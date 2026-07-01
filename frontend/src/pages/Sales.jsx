import { useState, useEffect } from 'react';
import axios from 'axios';

export default function Sales() {
  const [sales, setSales] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ product: { id: '' }, quantitySold: '' });
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const sRes = await axios.get('/api/sales');
      const pRes = await axios.get('/api/products');
      setSales(sRes.data);
      setProducts(pRes.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await axios.post('/api/sales', form);
      setForm({ product: { id: '' }, quantitySold: '' });
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to record sale. Check stock levels.');
      console.error(err);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="animate-fade-in">
      <h1 style={{ fontSize: '1.75rem', fontWeight: 600, marginBottom: '1.5rem' }}>Sales Management</h1>
      
      <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--primary-color)' }}>Record New Sale</h2>
        {error && <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger-color)', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.875rem' }}>{error}</div>}
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '1rem', alignItems: 'end', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Product</label>
            <select className="input-field" value={form.product.id} onChange={e => setForm({...form, product: { id: e.target.value }})} required>
              <option value="">Select Product</option>
              {products.map(p => <option key={p.id} value={p.id}>{p.name} (Stock: {p.quantity})</option>)}
            </select>
          </div>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Quantity Sold</label>
            <input type="number" min="1" className="input-field" value={form.quantitySold} onChange={e => setForm({...form, quantitySold: e.target.value})} required />
          </div>
          <button type="submit" className="btn btn-primary" style={{ padding: '0.75rem' }}>Record Sale</button>
        </form>
      </div>

      <div className="glass-panel" style={{ padding: '1rem', overflowX: 'auto' }}>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Product</th>
              <th>Quantity Sold</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {sales.map(s => (
              <tr key={s.id}>
                <td>{s.id}</td>
                <td style={{ fontWeight: 500 }}>{s.product?.name}</td>
                <td>
                  <span style={{ color: 'var(--success-color)', fontWeight: 'bold' }}>+{s.quantitySold}</span>
                </td>
                <td>{new Date(s.date).toLocaleString()}</td>
              </tr>
            ))}
            {sales.length === 0 && <tr><td colSpan="4" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No sales recorded</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
