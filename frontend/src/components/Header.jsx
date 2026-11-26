import React from 'react';

export default function Header({
  searchQuery,
  onSearchChange,
  onSearchSubmit,
  activeView,
  onNavigate,
  cartCount,
  user,
  onOpenAuth,
  onLogout
}) {
  return (
    <header className="fk-header">
      <div className="fk-header-inner">
        <button className="fk-brand" onClick={() => onNavigate('catalog')}>
          <span className="fk-brand-title">FlipCart</span>
          <span className="fk-brand-sub">Dev Storefront</span>
        </button>

        <form
          className="fk-search"
          onSubmit={(e) => {
            e.preventDefault();
            onSearchSubmit();
          }}
        >
          <input
            type="text"
            placeholder="Search for mobiles, laptops, fashion, appliances..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          <button type="submit">Search</button>
        </form>

        <nav className="fk-nav-actions">
          {user ? (
            <>
              <span style={{ fontSize: 13, fontWeight: 600 }}>Hi, {user.name.split(' ')[0]}</span>
              <button className="fk-nav-btn" onClick={onLogout}>
                Logout
              </button>
            </>
          ) : (
            <button className="fk-nav-btn primary" onClick={onOpenAuth}>
              Login
            </button>
          )}

          <button
            className={`fk-nav-btn ${activeView === 'orders' ? 'active' : ''}`}
            onClick={() => onNavigate('orders')}
          >
            My Orders
          </button>

          <button
            className={`fk-nav-btn ${activeView === 'cart' ? 'active' : ''}`}
            onClick={() => onNavigate('cart')}
          >
            Cart ({cartCount})
          </button>
        </nav>
      </div>
    </header>
  );
}
