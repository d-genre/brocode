import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'

const WishlistContext = createContext(null)
const STORAGE_KEY = 'wishlist'

function readStoredWishlist() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : [] // array of product_id
  } catch {
    return []
  }
}

function writeStoredWishlist(ids) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ids))
}

export function WishlistProvider({ children }) {
  const [wishlistItems, setWishlistItems] = useState([])

  const fetchWishlist = useCallback(async () => {
    const ids = readStoredWishlist()
    if (ids.length === 0) {
      setWishlistItems([])
      return
    }
    const { data, error } = await supabase
      .from('products')
      .select('id, name, price, image_url')
      .in('id', ids)

    if (error) {
      console.error('Error fetching wishlist:', error)
      return
    }

    const hydrated = ids
      .map((productId) => {
        const product = data.find((p) => p.id === productId)
        if (!product) return null
        return { id: productId, product_id: productId, products: product }
      })
      .filter(Boolean)

    setWishlistItems(hydrated)
  }, [])

  useEffect(() => {
    fetchWishlist()
  }, [fetchWishlist])

  function isWishlisted(productId) {
    return wishlistItems.some((item) => item.product_id === productId)
  }

  async function toggleWishlist(productId) {
    const ids = readStoredWishlist()
    const exists = ids.includes(productId)
    const updated = exists ? ids.filter((id) => id !== productId) : [...ids, productId]
    writeStoredWishlist(updated)
    await fetchWishlist()
  }

  return (
    <WishlistContext.Provider value={{ wishlistItems, isWishlisted, toggleWishlist }}>
      {children}
    </WishlistContext.Provider>
  )
}

export function useWishlist() {
  return useContext(WishlistContext)
}