import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';

const PublicLayout = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: 'var(--color-bg)' }}>
      <Navbar />
      <main style={{ flex: 1, padding: '4rem 0' }}>
        <Outlet />
      </main>
      <footer style={{ borderTop: '1px solid var(--color-border)', padding: '2rem 0', textAlign: 'center', color: 'var(--color-text-muted)' }}>
        <div className="container">
          <p>© 2026 CustomTees. Developer-crafted quality.</p>
        </div>
      </footer>
    </div>
  );
};

export default PublicLayout;
