import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { useWishlist } from '../context/WishlistContext'

export default function Navbar() {
  const { user, isAdmin, signOut } = useAuth()
  const { cartCount } = useCart()
  const { wishlistItems } = useWishlist()

  return (
    <header style={styles.header}>
      <div className="container" style={styles.inner}>
        <Link to="/" style={styles.logo}>BROCODE</Link>

        <nav style={styles.nav}>
          <Link to="/" style={styles.link}>Shop</Link>
          {isAdmin && <Link to="/admin" style={styles.link}>Admin</Link>}
          <Link to="/wishlist" style={styles.link}>
            Wishlist{wishlistItems.length > 0 && ` (${wishlistItems.length})`}
          </Link>
          <Link to="/cart" style={styles.link}>
            Cart{cartCount > 0 && ` (${cartCount})`}
          </Link>
          {user ? (
            <button onClick={signOut} style={styles.link}>Log out</button>
          ) : (
            <Link to="/login" style={styles.link}>Log in</Link>
          )}
        </nav>
      </div>
    </header>
  )
}

const styles = {
  header: {
    borderBottom: '1px solid var(--color-line)',
    background: 'var(--color-bg)',
    position: 'sticky',
    top: 0,
    zIndex: 10,
  },
  inner: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 76,
  },
  logo: {
    fontFamily: 'var(--font-display)',
    fontSize: 20,
    fontWeight: 600,
    letterSpacing: '0.02em',
  },
  nav: {
    display: 'flex',
    alignItems: 'center',
    gap: 28,
    fontSize: 14,
    fontWeight: 500,
  },
  link: {
    color: 'var(--color-ink)',
  },
}
