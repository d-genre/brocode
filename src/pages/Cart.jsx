import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'

export default function Cart() {
  const { cartItems, loading, updateQuantity, removeFromCart, cartTotal } = useCart()

  if (loading) return <div className="container" style={{ padding: 60 }}>Loading…</div>

  if (cartItems.length === 0) {
    return (
      <div className="container" style={{ padding: '56px 32px 80px' }}>
        <h1 style={{ fontSize: 32 }}>Your cart is empty</h1>
        <p style={{ color: 'var(--color-ink-soft)', marginTop: 12 }}>
          Nothing here yet. <Link to="/" style={{ color: 'var(--color-accent)' }}>Browse the collection →</Link>
        </p>
      </div>
    )
  }

  return (
    <div className="container" style={{ padding: '56px 32px 80px' }}>
      <h1 style={{ fontSize: 32, marginBottom: 32 }}>Your Cart</h1>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {cartItems.map((item) => {
          const product = item.product_variants?.products
          const variant = item.product_variants
          return (
            <div key={item.id} style={styles.row}>
              <img src={product?.image_url} alt={product?.name} style={styles.thumb} />
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: 16 }}>{product?.name}</h3>
                <p style={{ fontSize: 13, color: 'var(--color-ink-soft)', marginTop: 4 }}>
                  Size {variant?.size}
                </p>
                <p className="price" style={{ marginTop: 8 }}>₹{product?.price}</p>
              </div>

              <div style={styles.qtyControl}>
                <button onClick={() => updateQuantity(item.id, item.quantity - 1)} style={styles.qtyBtn}>−</button>
                <span style={{ width: 28, textAlign: 'center' }}>{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  disabled={item.quantity >= variant?.stock_quantity}
                  style={styles.qtyBtn}
                >
                  +
                </button>
              </div>

              <button onClick={() => removeFromCart(item.id)} style={styles.removeBtn}>Remove</button>
            </div>
          )
        })}
      </div>

      <div style={styles.summary}>
        <span style={{ fontSize: 16 }}>Total</span>
        <span className="price" style={{ fontSize: 22 }}>₹{cartTotal.toFixed(2)}</span>
      </div>
      <button className="btn-primary" style={{ width: '100%', marginTop: 16 }}>
        Checkout
      </button>
      <p style={{ fontSize: 12, color: 'var(--color-ink-soft)', marginTop: 10, textAlign: 'center' }}>
        Checkout / payment integration is the next step — see notes below.
      </p>
    </div>
  )
}

const styles = {
  row: {
    display: 'flex', alignItems: 'center', gap: 20,
    paddingBottom: 20, borderBottom: '1px solid var(--color-line)',
  },
  thumb: { width: 80, height: 96, objectFit: 'cover', background: 'var(--color-accent-soft)' },
  qtyControl: {
    display: 'flex', alignItems: 'center', gap: 4,
    border: '1px solid var(--color-line)', borderRadius: 2,
  },
  qtyBtn: { width: 32, height: 32, fontSize: 16 },
  removeBtn: { fontSize: 13, color: 'var(--color-ink-soft)', textDecoration: 'underline' },
  summary: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
    marginTop: 32, paddingTop: 20, borderTop: '1px solid var(--color-ink)',
  },
}
