import { Outlet, Link } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingCart, Users } from 'lucide-react';

const AdminLayout = () => {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--color-surface)' }}>
      <aside style={{ width: '250px', backgroundColor: 'var(--color-text-main)', color: 'var(--color-bg)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid #333', fontSize: '1.25rem', fontWeight: 700, letterSpacing: '-0.05em' }}>
          Admin Panel
        </div>
        <nav style={{ display: 'flex', flexDirection: 'column', padding: '1rem 0' }}>
          <Link to="/admin/dashboard" style={{ padding: '0.75rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', opacity: 0.8 }}>
            <LayoutDashboard size={18} /> Dashboard
          </Link>
          <Link to="/admin/orders" style={{ padding: '0.75rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', opacity: 0.8 }}>
            <ShoppingCart size={18} /> Orders
          </Link>
          <Link to="/admin/products" style={{ padding: '0.75rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', opacity: 0.8 }}>
            <Package size={18} /> Products
          </Link>
          <Link to="/admin/customers" style={{ padding: '0.75rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', opacity: 0.8 }}>
            <Users size={18} /> Customers
          </Link>
        </nav>
      </aside>
      <main style={{ flex: 1, padding: '2rem', backgroundColor: 'var(--color-bg)' }}>
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
