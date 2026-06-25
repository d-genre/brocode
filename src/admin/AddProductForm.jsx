import { useState } from 'react'
import { supabase } from '../lib/supabase'

const SIZES = ['S', 'M', 'L', 'XL']

export default function AddProductForm({ onCreated }) {
  const [form, setForm] = useState({
    name: '', description: '', price: '', category: '', image_url: '',
  })
  const [stock, setStock] = useState({ S: 0, M: 0, L: 0, XL: 0 })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    const { data: product, error: productError } = await supabase
      .from('products')
      .insert({
        name: form.name,
        description: form.description,
        price: parseFloat(form.price),
        category: form.category,
        image_url: form.image_url,
      })
      .select()
      .single()

    if (productError) {
      setError(productError.message)
      setSubmitting(false)
      return
    }

    const variantRows = SIZES.map((size) => ({
      product_id: product.id,
      size,
      stock_quantity: parseInt(stock[size] || 0, 10),
    }))

    const { error: variantError } = await supabase.from('product_variants').insert(variantRows)

    setSubmitting(false)
    if (variantError) {
      setError(variantError.message)
      return
    }

    onCreated?.()
  }

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <h3 style={{ fontSize: 18, marginBottom: 4 }}>New Product</h3>

      <div style={styles.grid2}>
        <Field label="Name">
          <input required value={form.name} onChange={(e) => update('name', e.target.value)} style={styles.input} />
        </Field>
        <Field label="Price (₹)">
          <input required type="number" min="0" step="0.01" value={form.price} onChange={(e) => update('price', e.target.value)} style={styles.input} />
        </Field>
      </div>

      <Field label="Category">
        <input value={form.category} onChange={(e) => update('category', e.target.value)} style={styles.input} />
      </Field>

      <Field label="Image URL">
        <input required value={form.image_url} onChange={(e) => update('image_url', e.target.value)} style={styles.input} placeholder="https://…" />
      </Field>

      <Field label="Description">
        <textarea value={form.description} onChange={(e) => update('description', e.target.value)} style={{ ...styles.input, height: 80 }} />
      </Field>

      <div>
        <label style={styles.label}>Initial stock per size</label>
        <div style={{ display: 'flex', gap: 12, marginTop: 6 }}>
          {SIZES.map((size) => (
            <div key={size} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <span style={{ fontSize: 12, fontWeight: 600 }}>{size}</span>
              <input
                type="number"
                min="0"
                value={stock[size]}
                onChange={(e) => setStock((prev) => ({ ...prev, [size]: e.target.value }))}
                style={{ ...styles.input, width: 60, textAlign: 'center' }}
              />
            </div>
          ))}
        </div>
      </div>

      {error && <p style={{ color: 'var(--color-danger)', fontSize: 14 }}>{error}</p>}

      <button className="btn-primary" type="submit" disabled={submitting} style={{ alignSelf: 'flex-start', marginTop: 8 }}>
        {submitting ? 'Creating…' : 'Create Product'}
      </button>
    </form>
  )
}

function Field({ label, children }) {
  return (
    <div>
      <label style={styles.label}>{label}</label>
      {children}
    </div>
  )
}

const styles = {
  form: {
    display: 'flex', flexDirection: 'column', gap: 16,
    border: '1px solid var(--color-line)', padding: 24, background: 'var(--color-white)',
  },
  grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 },
  label: { display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 },
  input: {
    width: '100%', padding: '10px 12px', fontSize: 14,
    border: '1px solid var(--color-line)', borderRadius: 2,
    fontFamily: 'var(--font-body)',
  },
}
