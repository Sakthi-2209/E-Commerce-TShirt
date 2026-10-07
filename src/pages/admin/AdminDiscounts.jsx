import { useState, useEffect } from 'react';
import api from '../../services/api';
import { Trash2, Edit3 } from 'lucide-react';

const AdminDiscounts = () => {
  const [activeDiscount, setActiveDiscount] = useState(null);
  const [discountData, setDiscountData] = useState({
    promoCode: '',
    promoDiscount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchDiscounts = async () => {
    try {
      const { data } = await api.get('/discounts');
      const discount = {
        promoCode: data.promoCode || '',
        promoDiscount: data.promoDiscount || 0,
      };
      
      if (discount.promoCode && discount.promoDiscount > 0) {
        setActiveDiscount(discount);
      } else {
        setActiveDiscount(null);
      }
      
      setDiscountData(discount);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiscounts();
  }, []);

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      await api.put('/discounts', discountData);
      setMessage('Discounts updated successfully!');
      setTimeout(() => setMessage(''), 3000);
      setIsEditing(false);
      await fetchDiscounts();
    } catch (err) {
      console.error(err);
      setMessage('Failed to update discounts.');
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    setDeleting(true);
    setMessage('');
    try {

      await api.put('/discounts', { promoCode: '', promoDiscount: 0 });
      setMessage('Discount deleted successfully!');
      setTimeout(() => setMessage(''), 3000);
      setShowDeleteModal(false);
      await fetchDiscounts();
    } catch (err) {
      console.error(err);
      setMessage('Failed to delete discount.');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <div style={{ padding: '2rem' }}>Loading discounts...</div>;

  return (
    <div style={{ maxWidth: '800px' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '2rem' }}>Manage Discounts</h1>
      
      {message && (
        <div style={{ padding: '1rem', marginBottom: '1.5rem', backgroundColor: message.includes('Failed') ? '#fee2e2' : '#dcfce7', color: message.includes('Failed') ? '#991b1b' : '#166534', borderRadius: '4px' }}>
          {message}
        </div>
      )}

      {activeDiscount ? (
        <div style={{ 
          backgroundColor: 'var(--bg-secondary)', 
          padding: '2rem', 
          borderRadius: '12px',
          border: '1px solid var(--border-color)',
          marginBottom: '2rem',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '1.5rem',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 700, margin: '0 0 0.25rem 0' }}>{activeDiscount.promoCode}</h3>
              <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '1.1rem' }}>
                Currently offering <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{activeDiscount.promoDiscount}% OFF</span>
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <button 
              onClick={() => {
                setDiscountData(activeDiscount);
                setIsEditing(true);
              }}
              className="btn btn-outline"
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem' }}
            >
              <Edit3 size={18} /> Edit
            </button>
            <button 
              onClick={() => setShowDeleteModal(true)}
              style={{ 
                display: 'flex', alignItems: 'center', gap: '0.5rem', 
                padding: '0.75rem 1.5rem',
                backgroundColor: '#fee2e2',
                color: '#dc2626',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: 500
              }}
            >
              <Trash2 size={18} /> Delete
            </button>
          </div>
        </div>
      ) : (
        <div style={{ 
          padding: '3rem 2rem', 
          textAlign: 'center',
          backgroundColor: 'var(--bg-secondary)', 
          borderRadius: '12px',
          border: '1px dashed var(--border-color)',
          marginBottom: '2rem'
        }}>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>No Active Discounts</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>You don't have any global discounts active right now.</p>
          {!isEditing && (
            <button 
              onClick={() => setIsEditing(true)}
              className="btn btn-primary"
              style={{ padding: '0.75rem 2rem' }}
            >
              Create Discount
            </button>
          )}
        </div>
      )}

      {isEditing && (
        <div style={{ 
          backgroundColor: 'var(--bg-secondary)', 
          padding: '2rem', 
          borderRadius: '12px',
          border: '1px solid var(--border-color)',
          animation: 'fadeIn 0.3s ease'
        }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem' }}>
            {activeDiscount ? 'Edit Discount' : 'Create New Discount'}
          </h2>
          
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Promo Code Name</label>
                <input 
                  type="text" 
                  value={discountData.promoCode}
                  onChange={e => setDiscountData({...discountData, promoCode: e.target.value.toUpperCase()})}
                  placeholder="e.g. FESTIVAL20"
                  required
                  style={{ padding: '0.75rem', border: '1px solid var(--border-color)', outline: 'none', borderRadius: '4px' }}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Discount Percentage (%)</label>
                <input 
                  type="number" 
                  min="1"
                  max="100"
                  value={discountData.promoDiscount}
                  onChange={e => setDiscountData({...discountData, promoDiscount: Number(e.target.value)})}
                  required
                  style={{ padding: '0.75rem', border: '1px solid var(--border-color)', outline: 'none', borderRadius: '4px' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <button type="submit" disabled={saving} className="btn btn-primary" style={{ padding: '0.75rem 2rem' }}>
                {saving ? 'Saving...' : 'Save Discount'}
              </button>
              <button 
                type="button" 
                onClick={() => {
                  setIsEditing(false);
                  setDiscountData(activeDiscount || { promoCode: '', promoDiscount: 0 });
                }}
                className="btn btn-outline" 
                style={{ padding: '0.75rem 2rem' }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {showDeleteModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000,
          animation: 'fadeIn 0.2s ease-out'
        }}>
          <div style={{
            backgroundColor: 'var(--bg-primary)',
            padding: '2rem',
            borderRadius: '8px',
            maxWidth: '400px',
            width: '90%',
            boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--text-primary)' }}>Delete Discount</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: '1.5' }}>
              Are you sure you want to delete the active discount <strong style={{color: 'var(--text-primary)'}}>"{activeDiscount?.promoCode}"</strong>? This will remove the promotion from the homepage.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button 
                onClick={() => setShowDeleteModal(false)} 
                className="btn btn-outline" 
                style={{ padding: '0.5rem 1rem' }}
                disabled={deleting}
              >
                Cancel
              </button>
              <button 
                onClick={confirmDelete} 
                style={{ 
                  padding: '0.5rem 1rem', 
                  backgroundColor: '#dc2626', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '4px', 
                  cursor: deleting ? 'not-allowed' : 'pointer',
                  fontWeight: 500,
                  opacity: deleting ? 0.7 : 1
                }}
                disabled={deleting}
              >
                {deleting ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDiscounts;
