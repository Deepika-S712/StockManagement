import axios from 'axios';

// Activate mock database if hosted on GitHub Pages or if explicitly requested via VITE_USE_MOCK env variable
const isLocalOrDemo = window.location.hostname.endsWith('github.io') || import.meta.env.VITE_USE_MOCK === 'true';

if (isLocalOrDemo) {
  console.log("🚀 Initializing local client-side database...");

  // Helpers to manage LocalStorage
  const getDB = (key, defaultVal) => {
    const val = localStorage.getItem(`db_${key}`);
    if (!val || val === 'null' || val === 'undefined') {
      localStorage.setItem(`db_${key}`, JSON.stringify(defaultVal));
      return defaultVal;
    }
    try {
      const parsed = JSON.parse(val);
      return parsed || defaultVal;
    } catch (e) {
      return defaultVal;
    }
  };

  const saveDB = (key, data) => {
    localStorage.setItem(`db_${key}`, JSON.stringify(data));
  };

  // Seed Initial Data
  const initialSuppliers = [
    { id: 1, name: "Alpha Distributors", contact: "alpha@distributors.com", rating: 4.8, deliveryTime: 3, priceLevel: 2 },
    { id: 2, name: "Apex Logistics", contact: "apex@logistics.com", rating: 4.5, deliveryTime: 5, priceLevel: 3 },
    { id: 3, name: "Global Warehousing", contact: "global@warehousing.com", rating: 4.2, deliveryTime: 8, priceLevel: 1 },
  ];

  const initialProducts = [
    { id: 1, name: "Pro Wireless Mouse", category: "Electronics", price: 29.99, quantity: 4, supplier: initialSuppliers[0] },
    { id: 2, name: "Mechanical Keyboard", category: "Electronics", price: 79.99, quantity: 15, supplier: initialSuppliers[0] },
    { id: 3, name: "Ergonomic Office Chair", category: "Furniture", price: 189.99, quantity: 8, supplier: initialSuppliers[1] },
    { id: 4, name: "USB-C Hub Adapter", category: "Electronics", price: 19.99, quantity: 25, supplier: initialSuppliers[2] },
  ];

  const initialSales = [
    { id: 1, product: initialProducts[0], quantitySold: 12, date: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString() },
    { id: 2, product: initialProducts[1], quantitySold: 5, date: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString() },
  ];

  const initialHistory = [
    { id: 1, product: initialProducts[0], changeType: "ADD", quantity: 16, date: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString() },
    { id: 2, product: initialProducts[0], changeType: "REDUCE", quantity: 12, date: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString() },
    { id: 3, product: initialProducts[1], changeType: "ADD", quantity: 20, date: new Date(Date.now() - 8 * 24 * 3600 * 1000).toISOString() },
    { id: 4, product: initialProducts[1], changeType: "REDUCE", quantity: 5, date: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString() },
  ];

  // Custom Axios Adapter
  axios.defaults.adapter = async function (config) {
    const { url, method, data } = config;
    const body = data ? JSON.parse(data) : null;
    
    // Parse Endpoint Path (Handles /api/products, /StockManagement/api/products/1, http://..., etc.)
    const cleanUrl = url.split('?')[0];
    const apiMatch = cleanUrl.match(/\/api(?:\/|$)(.*)/);
    const pathString = apiMatch ? apiMatch[1] : cleanUrl.replace(/^\/api/, '');
    const pathParts = pathString.split('/').filter(Boolean);
    const resource = pathParts[0]; // e.g. "products", "sales", "auth"
    const id = pathParts[1] ? Number(pathParts[1]) : null;

    let responseData = null;
    let status = 200;

    try {
      // 1. Auth Endpoint
      if (resource === 'auth') {
        const action = pathParts[1];
        if (action === 'login') {
          if (body.email === 'admin@test.com' && body.password === 'password') {
            responseData = { id: 1, name: "Master Admin", email: "admin@test.com", role: "Admin" };
          } else {
            throw { status: 401, message: "Invalid email or password" };
          }
        } else if (action === 'register') {
          responseData = { id: Date.now(), name: body.name, email: body.email, role: body.role };
        }
      }

      // 2. Dashboard Stats
      else if (resource === 'dashboard') {
        const products = getDB('products', initialProducts);
        const sales = getDB('sales', initialSales);
        const suppliers = getDB('suppliers', initialSuppliers);

        // Calculate Stats
        const totalSales = sales.reduce((acc, s) => acc + s.quantitySold, 0);
        
        // Low Stock Items
        const urlParams = new URLSearchParams(url.split('?')[1] || '');
        const minStockLevel = Number(urlParams.get('minStockLevel')) || 10;
        const lowStockItems = products.filter(p => p.quantity < minStockLevel);

        // Reorder alerts
        const reorderAlerts = [];
        products.forEach(p => {
          // Calculate daily sales rate
          const prodSales = sales.filter(s => s.product.id === p.id);
          const totalSold = prodSales.reduce((acc, s) => acc + s.quantitySold, 0);
          const averageDailySales = totalSold / 30.0;
          if (averageDailySales > 0) {
            const leadTime = p.supplier?.deliveryTime || 7;
            const reorderPoint = Math.ceil(averageDailySales * leadTime);
            if (p.quantity <= reorderPoint) {
              reorderAlerts.push({
                product: p,
                averageDailySales,
                reorderPoint,
                daysLeft: Math.floor(p.quantity / averageDailySales)
              });
            }
          }
        });

        // Supplier recommendations
        const recommendedSuppliers = suppliers.map(s => {
          const score = (s.rating * 0.5) + (1.0 / s.deliveryTime * 0.3) + (1.0 / s.priceLevel * 0.2);
          return { supplier: s, score };
        }).sort((a, b) => b.score - a.score);

        responseData = {
          totalProducts: products.length,
          totalSales,
          lowStockItems,
          reorderAlerts,
          recommendedSuppliers
        };
      }

      // 3. Products CRUD
      else if (resource === 'products') {
        let products = getDB('products', initialProducts);
        let suppliers = getDB('suppliers', initialSuppliers);
        let history = getDB('history', initialHistory);

        if (method === 'GET') {
          responseData = id ? products.find(p => p.id === id) : products;
        } else if (method === 'POST') {
          const newProduct = { ...body, id: Date.now() };
          if (newProduct.supplier?.id) {
            newProduct.supplier = suppliers.find(s => s.id === Number(newProduct.supplier.id));
          }
          products.push(newProduct);
          saveDB('products', products);

          // Add history
          history.unshift({
            id: Date.now(),
            product: newProduct,
            changeType: 'ADD',
            quantity: newProduct.quantity,
            date: new Date().toISOString()
          });
          saveDB('history', history);
          responseData = newProduct;
        } else if (method === 'PUT') {
          const idx = products.findIndex(p => p.id === id);
          if (idx !== -1) {
            const oldQty = products[idx].quantity;
            const updatedProduct = { ...products[idx], ...body };
            if (updatedProduct.supplier?.id) {
              updatedProduct.supplier = suppliers.find(s => s.id === Number(updatedProduct.supplier.id));
            }
            products[idx] = updatedProduct;
            saveDB('products', products);

            // Add history if qty changed
            if (updatedProduct.quantity !== oldQty) {
              history.unshift({
                id: Date.now(),
                product: updatedProduct,
                changeType: updatedProduct.quantity > oldQty ? 'ADD' : 'REDUCE',
                quantity: Math.abs(updatedProduct.quantity - oldQty),
                date: new Date().toISOString()
              });
              saveDB('history', history);
            }
            responseData = updatedProduct;
          }
        } else if (method === 'DELETE') {
          products = products.filter(p => p.id !== id);
          saveDB('products', products);
          status = 200;
        }
      }

      // 4. Sales CRUD
      else if (resource === 'sales') {
        let sales = getDB('sales', initialSales);
        let products = getDB('products', initialProducts);
        let history = getDB('history', initialHistory);

        if (method === 'GET') {
          responseData = sales;
        } else if (method === 'POST') {
          const product = products.find(p => p.id === Number(body.product.id));
          if (!product) throw { status: 404, message: "Product not found" };
          
          if (product.quantity < body.quantitySold) {
            throw { status: 400, message: "Insufficient stock available!" };
          }

          // Deduct stock
          product.quantity -= body.quantitySold;
          saveDB('products', products);

          // Record sale
          const newSale = {
            id: Date.now(),
            product,
            quantitySold: body.quantitySold,
            date: new Date().toISOString()
          };
          sales.unshift(newSale);
          saveDB('sales', sales);

          // Add history
          history.unshift({
            id: Date.now() + 1,
            product,
            changeType: 'REDUCE',
            quantity: body.quantitySold,
            date: new Date().toISOString()
          });
          saveDB('history', history);

          responseData = newSale;
        }
      }

      // 5. Suppliers CRUD
      else if (resource === 'suppliers') {
        let suppliers = getDB('suppliers', initialSuppliers);
        if (method === 'GET') {
          responseData = id ? suppliers.find(s => s.id === id) : suppliers;
        } else if (method === 'POST') {
          const newSupplier = { ...body, id: Date.now() };
          suppliers.push(newSupplier);
          saveDB('suppliers', suppliers);
          responseData = newSupplier;
        } else if (method === 'PUT') {
          const idx = suppliers.findIndex(s => s.id === id);
          if (idx !== -1) {
            suppliers[idx] = { ...suppliers[idx], ...body };
            saveDB('suppliers', suppliers);
            responseData = suppliers[idx];
          }
        } else if (method === 'DELETE') {
          suppliers = suppliers.filter(s => s.id !== id);
          saveDB('suppliers', suppliers);
          status = 200;
        }
      }

      // 6. Stock History Audit Log
      else if (resource === 'stock-history') {
        responseData = getDB('history', initialHistory);
      }

      // Return mock Axios response
      return {
        data: responseData,
        status: status,
        statusText: 'OK',
        headers: {},
        config: config
      };

    } catch (err) {
      console.error("Mock API Error:", err);
      throw {
        response: {
          data: { message: err.message || "Request Failed" },
          status: err.status || 500,
          statusText: 'Bad Request',
          headers: {}
        }
      };
    }
  };
}
