import { useState, useEffect } from 'react';
import api from '../../services/api';
import { ExternalLink } from 'lucide-react';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [fullscreenItem, setFullscreenItem] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchOrders = async () => {
    try {
      const { data } = await api.get('/orders');
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await api.patch(`/orders/${orderId}`, { status: newStatus });

      setOrders(orders.map(order => order._id === orderId ? { ...order, status: newStatus } : order));
    } catch (err) {
      console.error(err);
      alert('Failed to update status');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return { bg: '#fef3c7', text: '#92400e' };
      case 'Paid': return { bg: '#e0e7ff', text: '#3730a3' };
      case 'Processing': return { bg: '#dbeafe', text: '#1e40af' };
      case 'Shipped': return { bg: '#f3e8ff', text: '#6b21a8' };
      case 'Delivered': return { bg: '#dcfce7', text: '#166534' };
      case 'Cancelled': return { bg: '#fee2e2', text: '#991b1b' };
      default: return { bg: '#f3f4f6', text: '#1f2937' };
    }
  };

  const totalPages = Math.ceil(orders.length / itemsPerPage);
  const currentOrders = orders.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 700, letterSpacing: '-0.05em' }}>Orders</h1>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '800px', border: '1px solid #d1d5db' }}>
          <thead>
            <tr style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-secondary)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              <th style={{ padding: '1rem', fontWeight: 600, border: '1px solid #d1d5db' }}>Order ID</th>
              <th style={{ padding: '1rem', fontWeight: 600, border: '1px solid #d1d5db' }}>Customer</th>
              <th style={{ padding: '1rem', fontWeight: 600, border: '1px solid #d1d5db' }}>Total</th>
              <th style={{ padding: '1rem', fontWeight: 600, border: '1px solid #d1d5db' }}>Payment</th>
              <th style={{ padding: '1rem', fontWeight: 600, border: '1px solid #d1d5db' }}>Status</th>
              <th style={{ padding: '1rem', fontWeight: 600, border: '1px solid #d1d5db' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="6" style={{ padding: '2rem', color: 'var(--text-secondary)', textAlign: 'center', border: '1px solid #d1d5db' }}>Loading...</td></tr>
            ) : currentOrders.length === 0 ? (
              <tr><td colSpan="6" style={{ padding: '2rem', color: 'var(--text-secondary)', textAlign: 'center', border: '1px solid #d1d5db' }}>No orders yet.</td></tr>
            ) : (
              currentOrders.map(order => {
                const statusColors = getStatusColor(order.status);
                
                return (
                  <tr key={order._id} style={{ fontSize: '0.875rem' }}>
                    <td style={{ padding: '1.25rem 1rem', fontFamily: 'monospace', color: 'var(--text-secondary)', border: '1px solid #d1d5db' }}>
                      #{order._id.substring(order._id.length - 8)}
                    </td>
                    <td style={{ padding: '1.25rem 1rem', border: '1px solid #d1d5db' }}>
                      <div style={{ fontWeight: 500 }}>{order.customer ? `${order.customer.firstName} ${order.customer.lastName}` : 'Guest'}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{order.customer?.email}</div>
                    </td>
                    <td style={{ padding: '1.25rem 1rem', fontWeight: 500, border: '1px solid #d1d5db' }}>₹{order.pricingBreakdown?.totalPrice}</td>
                    <td style={{ padding: '1.25rem 1rem', border: '1px solid #d1d5db' }}>
                      {order.isPaid ? (
                        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#166534', backgroundColor: '#dcfce7', padding: '0.25rem 0.75rem', borderRadius: '1rem' }}>Paid</span>
                      ) : (
                        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#991b1b', backgroundColor: '#fee2e2', padding: '0.25rem 0.75rem', borderRadius: '1rem' }}>Unpaid</span>
                      )}
                    </td>
                    <td style={{ padding: '1.25rem 1rem', border: '1px solid #d1d5db' }}>
                      <select 
                        value={order.status}
                        onChange={(e) => handleStatusChange(order._id, e.target.value)}
                        style={{ 
                          backgroundColor: statusColors.bg, 
                          color: statusColors.text,
                          padding: '0.25rem 0.75rem',
                          border: 'none',
                          borderRadius: '4px',
                          fontWeight: 600,
                          fontSize: '0.75rem',
                          cursor: 'pointer',
                          outline: 'none'
                        }}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Paid">Paid</option>
                        <option value="Processing">Processing</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td style={{ padding: '1.25rem 1rem', border: '1px solid #d1d5db' }}>
                      <button onClick={() => setSelectedOrder(order)} className="btn btn-outline" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem', border: '1px solid var(--border-color)', borderRadius: '2px' }}>
                        <ExternalLink size={14} /> View
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {!loading && totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', marginTop: '2rem' }}>
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              style={{
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid var(--border-color)',
                borderRadius: '4px',
                backgroundColor: currentPage === i + 1 ? 'var(--text-primary)' : 'var(--bg-primary)',
                color: currentPage === i + 1 ? 'var(--bg-primary)' : 'var(--text-primary)',
                fontSize: '0.875rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}

      {selectedOrder && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ backgroundColor: 'var(--bg-primary)', width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto', padding: '2rem', borderRadius: '4px', position: 'relative' }}>
            <button onClick={() => setSelectedOrder(null)} style={{ position: 'absolute', top: '1rem', right: '1rem', fontSize: '1.25rem', cursor: 'pointer', background: 'none', border: 'none' }}>&times;</button>
            
            <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1.5rem' }}>Order Details</h2>
            
            <div style={{ marginBottom: '1.5rem', fontSize: '0.875rem' }}>
              <p><strong>Order ID:</strong> {selectedOrder._id}</p>
              <p><strong>Customer:</strong> {selectedOrder.customer ? `${selectedOrder.customer.firstName} ${selectedOrder.customer.lastName}` : 'Guest'}</p>
            </div>
            
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem' }}>Items</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
              {selectedOrder.orderItems.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
                  <div 
                    onClick={() => setFullscreenItem(item)}
                    style={{ position: 'relative', width: '60px', height: '80px', backgroundColor: '#ffffff', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, cursor: 'pointer' }}
                    title="Click to view full size design"
                  >
                    <img src={item.customisation?.previewImageUrl || item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 500 }}>{item.name} (x{item.quantity})</div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Size: {item.size} | Color: {item.colour}</div>
                    {item.customisation?.type === 'text' && (
                      <div style={{ fontSize: '0.875rem', fontStyle: 'italic', color: 'var(--text-primary)', marginTop: '0.25rem' }}>
                        Custom Print: "{item.customisation.textContent}"
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem' }}>Shipping Address</h3>
            <div style={{ fontSize: '0.875rem', lineHeight: '1.5', color: 'var(--text-secondary)' }}>
              <p>{selectedOrder.shippingAddress?.street}</p>
              <p>{selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state} {selectedOrder.shippingAddress?.zip}</p>
              <p>{selectedOrder.shippingAddress?.country}</p>
              <p style={{ marginTop: '0.5rem', fontWeight: 500, color: 'var(--text-primary)' }}>
                Phone: {selectedOrder.shippingAddress?.phone || 'N/A'}
              </p>
            </div>

            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginTop: '2rem', marginBottom: '1rem' }}>Pricing Breakdown</h3>
            {(() => {
              const shirtPriceTotal = selectedOrder.orderItems.reduce((acc, item) => {
                const basePrice = item.price - (item.customisationFeeApplied || 0);
                return acc + (basePrice * item.quantity);
              }, 0);
              const customFee = selectedOrder.orderItems.reduce((acc, item) => acc + ((item.customisationFeeApplied || 0) * item.quantity), 0);

              return (
                <div style={{ fontSize: '0.875rem', lineHeight: '1.5', backgroundColor: 'var(--bg-secondary)', padding: '1rem', borderRadius: '4px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Shirt Price:</span>
                    <span>₹{shirtPriceTotal}</span>
                  </div>
                  {customFee > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Customization Charge:</span>
                      <span>₹{customFee}</span>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Shipping:</span>
                    <span>₹{selectedOrder.pricingBreakdown?.shippingPrice}</span>
                  </div>
                  {selectedOrder.pricingBreakdown?.discountPrice > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: '#166534' }}>
                      <span>Discount Applied:</span>
                      <span>-₹{selectedOrder.pricingBreakdown?.discountPrice}</span>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)', fontWeight: 600, fontSize: '1rem' }}>
                    <span>Total:</span>
                    <span>₹{selectedOrder.pricingBreakdown?.totalPrice}</span>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {fullscreenItem && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.9)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '2rem' }}>
          <button onClick={() => setFullscreenItem(null)} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', fontSize: '2rem', color: '#fff', cursor: 'pointer', background: 'none', border: 'none' }}>&times;</button>
          
          <div style={{ position: 'relative', height: '80vh', maxHeight: '800px', aspectRatio: '3/4', backgroundColor: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', borderRadius: '4px' }}>
            <img src={fullscreenItem.customisation?.previewImageUrl || fullscreenItem.image} alt={fullscreenItem.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>
          
          {(fullscreenItem.customisation?.type === 'text' || fullscreenItem.customisation?.type === 'both') && (
            <div style={{ position: 'absolute', bottom: '2rem', backgroundColor: 'rgba(255,255,255,0.9)', padding: '1rem', borderRadius: '4px', textAlign: 'center' }}>
              <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>Text Print Details</div>
              <div style={{ fontSize: '0.875rem' }}>
                Text: "{fullscreenItem.customisation.textContent}" | Color: {fullscreenItem.customisation.textColor || '#000000'}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
