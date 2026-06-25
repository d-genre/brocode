import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useCart } from '../context/CartContext'
import { useWishlist } from '../context/WishlistContext'

export default function ProductDetail() {
  const { id } = useParams()
  const [product, setProduct] = useState(null)
  const [selectedSize, setSelectedSize] = useState(null)
  const [loading, setLoading] = useState(true)
  const [justAdded, setJustAdded] = useState(false)

  const { addToCart } = useCart()
  const { isWishlisted, toggleWishlist } = useWishlist()

  useEffect(() => {
    async function fetchProduct() {
      const { data, error } = await supabase
        .from('products')
        .select('*, product_variants(*)')
        .eq('id', id)
        .single()

      if (error) console.error('Error fetching product:', error)
      setProduct(data)
      setLoading(false)
    }
    fetchProduct()
  }, [id])

  if (loading) return <div className="container" style={{ padding: 60 }}>Loading…</div>
  if (!product) return <div className="container" style={{ padding: 60 }}>Product not found.</div>

  const variants = product.product_variants ?? []
  const selectedVariant = variants.find((v) => v.size === selectedSize)
  const wishlisted = isWishlisted(product.id)

  async function handleAddToCart() {
    if (!selectedVariant) return
    await addToCart(selectedVariant.id, 1)
    setJustAdded(true)
    setTimeout(() => setJustAdded(false), 2000)
  }

  return (
    <div className="container" style={{ padding: '56px 32px 80px' }}>
      <div style={styles.layout}>
        <div style={styles.imageWrap}>
          <img src={product.image_url} alt={product.name} style={styles.image} />
        </div>

        <div style={styles.info}>
          <p className="eyebrow">{product.category}</p>
          <h1 style={{ fontSize: 34, marginTop: 8 }}>{product.name}</h1>
          <p className="price" style={{ fontSize: 20, marginTop: 8 }}>₹{product.price}</p>
          <p style={{ color: 'var(--color-ink-soft)', lineHeight: 1.6, marginTop: 20 }}>
            {product.description}
          </p>

          {/* Size selector — styled as fabric swatch tags */}
          <div style={{ marginTop: 32 }}>
            <p className="eyebrow" style={{ marginBottom: 12 }}>Select Size</p>
            <div style={styles.sizeRow}>
              {variants.map((v) => {
                const outOfStock = v.stock_quantity === 0
                const active = selectedSize === v.size
                return (
                  <button
                    key={v.id}
                    disabled={outOfStock}
                    onClick={() => setSelectedSize(v.size)}
                    style={{
                      ...styles.sizeTag,
                      ...(active ? styles.sizeTagActive : {}),
                      ...(outOfStock ? styles.sizeTagDisabled : {}),
                    }}
                  >
                    {v.size}
                    {outOfStock && <span style={styles.strike} />}
                  </button>
                )
              })}
            </div>
            {selectedVariant && selectedVariant.stock_quantity <= 5 && selectedVariant.stock_quantity > 0 && (
              <p style={{ fontSize: 13, color: 'var(--color-accent)', marginTop: 10 }}>
                Only {selectedVariant.stock_quantity} left in size {selectedVariant.size}
              </p>
            )}
          </div>

          <div style={{ display: 'flex', gap: 12, marginTop: 32 }}>
            <button
              className="btn-primary"
              disabled={!selectedVariant || selectedVariant.stock_quantity === 0}
              onClick={handleAddToCart}
              style={{ flex: 1 }}
            >
              {justAdded ? 'Added ✓' : selectedSize ? 'Add to Cart' : 'Select a size'}
            </button>
            <button
              className="btn-secondary"
              onClick={() => toggleWishlist(product.id)}
            >
              {wishlisted ? '♥ Saved' : '♡ Save'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

const styles = {
  layout: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64 },
  imageWrap: { aspectRatio: '3/4', background: 'var(--color-accent-soft)', overflow: 'hidden' },
  image: { width: '100%', height: '100%', objectFit: 'cover' },
  info: { paddingTop: 8 },
  sizeRow: { display: 'flex', gap: 10, flexWrap: 'wrap' },
  sizeTag: {
    position: 'relative',
    minWidth: 52, height: 44, padding: '0 14px',
    border: '1px solid var(--color-ink)',
    fontSize: 14, fontWeight: 500,
    background: 'transparent',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  sizeTagActive: { background: 'var(--color-ink)', color: 'var(--color-white)' },
  sizeTagDisabled: {
    borderColor: 'var(--color-line)', color: 'var(--color-line)', cursor: 'not-allowed',
  },
  strike: {
    position: 'absolute', left: 0, top: '50%', width: '100%', height: 1,
    background: 'var(--color-line)', transform: 'rotate(-8deg)',
  },
}
