import { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend, 
  ArcElement, 
  PointElement, 
  LineElement
);

// Circular KPI component
function CircularProgress({ percentage, color, title, label }) {
  const radius = 32;
  const strokeWidth = 6;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: '130px' }}>
      <div style={{ position: 'relative', width: '80px', height: '80px' }}>
        <svg width="80" height="80" viewBox="0 0 80 80">
          <circle 
            className="gauge-track" 
            cx="40" 
            cy="40" 
            r={radius} 
            strokeWidth={strokeWidth} 
          />
          <circle 
            className="gauge-progress" 
            cx="40" 
            cy="40" 
            r={radius} 
            strokeWidth={strokeWidth} 
            stroke={color} 
            strokeDasharray={circumference} 
            strokeDashoffset={offset} 
            transform="rotate(-90 40 40)"
          />
        </svg>
        <div style={{ 
          position: 'absolute', 
          top: 0, 
          left: 0, 
          width: '100%', 
          height: '100%', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          fontWeight: 'bold',
          fontSize: '1rem',
          color: 'var(--text-main)'
        }}>
          {percentage}%
        </div>
      </div>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-main)' }}>{title}</div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{label}</div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [products, setProducts] = useState([]);
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [minStockLevel, setMinStockLevel] = useState(10);
  const [chartType, setChartType] = useState('overview'); // overview, category, trend
  
  // Toast and PO Modal states
  const [toasts, setToasts] = useState([]);
  const [poModalOpen, setPoModalOpen] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [orderQty, setOrderQty] = useState(50);
  const [poStatus, setPoStatus] = useState('draft'); // draft, processing, success
  const [progress, setProgress] = useState(0);
  const [poId, setPoId] = useState('');

  useEffect(() => {
    fetchStats();
  }, [minStockLevel]);

  const fetchStats = async () => {
    try {
      const [res, prodRes, salesRes] = await Promise.all([
        axios.get(`/api/dashboard?minStockLevel=${minStockLevel}`),
        axios.get('/api/products'),
        axios.get('/api/sales')
      ]);
      setStats(res?.data || {});
      setProducts(Array.isArray(prodRes?.data) ? prodRes.data : []);
      setSales(Array.isArray(salesRes?.data) ? salesRes.data : []);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const addToast = (msg, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, msg, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const handleOpenPoModal = (alert) => {
    const randomId = `PO-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    setPoId(randomId);
    setSelectedAlert(alert);
    
    // Choose the best supplier (either current supplier or top recommended)
    const defSupplier = alert.product.supplier;
    if (defSupplier) {
      setSelectedSupplier(defSupplier);
    } else if (stats.recommendedSuppliers.length > 0) {
      setSelectedSupplier(stats.recommendedSuppliers[0].supplier);
    } else {
      setSelectedSupplier({ name: 'System Supplier', rating: 4.5, deliveryTime: 5, priceLevel: 2 });
    }

    setOrderQty(alert.reorderPoint * 2 || 50);
    setPoStatus('draft');
    setProgress(0);
    setPoModalOpen(true);
  };

  const handleSendPO = () => {
    setPoStatus('processing');
    setProgress(0);
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setPoStatus('success');
          addToast(`Purchase Order ${poId} dispatched to ${selectedSupplier.name}!`, 'success');
          return 100;
        }
        return prev + 10;
      });
    }, 150);
  };

  if (loading) return <div>Loading dashboard...</div>;
  if (!stats) return <div>Error loading dashboard.</div>;

  // KPI calculations
  const totalProductsCount = products?.length || 0;
  const lowStockCount = stats?.lowStockItems?.length || 0;
  const stockHealthPercentage = totalProductsCount 
    ? Math.round(((totalProductsCount - lowStockCount) / totalProductsCount) * 100) 
    : 100;

  const salesGoal = 150; // Quota target
  const salesGoalPercentage = Math.min(100, Math.round(((stats?.totalSales || 0) / salesGoal) * 100));

  const avgSupplierScore = stats?.recommendedSuppliers?.length
    ? Math.round((stats.recommendedSuppliers.reduce((acc, c) => acc + (c.score || 0), 0) / stats.recommendedSuppliers.length) * 10)
    : 80;

  // Chart 1: Bar overview
  const chartDataOverview = {
    labels: ['Total Products', 'Total Sales'],
    datasets: [
      {
        label: 'System Overview',
        data: [stats?.totalProducts || 0, stats?.totalSales || 0],
        backgroundColor: ['rgba(99, 102, 241, 0.55)', 'rgba(16, 185, 129, 0.55)'],
        borderColor: ['rgba(99, 102, 241, 1)', 'rgba(16, 185, 129, 1)'],
        borderWidth: 1.5,
      },
    ],
  };

  // Chart 2: Category distribution
  const categoriesMap = {};
  (products || []).forEach(p => {
    const cat = p.category || 'General';
    categoriesMap[cat] = (categoriesMap[cat] || 0) + p.quantity;
  });
  const chartDataCategory = {
    labels: Object.keys(categoriesMap),
    datasets: [
      {
        label: 'Stock Units',
        data: Object.values(categoriesMap),
        backgroundColor: [
          'rgba(99, 102, 241, 0.55)',
          'rgba(16, 185, 129, 0.55)',
          'rgba(249, 115, 22, 0.55)',
          'rgba(236, 72, 153, 0.55)',
          'rgba(14, 165, 233, 0.55)',
          'rgba(234, 179, 8, 0.55)'
        ],
        borderColor: [
          'rgba(99, 102, 241, 1)',
          'rgba(16, 185, 129, 1)',
          'rgba(249, 115, 22, 1)',
          'rgba(236, 72, 153, 1)',
          'rgba(14, 165, 233, 1)',
          'rgba(234, 179, 8, 1)'
        ],
        borderWidth: 1.5,
      }
    ]
  };

  // Chart 3: Sales Trend
  const salesMap = {};
  (sales || []).forEach(s => {
    const dateLabel = new Date(s.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    salesMap[dateLabel] = (salesMap[dateLabel] || 0) + s.quantitySold;
  });
  const sortedDates = Object.keys(salesMap).sort((a, b) => new Date(a) - new Date(b));
  const chartDataTrend = {
    labels: sortedDates.length ? sortedDates : ['No Data'],
    datasets: [
      {
        label: 'Daily Sales Units',
        data: sortedDates.length ? sortedDates.map(d => salesMap[d]) : [0],
        backgroundColor: 'rgba(13, 148, 136, 0.15)',
        borderColor: 'var(--primary-color)',
        borderWidth: 2,
        fill: true,
        tension: 0.3
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { 
        position: 'top',
        labels: { color: 'var(--text-muted)', font: { family: 'Inter' } }
      },
    },
    scales: {
      y: { 
        ticks: { color: 'var(--text-muted)' },
        grid: { color: 'rgba(15, 23, 42, 0.05)' }
      },
      x: { 
        ticks: { color: 'var(--text-muted)' },
        grid: { display: false }
      }
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Toast Notification Container */}
      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className="toast">
            <span>{t.type === 'success' ? '✅' : '⚠️'}</span>
            <div>{t.msg}</div>
          </div>
        ))}
      </div>

      {/* Title Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 600 }}>Dashboard</h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <label style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Low Stock Alert Level:</label>
          <input 
            type="number" 
            value={minStockLevel} 
            onChange={(e) => setMinStockLevel(Number(e.target.value) || 0)}
            style={{ 
              padding: '0.5rem 0.75rem', 
              borderRadius: '0.375rem', 
              border: '1px solid var(--border-color)', 
              background: 'rgba(255, 255, 255, 0.7)', 
              color: 'var(--text-main)',
              width: '80px',
              fontWeight: 500,
              outline: 'none',
              boxShadow: 'var(--shadow-sm)'
            }} 
          />
        </div>
      </div>

      {/* Dynamic Grid: Statistics Summary & Interactive Targets */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
        
        {/* Core Stats Overview */}
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', minHeight: '180px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', borderRight: '1px solid var(--border-color)', paddingRight: '0.5rem' }}>
            <div style={{ fontSize: '2.25rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>{stats?.totalProducts || 0}</div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Total Products</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', paddingLeft: '0.5rem' }}>
            <div style={{ fontSize: '2.25rem', fontWeight: 'bold', color: 'var(--success-color)' }}>{stats?.totalSales || 0}</div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Total Sales Units</div>
          </div>
        </div>

        {/* Circular KPI Progress Rings */}
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-around', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <CircularProgress 
            percentage={stockHealthPercentage} 
            color="var(--success-color)" 
            title="Stock Health" 
            label={`${totalProductsCount - lowStockCount}/${totalProductsCount} Healthy`} 
          />
          <CircularProgress 
            percentage={salesGoalPercentage} 
            color="var(--primary-color)" 
            title="Monthly Target" 
            label={`${stats?.totalSales || 0}/${salesGoal} units`} 
          />
          <CircularProgress 
            percentage={avgSupplierScore} 
            color="var(--warning-color)" 
            title="Supplier Score" 
            label="Avg Performance" 
          />
        </div>
      </div>

      {/* Interactive Charts & Actionable Warnings */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
        
        {/* Chart Panel with Mode Toggles */}
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600 }}>Analytics Hub</h3>
            
            {/* Chart type controls */}
            <div style={{ display: 'flex', background: 'rgba(15, 23, 42, 0.05)', borderRadius: '8px', padding: '2px', border: '1px solid var(--border-color)' }}>
              {[
                { id: 'overview', label: 'Overview' },
                { id: 'category', label: 'Categories' },
                { id: 'trend', label: 'Sales Trends' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setChartType(tab.id)}
                  style={{
                    padding: '0.25rem 0.75rem',
                    borderRadius: '6px',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '0.75rem',
                    fontWeight: 500,
                    background: chartType === tab.id ? 'var(--primary-color)' : 'transparent',
                    color: chartType === tab.id ? 'white' : 'var(--text-muted)',
                    transition: 'all 0.2s'
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div style={{ flex: 1, display: 'flex', alignItems: 'center', minHeight: '220px' }}>
            {chartType === 'overview' && <Bar options={chartOptions} data={chartDataOverview} />}
            {chartType === 'category' && <Doughnut options={{ responsive: true, plugins: { legend: { position: 'right' } } }} data={chartDataCategory} />}
            {chartType === 'trend' && <Line options={chartOptions} data={chartDataTrend} />}
          </div>
        </div>

        {/* Smart Alerts & Reorder Simulator */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div className="glass-panel" style={{ padding: '1.5rem', flex: 1 }}>
            <h3 style={{ color: 'var(--warning-color)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.125rem', fontWeight: 600 }}>
              <span style={{ fontSize: '1.25rem' }}>⚠️</span> Smart Reorder System
            </h3>
            {!stats?.reorderAlerts || stats.reorderAlerts.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>All products are at healthy stock levels. No reorder needed.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '300px', overflowY: 'auto', paddingRight: '0.25rem' }}>
                {stats.reorderAlerts.map((alert, idx) => (
                  <div key={idx} style={{ 
                    background: 'rgba(217, 119, 6, 0.05)', 
                    padding: '0.75rem', 
                    borderRadius: '8px', 
                    borderLeft: '4px solid var(--warning-color)', 
                    boxShadow: 'var(--shadow-sm)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '1rem'
                  }}>
                    <div>
                      <div style={{ fontWeight: 500, fontSize: '0.9rem' }}>{alert.product.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                        Qty: {alert.product.quantity} | Days left: <strong style={{color: 'var(--danger-color)'}}>{alert.daysLeft}d</strong>
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => handleOpenPoModal(alert)}
                      className="btn btn-primary" 
                      style={{ padding: '0.375rem 0.75rem', fontSize: '0.75rem', borderRadius: '6px' }}
                    >
                      ⚡ Order PO
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Top Suppliers List */}
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <h3 style={{ color: 'var(--success-color)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.125rem', fontWeight: 600 }}>
              <span style={{ fontSize: '1.25rem' }}>🏆</span> Optimized Suppliers
            </h3>
            {!stats?.recommendedSuppliers || stats.recommendedSuppliers.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>No supplier scoring data available.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {stats.recommendedSuppliers.slice(0, 3).map((rec, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.625rem 0.75rem', background: 'rgba(15, 23, 42, 0.03)', borderRadius: '8px', border: '1px solid var(--border-color)', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 500, fontSize: '0.875rem' }}>{rec.supplier.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Lead Time: {rec.supplier.deliveryTime}d | Price Level: {rec.supplier.priceLevel}/5</div>
                    </div>
                    <div style={{ color: 'var(--success-color)', fontWeight: 'bold', fontSize: '0.875rem' }}>
                      {rec.score.toFixed(2)} pts
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>

      {/* PURCHASE ORDER SIMULATOR MODAL */}
      {poModalOpen && selectedAlert && (
        <div className="modal-overlay">
          <div className="modal-content animate-fade-in" style={{ padding: '2rem' }}>
            
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary-color)' }}>Smart Purchase Order Simulator</h2>
              <button 
                onClick={() => setPoModalOpen(false)} 
                style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--text-muted)', padding: 0 }}
              >
                &times;
              </button>
            </div>

            {poStatus === 'draft' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ background: 'rgba(15, 23, 42, 0.03)', padding: '1rem', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                    <div><strong>PO Document ID:</strong></div><div>{poId}</div>
                    <div><strong>Target Product:</strong></div><div>{selectedAlert.product.name}</div>
                    <div><strong>Current Stock:</strong></div><div>{selectedAlert.product.quantity} units</div>
                    <div><strong>Reorder Trigger Point:</strong></div><div>{selectedAlert.reorderPoint} units</div>
                  </div>
                </div>

                {/* Form fields */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>Recommended Supplier Partner</label>
                  <div style={{ padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.7)', border: '1px solid var(--border-color)', borderRadius: '8px', fontSize: '0.9rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <strong>{selectedSupplier.name}</strong>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '0.5rem' }}>
                        Rating: {selectedSupplier.rating}⭐ | Delay: {selectedSupplier.deliveryTime} days
                      </span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>Order Quantity (Units)</label>
                    <input 
                      type="number" 
                      value={orderQty} 
                      onChange={e => setOrderQty(Math.max(1, Number(e.target.value) || 1))}
                      className="input-field" 
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>Estimated Unit Price</label>
                    <div className="input-field" style={{ background: 'rgba(15, 23, 42, 0.05)', display: 'flex', alignItems: 'center' }}>
                      ${selectedAlert.product.price?.toFixed(2)}
                    </div>
                  </div>
                </div>

                {/* Total Invoice */}
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1.5px dashed var(--border-color)', paddingTop: '1rem', marginTop: '0.5rem' }}>
                  <span style={{ fontWeight: 600, fontSize: '1.1rem' }}>Total Cost:</span>
                  <span style={{ fontWeight: 'bold', fontSize: '1.25rem', color: 'var(--success-color)' }}>
                    ${(orderQty * (selectedAlert.product.price || 0)).toFixed(2)}
                  </span>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                  <button 
                    onClick={() => setPoModalOpen(false)}
                    className="btn" 
                    style={{ flex: 1, background: 'rgba(15, 23, 42, 0.05)', color: 'var(--text-muted)' }}
                  >
                    Cancel Draft
                  </button>
                  <button 
                    onClick={handleSendPO}
                    className="btn btn-primary" 
                    style={{ flex: 2 }}
                  >
                    🚀 Confirm & Send to Supplier
                  </button>
                </div>
              </div>
            )}

            {poStatus === 'processing' && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1.5rem', minHeight: '220px' }}>
                <div style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-main)' }}>Transmitting Order to {selectedSupplier.name}...</div>
                
                {/* Progress bar container */}
                <div style={{ width: '100%', background: 'rgba(15, 23, 42, 0.06)', height: '12px', borderRadius: '999px', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                  <div style={{ width: `${progress}%`, background: 'var(--primary-color)', height: '100%', transition: 'width 0.15s ease' }} />
                </div>

                <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Uploading secure telemetry & stock requirements... {progress}%</div>
              </div>
            )}

            {poStatus === 'success' && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem', minHeight: '220px', textAlign: 'center' }}>
                <div style={{ fontSize: '3rem' }}>🎉</div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--success-color)' }}>PO Dispatched Successfully!</h3>
                
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', maxWidth: '400px' }}>
                  Purchase Order <strong>{poId}</strong> has been received by <strong>{selectedSupplier.name}</strong>. Delivery estimated in <strong>{selectedSupplier.deliveryTime}</strong> days.
                </p>

                <button 
                  onClick={() => setPoModalOpen(false)}
                  className="btn btn-primary" 
                  style={{ marginTop: '1rem', padding: '0.5rem 2rem' }}
                >
                  Return to Dashboard
                </button>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
