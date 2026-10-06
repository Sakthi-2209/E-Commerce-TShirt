import { useState, useEffect } from 'react';
import { Trash2, Upload, Plus } from 'lucide-react';
import api from '../../services/api';

const AdminDesigns = () => {
  const [designs, setDesigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  
  const [name, setName] = useState('');
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [designToDelete, setDesignToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchDesigns = async () => {
    try {
      const { data } = await api.get('/designs');
      setDesigns(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDesigns();
  }, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!name || !file) {
      setError('Name and Image File are required');
      return;
    }

    setUploading(true);
    setError('');

    try {
      const uploadData = new FormData();
      uploadData.append('image', file);
      
      const uploadRes = await api.post('/upload', uploadData);
      
      await api.post('/designs', {
        name,
        imageUrl: uploadRes.data.url
      });

      setName('');
      setFile(null);
      setShowForm(false);
      fetchDesigns();
    } catch (err) {
      console.error(err);
      setError('Failed to upload design');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!designToDelete) return;
    setDeleting(true);
    try {
      await api.delete(`/designs/${designToDelete._id}`);
      fetchDesigns();
      setDesignToDelete(null);
    } catch (err) {
      console.error(err);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Design Library</h1>
        {!showForm && (
          <button onClick={() => setShowForm(true)} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Plus size={16} /> Add Design
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleUpload} style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', padding: '2rem', marginBottom: '2rem', borderRadius: '2px', display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '500px' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Upload New Design</h2>
          
          {error && <div style={{ color: '#ef4444', fontSize: '0.875rem' }}>{error}</div>}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Design Name</label>
            <input 
              value={name} 
              onChange={e => setName(e.target.value)} 
              style={{ padding: '0.75rem', border: '1px solid var(--border-color)', outline: 'none' }} 
              placeholder="e.g., Cool Skull Logo"
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Image File (Transparent PNG recommended)</label>
            <div style={{ padding: '0.5rem', border: '1px dashed var(--border-color)', display: 'flex', alignItems: 'center' }}>
              <input 
                type="file" 
                accept="image/png, image/jpeg" 
                onChange={e => setFile(e.target.files[0])} 
                style={{ fontSize: '0.875rem' }} 
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <button type="button" onClick={() => setShowForm(false)} className="btn btn-outline" style={{ flex: 1 }}>
              Cancel
            </button>
            <button type="submit" disabled={uploading} className="btn btn-primary" style={{ flex: 1 }}>
              {uploading ? 'Uploading...' : 'Upload Design'}
            </button>
          </div>
        </form>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1.5rem' }}>
        {designs.map(design => (
          <div key={design._id} style={{ border: '1px solid var(--border-color)', borderRadius: '2px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div style={{ aspectRatio: '1/1', backgroundColor: '#ffffff', padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img src={design.imageUrl} alt={design.name} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
            </div>
            <div style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)' }}>
              <span style={{ fontWeight: 500, fontSize: '0.875rem' }}>{design.name}</span>
              <button onClick={() => setDesignToDelete(design)} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}>
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
        {designs.length === 0 && !showForm && (
          <div style={{ gridColumn: '1 / -1', padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)', border: '1px dashed var(--border-color)' }}>
            No designs found in the library. Upload one to get started.
          </div>
        )}
      </div>

      {designToDelete && (
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
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--text-primary)' }}>Delete Design</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: '1.5' }}>
              Are you sure you want to delete the design <strong style={{color: 'var(--text-primary)'}}>"{designToDelete.name}"</strong>? This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button 
                onClick={() => setDesignToDelete(null)} 
                className="btn btn-outline" 
                style={{ padding: '0.5rem 1rem' }}
                disabled={deleting}
              >
                Cancel
              </button>
              <button 
                onClick={handleDelete} 
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

export default AdminDesigns;
