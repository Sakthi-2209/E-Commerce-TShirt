import { useState, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import BackButton from '../../components/common/BackButton';

const addressSchema = z.object({
  street: z.string().min(1, 'Required').min(5, 'Please provide a complete address'),
  city: z.string().min(1, 'Required'),
  state: z.string().min(1, 'Required'),
  zip: z.string().min(1, 'Required').regex(/^\d{6}$/, 'Must be 6 digits'),
  phone: z.string().min(1, 'Required').min(10, 'Must be at least 10 digits'),
  country: z.literal('India')
});

const loadRazorpay = () => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const Checkout = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [globalError, setGlobalError] = useState('');
  
  const searchParams = new URLSearchParams(location.search);
  const promoCode = searchParams.get('promo');
  
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      street: '',
      city: '',
      state: '',
      zip: '',
      phone: '',
      country: 'India'
    }
  });

  const onSubmit = async (addressData) => {
    setLoading(true);
    setGlobalError('');
    
    const res = await loadRazorpay();
    if (!res) {
      setGlobalError('Payment gateway failed to load. Please check your connection.');
      setLoading(false);
      return;
    }

    try {
      const { data } = await api.post('/orders/checkout', { shippingAddress: addressData, promoCode });
      
      if (data.isTestBypass) {

        sessionStorage.removeItem('appliedPromo');
        navigate('/profile', { replace: true, state: { fromCheckout: true } });
        return;
      }
      
      const options = {
        key: 'rzp_test_TkGOCC6bOG6Yw3', // Updated with provided test key
        amount: data.amount,
        currency: data.currency,
        name: 'STYLEHUB',
        description: 'Order Payment',
        order_id: data.razorpayOrderId,
        handler: async function (response) {
          try {
            await api.post('/orders/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            });
            sessionStorage.removeItem('appliedPromo');
            navigate('/profile', { replace: true, state: { fromCheckout: true } });
          } catch (err) {
            setGlobalError('Payment verification failed.');
          }
        },
        prefill: {
          name: `${user?.firstName} ${user?.lastName}`,
          email: user?.email || '',
        },
        theme: {
          color: '#111827', // Matching STYLEHUB text-primary
        }
      };

      const paymentObject = new window.Razorpay(options);
      
      paymentObject.on('payment.failed', function (response){
        setGlobalError('Payment failed. Please try again.');
      });
      
      paymentObject.open();
      
    } catch (err) {
      console.error(err);
      setGlobalError(err.response?.data?.message || 'Error creating order. Is your cart empty?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem', minHeight: 'calc(100vh - 64px - 200px)' }}>
      <BackButton />
      
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 700, letterSpacing: '-0.025em', marginBottom: '2rem' }}>Checkout</h1>
      
      {globalError && (
        <div style={{ backgroundColor: '#fee2e2', color: '#991b1b', padding: '1rem', borderRadius: '2px', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
          {globalError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem' }}>Shipping Address</h2>
          <div className="checkout-grid" style={{ display: 'grid', gap: '1.25rem' }}>

            <div className="full-width" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Street Address</label>
              <input 
                {...register('street')}
                style={{ padding: '0.75rem', border: `1px solid ${errors.street ? '#ef4444' : 'var(--border-color)'}`, borderRadius: '2px', outline: 'none' }}
              />
              {errors.street && <span style={{ color: '#ef4444', fontSize: '0.75rem', fontWeight: 500 }}>{errors.street.message}</span>}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>City</label>
              <input 
                {...register('city')}
                style={{ padding: '0.75rem', border: `1px solid ${errors.city ? '#ef4444' : 'var(--border-color)'}`, borderRadius: '2px', outline: 'none' }}
              />
              {errors.city && <span style={{ color: '#ef4444', fontSize: '0.75rem', fontWeight: 500 }}>{errors.city.message}</span>}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>State</label>
              <input 
                {...register('state')}
                style={{ padding: '0.75rem', border: `1px solid ${errors.state ? '#ef4444' : 'var(--border-color)'}`, borderRadius: '2px', outline: 'none' }}
              />
              {errors.state && <span style={{ color: '#ef4444', fontSize: '0.75rem', fontWeight: 500 }}>{errors.state.message}</span>}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>ZIP Code</label>
              <input 
                {...register('zip')}
                style={{ padding: '0.75rem', border: `1px solid ${errors.zip ? '#ef4444' : 'var(--border-color)'}`, borderRadius: '2px', outline: 'none' }}
              />
              {errors.zip && <span style={{ color: '#ef4444', fontSize: '0.75rem', fontWeight: 500 }}>{errors.zip.message}</span>}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Phone Number</label>
              <input 
                type="tel"
                {...register('phone')}
                style={{ padding: '0.75rem', border: `1px solid ${errors.phone ? '#ef4444' : 'var(--border-color)'}`, borderRadius: '2px', outline: 'none' }}
              />
              {errors.phone && <span style={{ color: '#ef4444', fontSize: '0.75rem', fontWeight: 500 }}>{errors.phone.message}</span>}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Country</label>
              <input 
                {...register('country')}
                disabled
                style={{ padding: '0.75rem', border: '1px solid var(--border-color)', borderRadius: '2px', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}
              />
            </div>
          </div>
        </div>

        <button type="submit" disabled={loading} className="btn btn-primary" style={{ padding: '1rem', marginTop: '1rem', fontSize: '1rem' }}>
          {loading ? 'Processing...' : 'Complete Purchase'}
        </button>
      </form>
      </div>
      
      <style>{`
        .checkout-grid { grid-template-columns: 1fr; }
        @media (min-width: 640px) {
          .checkout-grid { grid-template-columns: 1fr 1fr; }
          .full-width { grid-column: span 2; }
        }
      `}</style>
    </div>
  );
};

export default Checkout;
