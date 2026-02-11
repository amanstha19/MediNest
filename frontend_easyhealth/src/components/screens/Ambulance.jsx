import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Card, CardContent } from '../ui/card';
import Button from '../ui/button';
import axios from 'axios';
import L from 'leaflet';
import { Ambulance as AmbulanceIcon, MapPin, Ruler, Phone, AlertTriangle } from 'lucide-react';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});



const AmbulanceCard = ({ service }) => (
  <Card>
    <CardContent>
      <h3 style={{ fontSize: '1.1rem', marginBottom: '12px', color: 'var(--eh-primary)' }}>
        <AmbulanceIcon size={20} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
        {service.name}
      </h3>
      <div style={{ display: 'grid', gap: '8px', marginBottom: 'var(--eh-spacing-lg)' }}>
        <div>
          <p style={{ color: 'var(--eh-text-muted)', fontSize: '0.85rem', marginBottom: '4px' }}>Location</p>
          <p style={{ fontSize: '0.95rem', fontWeight: 500 }}>
            <MapPin size={14} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
            {service.location}
          </p>
        </div>
        <div>
          <p style={{ color: 'var(--eh-text-muted)', fontSize: '0.85rem', marginBottom: '4px' }}>Distance</p>
          <p style={{ fontSize: '0.95rem', fontWeight: 500 }}>
            <Ruler size={14} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
            {service.distance.toFixed(1)} km away
          </p>
        </div>
        <div>
          <p style={{ color: 'var(--eh-text-muted)', fontSize: '0.85rem', marginBottom: '4px' }}>Contact</p>
          <p style={{ fontSize: '0.95rem', fontWeight: 500 }}>
            <Phone size={14} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
            {service.contact}
          </p>
        </div>
      </div>
      <a href={`tel:${service.phone.split(',')[0]}`} style={{ textDecoration: 'none' }}>
        <Button variant="success" className="eh-btn--block" size="sm">
          Call Now
        </Button>
      </a>
    </CardContent>
  </Card>
);

