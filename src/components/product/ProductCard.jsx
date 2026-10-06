import { Link } from 'react-router-dom';

const ProductCard = ({ product }) => {
  const variantColourObj = product.variantColour;
  const cName = variantColourObj ? (typeof variantColourObj === 'string' ? variantColourObj : variantColourObj.name) : null;
  const imageUrl = variantColourObj?.image || (product.baseImages && product.baseImages[0] ? product.baseImages[0] : null);

  const productLink = cName ? `/product/${product.slug}?colour=${encodeURIComponent(cName)}` : `/product/${product.slug}`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Link to={productLink} style={{ display: 'block', backgroundColor: '#ffffff', aspectRatio: '3/4', overflow: 'hidden' }}>
        {imageUrl ? (
          <img 
            src={imageUrl} 
            alt={product.name} 
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
          />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            No Image
          </div>
        )}
      </Link>
      
      <div style={{ paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', flexGrow: 1, justifyContent: 'space-between' }}>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
            <Link to={productLink} style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-primary)', textDecoration: 'none', lineHeight: 1.4 }}>
              {product.name} {cName && <span style={{ color: 'var(--text-secondary)', fontWeight: 400 }}>({cName})</span>}
            </Link>
            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>
              ₹{product.basePrice}
            </span>
          </div>
        </div>
        
        <Link to={productLink} className="btn btn-outline" style={{ marginTop: 'auto', width: '100%', padding: '0.5rem', fontSize: '0.75rem', textAlign: 'center' }}>
          View Product
        </Link>
      </div>
    </div>
  );
};

export default ProductCard;
