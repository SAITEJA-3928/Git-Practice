import React, { useState } from 'react';

export default function AuthModal({ onClose, onLogin, onRegister }) {
  const [mode, setMode] = useState('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'login') {
        await onLogin({ email, password });
      } else {
        await onRegister({ name, email, password });
      }
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function fillDemoCustomer() {
    setMode('login');
    setEmail('customer@flipkart.dev');
    setPassword('demo1234');
  }

  return (
    <div className="fk-modal-backdrop" onClick={onClose}>
      <div className="fk-modal" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0 }}>{mode === 'login' ? 'Login' : 'Create Account'}</h2>
          <button
            type="button"
            onClick={onClose}
            style={{ border: 'none', background: 'transparent', fontSize: 20 }}
          >
            ×
          </button>
        </div>

        <p style={{ fontSize: 13, color: '#666' }}>
          Get access to your Orders, Wishlist, and Fast Checkout.
        </p>

        {error && (
          <div style={{ background: '#ffebee', color: '#c62828', padding: 8, borderRadius: 4, marginBottom: 10, fontSize: 13 }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {mode === 'register' && (
            <input
              className="fk-input"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          )}
          <input
            className="fk-input"
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            className="fk-input"
            type="password"
            placeholder="Password (min 6 chars)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="submit" className="fk-btn buy" disabled={loading}>
            {loading ? 'Please wait...' : mode === 'login' ? 'LOGIN' : 'REGISTER'}
          </button>

          <button type="button" className="fk-btn outline" onClick={fillDemoCustomer}>
            Fill Seeded Demo Customer
          </button>
        </form>

        <div style={{ marginTop: 14, textAlign: 'center', fontSize: 13 }}>
          {mode === 'login' ? (
            <>
              New to FlipCart?{' '}
              <button
                type="button"
                onClick={() => setMode('register')}
                style={{ border: 'none', background: 'transparent', color: '#2874f0', fontWeight: 700 }}
              >
                Create an account
              </button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => setMode('login')}
                style={{ border: 'none', background: 'transparent', color: '#2874f0', fontWeight: 700 }}
              >
                Login
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
