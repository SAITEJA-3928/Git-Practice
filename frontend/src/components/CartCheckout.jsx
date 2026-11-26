import React, { useState } from 'react';

const DEFAULT_ADDRESS = {
  fullName: 'Aarav Sharma',
  phone: '9876543210',
  pincode: '560103',
  street: '42 Outer Ring Road, Bellandur',
  city: 'Bengaluru',
  state: 'Karnataka'
};

export default function CartCheckout({
  cart,
  user,
  onUpdateQty,
  onRemoveItem,
  onPlaceOrder,
  onOpenAuth,
  submitting
}) {
  const savedAddress = user?.addresses?.[0];
  const [address, setAddress] = useState(savedAddress || DEFAULT_ADDRESS);
  const [paymentMethod, setPaymentMethod] = useState('UPI');

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const mrpTotal = cart.reduce((sum, item) => sum + (item.mrp || item.price) * item.quantity, 0);
  const savings = Math.max(0, mrpTotal - subtotal);
  const deliveryFee = subtotal === 0 || subtotal >= 499 ? 0 : 40;
  const totalAmount = subtotal + deliveryFee;

  if (cart.length === 0) {
    return (
      <div className="fk-panel" style={{ textAlign: 'center', padding: 40 }}>
        <h2>Your FlipCart Basket is Empty</h2>
        <p style={{ color: '#666' }}>Add products from the catalog to test checkout and order tracking.</p>
      </div>
    );
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!user) {
      onOpenAuth();
      return;
    }
    onPlaceOrder({
      items: cart.map((item) => ({ productId: item._id, quantity: item.quantity })),
      shippingAddress: address,
      paymentMethod
    });
  }

  return (
    <div className="fk-checkout-layout">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div className="fk-panel">
          <h2 style={{ marginTop: 0 }}>My Cart ({cart.length})</h2>
          {cart.map((item) => (
            <div key={item._id} className="fk-cart-item">
              <img src={item.imageUrl} alt={item.title} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600 }}>{item.title}</div>
                <div style={{ fontSize: 13, color: '#666', margin: '4px 0' }}>
                  Seller: {item.seller}
                </div>
                <div className="fk-price-row" style={{ marginBottom: 4 }}>
                  <span className="fk-price">₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                  {item.mrp > item.price && (
                    <span className="fk-mrp">₹{(item.mrp * item.quantity).toLocaleString('en-IN')}</span>
                  )}
                </div>
                <div className="fk-qty-controls">
                  <button type="button" onClick={() => onUpdateQty(item._id, item.quantity - 1)}>
                    -
                  </button>
                  <span>{item.quantity}</span>
                  <button
                    type="button"
                    disabled={item.quantity >= item.stock}
                    onClick={() => onUpdateQty(item._id, item.quantity + 1)}
                  >
                    +
                  </button>
                  <button
                    type="button"
                    style={{ width: 'auto', borderRadius: 3, padding: '0 10px', marginLeft: 10 }}
                    onClick={() => onRemoveItem(item._id)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <form className="fk-panel" onSubmit={handleSubmit}>
          <h3 style={{ marginTop: 0 }}>Delivery Address &amp; Payment</h3>
          <div className="fk-form-grid">
            <input
              className="fk-input"
              placeholder="Full Name"
              value={address.fullName}
              onChange={(e) => setAddress({ ...address, fullName: e.target.value })}
              required
            />
            <input
              className="fk-input"
              placeholder="Phone Number"
              value={address.phone}
              onChange={(e) => setAddress({ ...address, phone: e.target.value })}
              required
            />
            <input
              className="fk-input"
              placeholder="Pincode"
              value={address.pincode}
              onChange={(e) => setAddress({ ...address, pincode: e.target.value })}
              required
            />
            <input
              className="fk-input"
              placeholder="City"
              value={address.city}
              onChange={(e) => setAddress({ ...address, city: e.target.value })}
              required
            />
            <input
              className="fk-input"
              placeholder="Street / House No."
              style={{ gridColumn: '1 / -1' }}
              value={address.street}
              onChange={(e) => setAddress({ ...address, street: e.target.value })}
              required
            />
            <input
              className="fk-input"
              placeholder="State"
              value={address.state}
              onChange={(e) => setAddress({ ...address, state: e.target.value })}
              required
            />
            <select
              className="fk-input"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
            >
              <option value="UPI">UPI (Instant Pay)</option>
              <option value="CARD">Credit / Debit Card</option>
              <option value="COD">Cash on Delivery (COD)</option>
            </select>
          </div>

          <button
            type="submit"
            className="fk-btn buy"
            disabled={submitting}
            style={{ width: '100%', marginTop: 16, padding: '12px 16px', fontSize: 15 }}
          >
            {submitting
              ? 'PLACING ORDER...'
              : user
              ? `PLACE ORDER • ₹${totalAmount.toLocaleString('en-IN')}`
              : 'LOGIN TO PLACE ORDER'}
          </button>
        </form>
      </div>

      <aside className="fk-panel">
        <h3 style={{ marginTop: 0, color: '#6e6e6e', fontSize: 14 }}>PRICE DETAILS</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Price ({cart.reduce((s, i) => s + i.quantity, 0)} items)</span>
            <span>₹{mrpTotal.toLocaleString('en-IN')}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#388e3c' }}>
            <span>Discount</span>
            <span>- ₹{savings.toLocaleString('en-IN')}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Delivery Charges</span>
            <span>{deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}</span>
          </div>
          <hr style={{ width: '100%', border: 'none', borderTop: '1px dashed #ddd' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: 17 }}>
            <span>Total Amount</span>
            <span>₹{totalAmount.toLocaleString('en-IN')}</span>
          </div>
          {savings > 0 && (
            <div style={{ color: '#388e3c', fontWeight: 600, fontSize: 13 }}>
              You will save ₹{savings.toLocaleString('en-IN')} on this order
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}
