import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Menu, X, Search, Bell, Settings } from 'lucide-react';
import API from '../../utils/api';
import { Card, CardContent } from '../ui/card';
import '../ui/modern-ui.css';

const AdminPanel = () => {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [products, setProducts] = useState([]);
  const [labTests, setLabTests] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminLoading, setAdminLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();

  // Check admin access on mount
  useEffect(() => {
    const checkAdminAccess = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return navigate('/login?redirect=admin');

        const response = await API.get('/verify-admin/', {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.data.is_admin) {
          setIsAdmin(true);
          setCurrentUser(response.data.user);
          setAdminLoading(false);
          fetchDashboardData();
        } else {
          navigate('/');
        }
      } catch (err) {
        console.error('Admin verification error:', err);
        localStorage.removeItem('token');
        navigate('/login?redirect=admin');
      }
    };

    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('token');
        const [productsRes, testsRes, ordersRes, usersRes] = await Promise.all([
          API.get('/products/', { headers: { Authorization: `Bearer ${token}` } }).catch(() => ({ data: [] })),
          API.get('/lab-tests/', { headers: { Authorization: `Bearer ${token}` } }).catch(() => ({ data: [] })),
          API.get('/orders/', { headers: { Authorization: `Bearer ${token}` } }).catch(() => ({ data: [] })),
          API.get('/users/', { headers: { Authorization: `Bearer ${token}` } }).catch(() => ({ data: [] }))
        ]);

        setProducts(productsRes.data || []);
        setLabTests(testsRes.data || []);
        setOrders(ordersRes.data || []);
        setUsers(usersRes.data || []);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setLoading(false);
      }
    };

    checkAdminAccess();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  if (adminLoading) {
    return (
      <div className="eh-hero" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="eh-center">
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔐</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Verifying admin access...</div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#f8f9fa' }}>
        <div style={{ textAlign: 'center', padding: '2rem', background: 'white', borderRadius: '12px', boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🔒</div>
          <h1 style={{ fontSize: '2rem', color: '#d32f2f', marginBottom: '0.5rem' }}>Access Denied</h1>
          <p style={{ color: '#666', marginBottom: '2rem' }}>You do not have admin privileges</p>
          <button 
            onClick={() => navigate('/')}
            style={{ padding: '0.75rem 2rem', background: '#0066cc', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '1rem', fontWeight: 'bold' }}
          >
            ← Go Home
          </button>
        </div>
      </div>
    );
  }

  const menuItems = [
    { id: 'dashboard', label: '📊 Dashboard', color: '#0066cc' },
    { id: 'products', label: '📦 Products', color: '#2e7d32' },
    { id: 'tests', label: '🧪 Lab Tests', color: '#ff6b35' },
    { id: 'orders', label: '🛒 Orders', color: '#d32f2f' },
    { id: 'users', label: '👥 Users', color: '#6a1b9a' },
  ];

  return (
    <div className="eh-flex" style={{ minHeight: '100vh', backgroundColor: 'var(--eh-bg)' }}>
      {/* Sidebar */}
      <aside className="eh-card" style={{
        width: sidebarOpen ? '280px' : '100px',
        background: 'linear-gradient(180deg, #1a1a2e 0%, #0f3460 100%)',
        color: 'white',
        padding: sidebarOpen ? '1.5rem' : '1rem',
        transition: 'all 0.3s ease',
        position: 'fixed',
        height: '100vh',
        overflowY: 'auto',
        zIndex: 100,
        boxShadow: 'var(--eh-shadow-lg)',
        border: 'none'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          {sidebarOpen && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '40px', height: '40px', background: 'linear-gradient(135deg, #0066cc, #ff6b35)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', fontWeight: 'bold' }}>⚙️</div>
              <div>
                <h1 style={{ fontSize: '1.3rem', fontWeight: 'bold', margin: 0 }}>Admin</h1>
                <p style={{ fontSize: '0.75rem', opacity: 0.7, margin: 0 }}>Control Hub</p>
              </div>
            </div>
          )}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', cursor: 'pointer', padding: '8px', borderRadius: '6px' }}>
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav>
          {menuItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className="eh-btn eh-btn--ghost"
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                background: activeSection === item.id ? 'rgba(255,255,255,0.15)' : 'transparent',
                border: 'none',
                color: 'white',
                textAlign: 'left',
                borderRadius: '6px',
                marginBottom: '0.5rem',
                transition: 'all 0.2s ease'
              }}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <button
          onClick={handleLogout}
          style={{
            width: '100%',
            padding: '0.75rem 1rem',
            background: 'rgba(211,47,47,0.2)',
            border: '1px solid #d32f2f',
            color: '#ff6b6b',
            cursor: 'pointer',
            borderRadius: '6px',
            marginTop: '2rem',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}
        >
          <LogOut size={18} />
          {sidebarOpen && <span>Logout</span>}
        </button>
      </aside>

      {/* Main Content */}
      <main style={{ marginLeft: sidebarOpen ? '280px' : '100px', flex: 1, padding: '2rem', transition: 'margin-left 0.3s ease' }}>
        <Card className="eh-mb">
          <CardContent>
            <div className="eh-flex-between">
              <h2 style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--eh-text-primary)', margin: 0 }}>
                {menuItems.find(item => item.id === activeSection)?.label}
              </h2>

              <div className="eh-flex eh-gap">
                <button className="eh-btn eh-btn--ghost" style={{ position: 'relative' }}>
                  <Bell size={20} style={{ color: 'var(--eh-text-primary)' }} />
                  <span style={{ position: 'absolute', top: '4px', right: '4px', width: '8px', height: '8px', background: 'var(--eh-accent)', borderRadius: '50%' }}></span>
                </button>
                <button className="eh-btn eh-btn--ghost">
                  <Settings size={20} style={{ color: 'var(--eh-text-primary)' }} />
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section Content */}
        {activeSection === 'dashboard' && <Dashboard loading={loading} products={products} orders={orders} users={users} labTests={labTests} />}
        {activeSection === 'products' && <Products loading={loading} products={products} searchTerm={searchTerm} setSearchTerm={setSearchTerm} />}
        {activeSection === 'tests' && <Tests loading={loading} labTests={labTests} />}
        {activeSection === 'orders' && <Orders loading={loading} orders={orders} />}
        {activeSection === 'users' && <Users loading={loading} users={users} />}
      </main>
    </div>
  );
};

