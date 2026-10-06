import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, User, LogOut, Menu } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);

  return (
    <header style={{
      borderBottom: '1px solid var(--color-border)',
      backgroundColor: 'var(--color-bg)',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      padding: '1rem 0'
    }}>
      <div className="container flex items-center justify-between">

        <Link to="/" style={{ fontSize: '1.25rem', fontWeight: 700, letterSpacing: '-0.05em' }}>
          CustomTees.
        </Link>

        <nav style={{ display: 'flex', gap: '2rem', display: 'none' }} className="nav-desktop">
          <Link to="/" style={{ color: 'var(--color-text-muted)', fontWeight: 500 }}>Shop</Link>
          <Link to="/customise" style={{ color: 'var(--color-text-muted)', fontWeight: 500 }}>Customise</Link>
          <Link to="/about" style={{ color: 'var(--color-text-muted)', fontWeight: 500 }}>About</Link>
        </nav>

        <div className="flex items-center gap-sm">
          <Link to="/cart" className="btn btn-outline" style={{ padding: '0.5rem', borderRadius: '50%' }}>
            <ShoppingBag size={20} />
          </Link>

          {user ? (
            <div className="flex items-center gap-sm">
              <Link to="/profile" style={{ fontSize: '0.875rem', fontWeight: 500 }}>
                {user.firstName}
              </Link>
              <button onClick={logout} className="btn btn-outline" style={{ padding: '0.5rem', borderRadius: '50%' }}>
                <LogOut size={20} />
              </button>
            </div>
          ) : (
            <Link to="/login" className="btn btn-primary" style={{ padding: '0.5rem', borderRadius: '50%' }}>
              <User size={20} />
            </Link>
          )}

          <button className="btn btn-outline menu-mobile" style={{ padding: '0.5rem', borderRadius: '50%' }}>
            <Menu size={20} />
          </button>
        </div>
      </div>
      <style>{`
        @media (min-width: 768px) {
          .nav-desktop { display: flex !important; }
          .menu-mobile { display: none !important; }
        }
      `}</style>
    </header>
  );
};

export default Navbar;