const fetchAmbulances = async (retries = 20) => {
  // Check cache first
  const cached = localStorage.getItem('ambulanceData');
  if (cached) {
    const cacheData = JSON.parse(cached);
    const cacheAge = Date.now() - cacheData.timestamp;
    const cacheExpiry = 24 * 60 * 60 * 1000; // 24 hours
    if (cacheAge < cacheExpiry) {
      console.log('Using cached ambulance data');
      return cacheData.data;
    }
  }

  const query = `[out:json];area["ISO3166-1"="NP"]->.nepal;(node[amenity=ambulance](area.nepal);node[amenity=hospital](area.nepal););out;`;
  const url = `https://overpass.kumi.systems/api/interpreter?data=${encodeURIComponent(query)}`;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await axios.get(url, { timeout: 30000 }); // 30 second timeout
      const data = response.data.elements.map(node => ({
        name: node.tags.name || 'Unnamed Ambulance/Hospital',
        location: node.tags.name || 'Location not specified',
        contact: node.tags.phone || node.tags.contact || node.tags['contact:phone'] || 'Contact not available',
        phone: node.tags.phone || node.tags.contact || node.tags['contact:phone'] || '',
        lat: node.lat,
        lng: node.lon
      }));

      // Cache the data
      const cacheData = {
        data: data,
        timestamp: Date.now()
      };
      localStorage.setItem('ambulanceData', JSON.stringify(cacheData));

      return data;
    } catch (error) {
      console.error(`Attempt ${attempt} failed:`, error.message);
      if (attempt < retries) {
        // Wait before retrying (exponential backoff)
        const delay = 3000 * attempt; // 3s, 6s, 9s, etc.
        console.log(`Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        // Last attempt failed
        return null;
      }
    }
  }
  return null;
};

function Ambulance() {
  const [ambulances, setAmbulances] = useState([]);
  const [userLocation, setUserLocation] = useState({ lat: 27.7172, lng: 85.3240 }); // Default Kathmandu
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (err) => {
          console.warn('Geolocation error:', err);
          // Use default
        }
      );
    } else {
      console.warn('Geolocation not supported');
    }
  }, []);

  useEffect(() => {
    const fetchAndProcessAmbulances = async () => {
      try {
        const fetchedAmbulances = await fetchAmbulances();
        const ambulanceData = fetchedAmbulances || fallbackAmbulances;

        // Calculate distances and sort ambulances by proximity to user location
        const calculateDistance = (lat1, lon1, lat2, lon2) => {
          const R = 6371; // Radius of the Earth in km
          const dLat = (lat2 - lat1) * Math.PI / 180;
          const dLon = (lon2 - lon1) * Math.PI / 180;
          const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                    Math.sin(dLon/2) * Math.sin(dLon/2);
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
          const distance = R * c; // Distance in km
          return distance;
        };

        const sortedAmbulances = ambulanceData.map(ambulance => ({
          ...ambulance,
          distance: calculateDistance(userLocation.lat, userLocation.lng, ambulance.lat, ambulance.lng)
        })).sort((a, b) => a.distance - b.distance).slice(0, 20);

        setAmbulances(sortedAmbulances);
        setError(null);
      } catch (err) {
        console.error('Error processing ambulances:', err);
        setError('Failed to load live ambulance data. Using fallback data.');
        // Fallback to static data
        const calculateDistance = (lat1, lon1, lat2, lon2) => {
          const R = 6371;
          const dLat = (lat2 - lat1) * Math.PI / 180;
          const dLon = (lon2 - lon1) * Math.PI / 180;
          const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                    Math.sin(dLon/2) * Math.sin(dLon/2);
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
          const distance = R * c;
          return distance;
        };
        const sortedAmbulances = fallbackAmbulances.map(ambulance => ({
          ...ambulance,
          distance: calculateDistance(userLocation.lat, userLocation.lng, ambulance.lat, ambulance.lng)
        })).sort((a, b) => a.distance - b.distance).slice(0, 20);
        setAmbulances(sortedAmbulances);
      } finally {
        setLoading(false);
      }
    };

    fetchAndProcessAmbulances();
  }, [userLocation]);

  if (loading) {
    return (
      <div className="eh-container" style={{ paddingTop: 'var(--eh-spacing-2xl)', paddingBottom: 'var(--eh-spacing-2xl)' }}>
        <div>Loading nearby ambulances...</div>
      </div>
    );
  }

  return (
    <div className="eh-container" style={{ paddingTop: 'var(--eh-spacing-2xl)', paddingBottom: 'var(--eh-spacing-2xl)' }}>
      <div className="eh-hero" style={{ marginBottom: 'var(--eh-spacing-2xl)' }}>
        <div style={{ fontSize: '3rem', marginBottom: '12px' }}>
          <AmbulanceIcon size={48} />
        </div>
        <h1 style={{ fontSize: '2rem', marginBottom: '12px' }}>Emergency Ambulance Services</h1>
        <p>Quick access to emergency ambulance services near you. Save these numbers for emergency.</p>
      </div>

      {error && <div style={{ color: 'red', marginBottom: 'var(--eh-spacing-lg)' }}>{error}</div>}

      <div style={{ marginBottom: 'var(--eh-spacing-2xl)', padding: 'var(--eh-spacing-lg)', background: 'var(--eh-surface)', borderRadius: 'var(--eh-radius)', border: '2px solid var(--eh-accent)' }}>
        <div style={{ display: 'flex', alignItems: 'start', gap: 'var(--eh-spacing-md)' }}>
          <div style={{ fontSize: '1.5rem' }}>
            <AlertTriangle size={24} style={{ color: 'var(--eh-accent)' }} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '8px', color: 'var(--eh-accent)' }}>In Case of Emergency</h3>
            <p style={{ color: 'var(--eh-text-secondary)', marginBottom: '8px' }}>Call the nearest ambulance service immediately. Emergency response time may vary based on location and traffic conditions.</p>
            <p style={{ fontSize: '0.9rem', color: 'var(--eh-text-muted)' }}>For general inquiries about non-emergency services, you can also book through our website.</p>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 'var(--eh-spacing-2xl)', alignItems: 'flex-start', marginBottom: 'var(--eh-spacing-2xl)' }}>
        <div style={{ flex: 1 }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: 'var(--eh-spacing-lg)' }}>Available Ambulance Services</h2>
          <div className="eh-grid--2">
            {ambulances.map((service, idx) => (
              <AmbulanceCard key={idx} service={service} />
            ))}
          </div>
        </div>

        <div style={{ flex: 1, height: '500px', borderRadius: 'var(--eh-radius)', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
          <MapContainer center={[userLocation.lat, userLocation.lng]} zoom={13} style={{ height: '100%', width: '100%' }}>
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            {ambulances.map((service, idx) => (
              <Marker key={idx} position={[service.lat, service.lng]}>
                <Popup>
                  <strong>{service.name}</strong><br />
                  Location: {service.location}<br />
                  Contact: {service.contact}<br />
                  {service.phone && <a href={`tel:${service.phone.split(',')[0]}`}>Call Now</a>}
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </div>

      <Card style={{ marginTop: 'var(--eh-spacing-2xl)', background: 'rgba(15, 118, 110, 0.05)' }}>
        <CardContent>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '12px', color: 'var(--eh-primary)' }}>Tips for Emergency</h3>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--eh-spacing-md)' }}>
            <li style={{ padding: 'var(--eh-spacing-md)', background: 'white', borderRadius: 'var(--eh-radius-sm)', border: '1px solid var(--eh-border)' }}>
              <p style={{ fontWeight: 600, marginBottom: '4px' }}>✓ Stay Calm</p>
              <p style={{ fontSize: '0.9rem', color: 'var(--eh-text-muted)' }}>Take a deep breath and try to remain calm.</p>
            </li>
            <li style={{ padding: 'var(--eh-spacing-md)', background: 'white', borderRadius: 'var(--eh-radius-sm)', border: '1px solid var(--eh-border)' }}>
              <p style={{ fontWeight: 600, marginBottom: '4px' }}>✓ Provide Location</p>
              <p style={{ fontSize: '0.9rem', color: 'var(--eh-text-muted)' }}>Give clear landmarks or address to dispatcher.</p>
            </li>
            <li style={{ padding: 'var(--eh-spacing-md)', background: 'white', borderRadius: 'var(--eh-radius-sm)', border: '1px solid var(--eh-border)' }}>
              <p style={{ fontWeight: 600, marginBottom: '4px' }}>✓ Follow Instructions</p>
              <p style={{ fontSize: '0.9rem', color: 'var(--eh-text-muted)' }}>Follow the dispatcher's instructions carefully.</p>
            </li>
            <li style={{ padding: 'var(--eh-spacing-md)', background: 'white', borderRadius: 'var(--eh-radius-sm)', border: '1px solid var(--eh-border)' }}>
              <p style={{ fontWeight: 600, marginBottom: '4px' }}>✓ Have Info Ready</p>
              <p style={{ fontSize: '0.9rem', color: 'var(--eh-text-muted)' }}>Have patient details and medical history ready.</p>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

// Fallback static data in case API fails
const fallbackAmbulances = [
  // Kathmandu Valley
  { name: 'Nepal Ambulance Service', contact: '01-4427833, 102', location: 'Ghattekulo Marg, Kathmandu', phone: '01-4427833', lat: 27.7172, lng: 85.3240 },
  { name: 'B. P. Smriti Hospital', contact: '9841447710', location: 'Basundhara, Kathmandu', phone: '9841447710', lat: 27.7330, lng: 85.3144 },
  { name: 'Ambulance Service', contact: '01-4310030', location: 'Teku, Kathmandu', phone: '01-4310030', lat: 27.7100, lng: 85.3200 },
  { name: 'National Ambulance Service', contact: '01-4331112', location: 'Koteshwor, Kathmandu', phone: '01-4331112', lat: 27.6846, lng: 85.3569 },
  { name: 'Red Cross Ambulance', contact: '01-4270228, 102', location: 'Kanti Path, Kathmandu', phone: '01-4270228', lat: 27.7056, lng: 85.3122 },
  { name: 'Teaching Hospital Ambulance', contact: '01-4412303', location: 'Maharajgunj, Kathmandu', phone: '01-4412303', lat: 27.7378, lng: 85.3317 },
  { name: 'Bir Hospital Ambulance', contact: '01-4221119', location: 'New Road, Kathmandu', phone: '01-4221119', lat: 27.7012, lng: 85.3156 },
  { name: 'Civil Service Hospital Ambulance', contact: '01-5521006', location: 'Minbhawan, Kathmandu', phone: '01-5521006', lat: 27.6878, lng: 85.3589 },
  { name: 'Om Hospital Ambulance', contact: '01-4427878', location: 'Chabahil, Kathmandu', phone: '01-4427878', lat: 27.7167, lng: 85.3500 },
  { name: 'Grande International Hospital', contact: '01-5159266', location: 'Tokha, Kathmandu', phone: '01-5159266', lat: 27.7567, lng: 85.3367 },
  
  // Lalitpur/Patan
  { name: 'Ambulance Lalitpur Municipality', contact: '9841202641, 01-5527003', location: 'Pulchowk, Lalitpur', phone: '9841202641', lat: 27.6786, lng: 85.3188 },
  { name: 'Patan Hospital Ambulance', contact: '01-5522278', location: 'Lagankhel, Lalitpur', phone: '01-5522278', lat: 27.6681, lng: 85.3239 },
  { name: 'KIST Medical College Ambulance', contact: '01-5201498', location: 'Imadol, Lalitpur', phone: '01-5201498', lat: 27.6556, lng: 85.3467 },
  
  // Pokhara
  { name: 'Ambulance Service Siddhartha Club', contact: '061530200, 061521433', location: 'Siddhartha Chowk, Pokhara', phone: '061530200', lat: 28.2096, lng: 83.9856 },
  { name: 'Pokhara Ambulance Service', contact: '061-520400', location: 'Lakeside, Pokhara', phone: '061-520400', lat: 28.2136, lng: 84.0042 },
  { name: 'Gandaki Medical College Ambulance', contact: '061-527000', location: 'Pokhara', phone: '061-527000', lat: 28.2000, lng: 84.0000 },
  
  // Chitwan
  { name: 'Sanjivini Ayurvedic Prakritik Chikitsaylaya', contact: '9848554800', location: 'Chitwan', phone: '9848554800', lat: 27.5291, lng: 84.3542 },
  { name: 'Chitwan Medical College Ambulance', contact: '056-593000', location: 'Bharatpur, Chitwan', phone: '056-593000', lat: 27.6867, lng: 84.4350 },
  { name: 'Bardhanagar Ambulance', contact: '056-520333', location: 'Bardhanagar, Chitwan', phone: '056-520333', lat: 27.7000, lng: 84.4167 },
  
  // Biratnagar
  { name: 'Biratnagar Ambulance Service', contact: '021-470111', location: 'Biratnagar', phone: '021-470111', lat: 26.4525, lng: 87.2718 },
  { name: 'Nobel Hospital Ambulance', contact: '021-430700', location: 'Biratnagar', phone: '021-430700', lat: 26.4667, lng: 87.2833 },
  
  // Butwal
  { name: 'Butwal Ambulance Service', contact: '071-520100', location: 'Butwal', phone: '071-520100', lat: 27.7000, lng: 83.4500 },
  { name: 'Lumbini Provincial Hospital', contact: '071-520500', location: 'Butwal', phone: '071-520500', lat: 27.6833, lng: 83.4667 },
  
  // Jhapa
  { name: 'Akhil Nepal Chiya Majdur Sangh', contact: '9814952000', location: 'Jhapa', phone: '9814952000', lat: 26.6637, lng: 87.9236 },
  { name: 'Birtamode Ambulance', contact: '023-540100', location: 'Birtamode, Jhapa', phone: '023-540100', lat: 26.6333, lng: 87.9833 },
  
  // Other Major Cities
  { name: 'Hetauda Hospital Ambulance', contact: '057-520100', location: 'Hetauda', phone: '057-520100', lat: 27.4167, lng: 85.0333 },
  { name: 'Bharatpur Hospital Ambulance', contact: '056-520500', location: 'Bharatpur', phone: '056-520500', lat: 27.6833, lng: 84.4333 },
  { name: 'Dharan Hospital Ambulance', contact: '025-520100', location: 'Dharan', phone: '025-520100', lat: 26.8167, lng: 87.2833 },
  { name: 'Janakpur Hospital Ambulance', contact: '041-520100', location: 'Janakpur', phone: '041-520100', lat: 26.7167, lng: 85.9333 },
  { name: 'Surkhet Hospital Ambulance', contact: '063-520100', location: 'Surkhet', phone: '063-520100', lat: 28.6000, lng: 81.6000 },
  { name: 'Dhangadhi Hospital Ambulance', contact: '091-520100', location: 'Dhangadhi', phone: '091-520100', lat: 28.9833, lng: 80.5833 },
  { name: 'Mahendranagar Hospital', contact: '099-520100', location: 'Mahendranagar', phone: '099-520100', lat: 28.9667, lng: 80.1833 },
];
export default Ambulance;
