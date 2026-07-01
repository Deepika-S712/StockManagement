import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../App';
import axios from 'axios';

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('Staff');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { setUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setIsLoading(true);
    try {
      if (isLogin) {
        const res = await axios.post('/api/auth/login', { email, password });
        setUser(res.data);
        navigate('/');
      } else {
        await axios.post('/api/auth/register', { name, email, password, role });
        setIsLogin(true);
        setPassword('');
        setSuccessMsg('Registration successful! Please sign in with your credentials.');
      }
    } catch (err) {
      console.error("Login/Register error:", err);
      const fallbackMsg = isLogin 
        ? 'Authentication failed. Please check credentials.' 
        : `Registration error: ${err.message || 'Unknown error'}`;
      setError(err.response?.data?.message || fallbackMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
      <div className="glass-panel animate-fade-in" style={{ padding: '2.5rem', width: '100%', maxWidth: '400px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ color: 'var(--primary-color)', fontSize: '2rem', marginBottom: '0.5rem' }}>SmartInventory</h1>
          <p style={{ color: 'var(--text-muted)' }}>{isLogin ? 'Sign in to your account' : 'Create a new account'}</p>
        </div>

        {error && <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger-color)', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.875rem' }}>{error}</div>}
        {successMsg && <div style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success-color)', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.875rem' }}>{successMsg}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {!isLogin && (
            <>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>Full Name</label>
                <input type="text" className="input-field" value={name} onChange={e => setName(e.target.value)} required={!isLogin} disabled={isLoading} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>Role</label>
                <select className="input-field" value={role} onChange={e => setRole(e.target.value)} disabled={isLoading}>
                  <option value="Staff">Staff</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>
            </>
          )}
          
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>Email Address</label>
            <input type="email" className="input-field" value={email} onChange={e => setEmail(e.target.value)} required disabled={isLoading} />
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>Password</label>
            <input type="password" className="input-field" value={password} onChange={e => setPassword(e.target.value)} required disabled={isLoading} />
          </div>

          <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem', padding: '0.75rem', opacity: isLoading ? 0.7 : 1 }} disabled={isLoading}>
            {isLoading ? 'Processing...' : (isLogin ? 'Sign In' : 'Sign Up')}
          </button>
        </form>

        <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button 
            type="button" 
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
              setSuccessMsg('');
            }} 
            style={{ background: 'none', border: 'none', color: 'var(--primary-color)', cursor: 'pointer', fontWeight: 500, fontFamily: 'inherit' }}
            disabled={isLoading}
          >
            {isLogin ? 'Register' : 'Login'}
          </button>
        </div>
      </div>
    </div>
  );
}
