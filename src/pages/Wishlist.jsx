import { Link } from 'react-router-dom'
import { useWishlist } from '../context/WishlistContext'

export default function Wishlist() {
  const { wishlistItems, toggleWishlist } = useWishlist()

  if (wishlistItems.length === 0) {
    return (
      <div className="container" style={{ padding: '56px 32px 80px' }}>
        <h1 style={{ fontSize: 32 }}>Your wishlist is empty</h1>
        <p style={{ color: 'var(--color-ink-soft)', marginTop: 12 }}>
          Save pieces you love. <Link to="/" style={{ color: 'var(--color-accent)' }}>Browse the collection →</Link>
        </p>
      </div>
    )
  }

  return (
    <div className="container" style={{ padding: '56px 32px 80px' }}>
      <h1 style={{ fontSize: 32, marginBottom: 32 }}>Your Wishlist</h1>
      <div style={styles.grid}>
        {wishlistItems.map((item) => (
          <div key={item.id} style={styles.card}>
            <Link to={`/product/${item.product_id}`}>
              <img src={item.products?.image_url} alt={item.products?.name} style={styles.image} />
            </Link>
            <h3 style={{ fontSize: 16, marginTop: 10 }}>{item.products?.name}</h3>
            <p className="price" style={{ fontSize: 14, color: 'var(--color-ink-soft)' }}>
              ₹{item.products?.price}
            </p>
            <button
              onClick={() => toggleWishlist(item.product_id)}
              style={{ fontSize: 13, textDecoration: 'underline', marginTop: 6 }}
            >
              Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

const styles = {
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 28 },
  card: { display: 'flex', flexDirection: 'column' },
  image: { width: '100%', aspectRatio: '3/4', objectFit: 'cover', background: 'var(--color-accent-soft)' },
}
