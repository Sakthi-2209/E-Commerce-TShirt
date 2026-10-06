import { Shield, Mail, Phone, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer style={{ backgroundColor: 'var(--bg-secondary)', padding: '2rem 0 1.5rem', borderTop: '1px solid var(--border-color)' }}>
      <div className="container">

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ fontSize: '1.125rem', fontWeight: 700, letterSpacing: '-0.05em' }}>STYLEHUB</div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.6 }}>
              Minimalist, high-quality everyday wear designed with simplicity in mind. We believe in clothes that look good, feel good, and last longer.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ fontWeight: 600, fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Shop</div>
            <Link to="/shop" onClick={() => window.scrollTo(0, 0)} style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', textDecoration: 'none' }}>All Products</Link>
            <Link to="/shop" onClick={() => window.scrollTo(0, 0)} style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', textDecoration: 'none' }}>New Arrivals</Link>
            <Link to="/shop" onClick={() => window.scrollTo(0, 0)} style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', textDecoration: 'none' }}>Best Sellers</Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ fontWeight: 600, fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Contact Us</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              <Mail size={16} /> sakthi270929@gmail.com
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              <Phone size={16} /> +91 9789283101
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              <MapPin size={16} style={{ marginTop: '2px', flexShrink: 0 }} /> 
              <span>100 feet Road, Vijaya Nagar,<br/>Velachery, Chennai, 600042, Tamilnadu</span>
            </div>
          </div>

        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            © {new Date().getFullYear()} STYLEHUB. All rights reserved.
          </div>
        </div>
        
      </div>
    </footer>
  );
};

export default Footer;
