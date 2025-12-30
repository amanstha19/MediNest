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
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminLoading, setAdminLoading] = useState(true);


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
        const [productsRes, ordersRes, usersRes] = await Promise.all([
          API.get('/products/', { headers: { Authorization: `Bearer ${token}` } }).catch(() => ({ data: [] })),
          API.get('/orders/', { headers: { Authorization: `Bearer ${token}` } }).catch(() => ({ data: [] })),
          API.get('/users/', { headers: { Authorization: `Bearer ${token}` } }).catch(() => ({ data: [] }))
        ]);

        setProducts(productsRes.data || []);
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
    { id: 'orders', label: '🛒 Orders', color: '#d32f2f' },
    { id: 'users', label: '👥 Users', color: '#6a1b9a' },
  ];


  return (
    <div className="eh-admin-layout">
      {/* Sidebar */}
      <aside className={`eh-admin-sidebar ${sidebarOpen ? 'eh-admin-sidebar--expanded' : 'eh-admin-sidebar--collapsed'}`}>
        <div className="eh-admin-header">
          {sidebarOpen && (
            <div className="eh-admin-logo">
              <div className="eh-admin-logo-icon">⚙️</div>
              <div className="eh-admin-brand-text">
                <h1>Admin</h1>
                <p>Control Hub</p>
              </div>
            </div>
          )}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="eh-admin-toggle">
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav>
          {menuItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={`eh-admin-menu-item ${activeSection === item.id ? 'eh-admin-menu-item--active' : ''}`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <button
          onClick={handleLogout}
          className="eh-admin-logout"
        >
          <LogOut size={18} />
          {sidebarOpen && <span>Logout</span>}
        </button>
      </aside>

      {/* Main Content */}
      <main className={`eh-admin-content ${!sidebarOpen ? 'eh-admin-content--collapsed' : ''}`}>
        <Card className="eh-mb">
          <CardContent>
            <div className="eh-admin-header">
              <h2 style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--eh-text-primary)', margin: 0 }}>
                {menuItems.find(item => item.id === activeSection)?.label}
              </h2>

              <div className="eh-admin-actions">
                <button className="eh-admin-notification">
                  <Bell size={20} style={{ color: 'var(--eh-text-primary)' }} />
                  <span className="eh-admin-notification-dot"></span>
                </button>
                <button className="eh-admin-notification">
                  <Settings size={20} style={{ color: 'var(--eh-text-primary)' }} />
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section Content */}
        {activeSection === 'dashboard' && <Dashboard loading={loading} products={products} orders={orders} users={users} />}
        {activeSection === 'products' && <Products loading={loading} products={products} searchTerm={searchTerm} setSearchTerm={setSearchTerm} />}
        {activeSection === 'orders' && <Orders loading={loading} orders={orders} />}
        {activeSection === 'users' && <Users loading={loading} users={users} />}
      </main>
    </div>
  );
};


// Dashboard Component
const Dashboard = ({ loading, products, orders, users }) => (
  <div>
    <div className="eh-admin-stats-grid">
      {[
        { label: 'Total Products', value: products.length, icon: '📦', color: 'var(--eh-success)' },
        { label: 'Total Orders', value: orders.length, icon: '🛒', color: 'var(--eh-accent)' },
        { label: 'Registered Users', value: users.length, icon: '👥', color: 'var(--eh-purple)' }
      ].map((stat, idx) => (
        <Card key={idx} className="eh-card eh-admin-stat-card" style={{ borderLeftColor: stat.color }}>
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
        <div className="eh-admin-search">
          <Search size={20} className="eh-admin-search-icon" />
          <input type="text" placeholder="Search products..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="eh-input" />
        </div>
      </div>

      {loading ? <p>Loading...</p> : (
        <Card>
          <CardContent style={{ padding: 0 }}>
            <div style={{ overflowX: 'auto' }}>
              <table className="eh-admin-table">
                <thead>
                  <tr>
                    <th>Product Name</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Stock</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((product, idx) => (
                    <tr key={product.id}>
                      <td>{product.name}</td>
                      <td>{product.category}</td>
                      <td style={{ color: 'var(--eh-success)', fontWeight: 'bold' }}>NPR {product.price}</td>
                      <td>{product.stock || 0}</td>
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
            <table className="eh-admin-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td>#{order.id}</td>
                    <td>{order.customer_name || 'N/A'}</td>
                    <td style={{ color: 'var(--eh-accent)', fontWeight: 'bold' }}>NPR {order.total_amount}</td>
                    <td>
                      <span className={`eh-admin-badge ${order.status === 'completed' ? 'eh-admin-badge--success' : 'eh-admin-badge--warning'}`}>
                        {order.status?.toUpperCase() || 'PENDING'}
                      </span>
                    </td>
                    <td>{new Date(order.created_at).toLocaleDateString()}</td>
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
            <table className="eh-admin-table">
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Joined</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <div className="eh-flex eh-gap">
                        <div className="eh-admin-avatar">
                          {user.username?.[0]?.toUpperCase() || 'U'}
                        </div>
                        {user.username}
                      </div>
                    </td>
                    <td>{user.email}</td>
                    <td>{user.date_joined ? new Date(user.date_joined).toLocaleDateString() : 'N/A'}</td>
                    <td style={{ textAlign: 'center' }}>
                      <span className={`eh-admin-badge ${user.is_active ? 'eh-admin-badge--success' : 'eh-admin-badge--danger'}`}>
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
