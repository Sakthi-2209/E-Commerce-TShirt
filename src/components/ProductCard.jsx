import { Link } from 'react-router-dom';

const ProductCard = ({ product }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <Link to={`/product/${product.slug}`} style={{ display: 'block', backgroundColor: 'var(--color-surface)', aspectRatio: '4/5', position: 'relative' }}>
        {product.baseImages && product.baseImages[0] ? (
          <img 
            src={product.baseImages[0]} 
            alt={product.name} 
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)' }}>
            No Image
          </div>
        )}
      </Link>
      
      <div style={{ padding: '1rem 0', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <Link to={`/product/${product.slug}`} style={{ fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>
            {product.name}
          </Link>
          <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
            {product.availableSizes?.length} sizes • {product.availableColours?.length} colours
          </div>
        </div>
        <div style={{ fontWeight: 500 }}>
          ₹{product.basePrice}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
