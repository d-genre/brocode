import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if someone's already logged in (e.g. on page refresh)
    supabase.auth.getSession().then(({ data: { session } }) => {
      handleSession(session)
    })

    // Keep listening for login/logout events
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      handleSession(session)
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  async function handleSession(session) {
    const currentUser = session?.user ?? null
    setUser(currentUser)

    if (currentUser) {
      const { data } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', currentUser.id)
        .single()
      setIsAdmin(data?.is_admin ?? false)
    } else {
      setIsAdmin(false)
    }
    setLoading(false)
  }

  async function signUp(email, password) {
    return supabase.auth.signUp({ email, password })
  }

  async function signIn(email, password) {
    return supabase.auth.signInWithPassword({ email, password })
  }

  async function signOut() {
    return supabase.auth.signOut()
  }

  return (
    <AuthContext.Provider value={{ user, isAdmin, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
