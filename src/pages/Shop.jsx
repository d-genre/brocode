import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import ProductCard from '../components/ProductCard'

export default function Shop() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchProducts() {
      const { data, error } = await supabase
        .from('products')
        .select('*, product_variants(*)')
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (error) console.error('Error fetching products:', error)
      setProducts(data ?? [])
      setLoading(false)
    }
    fetchProducts()
  }, [])

  return (
    <div className="container" style={{ padding: '56px 32px 80px' }}>
      <p className="eyebrow">New Arrivals</p>
      <h1 style={{ fontSize: 40, marginTop: 8, marginBottom: 40 }}>The Full Collection</h1>

      {loading && <p>Loading products…</p>}
      {!loading && products.length === 0 && <p>No products yet. Check back soon.</p>}

      <div style={styles.grid}>
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  )
}

const styles = {
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
    gap: 32,
  },
}
