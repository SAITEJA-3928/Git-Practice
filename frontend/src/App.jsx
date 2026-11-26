import React, { useEffect, useState } from 'react';
import { api } from './api/client';
import Header from './components/Header';
import ProductCard from './components/ProductCard';
import CartCheckout from './components/CartCheckout';
import OrdersView from './components/OrdersView';
import AuthModal from './components/AuthModal';

const CATEGORIES = ['All', 'Mobiles', 'Electronics', 'Fashion', 'Home', 'Appliances'];

export default function App() {
  const [activeView, setActiveView] = useState('catalog');
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [category, setCategory] = useState('All');
  const [sort, setSort] = useState('relevance');
  const [searchInput, setSearchInput] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');

  const [token, setToken] = useState(() => localStorage.getItem('fk_token') || '');
  const [user, setUser] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const [cart, setCart] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('fk_cart') || '[]');
    } catch {
      return [];
    }
  });

  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [apiHealth, setApiHealth] = useState(null);
  const [toast, setToast] = useState('');

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(''), 2800);
  }

  useEffect(() => {
    localStorage.setItem('fk_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    api.getHealth().then(setApiHealth).catch(() => setApiHealth({ status: 'offline' }));
  }, []);

  useEffect(() => {
    if (!token) {
      setUser(null);
      return;
    }
    api
      .getMe(token)
      .then((res) => setUser(res.user))
      .catch(() => {
        localStorage.removeItem('fk_token');
        setToken('');
        setUser(null);
      });
  }, [token]);

  async function fetchProducts() {
    setLoadingProducts(true);
    try {
      const data = await api.getProducts({
        category,
        sort,
        q: appliedSearch
      });
      setProducts(data.products || []);
    } catch (err) {
      showToast(err.message);
    } finally {
      setLoadingProducts(false);
    }
  }

  useEffect(() => {
    fetchProducts();
  }, [category, sort, appliedSearch]);

  async function fetchOrders() {
    if (!token) return;
    setLoadingOrders(true);
    try {
      const data = await api.getMyOrders(token);
      setOrders(data.orders || []);
    } catch (err) {
      showToast(err.message);
    } finally {
      setLoadingOrders(false);
    }
  }

  useEffect(() => {
    if (activeView === 'orders' && token) {
      fetchOrders();
    }
  }, [activeView, token]);

  function addToCart(product) {
    setCart((prev) => {
      const existing = prev.find((item) => item._id === product._id);
      if (existing) {
        if (existing.quantity >= product.stock) return prev;
        return prev.map((item) =>
          item._id === product._id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    showToast(`Added "${product.title}" to cart`);
  }

  function buyNow(product) {
    addToCart(product);
    setActiveView('cart');
  }

  function updateQty(productId, qty) {
    if (qty <= 0) {
      setCart((prev) => prev.filter((item) => item._id !== productId));
      return;
    }
    setCart((prev) =>
      prev.map((item) => (item._id === productId ? { ...item, quantity: qty } : item))
    );
  }

  function removeItem(productId) {
    setCart((prev) => prev.filter((item) => item._id !== productId));
  }

  async function handleLogin(credentials) {
    const res = await api.login(credentials);
    localStorage.setItem('fk_token', res.token);
    setToken(res.token);
    setUser(res.user);
    showToast(`Welcome back, ${res.user.name}`);
  }

  async function handleRegister(payload) {
    const res = await api.register(payload);
    localStorage.setItem('fk_token', res.token);
    setToken(res.token);
    setUser(res.user);
    showToast(`Account created for ${res.user.name}`);
  }

  function handleLogout() {
    localStorage.removeItem('fk_token');
    setToken('');
    setUser(null);
    setOrders([]);
    showToast('Logged out');
  }

  async function handlePlaceOrder(payload) {
    setPlacingOrder(true);
    try {
      const res = await api.createOrder(payload, token);
      setCart([]);
      showToast(`Order ${res.order.orderNumber} placed!`);
      setActiveView('orders');
      fetchOrders();
      fetchProducts();
    } catch (err) {
      showToast(err.message);
    } finally {
      setPlacingOrder(false);
    }
  }

  async function handleCancelOrder(orderId) {
    try {
      await api.cancelOrder(orderId, 'Cancelled by customer in dev UI', token);
      showToast('Order cancelled and stock restored');
      fetchOrders();
      fetchProducts();
    } catch (err) {
      showToast(err.message);
    }
  }

  async function handleAdvanceStatus(orderId, nextStatus) {
    try {
      await api.advanceOrderStatus(orderId, nextStatus, token);
      showToast(`Order moved to ${nextStatus.replace(/_/g, ' ')}`);
      fetchOrders();
    } catch (err) {
      showToast(err.message);
    }
  }

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div>
      <Header
        searchQuery={searchInput}
        onSearchChange={setSearchInput}
        onSearchSubmit={() => {
          setAppliedSearch(searchInput);
          setActiveView('catalog');
        }}
        activeView={activeView}
        onNavigate={setActiveView}
        cartCount={cartCount}
        user={user}
        onOpenAuth={() => setShowAuthModal(true)}
        onLogout={handleLogout}
      />

      {activeView === 'catalog' && (
        <div className="fk-categories-bar">
          <div className="fk-categories-inner">
            <div className="fk-cat-pills">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  className={`fk-pill ${category === cat ? 'active' : ''}`}
                  onClick={() => setCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
            <select
              className="fk-input"
              style={{ width: 'auto', minWidth: 180 }}
              value={sort}
              onChange={(e) => setSort(e.target.value)}
            >
              <option value="relevance">Sort: Relevance</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="rating">Customer Rating</option>
            </select>
          </div>
        </div>
      )}

      <main className="fk-main">
        {activeView === 'catalog' && (
          <>
            <section className="fk-banner">
              <div>
                <h2>Big Dev Days Sale — Flipkart-Style Shopping &amp; Orders</h2>
                <p>
                  Full-stack React + Node.js + MongoDB application running in hot-reload dev mode.
                </p>
              </div>
              <div className="fk-dev-badge">
                API: {apiHealth?.status || 'checking'} | DB: {apiHealth?.database || '...'}
              </div>
            </section>

            {loadingProducts ? (
              <div className="fk-panel">Loading catalog from MongoDB...</div>
            ) : products.length === 0 ? (
              <div className="fk-panel">
                No products matched your filter.{' '}
                <button
                  className="fk-btn outline"
                  style={{ width: 'auto', marginLeft: 10 }}
                  onClick={() => {
                    setCategory('All');
                    setSearchInput('');
                    setAppliedSearch('');
                  }}
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <div className="fk-grid">
                {products.map((product) => (
                  <ProductCard
                    key={product._id}
                    product={product}
                    onAddToCart={addToCart}
                    onBuyNow={buyNow}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {activeView === 'cart' && (
          <CartCheckout
            cart={cart}
            user={user}
            onUpdateQty={updateQty}
            onRemoveItem={removeItem}
            onPlaceOrder={handlePlaceOrder}
            onOpenAuth={() => setShowAuthModal(true)}
            submitting={placingOrder}
          />
        )}

        {activeView === 'orders' && (
          <OrdersView
            orders={orders}
            user={user}
            loading={loadingOrders}
            onOpenAuth={() => setShowAuthModal(true)}
            onCancelOrder={handleCancelOrder}
            onAdvanceStatus={handleAdvanceStatus}
          />
        )}
      </main>

      {showAuthModal && (
        <AuthModal
          onClose={() => setShowAuthModal(false)}
          onLogin={handleLogin}
          onRegister={handleRegister}
        />
      )}

      {toast && <div className="fk-toast">{toast}</div>}
    </div>
  );
}
