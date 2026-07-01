import { useState, useEffect } from 'react';
import axios from 'axios';

export default function Suppliers() {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: '', rating: '', deliveryTime: '', priceLevel: '', contact: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await axios.get('/api/suppliers');
      setSuppliers(res.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/suppliers', form);
      setForm({ name: '', rating: '', deliveryTime: '', priceLevel: '', contact: '' });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/suppliers/${id}`);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="animate-fade-in">
      <h1 style={{ fontSize: '1.75rem', fontWeight: 600, marginBottom: '1.5rem' }}>Supplier Management</h1>
      
      <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--primary-color)' }}>Add New Supplier</h2>
        <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', alignItems: 'end' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Name</label>
            <input type="text" className="input-field" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Rating (1-5)</label>
            <input type="number" step="0.1" max="5" min="1" className="input-field" value={form.rating} onChange={e => setForm({...form, rating: e.target.value})} required />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Delivery Time (Days)</label>
            <input type="number" className="input-field" value={form.deliveryTime} onChange={e => setForm({...form, deliveryTime: e.target.value})} required />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Price Level (1-100)</label>
            <input type="number" className="input-field" value={form.priceLevel} onChange={e => setForm({...form, priceLevel: e.target.value})} required />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Contact</label>
            <input type="text" className="input-field" value={form.contact} onChange={e => setForm({...form, contact: e.target.value})} required />
          </div>
          <button type="submit" className="btn btn-primary" style={{ padding: '0.75rem' }}>Add Supplier</button>
        </form>
      </div>

      <div className="glass-panel" style={{ padding: '1rem', overflowX: 'auto' }}>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Rating</th>
              <th>Delivery (Days)</th>
              <th>Price Level</th>
              <th>Contact</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {suppliers.map(s => (
              <tr key={s.id}>
                <td>{s.id}</td>
                <td style={{ fontWeight: 500 }}>{s.name}</td>
                <td>{s.rating} ★</td>
                <td>{s.deliveryTime}</td>
                <td>{s.priceLevel}</td>
                <td>{s.contact}</td>
                <td>
                  <button onClick={() => handleDelete(s.id)} className="btn" style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger-color)', padding: '0.25rem 0.5rem', fontSize: '0.875rem' }}>Delete</button>
                </td>
              </tr>
            ))}
            {suppliers.length === 0 && <tr><td colSpan="7" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No suppliers found</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
