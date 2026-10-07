import { useContext, useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { LayoutDashboard, Package, ShoppingBag, LogOut, Shield, Palette, Settings, Menu, X } from 'lucide-react';
import api from '../../services/api';

const AdminLayout = () => {
  const { user, role, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  if (!user || role !== 'admin') {
    navigate('/login');
    return null;
  }

  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [pendingOrdersCount, setPendingOrdersCount] = useState(0);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data } = await api.get('/orders');
        if (Array.isArray(data)) {
          const pending = data.filter(o => o.status !== 'Delivered' && o.status !== 'Cancelled');
          
          if (pending.length > 0) {
            const lastViewed = localStorage.getItem('lastViewedOrdersAt');
            
            if (location.pathname === '/admin/orders') {
              setPendingOrdersCount(0);
            } else if (lastViewed) {
              const unseenCount = pending.filter(o => new Date(o.createdAt || o.updatedAt) > new Date(lastViewed)).length;
              setPendingOrdersCount(unseenCount);
            } else {
              setPendingOrdersCount(pending.length);
            }
          } else {
            setPendingOrdersCount(0);
          }
        }
      } catch (err) {
        console.error('Failed to fetch orders for badge', err);
      }
    };
    fetchOrders();
    const interval = setInterval(fetchOrders, 30000);
    return () => clearInterval(interval);
  }, [location.pathname]);

  useEffect(() => {
    if (location.pathname === '/admin/orders') {
      localStorage.setItem('lastViewedOrdersAt', new Date().toISOString());
      setPendingOrdersCount(0);
    }
  }, [location.pathname]);

  const confirmLogout = () => {
    setShowLogoutModal(false);
    logout();
    navigate('/admin-setup');
  };

  const navItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Products', path: '/admin/products', icon: Package },
    { name: 'Design Library', path: '/admin/designs', icon: Palette },
    { name: 'Orders', path: '/admin/orders', icon: ShoppingBag },
    { name: 'Discounts', path: '/admin/discounts', icon: Settings },
  ];

  return (
    <div className="admin-layout" style={{ minHeight: '100vh', backgroundColor: 'var(--bg-secondary)', position: 'relative' }}>
      
      {/* Mobile Top Bar */}
      <div className="admin-mobile-topbar">
        <Link to="/admin/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.25rem', fontWeight: 700, letterSpacing: '-0.05em', color: 'var(--text-primary)', textDecoration: 'none' }}>
          <Shield size={20} />
          STYLEHUB <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 500 }}>Admin</span>
        </Link>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} style={{ background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer' }}>
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`admin-sidebar ${mobileMenuOpen ? 'open' : ''}`}>
        <div className="admin-sidebar-header" style={{ padding: '2rem 1.5rem', borderBottom: '1px solid var(--border-color)' }}>
          <Link to="/admin/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.25rem', fontWeight: 700, letterSpacing: '-0.05em', color: 'var(--text-primary)', textDecoration: 'none' }}>
            <Shield size={20} />
            STYLEHUB <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 500 }}>Admin</span>
          </Link>
        </div>
        
        <nav style={{ padding: '1.5rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.75rem 1rem',
                  borderRadius: '4px',
                  backgroundColor: isActive ? 'var(--text-primary)' : 'transparent',
                  color: isActive ? 'var(--bg-primary)' : 'var(--text-secondary)',
                  fontWeight: 500,
                  fontSize: '0.875rem',
                  textDecoration: 'none'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <Icon size={18} />
                  {item.name}
                </div>
                {item.name === 'Orders' && pendingOrdersCount > 0 && (
                  <span style={{ 
                    backgroundColor: 'var(--text-primary)', 
                    color: 'var(--bg-primary)', 
                    fontSize: '0.75rem', 
                    fontWeight: 700, 
                    padding: '0.1rem 0.5rem', 
                    borderRadius: '99px',
                    marginLeft: 'auto'
                  }}>
                    {pendingOrdersCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div style={{ padding: '1.5rem 1rem', borderTop: '1px solid var(--border-color)' }}>
          <button 
            onClick={() => { setShowLogoutModal(true); setMobileMenuOpen(false); }}
            style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-secondary)', fontWeight: 500, fontSize: '0.875rem', width: '100%', padding: '0.75rem 1rem', background: 'none', border: 'none', cursor: 'pointer' }}
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {mobileMenuOpen && (
        <div 
          className="admin-mobile-overlay" 
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="admin-main">
        <Outlet />
      </main>

      {showLogoutModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ backgroundColor: 'var(--bg-primary)', width: '100%', maxWidth: '400px', padding: '2rem', borderRadius: '4px', position: 'relative', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--text-primary)' }}>Sign Out</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '2rem', lineHeight: 1.5 }}>
              Are you sure you want to sign out of the admin dashboard?
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button onClick={() => setShowLogoutModal(false)} style={{ padding: '0.5rem 1rem', border: '1px solid var(--border-color)', borderRadius: '2px', background: 'none', cursor: 'pointer', fontWeight: 500, color: 'var(--text-primary)' }}>
                Cancel
              </button>
              <button onClick={confirmLogout} style={{ padding: '0.5rem 1rem', border: 'none', borderRadius: '2px', backgroundColor: 'var(--text-primary)', color: 'var(--bg-primary)', cursor: 'pointer', fontWeight: 500 }}>
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .admin-layout {
          display: flex;
          flex-direction: column;
        }
        .admin-mobile-topbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1rem 1.5rem;
          background-color: var(--bg-primary);
          border-bottom: 1px solid var(--border-color);
          position: sticky;
          top: 0;
          z-index: 40;
        }
        .admin-sidebar {
          position: fixed;
          top: 0;
          left: -300px;
          width: 280px;
          height: 100vh;
          background-color: var(--bg-primary);
          z-index: 50;
          display: flex;
          flex-direction: column;
          transition: left 0.3s ease;
          box-shadow: 2px 0 8px rgba(0,0,0,0.1);
        }
        .admin-sidebar.open {
          left: 0;
        }
        .admin-sidebar-header {
          display: none;
        }
        .admin-mobile-overlay {
          position: fixed;
          inset: 0;
          background-color: rgba(0,0,0,0.5);
          z-index: 45;
        }
        .admin-main {
          flex: 1;
          padding: 1rem;
          overflow-y: auto;
          position: relative;
        }

        @media (min-width: 768px) {
          .admin-layout {
            flex-direction: row;
          }
          .admin-mobile-topbar {
            display: none;
          }
          .admin-sidebar {
            position: sticky;
            top: 0;
            left: 0;
            width: 250px;
            box-shadow: none;
            border-right: 1px solid var(--border-color);
            transition: none;
          }
          .admin-sidebar-header {
            display: block;
          }
          .admin-mobile-overlay {
            display: none;
          }
          .admin-main {
            padding: 2rem 3rem;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminLayout;
