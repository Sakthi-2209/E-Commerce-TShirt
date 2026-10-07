import ProductCard from './ProductCard';

const ProductGrid = ({ products, loading, filters, maxItems }) => {
  if (loading) {
    return <div style={{ padding: '4rem 0', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading products...</div>;
  }

  if (!products || products.length === 0) {
    return <div style={{ padding: '4rem 0', textAlign: 'center', color: 'var(--text-secondary)' }}>No products found.</div>;
  }

  const { search = '', category = '', size = '', priceRange = '' } = filters || {};

  const flattenedProducts = [];
  products.forEach(product => {

    if (priceRange) {
      const [minStr, maxStr] = priceRange.split('-');
      const min = Number(minStr);
      const max = Number(maxStr);
      if (product.basePrice < min || product.basePrice > max) return;
    }

    if (category) {
      const catLower = category.toLowerCase();
      const matchCat = product.name.toLowerCase().includes(catLower) || 
                       (product.description && product.description.toLowerCase().includes(catLower));
      if (!matchCat) return;
    }

    if (product.availableColours?.length > 0) {
      product.availableColours.forEach(c => {
        const cName = typeof c === 'string' ? c : c.name;
        const cSizes = c.sizes || [];
        
        if (search) {
          const matchName = product.name.toLowerCase().includes(search.toLowerCase());
          const matchColour = cName.toLowerCase().includes(search.toLowerCase());
          if (!matchName && !matchColour) return;
        }
        
        if (size && cSizes.length > 0 && !cSizes.some(s => s.toLowerCase() === size.toLowerCase())) return;

        flattenedProducts.push({
          ...product,
          _id: `${product._id}-${cName}`,
          variantColour: c
        });
      });
    } else {
      if (search && !product.name.toLowerCase().includes(search.toLowerCase())) return;
      if (size && product.availableSizes?.length > 0 && !product.availableSizes.some(s => s.toLowerCase() === size.toLowerCase())) return;
      
      flattenedProducts.push(product);
    }
  });

  const displayProducts = maxItems ? flattenedProducts.slice(0, maxItems) : flattenedProducts;

  if (displayProducts.length === 0) {
    return (
      <div style={{ padding: '4rem 0', textAlign: 'center', width: '100%', color: 'var(--text-secondary)' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>No products found</h3>
        <p>Try adjusting your filters or search term to find what you're looking for.</p>
      </div>
    );
  }

  return (
    <>
      <style>{`
        .product-grid-layout {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1rem;
        }
        @media (min-width: 640px) {
          .product-grid-layout {
            grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
            gap: 2rem;
          }
        }
      `}</style>
      <div className="product-grid-layout">
        {displayProducts.map(product => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
    </>
  );
};

export default ProductGrid;
