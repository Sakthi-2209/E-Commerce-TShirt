import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { Plus, Image as ImageIcon, Edit2, X, Trash2, ExternalLink } from 'lucide-react';

const SizeDropdown = ({ selected, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const options = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
  
  const toggleOption = (opt) => {
    if (selected.includes(opt)) {
      onChange(selected.filter(o => o !== opt));
    } else {
      onChange([...selected, opt]);
    }
  };

  return (
    <div style={{ position: 'relative', width: '100%', flex: '1 1 200px' }}>
      <label style={{ fontSize: '0.75rem', marginBottom: '0.5rem', display: 'block' }}>Sizes</label>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        style={{ 
          border: '1px solid var(--border-color)', 
          borderRadius: '2px', 
          padding: '0.5rem', 
          minHeight: '42px',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.5rem',
          alignItems: 'center',
          cursor: 'pointer',
          backgroundColor: 'var(--bg-primary)'
        }}
      >
        {selected.length === 0 ? (
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Select sizes...</span>
        ) : (
          selected.map(sz => (
            <span key={sz} style={{ 
              backgroundColor: '#ecfdf5',
              color: '#065f46',
              padding: '0.125rem 0.5rem',
              borderRadius: '2px',
              fontSize: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
              border: '1px solid #a7f3d0'
            }}>
              {sz}
              <button 
                type="button"
                onClick={(e) => { e.stopPropagation(); toggleOption(sz); }}
                style={{ background: 'none', border: 'none', color: '#065f46', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
              >
                <X size={12} />
              </button>
            </span>
          ))
        )}
        <div style={{ marginLeft: 'auto', color: 'var(--text-secondary)' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {isOpen ? <polyline points="18 15 12 9 6 15"></polyline> : <polyline points="6 9 12 15 18 9"></polyline>}
          </svg>
        </div>
      </div>

      {isOpen && (
        <div style={{ 
          position: 'absolute', 
          top: '100%', 
          left: 0, 
          right: 0, 
          backgroundColor: 'var(--bg-primary)', 
          border: '1px solid var(--border-color)',
          borderTop: 'none',
          borderBottomLeftRadius: '2px',
          borderBottomRightRadius: '2px',
          zIndex: 10,
          maxHeight: '200px',
          overflowY: 'auto',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
        }}>
          {options.map(opt => {
            const isChecked = selected.includes(opt);
            return (
              <div 
                key={opt}
                onClick={(e) => { e.stopPropagation(); toggleOption(opt); }}
                style={{ 
                  padding: '0.75rem 1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  cursor: 'pointer',
                  backgroundColor: isChecked ? '#ecfdf5' : 'transparent',
                  borderBottom: '1px solid var(--border-color)'
                }}
              >
                <div style={{
                  width: '16px', height: '16px', borderRadius: '2px',
                  border: `1px solid ${isChecked ? '#059669' : 'var(--border-color)'}`,
                  backgroundColor: isChecked ? '#059669' : 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  {isChecked && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>}
                </div>
                <span style={{ fontSize: '0.875rem', color: isChecked ? '#065f46' : 'var(--text-primary)', fontWeight: isChecked ? 500 : 400 }}>
                  {opt}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const initialFormState = { name: '', slug: '', description: '', basePrice: '', isActive: true };
  const [formData, setFormData] = useState(initialFormState);
  const [colours, setColours] = useState([]);
  const [imageFile, setImageFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [editingSlug, setEditingSlug] = useState(null);
  const [productToDelete, setProductToDelete] = useState(null);
  const [colourToDeleteIdx, setColourToDeleteIdx] = useState(null);
  const [toastMessage, setToastMessage] = useState('');
  const [errors, setErrors] = useState({});

  const fetchProducts = async () => {
    try {
      const { data } = await api.get('/products?limit=10000&showAll=true');
      setProducts(data.products || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleEditClick = (product) => {
    setFormData({
      name: product.name,
      slug: product.slug,
      description: product.description,
      basePrice: product.basePrice,
      isActive: product.isActive
    });
    setColours(product.availableColours?.map(c => typeof c === 'string' 
      ? { name: c, existingImage: '', sizes: 'S, M, L', file: null } 
      : { name: c.name, existingImage: c.image || '', sizes: c.sizes?.join(', ') || 'S, M, L', file: null }
    ) || []);
    setEditingSlug(product.slug);
    setImageFile(null);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingSlug(null);
    setFormData(initialFormState);
    setImageFile(null);
    setColours([]);
    setErrors({});
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    
    const newErrors = {};
    if (!formData.name?.trim()) newErrors.name = 'Required';
    if (!formData.basePrice) newErrors.basePrice = 'Required';
    if (!formData.description?.trim()) newErrors.description = 'Required';
    
    if (!imageFile && !editingSlug) {
      newErrors.image = 'Required';
    }

    if (!colours || colours.length === 0) {
      newErrors.colours = 'At least one colour variant is required';
    } else {
      const invalidColour = colours.find(c => !c.name?.trim());
      if (invalidColour) {
        newErrors.colours = 'All colour variants must have a name';
      }
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setErrors({});
    setSaving(true);
    
    try {
      let imageUrl = '';
      if (imageFile) {
        const uploadData = new FormData();
        uploadData.append('image', imageFile);
        const uploadRes = await api.post('/upload', uploadData);
        imageUrl = uploadRes.data.url;
      }

      const uploadedColours = await Promise.all(colours.map(async (c) => {
        let imageUrl = c.existingImage;
        if (c.file) {
          const uploadData = new FormData();
          uploadData.append('image', c.file);
          const uploadRes = await api.post('/upload', uploadData);
          imageUrl = uploadRes.data.url;
        }
        return { 
          name: c.name, 
          image: imageUrl, 
          sizes: (c.sizes || 'S, M, L').split(',').map(s => s.trim()) 
        };
      }));

      const finalSlug = editingSlug ? formData.slug : formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

      const payload = {
        name: formData.name,
        slug: finalSlug,
        description: formData.description,
        basePrice: Number(formData.basePrice),
        availableColours: uploadedColours.filter(c => c.name),
        isActive: formData.isActive
      };
      
      if (imageUrl) {
        payload.baseImages = [imageUrl];
      }

      if (editingSlug) {
        await api.put(`/products/${editingSlug}`, payload);
      } else {
        await api.post('/products', payload);
      }
      
      const successMsg = editingSlug ? 'Product updated successfully.' : 'Product created successfully.';

      handleCancel();
      fetchProducts();
      
      setToastMessage(successMsg);
      setTimeout(() => setToastMessage(''), 3000);
    } catch (err) {
      console.error(err.response || err);
      alert('Failed: ' + (err.response?.data?.message || err.message || 'Unknown error'));
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProduct = (product) => {
    setProductToDelete(product);
  };

  const confirmDelete = async () => {
    try {
      await api.delete(`/products/${productToDelete.slug}`);
      setProductToDelete(null);
      fetchProducts();
      
      setToastMessage('Product deleted successfully.');
      setTimeout(() => setToastMessage(''), 3000);
    } catch (err) {
      console.error(err);
      alert('Failed to delete product: ' + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 700, letterSpacing: '-0.025em' }}>Products</h1>
        {!showForm && (
          <button onClick={() => setShowForm(true)} className="btn btn-primary" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', padding: '0.75rem 1rem' }}>
            <Plus size={18} /> New Product
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSaveProduct} style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', padding: '2rem', marginBottom: '2rem', borderRadius: '2px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>{editingSlug ? 'Edit Product' : 'Create New Product'}</h2>
            <button type="button" onClick={handleCancel} style={{ color: 'var(--text-secondary)', background: 'none', border: 'none', cursor: 'pointer' }}>
              <X size={20} />
            </button>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Product Name</label>
              <input value={formData.name} onChange={e => { setFormData({...formData, name: e.target.value}); if (errors.name) setErrors({...errors, name: null}); }} style={{ padding: '0.75rem', border: `1px solid ${errors.name ? '#ef4444' : 'var(--border-color)'}`, borderRadius: '2px', outline: 'none' }} />
              {errors.name && <span style={{ color: '#ef4444', fontSize: '0.75rem', fontWeight: 500 }}>{errors.name}</span>}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Base Price (₹)</label>
              <input type="number" value={formData.basePrice} onChange={e => { setFormData({...formData, basePrice: e.target.value}); if (errors.basePrice) setErrors({...errors, basePrice: null}); }} style={{ padding: '0.75rem', border: `1px solid ${errors.basePrice ? '#ef4444' : 'var(--border-color)'}`, borderRadius: '2px', outline: 'none' }} />
              {errors.basePrice && <span style={{ color: '#ef4444', fontSize: '0.75rem', fontWeight: 500 }}>{errors.basePrice}</span>}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Product Image {editingSlug && '(Leave empty to keep existing)'}</label>
              <div style={{ padding: '0.5rem', border: `1px dashed ${errors.image ? '#ef4444' : 'var(--border-color)'}`, borderRadius: '2px', display: 'flex', alignItems: 'center' }}>
                <input type="file" accept="image/*" onChange={e => { setImageFile(e.target.files[0]); if (errors.image) setErrors({...errors, image: null}); }} style={{ fontSize: '0.875rem' }} />
              </div>
              {errors.image && <span style={{ color: '#ef4444', fontSize: '0.75rem', fontWeight: 500 }}>{errors.image}</span>}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', gridColumn: 'span 2' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Colour Variants & Sizes</label>
                  {errors.colours && <span style={{ color: '#ef4444', fontSize: '0.75rem', fontWeight: 500 }}>{errors.colours}</span>}
                </div>
                <button type="button" onClick={() => { setColours([...colours, { name: '', file: null, existingImage: '', sizes: 'S, M, L' }]); if (errors.colours) setErrors({...errors, colours: null}); }} className="btn btn-outline" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}>Add Colour</button>
              </div>
              {colours.map((c, idx) => (
                <div key={idx} style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'flex-start', padding: '1rem', border: `1px solid ${errors.colours && !c.name?.trim() ? '#ef4444' : 'var(--border-color)'}`, borderRadius: '2px' }}>
                  <div style={{ flex: '1 1 200px', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label style={{ fontSize: '0.75rem' }}>Colour Name</label>
                    <input value={c.name} onChange={e => { const newC = [...colours]; newC[idx].name = e.target.value; setColours(newC); if (errors.colours) setErrors({...errors, colours: null}); }} style={{ padding: '0.5rem', border: '1px solid var(--border-color)', outline: 'none' }} placeholder="e.g. Red" />
                  </div>
                  <SizeDropdown 
                    selected={(c.sizes || '').split(',').map(s => s.trim()).filter(Boolean)}
                    onChange={(newSizes) => {
                      const newC = [...colours];
                      newC[idx].sizes = newSizes.join(', ');
                      setColours(newC);
                    }}
                  />
                  <div style={{ flex: '1 1 200px', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label style={{ fontSize: '0.75rem' }}>Colour Image {c.existingImage && '(Has Image)'}</label>
                    <input type="file" accept="image/*" onChange={e => { const newC = [...colours]; newC[idx].file = e.target.files[0]; setColours(newC); }} style={{ fontSize: '0.75rem' }} />
                  </div>
                  <button type="button" onClick={() => setColourToDeleteIdx(idx)} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', marginTop: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.875rem', fontWeight: 500 }}>
                    <Trash2 size={16} /> Delete
                  </button>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', gridColumn: 'span 2' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Description</label>
              <textarea value={formData.description} onChange={e => { setFormData({...formData, description: e.target.value}); if (errors.description) setErrors({...errors, description: null}); }} style={{ padding: '0.75rem', border: `1px solid ${errors.description ? '#ef4444' : 'var(--border-color)'}`, borderRadius: '2px', minHeight: '100px', resize: 'vertical', outline: 'none' }} />
              {errors.description && <span style={{ color: '#ef4444', fontSize: '0.75rem', fontWeight: 500 }}>{errors.description}</span>}
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', gridColumn: 'span 2' }}>
              <input type="checkbox" id="isActive" checked={formData.isActive} onChange={e => setFormData({...formData, isActive: e.target.checked})} />
              <label htmlFor="isActive" style={{ fontSize: '0.875rem', fontWeight: 500 }}>Product is Active</label>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <button type="submit" disabled={saving} className="btn btn-primary" style={{ padding: '0.75rem 2rem' }}>
              {saving ? 'Saving...' : (editingSlug ? 'Update Product' : 'Publish Product')}
            </button>
            <button type="button" onClick={handleCancel} className="btn" style={{ padding: '0.75rem 2rem', border: '1px solid var(--border-color)' }}>
              Cancel
            </button>
          </div>
        </form>
      )}

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '800px', border: '1px solid #d1d5db' }}>
          <thead>
            <tr style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-secondary)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              <th style={{ padding: '1rem', fontWeight: 600, border: '1px solid #d1d5db' }}>Image</th>
              <th style={{ padding: '1rem', fontWeight: 600, border: '1px solid #d1d5db' }}>Name</th>
              <th style={{ padding: '1rem', fontWeight: 600, border: '1px solid #d1d5db' }}>Price</th>
              <th style={{ padding: '1rem', fontWeight: 600, border: '1px solid #d1d5db' }}>Colors</th>
              <th style={{ padding: '1rem', fontWeight: 600, border: '1px solid #d1d5db' }}>Status</th>
              <th style={{ padding: '1rem', fontWeight: 600, border: '1px solid #d1d5db' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="6" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)', border: '1px solid #d1d5db' }}>Loading...</td></tr>
            ) : products.length === 0 ? (
              <tr><td colSpan="6" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)', border: '1px solid #d1d5db' }}>No products found.</td></tr>
            ) : (
              products.map(p => (
                <tr key={p._id} style={{ fontSize: '0.875rem' }}>
                  <td style={{ padding: '1rem', border: '1px solid #d1d5db' }}>
                    <div style={{ width: '40px', height: '40px', backgroundColor: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {p.baseImages?.[0] ? <img src={p.baseImages[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} /> : <ImageIcon size={16} color="var(--text-secondary)" />}
                    </div>
                  </td>
                  <td style={{ padding: '1rem', fontWeight: 500, border: '1px solid #d1d5db' }}>{p.name}</td>
                  <td style={{ padding: '1rem', border: '1px solid #d1d5db' }}>₹{p.basePrice}</td>
                  <td style={{ padding: '1rem', border: '1px solid #d1d5db' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      {p.availableColours?.map((c, i) => (
                        <span key={i} style={{ padding: '0.125rem 0.5rem', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '1rem', fontSize: '0.75rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                          {typeof c === 'string' ? c : c.name}
                        </span>
                      ))}
                      {(!p.availableColours || p.availableColours.length === 0) && <span style={{ color: 'var(--text-secondary)' }}>None</span>}
                    </div>
                  </td>
                  <td style={{ padding: '1rem', border: '1px solid #d1d5db' }}>
                    <span style={{ padding: '0.25rem 0.5rem', backgroundColor: p.isActive ? '#ecfdf5' : '#fef2f2', color: p.isActive ? '#065f46' : '#991b1b', fontSize: '0.75rem', borderRadius: '2px', fontWeight: 500 }}>
                      {p.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', border: '1px solid #d1d5db' }}>
                    <div style={{ display: 'flex', gap: '1rem' }}>

                      <button 
                        onClick={() => handleEditClick(p)} 
                        style={{ color: 'var(--text-secondary)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.875rem', fontWeight: 500 }}
                      >
                        <Edit2 size={16} /> Edit
                      </button>
                      <button 
                        onClick={() => handleDeleteProduct(p)} 
                        style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.875rem', fontWeight: 500 }}
                      >
                        <Trash2 size={16} /> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {productToDelete && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ backgroundColor: 'var(--bg-primary)', width: '100%', maxWidth: '400px', padding: '2rem', borderRadius: '4px', position: 'relative' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem' }}>Delete Product?</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '2rem', lineHeight: 1.5 }}>
              Are you sure you want to delete <strong>{productToDelete.name}</strong>? This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button onClick={() => setProductToDelete(null)} style={{ padding: '0.5rem 1rem', border: '1px solid var(--border-color)', borderRadius: '2px', background: 'none', cursor: 'pointer', fontWeight: 500 }}>
                Cancel
              </button>
              <button onClick={confirmDelete} style={{ padding: '0.5rem 1rem', border: 'none', borderRadius: '2px', backgroundColor: '#ef4444', color: '#fff', cursor: 'pointer', fontWeight: 500 }}>
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {colourToDeleteIdx !== null && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ backgroundColor: 'var(--bg-primary)', width: '100%', maxWidth: '400px', padding: '2rem', borderRadius: '4px', position: 'relative' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem' }}>Delete Colour Variant?</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '2rem', lineHeight: 1.5 }}>
              Are you sure you want to remove the <strong>{colours[colourToDeleteIdx]?.name || 'unnamed'}</strong> colour variant?
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => setColourToDeleteIdx(null)} style={{ padding: '0.5rem 1rem', border: '1px solid var(--border-color)', borderRadius: '2px', background: 'none', cursor: 'pointer', fontWeight: 500 }}>
                Cancel
              </button>
              <button type="button" onClick={() => {
                const newC = [...colours];
                newC.splice(colourToDeleteIdx, 1);
                setColours(newC);
                setColourToDeleteIdx(null);
              }} style={{ padding: '0.5rem 1rem', border: 'none', borderRadius: '2px', backgroundColor: '#ef4444', color: '#fff', cursor: 'pointer', fontWeight: 500 }}>
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {toastMessage && (
        <div style={{
          position: 'fixed',
          bottom: '2rem',
          right: '2rem',
          backgroundColor: '#000',
          color: '#fff',
          padding: '1rem 1.5rem',
          borderRadius: '4px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          fontSize: '0.875rem',
          fontWeight: 500
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
          {toastMessage}
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
