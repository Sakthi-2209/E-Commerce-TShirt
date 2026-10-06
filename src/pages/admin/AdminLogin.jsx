import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { Lock } from 'lucide-react';

const AdminLogin = () => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { adminLogin, adminRegister } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      if (isRegistering) {
        await adminRegister(name, email, password);
      } else {
        await adminLogin(email, password);
      }
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--color-surface)' }}>
      <div style={{ backgroundColor: 'var(--color-bg)', padding: '3rem', width: '100%', maxWidth: '400px', border: '1px solid var(--color-border)' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'inline-flex', padding: '1rem', backgroundColor: 'var(--color-surface)', borderRadius: '50%', marginBottom: '1rem' }}>
            <Lock size={24} color="var(--color-text-main)" />
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.025em' }}>
            Admin {isRegistering ? 'Registration' : 'Portal'}
          </h1>
        </div>

        {error && (
          <div style={{ backgroundColor: '#fee2e2', color: '#b91c1c', padding: '0.75rem', borderRadius: '4px', marginBottom: '1rem', fontSize: '0.875rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          {isRegistering && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>Full Name</label>
              <input required value={name} onChange={e => setName(e.target.value)} style={{ padding: '0.75rem', border: '1px solid var(--color-border)', borderRadius: '4px' }} />
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>Email Address</label>
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)} style={{ padding: '0.75rem', border: '1px solid var(--color-border)', borderRadius: '4px' }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>Password</label>
            <input type="password" required value={password} onChange={e => setPassword(e.target.value)} style={{ padding: '0.75rem', border: '1px solid var(--color-border)', borderRadius: '4px' }} />
          </div>

          <button type="submit" disabled={loading} className="btn btn-primary" style={{ padding: '0.75rem', marginTop: '0.5rem', width: '100%' }}>
            {loading ? 'Processing...' : (isRegistering ? 'Create Admin Account' : 'Secure Login')}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
          <button onClick={() => setIsRegistering(!isRegistering)} style={{ color: 'var(--color-text-main)', fontWeight: 500, textDecoration: 'underline' }}>
            {isRegistering ? 'Already have an admin account?' : 'Register first admin account'}
          </button>
        </div>

      </div>
    </div>
  );
};

export default AdminLogin;
