import { useContext, useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingBag, User, LogOut, Menu, Shield, Search } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';

const Navbar = () => {
  const { user, role, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [cartCount, setCartCount] = useState(0);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  useEffect(() => {
    if (user && role === 'customer') {
      api.get('/cart').then(res => {
        const count = res.data?.items?.reduce((acc, item) => acc + item.quantity, 0) || 0;
        setCartCount(count);
      }).catch(() => {});
    }
  }, [user, role]);

  const confirmLogout = () => {
    setShowLogoutModal(false);
    logout();
    navigate('/');
  };

  return (
    <header style={{
      borderBottom: '1px solid var(--border-color)',
      backgroundColor: 'var(--bg-primary)',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      height: '56px',
      display: 'flex',
      alignItems: 'center'
    }}>
      <div className="container" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>

        <div className="flex items-center gap-8">
          <Link to="/" style={{ fontSize: '1.125rem', fontWeight: 700, letterSpacing: '-0.05em' }}>
            STYLEHUB
          </Link>

          {location.pathname !== '/admin-setup' && (
            <nav className="nav-desktop" style={{ display: 'none', gap: '1.5rem' }}>
              <Link to="/" style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Home</Link>
              <Link to="/shop" style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Shop</Link>
            </nav>
          )}
        </div>

        {location.pathname !== '/admin-setup' && (
          <div className="flex items-center gap-4">
          <Link to="/shop" style={{ display: 'flex', alignItems: 'center', color: 'var(--text-secondary)' }} title="Search Products">
            <Search size={20} strokeWidth={1.5} />
          </Link>

          {(!user || role === 'customer') && (
            <Link to="/cart" style={{ position: 'relative', display: 'flex', alignItems: 'center', color: 'var(--text-secondary)' }}>
              <ShoppingBag size={20} strokeWidth={1.5} />
              {cartCount > 0 && (
                <span className="badge" style={{ position: 'absolute', top: '-6px', right: '-8px' }}>
                  {cartCount}
                </span>
              )}
            </Link>
          )}

          {user ? (
            <div className="flex items-center gap-4">
              <Link to="/profile" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--text-primary)', textDecoration: 'none' }} title="Profile">
                <User size={20} strokeWidth={1.5} />
                <span style={{ fontSize: '0.875rem', fontWeight: 500 }} className="nav-desktop">
                  {role === 'admin' ? 'Admin' : user.firstName}
                </span>
              </Link>
              <button onClick={() => setShowLogoutModal(true)} style={{ color: 'var(--text-secondary)' }}>
                <LogOut size={20} strokeWidth={1.5} />
              </button>
            </div>
          ) : (
            <Link to="/login" style={{ color: 'var(--text-secondary)' }}>
              <User size={20} strokeWidth={1.5} />
            </Link>
          )}

          <button className="menu-mobile" style={{ color: 'var(--text-secondary)' }}>
            <Menu size={20} strokeWidth={1.5} />
          </button>
        </div>
        )}
      </div>
      <style>{`
        @media (min-width: 768px) {
          .nav-desktop { display: flex !important; }
          .menu-mobile { display: none !important; }
        }
      `}</style>

      {showLogoutModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ backgroundColor: 'var(--bg-primary)', width: '100%', maxWidth: '400px', padding: '2rem', borderRadius: '4px', position: 'relative', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--text-primary)' }}>Sign Out</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '2rem', lineHeight: 1.5 }}>
              Are you sure you want to sign out of your account?
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
    </header>
  );
};

export default Navbar;
