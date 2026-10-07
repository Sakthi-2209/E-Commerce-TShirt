import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Trash2, ShoppingBag } from 'lucide-react';
import api from '../../services/api';
import BackButton from '../../components/common/BackButton';

const Cart = () => {
  const [cart, setCart] = useState(null);
  const [discountData, setDiscountData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [itemToRemove, setItemToRemove] = useState(null);
  
  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState(() => {
    const saved = sessionStorage.getItem('appliedPromo');
    return saved ? JSON.parse(saved) : null;
  });
  const [promoError, setPromoError] = useState('');

  const fetchCart = async () => {
    try {
      const [cartRes, discountRes] = await Promise.all([
        api.get('/cart'),
        api.get('/discounts')
      ]);
      const discountDataRes = discountRes.data;
      setCart(cartRes.data);
      setDiscountData(discountDataRes);

      const saved = sessionStorage.getItem('appliedPromo');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (discountDataRes?.promoCode !== parsed.code || discountDataRes?.promoDiscount <= 0) {
          sessionStorage.removeItem('appliedPromo');
          setAppliedPromo(null);
        } else {
          setPromoCodeInput(parsed.code);
        }
      }
    } catch (err) {
      if (err.response?.status !== 401) {
        console.error('Failed to fetch cart');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const handleRemove = (item) => {
    setItemToRemove(item);
  };

  const confirmRemove = async () => {
    try {
      await api.delete(`/cart/items/${itemToRemove._id}`);
      setItemToRemove(null);
      fetchCart();
    } catch (err) {
      console.error(err);
    }
  };

  const handleQuantity = async (itemId, currentQty, change) => {
    const newQty = currentQty + change;
    if (newQty < 1) return;
    try {
      await api.put(`/cart/items/${itemId}`, { quantity: newQty });
      fetchCart();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="container" style={{ padding: '4rem 1.5rem', textAlign: 'center' }}>Loading cart...</div>;

  if (!cart || cart.items.length === 0) {
    return (
      <div className="container" style={{ padding: '8rem 1.5rem', textAlign: 'center', minHeight: 'calc(100vh - 64px - 200px)' }}>
        <ShoppingBag size={48} strokeWidth={1} style={{ color: 'var(--border-color)', margin: '0 auto 1.5rem' }} />
        <h1 style={{ fontSize: '2rem', fontWeight: 700, letterSpacing: '-0.05em', marginBottom: '1rem' }}>Your cart is empty</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Looks like you haven't added anything yet.</p>
        <Link to="/shop" className="btn btn-primary">Continue Shopping</Link>
      </div>
    );
  }

  const getProductImage = (item) => {
    if (item.customisation?.previewImageUrl) {
      return item.customisation.previewImageUrl;
    }
    if (item.product.availableColours?.length) {
      const matched = item.product.availableColours.find(c => {
        const cName = typeof c === 'string' ? c : c.name;
        return cName === item.colour;
      });
      if (matched && typeof matched === 'object' && matched.image) return matched.image;
    }
    return item.product.baseImages?.[0];
  };

  const baseSubtotal = cart?.items?.reduce((acc, item) => acc + (item.product.basePrice * item.quantity), 0) || 0;
  const totalCustomisationFee = cart?.items?.reduce((acc, item) => {
    if (item.customisation?.type && item.customisation.type !== 'none') {
      return acc + ((cart.flatCustomisationFee || 50) * item.quantity);
    }
    return acc;
  }, 0) || 0;

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem', minHeight: 'calc(100vh - 64px - 200px)' }}>
      <BackButton />
      <h1 style={{ fontSize: '2.5rem', fontWeight: 700, letterSpacing: '-0.05em', marginBottom: '3rem' }}>Your Cart</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '4rem' }} className="cart-grid">

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {cart.items.map((item) => (
            <div key={item._id} className="cart-item">
              
              <div className="cart-item-img">
                {getProductImage(item) ? (
                  <img src={getProductImage(item)} alt={item.product.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                ) : (
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>No Image</span>
                )}
              </div>
              
              <div className="cart-item-details">
                <div>
                  <div className="cart-item-header">
                    <Link to={`/product/${item.product.slug}`} style={{ fontSize: '1.125rem', fontWeight: 600 }}>
                      {item.product.name}
                    </Link>
                    <span style={{ fontWeight: 500 }}>
                      ₹{(item.product.basePrice + (item.customisation?.type && item.customisation.type !== 'none' ? cart.flatCustomisationFee || 50 : 0)) * item.quantity}
                    </span>
                  </div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                    {item.colour} / {item.size}
                  </div>
                  {item.customisation?.type && item.customisation.type !== 'none' && (
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem', fontStyle: 'italic' }}>
                      + ₹{cart.flatCustomisationFee || 50} Custom Print
                      {item.customisation.type === 'text' && `: "${item.customisation.textContent}"`}
                      {item.customisation.type === 'library_design' && ` (Design)`}
                      {item.customisation.type === 'both' && ` (Text + Design)`}
                    </div>
                  )}
                </div>

                <div className="cart-item-controls">
                  <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--border-color)', borderRadius: '0px' }}>
                    <button onClick={() => handleQuantity(item._id, item.quantity, -1)} style={{ padding: '0.5rem 0.75rem' }}>-</button>
                    <span style={{ padding: '0 0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>{item.quantity}</span>
                    <button onClick={() => handleQuantity(item._id, item.quantity, 1)} style={{ padding: '0.5rem 0.75rem' }}>+</button>
                  </div>
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <button onClick={() => handleRemove(item)} style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.875rem', background: 'none', border: 'none', cursor: 'pointer' }}>
                      <Trash2 size={16} /> Remove
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="order-summary-box">
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem' }}>Order Summary</h2>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', color: 'var(--text-secondary)' }}>
            <span>Items Subtotal</span>
            <span>₹{baseSubtotal}</span>
          </div>
          {totalCustomisationFee > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', color: 'var(--text-secondary)' }}>
              <span>Custom Print Fee</span>
              <span>₹{totalCustomisationFee}</span>
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', color: 'var(--text-secondary)' }}>
            <span>Shipping</span>
            <span>₹50</span>
          </div>

          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input 
                type="text" 
                placeholder="Promo Code" 
                value={promoCodeInput}
                onChange={(e) => {
                  setPromoCodeInput(e.target.value.toUpperCase());
                  setPromoError('');
                }}
                style={{ flex: 1, minWidth: 0, padding: '0.75rem', border: '1px solid var(--border-color)', outline: 'none' }}
              />
              <button 
                onClick={() => {
                  if (promoCodeInput && discountData?.promoCode && promoCodeInput === discountData.promoCode && discountData.promoDiscount > 0) {
                    const promoObj = { code: discountData.promoCode, discount: discountData.promoDiscount };
                    setAppliedPromo(promoObj);
                    sessionStorage.setItem('appliedPromo', JSON.stringify(promoObj));
                    setPromoError('');
                  } else {
                    setPromoError('Invalid or expired promo code');
                    setAppliedPromo(null);
                    sessionStorage.removeItem('appliedPromo');
                  }
                }}
                className="btn btn-primary" 
                style={{ padding: '0.75rem 1.5rem' }}
              >
                Apply
              </button>
            </div>
            {promoError && <div style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.5rem' }}>{promoError}</div>}
            {appliedPromo && <div style={{ color: '#166534', fontSize: '0.75rem', marginTop: '0.5rem' }}>Promo applied! {appliedPromo.discount}% off items.</div>}
          </div>

          {appliedPromo && (
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', color: '#166534', fontWeight: 500 }}>
              <span>Discount ({appliedPromo.code})</span>
              <span>-₹{Math.round((baseSubtotal * appliedPromo.discount) / 100)}</span>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '1rem', borderTop: '1px solid var(--border-color)', fontWeight: 600, fontSize: '1.25rem', marginBottom: '2rem' }}>
            <span>Total</span>
            <span>₹{cart.subtotal + 50 - (appliedPromo ? Math.round((baseSubtotal * appliedPromo.discount) / 100) : 0)}</span>
          </div>
          <Link to={`/checkout${appliedPromo ? `?promo=${appliedPromo.code}` : ''}`} className="btn btn-primary" style={{ width: '100%', padding: '1rem', fontSize: '1rem', textAlign: 'center' }}>
            Proceed to Checkout
          </Link>
        </div>
      </div>

      {itemToRemove && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ backgroundColor: 'var(--bg-primary)', width: '100%', maxWidth: '400px', padding: '2rem', borderRadius: '4px', position: 'relative' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem' }}>Remove Item?</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '2rem', lineHeight: 1.5 }}>
              Do you want to remove <strong>{itemToRemove.product?.name}</strong> from your cart?
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button onClick={() => setItemToRemove(null)} style={{ padding: '0.5rem 1rem', border: '1px solid var(--border-color)', borderRadius: '2px', background: 'none', cursor: 'pointer', fontWeight: 500 }}>
                Cancel
              </button>
              <button onClick={confirmRemove} style={{ padding: '0.5rem 1rem', border: 'none', borderRadius: '2px', backgroundColor: '#ef4444', color: '#fff', cursor: 'pointer', fontWeight: 500 }}>
                Yes, Remove
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .order-summary-box {
          background-color: var(--bg-secondary);
          padding: 1.25rem;
          height: fit-content;
        }
        .cart-item {
          display: flex;
          gap: 1rem;
          padding-bottom: 1.5rem;
          border-bottom: 1px solid var(--border-color);
        }
        .cart-item-img {
          width: 80px;
          height: 100px;
          background-color: #ffffff;
          flex-shrink: 0;
          position: relative;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .cart-item-details {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          min-width: 0;
        }
        .cart-item-header {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 0.25rem;
        }
        .cart-item-controls {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 1rem;
          margin-top: 1rem;
        }
        @media (min-width: 640px) {
          .order-summary-box { padding: 2rem; }
          .cart-item { gap: 1.5rem; padding-bottom: 2rem; }
          .cart-item-img { width: 120px; height: 160px; }
          .cart-item-header { flex-direction: row; justify-content: space-between; align-items: flex-start; }
          .cart-item-controls { flex-direction: row; justify-content: space-between; align-items: center; margin-top: 0; }
        }
        @media (min-width: 1024px) {
          .cart-grid { grid-template-columns: 2fr 1fr !important; }
        }
      `}</style>
    </div>
  );
};

export default Cart;
