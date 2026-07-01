import { useState, useEffect } from 'react';
import axios from 'axios';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: '', category: '', price: '', quantity: '', supplier: { id: '' } });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const pRes = await axios.get('/api/products');
      const sRes = await axios.get('/api/suppliers');
      setProducts(pRes.data);
      setSuppliers(sRes.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...form, supplier: form.supplier.id ? form.supplier : null };
      await axios.post('/api/products', payload);
      setForm({ name: '', category: '', price: '', quantity: '', supplier: { id: '' } });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/products/${id}`);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="animate-fade-in">
      <h1 style={{ fontSize: '1.75rem', fontWeight: 600, marginBottom: '1.5rem' }}>Product Management</h1>
      
      <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--primary-color)' }}>Add New Product</h2>
        <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', alignItems: 'end' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Name</label>
            <input type="text" className="input-field" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Category</label>
            <input type="text" className="input-field" value={form.category} onChange={e => setForm({...form, category: e.target.value})} required />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Price</label>
            <input type="number" step="0.01" className="input-field" value={form.price} onChange={e => setForm({...form, price: e.target.value})} required />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Quantity</label>
            <input type="number" className="input-field" value={form.quantity} onChange={e => setForm({...form, quantity: e.target.value})} required />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Supplier</label>
            <select className="input-field" value={form.supplier.id} onChange={e => setForm({...form, supplier: { id: e.target.value }})}>
              <option value="">Select Supplier</option>
              {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <button type="submit" className="btn btn-primary" style={{ padding: '0.75rem' }}>Add Product</button>
        </form>
      </div>

      <div className="glass-panel" style={{ padding: '1rem', overflowX: 'auto' }}>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Category</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Supplier</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map(p => (
              <tr key={p.id}>
                <td>{p.id}</td>
                <td style={{ fontWeight: 500 }}>{p.name}</td>
                <td>{p.category}</td>
                <td>${p.price?.toFixed(2)}</td>
                <td>
                  <span style={{ 
                    padding: '0.25rem 0.5rem', 
                    borderRadius: '4px', 
                    background: p.quantity < 10 ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                    color: p.quantity < 10 ? 'var(--danger-color)' : 'var(--success-color)'
                  }}>
                    {p.quantity}
                  </span>
                </td>
                <td>{p.supplier ? p.supplier.name : 'N/A'}</td>
                <td>
                  <button onClick={() => handleDelete(p.id)} className="btn" style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger-color)', padding: '0.25rem 0.5rem', fontSize: '0.875rem' }}>Delete</button>
                </td>
              </tr>
            ))}
            {products.length === 0 && <tr><td colSpan="7" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No products found</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
