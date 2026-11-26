import React from 'react';

const TRACKING_FLOW = ['PLACED', 'PACKED', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED'];

function getNextStatus(current) {
  const idx = TRACKING_FLOW.indexOf(current);
  if (idx === -1 || idx === TRACKING_FLOW.length - 1) return null;
  return TRACKING_FLOW[idx + 1];
}

export default function OrdersView({
  orders,
  user,
  loading,
  onOpenAuth,
  onCancelOrder,
  onAdvanceStatus
}) {
  if (!user) {
    return (
      <div className="fk-panel" style={{ textAlign: 'center', padding: 40 }}>
        <h2>Sign in to view your Flipkart orders</h2>
        <button className="fk-btn buy" style={{ maxWidth: 220, marginTop: 10 }} onClick={onOpenAuth}>
          Login / Register
        </button>
      </div>
    );
  }

  if (loading) {
    return <div className="fk-panel">Loading your orders...</div>;
  }

  if (orders.length === 0) {
    return (
      <div className="fk-panel" style={{ textAlign: 'center', padding: 40 }}>
        <h2>No Orders Yet</h2>
        <p style={{ color: '#666' }}>Place your first order from the storefront to see live order tracking.</p>
      </div>
    );
  }

  return (
    <div>
      <h2 style={{ marginTop: 0 }}>My Orders ({orders.length})</h2>
      {orders.map((order) => {
        const isCancelled = order.orderStatus === 'CANCELLED';
        const currentIdx = TRACKING_FLOW.indexOf(order.orderStatus);
        const nextStatus = getNextStatus(order.orderStatus);
        const canCancel = order.orderStatus === 'PLACED' || order.orderStatus === 'PACKED';

        return (
          <div key={order._id} className="fk-order-card">
            <div className="fk-order-top">
              <div>
                <strong>Order #{order.orderNumber}</strong>
                <div style={{ fontSize: 12, color: '#666' }}>
                  Placed on {new Date(order.createdAt).toLocaleString()} • {order.paymentMethod} ({order.paymentStatus})
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 700, fontSize: 16 }}>
                  ₹{order.totalAmount.toLocaleString('en-IN')}
                </div>
                <div style={{ fontSize: 12, color: '#666' }}>
                  Deliver to: {order.shippingAddress.fullName}, {order.shippingAddress.city}
                </div>
              </div>
            </div>

            <div className="fk-status-steps">
              {isCancelled ? (
                <span className="fk-step cancelled">ORDER CANCELLED</span>
              ) : (
                TRACKING_FLOW.map((step, idx) => (
                  <span key={step} className={`fk-step ${idx <= currentIdx ? 'done' : ''}`}>
                    {step.replace(/_/g, ' ')}
                  </span>
                ))
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {order.items.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    style={{ width: 56, height: 56, objectFit: 'cover', borderRadius: 4 }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{item.title}</div>
                    <div style={{ fontSize: 12, color: '#666' }}>
                      Qty: {item.quantity} × ₹{item.price.toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 14, flexWrap: 'wrap' }}>
              {nextStatus && !isCancelled && (
                <button
                  className="fk-btn outline"
                  style={{ flex: 'none' }}
                  onClick={() => onAdvanceStatus(order._id, nextStatus)}
                >
                  Dev: Advance to {nextStatus.replace(/_/g, ' ')}
                </button>
              )}
              {canCancel && (
                <button
                  className="fk-btn danger"
                  style={{ flex: 'none' }}
                  onClick={() => onCancelOrder(order._id)}
                >
                  Cancel Order
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
