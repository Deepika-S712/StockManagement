import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, createContext, useContext } from 'react';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Suppliers from './pages/Suppliers';
import Sales from './pages/Sales';
import StockTimeline from './pages/StockTimeline';
import Layout from './components/Layout';
import './index.css';

// Simple Auth Context
export const AuthContext = createContext(null);

function App() {
  const [user, setUser] = useState(null);

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      <Router basename="/StockManagement">
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route path="/" element={user ? <Layout /> : <Navigate to="/login" />}>
            <Route index element={<Dashboard />} />
            <Route path="products" element={<Products />} />
            <Route path="suppliers" element={<Suppliers />} />
            <Route path="sales" element={<Sales />} />
            <Route path="history" element={<StockTimeline />} />
          </Route>
        </Routes>
      </Router>
    </AuthContext.Provider>
  );
}

export default App;
