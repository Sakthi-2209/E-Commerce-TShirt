import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import ProductGrid from '../../components/product/ProductGrid';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [discountData, setDiscountData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, discountRes] = await Promise.all([
          api.get('/products?limit=8'),
          api.get('/discounts')
        ]);
        setProducts(productsRes.data.products || []);
        setDiscountData(discountRes.data);
      } catch (err) {
        console.error('Failed to fetch home data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div>

      {discountData?.promoDiscount > 0 && discountData?.promoCode && (
        <div style={{ backgroundColor: 'var(--text-primary)', color: 'var(--bg-primary)', padding: '0.5rem', textAlign: 'center', fontSize: '0.875rem', fontWeight: 600, letterSpacing: '0.05em' }}>
          Use code <span style={{ color: '#fbbf24' }}>{discountData.promoCode}</span> for {discountData.promoDiscount}% off your entire order!
        </div>
      )}

      <section style={{ backgroundColor: 'var(--bg-secondary)', padding: '1.5rem 0', textAlign: 'center' }}>
        <div className="container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, letterSpacing: '-0.025em', maxWidth: '600px', lineHeight: 1.2 }}>
            Wear It . Make It Yours .
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', maxWidth: '500px' }}>
            Premium fabrics, bold fits, and zero compromises. Build your signature look with pieces that speak for themselves.
          </p>
          <Link to="/shop" className="btn btn-primary" style={{ marginTop: '0.5rem', fontSize: '0.875rem', padding: '0.5rem 1rem' }}>
            Shop Now
          </Link>
        </div>
      </section>

      <section style={{ padding: '4rem 0' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 600, letterSpacing: '-0.025em' }}>Featured Products</h2>
            <Link to="/shop" style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-secondary)' }}>
              View All
            </Link>
          </div>
          <ProductGrid products={products} loading={loading} />
        </div>
      </section>
    </div>
  );
};

export default Home;
