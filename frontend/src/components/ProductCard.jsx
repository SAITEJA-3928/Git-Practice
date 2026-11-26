import React from 'react';

export default function ProductCard({ product, onAddToCart, onBuyNow }) {
  const outOfStock = product.stock <= 0;

  return (
    <article className="fk-card">
      <img src={product.imageUrl} alt={product.title} loading="lazy" />
      <span className="fk-brand-tag">
        {product.brand} • {product.category}
      </span>
      <h3 className="fk-card-title">{product.title}</h3>

      <div className="fk-rating-row">
        <span className="fk-rating-pill">{product.rating} ★</span>
        <span>({product.reviewCount?.toLocaleString('en-IN')} reviews)</span>
      </div>

      <div className="fk-price-row">
        <span className="fk-price">₹{product.price.toLocaleString('en-IN')}</span>
        {product.mrp > product.price && (
          <>
            <span className="fk-mrp">₹{product.mrp.toLocaleString('en-IN')}</span>
            <span className="fk-discount">{product.discountPercent}% off</span>
          </>
        )}
      </div>

      <ul className="fk-highlights">
        {(product.highlights || []).slice(0, 3).map((item, idx) => (
          <li key={idx}>{item}</li>
        ))}
      </ul>

      <div style={{ fontSize: 12, color: outOfStock ? '#c62828' : '#388e3c', marginBottom: 8 }}>
        {outOfStock ? 'Out of Stock' : `In Stock (${product.stock} left)`}
      </div>

      <div className="fk-btn-row">
        <button
          className="fk-btn cart"
          disabled={outOfStock}
          onClick={() => onAddToCart(product)}
        >
          ADD TO CART
        </button>
        <button
          className="fk-btn buy"
          disabled={outOfStock}
          onClick={() => onBuyNow(product)}
        >
          BUY NOW
        </button>
      </div>
    </article>
  );
}
