import { useState, useEffect, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';
import { Package } from 'lucide-react';
import BackButton from '../../components/common/BackButton';

const Profile = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fullscreenItem, setFullscreenItem] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data } = await api.get('/orders/myorders');
        setOrders(data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (user) {
      fetchOrders();
    }
  }, [user]);

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem', minHeight: 'calc(100vh - 64px - 200px)' }}>
      <BackButton onClick={() => location.state?.fromCheckout ? navigate('/shop', { replace: true, state: { fromCheckout: true } }) : navigate(-1)} />
      <div style={{ marginBottom: '3rem', paddingBottom: '2rem', borderBottom: '1px solid var(--border-color)' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 700, letterSpacing: '-0.025em' }}>My Profile</h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>{user.firstName} {user.lastName} • {user.email}</p>
      </div>

      <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem' }}>Order History</h2>
      
      {loading ? (
        <div style={{ color: 'var(--text-secondary)' }}>Loading orders...</div>
      ) : orders.length === 0 ? (
        <div style={{ padding: '4rem', textAlign: 'center', backgroundColor: 'var(--bg-secondary)', borderRadius: '2px' }}>
          <Package size={32} strokeWidth={1} style={{ margin: '0 auto 1rem', color: 'var(--text-secondary)' }} />
          <p style={{ color: 'var(--text-secondary)' }}>You haven't placed any orders yet.</p>
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '700px', border: '1px solid #d1d5db' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-secondary)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                <th style={{ padding: '1rem', fontWeight: 600, border: '1px solid #d1d5db', width: '15%' }}>Order ID</th>
                <th style={{ padding: '1rem', fontWeight: 600, border: '1px solid #d1d5db', width: '15%' }}>Date</th>
                <th style={{ padding: '1rem', fontWeight: 600, border: '1px solid #d1d5db', width: '40%' }}>Items</th>
                <th style={{ padding: '1rem', fontWeight: 600, border: '1px solid #d1d5db', width: '15%' }}>Total</th>
                <th style={{ padding: '1rem', fontWeight: 600, border: '1px solid #d1d5db', width: '15%' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order._id} style={{ fontSize: '0.875rem' }}>
                  <td style={{ padding: '1rem', fontFamily: 'monospace', color: 'var(--text-secondary)', border: '1px solid #d1d5db' }}>
                    #{order._id.substring(order._id.length - 8)}
                  </td>
                  <td style={{ padding: '1rem', border: '1px solid #d1d5db' }}>
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '1rem', border: '1px solid #d1d5db' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                      {order.orderItems.map((item, idx) => (
                        <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ fontWeight: 500 }}>{item.quantity}x</span>
                          <span 
                            onClick={() => setFullscreenItem(item)}
                            style={{ 
                              cursor: 'pointer',
                              borderBottom: item.customisation ? '1px dashed var(--text-secondary)' : 'none',
                              color: 'var(--text-primary)'
                            }}
                            title={item.customisation ? 'View Custom Design' : 'View Item'}
                          >
                            {item.name}
                          </span>
                          <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>({item.size})</span>
                        </div>
                      ))}
                    </div>
                  </td>
                  <td style={{ padding: '1rem', fontWeight: 500, border: '1px solid #d1d5db' }}>
                    ₹{order.pricingBreakdown?.totalPrice}
                  </td>
                  <td style={{ padding: '1rem', border: '1px solid #d1d5db' }}>
                    <span style={{ 
                      fontSize: '0.75rem', 
                      fontWeight: 600, 
                      padding: '0.25rem 0.75rem', 
                      backgroundColor: order.isPaid ? '#dcfce7' : '#f1f5f9', 
                      color: order.isPaid ? '#166534' : 'var(--text-secondary)', 
                      borderRadius: '1rem' 
                    }}>
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {fullscreenItem && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.9)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '2rem' }}>
          <button onClick={() => setFullscreenItem(null)} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', fontSize: '2rem', color: '#fff', cursor: 'pointer', background: 'none', border: 'none' }}>&times;</button>
          
          <div style={{ position: 'relative', height: '80vh', maxHeight: '800px', aspectRatio: '3/4', backgroundColor: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', borderRadius: '4px' }}>
            <img src={fullscreenItem.customisation?.previewImageUrl || fullscreenItem.image} alt={fullscreenItem.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
