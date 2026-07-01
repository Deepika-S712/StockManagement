import { useState, useEffect } from 'react';
import axios from 'axios';

export default function StockTimeline() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('ALL'); // ALL, ADD, REDUCE

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await axios.get('/api/stock-history');
      setHistory(res.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching history:', err);
      setLoading(false);
    }
  };

  const filteredHistory = history.filter(item => {
    const matchesSearch = item.product?.name.toLowerCase().includes(search.toLowerCase()) || 
                          item.product?.category.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'ALL' || item.changeType === filter;
    return matchesSearch && matchesFilter;
  });

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  };

  if (loading) return <div style={{ color: 'var(--text-muted)' }}>Loading Activity Feed...</div>;

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 600 }}>Activity Log & Audit Trail</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            Real-time track of all product stock additions, sales, and manual adjustments.
          </p>
        </div>

        {/* Filter Controls */}
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <input 
            type="text" 
            placeholder="Search by product..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input-field"
            style={{ width: '220px', padding: '0.5rem 1rem' }}
          />

          <div style={{ display: 'flex', background: 'rgba(15, 23, 42, 0.05)', borderRadius: '8px', padding: '2px', border: '1px solid var(--border-color)' }}>
            {['ALL', 'ADD', 'REDUCE'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  padding: '0.375rem 0.75rem',
                  borderRadius: '6px',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  background: filter === f ? 'var(--primary-color)' : 'transparent',
                  color: filter === f ? 'white' : 'var(--text-muted)',
                  transition: 'all 0.2s'
                }}
              >
                {f === 'ALL' ? 'All' : f === 'ADD' ? 'Restocked' : 'Sold'}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '2rem 1.5rem' }}>
        {filteredHistory.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
            No activity matches the criteria.
          </div>
        ) : (
          <div className="timeline-container">
            {filteredHistory.map((item, idx) => {
              const isAdd = item.changeType === 'ADD';
              return (
                <div key={item.id || idx} className="timeline-item animate-fade-in" style={{ animationDelay: `${idx * 0.05}s` }}>
                  {/* Badge (plus or minus indicator) */}
                  <div className={`timeline-badge ${isAdd ? 'add' : 'reduce'}`}>
                    {isAdd ? '＋' : '－'}
                  </div>

                  {/* Log Content card */}
                  <div style={{
                    marginLeft: '0.5rem',
                    background: 'rgba(255, 255, 255, 0.4)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '12px',
                    padding: '1rem 1.25rem',
                    boxShadow: 'var(--shadow-sm)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '1rem',
                    flexWrap: 'wrap'
                  }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <span style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--text-main)' }}>
                          {item.product?.name || 'Unknown Product'}
                        </span>
                        <span style={{
                          fontSize: '0.75rem',
                          padding: '0.125rem 0.5rem',
                          borderRadius: '999px',
                          background: 'rgba(15, 23, 42, 0.05)',
                          color: 'var(--text-muted)'
                        }}>
                          {item.product?.category || 'General'}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                        {isAdd ? (
                          <span>Stock replenished by <strong style={{ color: 'var(--success-color)' }}>{item.quantity}</strong> units.</span>
                        ) : (
                          <span>Dispatched <strong style={{ color: 'var(--warning-color)' }}>{item.quantity}</strong> units via Sales.</span>
                        )}
                      </div>
                    </div>

                    <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      <span style={{ 
                        fontSize: '0.875rem', 
                        fontWeight: 600, 
                        color: isAdd ? 'var(--success-color)' : 'var(--warning-color)'
                      }}>
                        {isAdd ? `+${item.quantity}` : `-${item.quantity}`} Units
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {formatDate(item.date)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
