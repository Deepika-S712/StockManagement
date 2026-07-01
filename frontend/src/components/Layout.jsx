import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../App';

export default function Layout() {
  const { user, setUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const [currentTheme, setCurrentTheme] = useState(() => {
    return localStorage.getItem('app-theme') || 'emerald';
  });

  useEffect(() => {
    document.body.classList.remove('theme-emerald', 'theme-midnight', 'theme-ocean', 'theme-sunset');
    document.body.classList.add(`theme-${currentTheme}`);
    localStorage.setItem('app-theme', currentTheme);
  }, [currentTheme]);

  const navItems = [
    { path: '/', label: 'Dashboard' },
    { path: '/products', label: 'Products' },
    { path: '/suppliers', label: 'Suppliers' },
    { path: '/sales', label: 'Sales' },
    { path: '/history', label: 'Activity Log' },
  ];

  const themes = [
    { id: 'emerald', name: 'Emerald Oasis', color: '#0d9488' },
    { id: 'midnight', name: 'Midnight Synth', color: '#a855f7' },
    { id: 'ocean', name: 'Oceanic Drift', color: '#0284c7' },
    { id: 'sunset', name: 'Sunset Amber', color: '#ea580c' },
  ];

  const handleLogout = () => {
    setUser(null);
    navigate('/login');
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <aside className="glass-panel" style={{ width: '250px', margin: '1rem', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <h2 style={{ color: 'var(--primary-color)', marginBottom: '1rem', fontSize: '1.5rem', fontWeight: 'bold' }}>SmartInventory</h2>
        
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
          {navItems.map(item => (
            <Link 
              key={item.path}
              to={item.path}
              style={{
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                textDecoration: 'none',
                color: location.pathname === item.path ? 'white' : 'var(--text-muted)',
                background: location.pathname === item.path ? 'var(--primary-color)' : 'transparent',
                transition: 'all 0.2s',
                fontWeight: 500
              }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Theme Switcher */}
        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '0.75rem' }}>UI Theme</span>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            {themes.map(t => (
              <button 
                key={t.id} 
                onClick={() => setCurrentTheme(t.id)}
                title={t.name}
                style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  background: t.color,
                  border: currentTheme === t.id ? '2px solid var(--text-main)' : '2px solid transparent',
                  cursor: 'pointer',
                  boxShadow: 'var(--shadow-sm)',
                  transform: currentTheme === t.id ? 'scale(1.15)' : 'scale(1)',
                  transition: 'all 0.2s ease',
                  padding: 0
                }}
              />
            ))}
          </div>
        </div>

        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem', marginTop: 'auto' }}>
          <div style={{ marginBottom: '1rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Logged in as <strong style={{color: 'var(--text-main)'}}>{user?.name}</strong> ({user?.role})
          </div>
          <button className="btn" style={{ width: '100%', background: 'rgba(220, 38, 38, 0.08)', color: 'var(--danger-color)', border: '1px solid rgba(220, 38, 38, 0.15)' }} onClick={handleLogout}>
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, padding: '1rem 1rem 1rem 0', display: 'flex', flexDirection: 'column' }}>
        <div className="glass-panel" style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
          <Outlet />
        </div>
      </main>
    </div>
  );
}
