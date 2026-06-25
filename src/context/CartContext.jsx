import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'

const CartContext = createContext(null)
const STORAGE_KEY = 'cart'

function readStoredCart() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : [] // [{ variant_id, quantity }]
  } catch {
    return []
  }
}

function writeStoredCart(items) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
}

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([])
  const [loading, setLoading] = useState(false)

  // Reads the {variant_id, quantity} pairs from localStorage, then hydrates
  // them with live product/stock data so prices and stock stay accurate.
  const fetchCart = useCallback(async () => {
    const stored = readStoredCart()
    if (stored.length === 0) {
      setCartItems([])
      return
    }
    setLoading(true)
    const variantIds = stored.map((i) => i.variant_id)
    const { data, error } = await supabase
      .from('product_variants')
      .select(`id, size, stock_quantity, products ( id, name, price, image_url )`)
      .in('id', variantIds)

    if (error) {
      console.error('Error fetching cart:', error)
      setLoading(false)
      return
    }

    const hydrated = stored
      .map((storedItem) => {
        const variant = data.find((v) => v.id === storedItem.variant_id)
        if (!variant) return null // variant no longer exists, drop it silently
        return {
          id: storedItem.variant_id,
          variant_id: storedItem.variant_id,
          quantity: storedItem.quantity,
          product_variants: variant,
        }
      })
      .filter(Boolean)

    setCartItems(hydrated)
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchCart()
  }, [fetchCart])

  async function addToCart(variantId, quantity = 1) {
    const stored = readStoredCart()
    const existing = stored.find((i) => i.variant_id === variantId)
    if (existing) {
      existing.quantity += quantity
    } else {
      stored.push({ variant_id: variantId, quantity })
    }
    writeStoredCart(stored)
    await fetchCart()
  }

  async function updateQuantity(variantId, newQuantity) {
    if (newQuantity < 1) {
      await removeFromCart(variantId)
      return
    }
    const stored = readStoredCart()
    const item = stored.find((i) => i.variant_id === variantId)
    if (item) item.quantity = newQuantity
    writeStoredCart(stored)
    await fetchCart()
  }

  async function removeFromCart(variantId) {
    const stored = readStoredCart().filter((i) => i.variant_id !== variantId)
    writeStoredCart(stored)
    await fetchCart()
  }

  const cartTotal = cartItems.reduce(
    (sum, item) => sum + (item.product_variants?.products?.price ?? 0) * item.quantity,
    0
  )
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <CartContext.Provider
      value={{ cartItems, loading, addToCart, updateQuantity, removeFromCart, cartTotal, cartCount, refetch: fetchCart }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  return useContext(CartContext)
}