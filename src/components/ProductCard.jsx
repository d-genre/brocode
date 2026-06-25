import { Link } from 'react-router-dom'
import { useWishlist } from '../context/WishlistContext'

export default function ProductCard({ product }) {
  const { isWishlisted, toggleWishlist } = useWishlist()
  const wishlisted = isWishlisted(product.id)

  const totalStock = (product.product_variants ?? []).reduce(
    (sum, v) => sum + v.stock_quantity,
    0
  )

  return (
    <div style={styles.card}>
      <div style={styles.imageWrap}>
        <Link to={`/product/${product.id}`}>
          <img src={product.image_url} alt={product.name} style={styles.image} />
        </Link>
        <button
          onClick={() => toggleWishlist(product.id)}
          aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          style={styles.wishlistBtn}
        >
          {wishlisted ? '♥' : '♡'}
        </button>
        {totalStock === 0 && <span style={styles.soldOut}>Sold out</span>}
      </div>

      <Link to={`/product/${product.id}`}>
        <h3 style={styles.name}>{product.name}</h3>
      </Link>
      <p className="price" style={styles.price}>₹{product.price}</p>
    </div>
  )
}

const styles = {
  card: { display: 'flex', flexDirection: 'column', gap: 8 },
  imageWrap: { position: 'relative', aspectRatio: '3/4', overflow: 'hidden', background: 'var(--color-accent-soft)' },
  image: { width: '100%', height: '100%', objectFit: 'cover', display: 'block' },
  wishlistBtn: {
    position: 'absolute', top: 12, right: 12,
    width: 36, height: 36, borderRadius: '50%',
    background: 'rgba(255,255,255,0.9)', fontSize: 18,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: 'var(--color-accent)',
  },
  soldOut: {
    position: 'absolute', bottom: 12, left: 12,
    fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase',
    background: 'var(--color-ink)', color: 'var(--color-white)', padding: '4px 10px',
  },
  name: { fontSize: 16, fontWeight: 500, marginTop: 4 },
  price: { fontSize: 15, color: 'var(--color-ink-soft)', margin: 0 },
}
