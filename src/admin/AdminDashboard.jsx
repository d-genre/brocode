import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { Navigate } from 'react-router-dom'
import AddProductForm from './AddProductForm'

export default function AdminDashboard() {
  const { isAdmin, loading: authLoading } = useAuth()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingStock, setEditingStock] = useState({}) // variantId -> draft value
  const [showAddForm, setShowAddForm] = useState(false)

  async function fetchProducts() {
    setLoading(true)
    const { data, error } = await supabase
      .from('products')
      .select('*, product_variants(*)')
      .order('created_at', { ascending: false })

    if (error) console.error('Error fetching products:', error)
    setProducts(data ?? [])
    setLoading(false)
  }

  useEffect(() => {
    if (isAdmin) fetchProducts()
  }, [isAdmin])

  // Redirect non-admins away from this page entirely
  if (!authLoading && !isAdmin) {
    return <Navigate to="/" replace />
  }

  async function saveStock(variantId) {
    const newValue = editingStock[variantId]
    if (newValue === undefined) return

    const { error } = await supabase
      .from('product_variants')
      .update({ stock_quantity: parseInt(newValue, 10) })
      .eq('id', variantId)

    if (error) {
      alert('Error updating stock: ' + error.message)
      return
    }
    setEditingStock((prev) => {
      const next = { ...prev }
      delete next[variantId]
      return next
    })
    fetchProducts()
  }

  async function toggleActive(product) {
    await supabase
      .from('products')
      .update({ is_active: !product.is_active })
      .eq('id', product.id)
    fetchProducts()
  }

  async function deleteProduct(productId) {
    if (!confirm('Delete this product permanently? This cannot be undone.')) return
    await supabase.from('products').delete().eq('id', productId)
    fetchProducts()
  }

  return (
    <div className="container" style={{ padding: '56px 32px 80px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <h1 style={{ fontSize: 32 }}>Inventory</h1>
        <button className="btn-primary" onClick={() => setShowAddForm((s) => !s)}>
          {showAddForm ? 'Close' : '+ Add Product'}
        </button>
      </div>

      {showAddForm && (
        <div style={{ marginBottom: 48 }}>
          <AddProductForm onCreated={() => { setShowAddForm(false); fetchProducts() }} />
        </div>
      )}

      {loading && <p>Loading…</p>}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {products.map((product) => (
          <div key={product.id} style={styles.card}>
            <div style={{ display: 'flex', gap: 16 }}>
              <img src={product.image_url} alt={product.name} style={styles.thumb} />
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h3 style={{ fontSize: 17 }}>{product.name}</h3>
                    <p className="price" style={{ fontSize: 14, color: 'var(--color-ink-soft)' }}>₹{product.price}</p>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => toggleActive(product)} style={styles.smallBtn}>
                      {product.is_active ? 'Hide' : 'Unhide'}
                    </button>
                    <button onClick={() => deleteProduct(product.id)} style={{ ...styles.smallBtn, color: 'var(--color-danger)' }}>
                      Delete
                    </button>
                  </div>
                </div>

                <div style={styles.variantGrid}>
                  {(product.product_variants ?? []).map((v) => (
                    <div key={v.id} style={styles.variantRow}>
                      <span style={styles.sizeLabel}>{v.size}</span>
                      <input
                        type="number"
                        min="0"
                        value={editingStock[v.id] ?? v.stock_quantity}
                        onChange={(e) =>
                          setEditingStock((prev) => ({ ...prev, [v.id]: e.target.value }))
                        }
                        style={styles.stockInput}
                      />
                      <button
                        onClick={() => saveStock(v.id)}
                        disabled={editingStock[v.id] === undefined}
                        style={styles.saveBtn}
                      >
                        Save
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

const styles = {
  card: {
    border: '1px solid var(--color-line)', padding: 20, background: 'var(--color-white)',
  },
  thumb: { width: 72, height: 88, objectFit: 'cover', background: 'var(--color-accent-soft)', flexShrink: 0 },
  smallBtn: { fontSize: 13, textDecoration: 'underline' },
  variantGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
    gap: 10, marginTop: 16,
  },
  variantRow: {
    display: 'flex', alignItems: 'center', gap: 8,
    border: '1px solid var(--color-line)', padding: '6px 10px',
  },
  sizeLabel: { fontSize: 13, fontWeight: 600, width: 28 },
  stockInput: {
    width: 60, padding: '5px 8px', fontSize: 14,
    border: '1px solid var(--color-line)', borderRadius: 2,
  },
  saveBtn: { fontSize: 12, fontWeight: 600, color: 'var(--color-accent)' },
}
