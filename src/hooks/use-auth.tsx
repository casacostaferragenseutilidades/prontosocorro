import { useState, useEffect, createContext, useContext, ReactNode, useMemo } from 'react'
import { supabase, onAuthStateChange, getCurrentUser, signIn, signUp, signOut } from '@/lib/supabase'
import { useQueryClient } from '@tanstack/react-query'

interface User {
  id: string
  email?: string
  name?: string
  role?: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signUp: (email: string, password: string, userData: { name: string; phone?: string }) => Promise<{ error: any }>
  signOut: () => Promise<{ error: any }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const queryClient = useQueryClient()

  useEffect(() => {
    let mounted = true

    const syncUser = async () => {
      try {
        const currentUser = await getCurrentUser()
        if (!mounted) return
        
        if (currentUser) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', currentUser.id)
            .maybeSingle()
          
          if (mounted) {
            setUser({
              id: currentUser.id,
              email: currentUser.email,
              name: profile?.name || currentUser.user_metadata?.name || 'Usuário',
              role: profile?.role || 'user'
            })
          }
        } else {
          if (mounted) setUser(null)
        }
      } catch (e) {
        console.error('Auth sync error:', e)
        if (mounted) setUser(null)
      } finally {
        if (mounted) setLoading(false)
      }
    }

    syncUser()

    const { data: { subscription } } = onAuthStateChange((event) => {
      if (['SIGNED_IN', 'SIGNED_OUT', 'USER_UPDATED', 'INITIAL_SESSION'].includes(event)) {
        syncUser()
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const handleSignIn = async (email: string, password: string) => {
    try {
      const { error } = await signIn(email, password)
      return { error }
    } catch (error: any) {
      return { error }
    }
  }

  const handleSignUp = async (email: string, password: string, userData: { name: string; phone?: string }) => {
    try {
      const { data, error } = await signUp(email, password, userData)
      if (data.user && !error) {
        try {
          await supabase.from('profiles').insert({
            user_id: data.user.id,
            name: userData.name,
            email: email,
            phone: userData.phone || null,
            role: 'user',
            status: 'active'
          })
        } catch (e) {
          console.error('Profile trigger/insert bypass:', e)
        }
      }
      return { error }
    } catch (error: any) {
      return { error }
    }
  }

  const handleSignOut = async () => {
    try {
      await queryClient.clear()
      const { error } = await signOut()
      return { error }
    } catch (error: any) {
      return { error }
    }
  }

  const authValue = useMemo(() => ({
    user,
    loading,
    signIn: handleSignIn,
    signUp: handleSignUp,
    signOut: handleSignOut
  }), [user, loading])

  return <AuthContext.Provider value={authValue}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export function useRequireAuth() {
  const { user, loading } = useAuth()
  if (loading) return { loading: true, user: null }
  if (!user) return { loading: false, user: null, redirectTo: '/login' }
  return { loading: false, user }
}
