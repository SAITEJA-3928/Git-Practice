const API_BASE = import.meta.env.VITE_API_URL || '/api';

async function request(path, { method = 'GET', body, token } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || `Request failed (${response.status})`);
  }
  return data;
}

export const api = {
  getHealth: () => request('/health'),
  getProducts: (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') query.set(k, v);
    });
    const qs = query.toString();
    return request(`/products${qs ? `?${qs}` : ''}`);
  },
  login: (payload) => request('/auth/login', { method: 'POST', body: payload }),
  register: (payload) => request('/auth/register', { method: 'POST', body: payload }),
  getMe: (token) => request('/auth/me', { token }),
  createOrder: (payload, token) => request('/orders', { method: 'POST', body: payload, token }),
  getMyOrders: (token) => request('/orders/my', { token }),
  cancelOrder: (orderId, reason, token) =>
    request(`/orders/${orderId}/cancel`, { method: 'PATCH', body: { reason }, token }),
  advanceOrderStatus: (orderId, status, token) =>
    request(`/orders/${orderId}/status`, { method: 'PATCH', body: { status }, token })
};
