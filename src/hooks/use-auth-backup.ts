import { useState, useEffect, createContext, useContext, ReactNode } from 'react'
import { supabase, getCurrentUser, signIn, signUp, signOut, onAuthStateChange } from '@/lib/supabase'
import { useQuery, useQueryClient } from '@tanstack/react-query'

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
    // Verificar usuário atual
    const initializeAuth = async () => {
      try {
        const currentUser = await getCurrentUser()
        if (currentUser) {
          // Buscar perfil do usuário
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', currentUser.id)
            .single()
          
          setUser({
            id: currentUser.id,
            email: currentUser.email,
            name: profile?.name,
            role: profile?.role
          })
        }
      } catch (error) {
        console.error('Erro ao inicializar autenticação:', error)
      } finally {
        setLoading(false)
      }
    }

    initializeAuth()

    // Escutar mudanças de autenticação
    const { data: { subscription } } = onAuthStateChange(async (event, session) => {
      if (session?.user) {
        // Buscar perfil do usuário
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', session.user.id)
          .single()
        
        setUser({
          id: session.user.id,
          email: session.user.email,
          name: profile?.name,
          role: profile?.role
        })
      } else {
        setUser(null)
      }
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleSignIn = async (email: string, password: string) => {
    try {
      const { error } = await signIn(email, password)
      return { error }
    } catch (error) {
      return { error }
    }
  }

  const handleSignUp = async (email: string, password: string, userData: { name: string; phone?: string }) => {
    try {
      const { data, error } = await signUp(email, password, userData)
      
      // Se signup for bem-sucedido, criar perfil
      if (data.user && !error) {
        await supabase
          .from('profiles')
          .insert({
            user_id: data.user.id,
            name: userData.name,
            email: email,
            phone: userData.phone || null,
            role: 'user',
            status: 'active'
          })
      }
      
      return { error }
    } catch (error) {
      return { error }
    }
  }

  const handleSignOut = async () => {
    try {
      await queryClient.clear()
      const { error } = await signOut()
      return { error }
    } catch (error) {
      return { error }
    }
  }

  const value = {
    user,
    loading,
    signIn: handleSignIn,
    signUp: handleSignUp,
    signOut: handleSignOut
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Hook para verificar se usuário está autenticado
export function useRequireAuth() {
  const { user, loading } = useAuth()
  
  if (loading) {
    return { loading: true, user: null }
  }
  
  if (!user) {
    return { loading: false, user: null, redirectTo: '/login' }
  }
  
  return { loading: false, user }
}
