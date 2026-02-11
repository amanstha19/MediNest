import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  MapPin,
  User,
  Phone,
  Mail,
  Home,
  Building,
  Map,
  Navigation,
  FileText,
  CheckCircle
} from 'lucide-react';
import './AddressForm.css';

const AddressForm = ({ onAddressChange, initialAddress = {} }) => {
  const [formData, setFormData] = useState({
    fullName: initialAddress.fullName || '',
    phone: initialAddress.phone || '',
    email: initialAddress.email || '',
    addressLine1: initialAddress.addressLine1 || '',
    addressLine2: initialAddress.addressLine2 || '',
    city: initialAddress.city || '',
    province: initialAddress.province || '',
    postalCode: initialAddress.postalCode || '',
    landmark: initialAddress.landmark || '',
    deliveryInstructions: initialAddress.deliveryInstructions || ''
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isValid, setIsValid] = useState(false);

  const provinces = [
    'Province 1',
    'Province 2',
    'Bagmati Province',
    'Gandaki Province',
    'Lumbini Province',
    'Karnali Province',
    'Sudurpashchim Province'
  ];

  const cities = [
    'Kathmandu',
    'Lalitpur',
    'Pokhara',
    'Biratnagar',
    'Birgunj',
    'Dharan',
    'Bharatpur',
    'Janakpur',
    'Dhangadhi',
    'Butwal',
    'Mahendranagar',
    'Nepalgunj',
    'Hetauda',
    'Delhi',
    'Mumbai',
    'Chennai',
    'Kolkata',
    'Bangalore',
    'Hyderabad',
    'Other'
  ];

  useEffect(() => {
    validateForm();
    onAddressChange(formData);
  }, [formData]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    } else if (formData.fullName.length < 2) {
      newErrors.fullName = 'Name must be at least 2 characters';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) {
      newErrors.phone = 'Please enter a valid 10-digit phone number';
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.addressLine1.trim()) {
      newErrors.addressLine1 = 'Street address is required';
    }

    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
    }

    if (!formData.province.trim()) {
      newErrors.province = 'Province is required';
    }

    setErrors(newErrors);
    setIsValid(Object.keys(newErrors).length === 0);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));
    validateForm();
  };

  const formatAddress = () => {
    const parts = [];
    if (formData.addressLine1) parts.push(formData.addressLine1);
    if (formData.addressLine2) parts.push(formData.addressLine2);
    if (formData.city) parts.push(formData.city);
    if (formData.province) parts.push(formData.province);
    if (formData.postalCode) parts.push(formData.postalCode);
    return parts.join(', ');
  };

  return (
    <motion.div
      className="address-form-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Header */}
      <div className="address-section-header">
        <div className="address-section-icon">
          <MapPin size={20} />
        </div>
        <h3 className="address-section-title">Delivery Address</h3>
      </div>

      {/* Contact Information */}
      <div className="address-form-grid">
        {/* Full Name */}
        <div className="address-input-wrapper">
          <label className="address-input-label">
            <User size={16} />
            Full Name
            <span className="address-input-required">*</span>
          </label>
          <input
            type="text"
            name="fullName"
            className={`address-input-field ${touched.fullName && errors.fullName ? 'invalid' : touched.fullName && !errors.fullName ? 'valid' : ''}`}
            placeholder="Enter your full name"
            value={formData.fullName}
            onChange={handleChange}
            onBlur={handleBlur}
          />
          {touched.fullName && errors.fullName && (
            <span className="address-error-message">
              <span>⚠</span> {errors.fullName}
            </span>
          )}
        </div>

        {/* Phone */}
        <div className="address-input-wrapper">
          <label className="address-input-label">
            <Phone size={16} />
            Phone Number
            <span className="address-input-required">*</span>
          </label>
          <input
            type="tel"
            name="phone"
            className={`address-input-field ${touched.phone && errors.phone ? 'invalid' : touched.phone && !errors.phone ? 'valid' : ''}`}
            placeholder="98XXXXXXXX"
            value={formData.phone}
            onChange={handleChange}
            onBlur={handleBlur}
            maxLength={10}
          />
          {touched.phone && errors.phone && (
            <span className="address-error-message">
              <span>⚠</span> {errors.phone}
            </span>
          )}
        </div>

        {/* Email */}
        <div className="address-input-wrapper">
          <label className="address-input-label">
            <Mail size={16} />
            Email
            <span>(Optional)</span>
          </label>
          <input
            type="email"
            name="email"
            className={`address-input-field ${touched.email && errors.email ? 'invalid' : ''}`}
            placeholder="your@email.com"
            value={formData.email}
            onChange={handleChange}
            onBlur={handleBlur}
          />
          {touched.email && errors.email && (
            <span className="address-error-message">
              <span>⚠</span> {errors.email}
            </span>
          )}
        </div>

        {/* Postal Code */}
        <div className="address-input-wrapper">
          <label className="address-input-label">
            <Navigation size={16} />
            Postal Code
            <span>(Optional)</span>
          </label>
          <input
            type="text"
            name="postalCode"
            className="address-input-field"
            placeholder="44600"
            value={formData.postalCode}
            onChange={handleChange}
          />
        </div>

        {/* Address Line 1 */}
        <div className="address-form-full address-input-wrapper">
          <label className="address-input-label">
            <Home size={16} />
            Street Address
            <span className="address-input-required">*</span>
          </label>
          <input
            type="text"
            name="addressLine1"
            className={`address-input-field ${touched.addressLine1 && errors.addressLine1 ? 'invalid' : touched.addressLine1 && !errors.addressLine1 ? 'valid' : ''}`}
            placeholder="House/Building number, Street name, Area"
            value={formData.addressLine1}
            onChange={handleChange}
            onBlur={handleBlur}
          />
          {touched.addressLine1 && errors.addressLine1 && (
            <span className="address-error-message">
              <span>⚠</span> {errors.addressLine1}
            </span>
          )}
        </div>

        {/* Address Line 2 */}
        <div className="address-form-full address-input-wrapper">
          <label className="address-input-label">
            <Building size={16} />
            Address Line 2
            <span>(Optional)</span>
          </label>
          <input
            type="text"
            name="addressLine2"
            className="address-input-field"
            placeholder="Apartment, Suite, Unit, etc."
            value={formData.addressLine2}
            onChange={handleChange}
          />
        </div>

        {/* City */}
        <div className="address-input-wrapper">
          <label className="address-input-label">
            <Map size={16} />
            City
            <span className="address-input-required">*</span>
          </label>
          <select
            name="city"
            className={`address-input-field address-select ${touched.city && errors.city ? 'invalid' : touched.city && !errors.city ? 'valid' : ''}`}
            value={formData.city}
            onChange={handleChange}
            onBlur={handleBlur}
          >
            <option value="">Select City</option>
            {cities.map(city => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>
          {touched.city && errors.city && (
            <span className="address-error-message">
              <span>⚠</span> {errors.city}
            </span>
          )}
        </div>

        {/* Province */}
        <div className="address-input-wrapper">
          <label className="address-input-label">
            <MapPin size={16} />
            Province
            <span className="address-input-required">*</span>
          </label>
          <select
            name="province"
            className={`address-input-field address-select ${touched.province && errors.province ? 'invalid' : touched.province && !errors.province ? 'valid' : ''}`}
            value={formData.province}
            onChange={handleChange}
            onBlur={handleBlur}
          >
            <option value="">Select Province</option>
            {provinces.map(province => (
              <option key={province} value={province}>{province}</option>
            ))}
          </select>
          {touched.province && errors.province && (
            <span className="address-error-message">
              <span>⚠</span> {errors.province}
            </span>
          )}
        </div>

        {/* Landmark */}
        <div className="address-form-full address-input-wrapper">
          <label className="address-input-label">
            <Navigation size={16} />
            Landmark
            <span>(Optional)</span>
          </label>
          <input
            type="text"
            name="landmark"
            className="address-input-field"
            placeholder="Near landmark, hospital, school, etc."
            value={formData.landmark}
            onChange={handleChange}
          />
        </div>

        {/* Delivery Instructions */}
        <div className="address-form-full address-input-wrapper">
          <label className="address-input-label">
            <FileText size={16} />
            Delivery Instructions
            <span>(Optional)</span>
          </label>
          <textarea
            name="deliveryInstructions"
            className="address-input-field address-textarea"
            placeholder="Any special instructions for delivery (e.g., gate code, floor, etc.)"
            value={formData.deliveryInstructions}
            onChange={handleChange}
            maxLength={500}
            rows={3}
          />
          <div className={`address-char-counter ${formData.deliveryInstructions.length > 450 ? 'warning' : ''} ${formData.deliveryInstructions.length >= 500 ? 'error' : ''}`}>
            {formData.deliveryInstructions.length}/500 characters
          </div>
        </div>
      </div>

      {/* Address Preview */}
      {isValid && (
        <motion.div
          className="address-preview-card"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="address-preview-header">
            <CheckCircle size={18} className="address-preview-icon" />
            <h4 className="address-preview-title">Delivery Summary</h4>
          </div>
          <p className="address-preview-content">
            <strong>{formData.fullName}</strong> • {formData.phone}<br />
            {formatAddress()}<br />
            {formData.landmark && (
              <>
                <strong>Landmark:</strong> {formData.landmark}<br />
              </>
            )}
            {formData.deliveryInstructions && (
              <>
                <strong>Instructions:</strong> {formData.deliveryInstructions}
              </>
            )}
          </p>
        </motion.div>
      )}
    </motion.div>
  );
};

export default AddressForm;