// Dashboard Component
const Dashboard = ({ loading, products, orders, users, labTests }) => (
  <div>
    <div className="eh-grid eh-mb">
      {[
        { label: 'Total Products', value: products.length, icon: '📦', color: 'var(--eh-success)' },
        { label: 'Lab Tests', value: labTests.length, icon: '🧪', color: 'var(--eh-secondary)' },
        { label: 'Total Orders', value: orders.length, icon: '🛒', color: 'var(--eh-accent)' },
        { label: 'Registered Users', value: users.length, icon: '👥', color: 'var(--eh-purple)' }
      ].map((stat, idx) => (
        <Card key={idx} className="eh-card" style={{ borderLeft: `4px solid ${stat.color}`, cursor: 'pointer' }}>
          <CardContent>
            <div className="eh-flex-between">
              <div>
                <p className="eh-text-muted" style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem' }}>{stat.label}</p>
                <p style={{ fontSize: '2rem', fontWeight: 'bold', color: stat.color, margin: 0 }}>{stat.value}</p>
              </div>
              <div style={{ fontSize: '2.5rem' }}>{stat.icon}</div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
);

// Products Component
const Products = ({ loading, products, searchTerm, setSearchTerm }) => {
  const filteredProducts = products.filter(p => p.name?.toLowerCase().includes(searchTerm.toLowerCase()));
  return (
    <div>
      <div className="eh-mb eh-flex eh-gap">
        <div style={{ flex: 1, position: 'relative' }}>
          <Search size={20} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--eh-text-muted)' }} />
          <input type="text" placeholder="Search products..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="eh-input" style={{ paddingLeft: '2.5rem' }} />
        </div>
      </div>

      {loading ? <p>Loading...</p> : (
        <Card>
          <CardContent style={{ padding: 0 }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: 'var(--eh-bg)', borderBottom: '2px solid var(--eh-border)' }}>
                    <th style={{ padding: '1.2rem', textAlign: 'left', fontWeight: 'bold', color: 'var(--eh-text-primary)' }}>Product Name</th>
                    <th style={{ padding: '1.2rem', textAlign: 'left', fontWeight: 'bold', color: 'var(--eh-text-primary)' }}>Category</th>
                    <th style={{ padding: '1.2rem', textAlign: 'left', fontWeight: 'bold', color: 'var(--eh-text-primary)' }}>Price</th>
                    <th style={{ padding: '1.2rem', textAlign: 'left', fontWeight: 'bold', color: 'var(--eh-text-primary)' }}>Stock</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((product, idx) => (
                    <tr key={product.id} style={{ borderBottom: '1px solid var(--eh-border)', background: idx % 2 === 0 ? 'var(--eh-surface)' : 'var(--eh-bg)' }}>
                      <td style={{ padding: '1.2rem', color: 'var(--eh-text-primary)', fontWeight: '500' }}>{product.name}</td>
                      <td style={{ padding: '1.2rem', color: 'var(--eh-text-secondary)' }}>{product.category}</td>
                      <td style={{ padding: '1.2rem', color: 'var(--eh-success)', fontWeight: 'bold' }}>NPR {product.price}</td>
                      <td style={{ padding: '1.2rem', color: 'var(--eh-text-secondary)' }}>{product.stock || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

// Tests Component
const Tests = ({ loading, labTests }) => (
  <div>
    <div className="eh-mb">
      <h3 className="eh-text-muted" style={{ marginTop: '0.5rem' }}>Manage all available lab tests</h3>
    </div>
    {loading ? <p>Loading...</p> : (
      <Card>
        <CardContent style={{ padding: 0 }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--eh-bg)', borderBottom: '2px solid var(--eh-border)' }}>
                  <th style={{ padding: '1.2rem', textAlign: 'left', fontWeight: 'bold', color: 'var(--eh-text-primary)' }}>Test Name</th>
                  <th style={{ padding: '1.2rem', textAlign: 'left', fontWeight: 'bold', color: 'var(--eh-text-primary)' }}>Price</th>
                  <th style={{ padding: '1.2rem', textAlign: 'left', fontWeight: 'bold', color: 'var(--eh-text-primary)' }}>Description</th>
                </tr>
              </thead>
              <tbody>
                {labTests.map((test, idx) => (
                  <tr key={test.id} style={{ borderBottom: '1px solid var(--eh-border)', background: idx % 2 === 0 ? 'var(--eh-surface)' : 'var(--eh-bg)' }}>
                    <td style={{ padding: '1.2rem', color: 'var(--eh-text-primary)', fontWeight: '500' }}>{test.name}</td>
                    <td style={{ padding: '1.2rem', color: 'var(--eh-secondary)', fontWeight: 'bold' }}>NPR {test.price}</td>
                    <td style={{ padding: '1.2rem', color: 'var(--eh-text-secondary)' }}>{test.description || 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    )}
  </div>
);

// Orders Component
const Orders = ({ loading, orders }) => (
  <div>
    <div className="eh-mb">
      <p className="eh-text-muted" style={{ marginTop: '0.5rem' }}>View and manage all customer orders</p>
    </div>
    {loading ? <p>Loading...</p> : (
      <Card>
        <CardContent style={{ padding: 0 }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--eh-bg)', borderBottom: '2px solid var(--eh-border)' }}>
                  <th style={{ padding: '1.2rem', textAlign: 'left', fontWeight: 'bold', color: 'var(--eh-text-primary)' }}>Order ID</th>
                  <th style={{ padding: '1.2rem', textAlign: 'left', fontWeight: 'bold', color: 'var(--eh-text-primary)' }}>Customer</th>
                  <th style={{ padding: '1.2rem', textAlign: 'left', fontWeight: 'bold', color: 'var(--eh-text-primary)' }}>Amount</th>
                  <th style={{ padding: '1.2rem', textAlign: 'left', fontWeight: 'bold', color: 'var(--eh-text-primary)' }}>Status</th>
                  <th style={{ padding: '1.2rem', textAlign: 'left', fontWeight: 'bold', color: 'var(--eh-text-primary)' }}>Date</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order, idx) => (
                  <tr key={order.id} style={{ borderBottom: '1px solid var(--eh-border)', background: idx % 2 === 0 ? 'var(--eh-surface)' : 'var(--eh-bg)' }}>
                    <td style={{ padding: '1.2rem', color: 'var(--eh-text-primary)', fontWeight: '500' }}>#{order.id}</td>
                    <td style={{ padding: '1.2rem', color: 'var(--eh-text-secondary)' }}>{order.customer_name || 'N/A'}</td>
                    <td style={{ padding: '1.2rem', color: 'var(--eh-accent)', fontWeight: 'bold' }}>NPR {order.total_amount}</td>
                    <td style={{ padding: '1.2rem' }}>
                      <span style={{ background: order.status === 'completed' ? 'var(--eh-success-light)' : '#fff3cd', color: order.status === 'completed' ? 'var(--eh-success)' : '#856404', padding: '6px 12px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 'bold' }}>
                        {order.status?.toUpperCase() || 'PENDING'}
                      </span>
                    </td>
                    <td style={{ padding: '1.2rem', color: 'var(--eh-text-secondary)' }}>{new Date(order.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    )}
  </div>
);

// Users Component
const Users = ({ loading, users }) => (
  <div>
    <div className="eh-mb">
      <p className="eh-text-muted" style={{ marginTop: '0.5rem' }}>Manage all registered users</p>
    </div>
    {loading ? <p>Loading...</p> : (
      <Card>
        <CardContent style={{ padding: 0 }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--eh-bg)', borderBottom: '2px solid var(--eh-border)' }}>
                  <th style={{ padding: '1.2rem', textAlign: 'left', fontWeight: 'bold', color: 'var(--eh-text-primary)' }}>Username</th>
                  <th style={{ padding: '1.2rem', textAlign: 'left', fontWeight: 'bold', color: 'var(--eh-text-primary)' }}>Email</th>
                  <th style={{ padding: '1.2rem', textAlign: 'left', fontWeight: 'bold', color: 'var(--eh-text-primary)' }}>Joined</th>
                  <th style={{ padding: '1.2rem', textAlign: 'center', fontWeight: 'bold', color: 'var(--eh-text-primary)' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user, idx) => (
                  <tr key={user.id} style={{ borderBottom: '1px solid var(--eh-border)', background: idx % 2 === 0 ? 'var(--eh-surface)' : 'var(--eh-bg)' }}>
                    <td style={{ padding: '1.2rem', color: 'var(--eh-text-primary)', fontWeight: '500' }}>
                      <div className="eh-flex eh-gap">
                        <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: `linear-gradient(135deg, var(--eh-primary), var(--eh-secondary))`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', fontSize: '0.9rem' }}>
                          {user.username?.[0]?.toUpperCase() || 'U'}
                        </div>
                        {user.username}
                      </div>
                    </td>
                    <td style={{ padding: '1.2rem', color: 'var(--eh-text-secondary)' }}>{user.email}</td>
                    <td style={{ padding: '1.2rem', color: 'var(--eh-text-secondary)' }}>{user.date_joined ? new Date(user.date_joined).toLocaleDateString() : 'N/A'}</td>
                    <td style={{ padding: '1.2rem', textAlign: 'center' }}>
                      <span style={{ background: user.is_active ? 'var(--eh-success-light)' : '#f8d7da', color: user.is_active ? 'var(--eh-success)' : '#721c24', padding: '6px 12px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 'bold' }}>
                        {user.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    )}
  </div>
);

export default AdminPanel;
