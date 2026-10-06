import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import api from '../../services/api';
import ProductGrid from '../../components/product/ProductGrid';
import BackButton from '../../components/common/BackButton';

const Shop = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const location = useLocation();
  const navigate = useNavigate();

  const [filters, setFilters] = useState({ category: '', size: '', priceRange: '' });

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/products?limit=50${debouncedSearch ? `&keyword=${debouncedSearch}` : ''}`);
        setProducts(data.products || []);
      } catch (err) {
        console.error('Failed to fetch products', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [debouncedSearch]);

  const activeFilters = { search: debouncedSearch, ...filters };

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem', minHeight: 'calc(100vh - 64px - 200px)' }}>
      <BackButton onClick={() => location.state?.fromCheckout ? navigate('/', { replace: true }) : navigate(-1)} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 700, letterSpacing: '-0.05em' }}>Shop Essentials</h1>
        
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: '1 1 250px', maxWidth: '400px' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
            <input 
              type="text" 
              placeholder="Search products..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ 
                width: '100%', 
                padding: '0.75rem 1rem 0.75rem 2.5rem', 
                border: '1px solid var(--border-color)', 
                borderRadius: '2px',
                outline: 'none',
                fontSize: '0.875rem'
              }}
            />
          </div>

          <select 
            value={filters.category} 
            onChange={e => setFilters({ ...filters, category: e.target.value })}
            style={{ padding: '0.75rem', border: '1px solid var(--border-color)', borderRadius: '2px', outline: 'none', fontSize: '0.875rem', backgroundColor: 'var(--bg-primary)' }}
          >
            <option value="">All Categories</option>
            <option value="Plain">Plain T-shirts</option>
            <option value="Full Hand">Full Hand</option>
            <option value="Oversized">Oversized</option>
            <option value="Dual Color">Dual Color</option>
            <option value="Hoodies">Hoodies</option>
            <option value="Printed">Printed</option>
          </select>

          <select 
            value={filters.size} 
            onChange={e => setFilters({ ...filters, size: e.target.value })}
            style={{ padding: '0.75rem', border: '1px solid var(--border-color)', borderRadius: '2px', outline: 'none', fontSize: '0.875rem', backgroundColor: 'var(--bg-primary)' }}
          >
            <option value="">All Sizes</option>
            <option value="S">Small (S)</option>
            <option value="M">Medium (M)</option>
            <option value="L">Large (L)</option>
            <option value="XL">Extra Large (XL)</option>
          </select>

          <select 
            value={filters.priceRange} 
            onChange={e => setFilters({ ...filters, priceRange: e.target.value })}
            style={{ padding: '0.75rem', border: '1px solid var(--border-color)', borderRadius: '2px', outline: 'none', fontSize: '0.875rem', backgroundColor: 'var(--bg-primary)' }}
          >
            <option value="">Any Price</option>
            <option value="0-500">₹0 - ₹500</option>
            <option value="500-1000">₹500 - ₹1000</option>
            <option value="1000-1500">₹1000 - ₹1500</option>
          </select>
        </div>
      </div>

      <ProductGrid products={products} loading={loading} filters={activeFilters} />
    </div>
  );
};

export default Shop;
