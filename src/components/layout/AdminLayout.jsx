import { useContext, useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { LayoutDashboard, Package, ShoppingBag, LogOut, Shield, Palette, Settings } from 'lucide-react';

const AdminLayout = () => {
  const { user, role, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  if (!user || role !== 'admin') {
    navigate('/login');
    return null;
  }

  const [showLogoutModal, setShowLogoutModal] = useState(false);

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
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-secondary)' }}>

      <aside style={{ width: '250px', backgroundColor: 'var(--bg-primary)', borderRight: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '2rem 1.5rem', borderBottom: '1px solid var(--border-color)' }}>
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
                <Icon size={18} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div style={{ padding: '1.5rem 1rem', borderTop: '1px solid var(--border-color)' }}>
          <button 
            onClick={() => setShowLogoutModal(true)}
            style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-secondary)', fontWeight: 500, fontSize: '0.875rem', width: '100%', padding: '0.75rem 1rem', background: 'none', border: 'none', cursor: 'pointer' }}
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </aside>

      <main style={{ flex: 1, padding: '2rem 3rem', overflowY: 'auto', position: 'relative' }}>
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
    </div>
  );
};

export default AdminLayout;
