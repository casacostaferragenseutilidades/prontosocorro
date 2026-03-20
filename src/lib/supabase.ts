import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Variáveis de ambiente do Supabase não configuradas. Verifique seu arquivo .env')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Tipos TypeScript para as tabelas
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          user_id: string
          name: string
          email: string
          phone: string | null
          role: 'admin' | 'manager' | 'user'
          status: 'active' | 'inactive'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          email: string
          phone?: string | null
          role?: 'admin' | 'manager' | 'user'
          status?: 'active' | 'inactive'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          email?: string
          phone?: string | null
          role?: 'admin' | 'manager' | 'user'
          status?: 'active' | 'inactive'
          updated_at?: string
        }
      }
      customers: {
        Row: {
          id: string
          name: string
          email: string | null
          phone: string
          address: string | null
          payment_method: 'money' | 'credit_card' | 'debit_card' | 'pix'
          total_debt: number
          status: 'active' | 'inactive'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          email?: string | null
          phone: string
          address?: string | null
          payment_method?: 'money' | 'credit_card' | 'debit_card' | 'pix'
          total_debt?: number
          status?: 'active' | 'inactive'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string | null
          phone?: string
          address?: string | null
          payment_method?: 'money' | 'credit_card' | 'debit_card' | 'pix'
          total_debt?: number
          status?: 'active' | 'inactive'
          updated_at?: string
        }
      }
      suppliers: {
        Row: {
          id: string
          name: string
          email: string | null
          phone: string
          cnpj: string | null
          address: string | null
          status: 'active' | 'inactive'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          email?: string | null
          phone: string
          cnpj?: string | null
          address?: string | null
          status?: 'active' | 'inactive'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string | null
          phone?: string
          cnpj?: string | null
          address?: string | null
          status?: 'active' | 'inactive'
          updated_at?: string
        }
      }
      products: {
        Row: {
          id: string
          name: string
          description: string | null
          category: string | null
          price: number
          cost: number
          stock_quantity: number
          min_stock_alert: number
          unit: string
          barcode: string | null
          status: 'active' | 'inactive'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          category?: string | null
          price: number
          cost: number
          stock_quantity?: number
          min_stock_alert?: number
          unit?: string
          barcode?: string | null
          status?: 'active' | 'inactive'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          category?: string | null
          price?: number
          cost?: number
          stock_quantity?: number
          min_stock_alert?: number
          unit?: string
          barcode?: string | null
          status?: 'active' | 'inactive'
          updated_at?: string
        }
      }
      sales: {
        Row: {
          id: string
          customer_id: string | null
          user_id: string | null
          total_amount: number
          discount_amount: number
          final_amount: number
          payment_method: 'money' | 'credit_card' | 'debit_card' | 'pix' | 'fiado'
          status: 'pending' | 'completed' | 'cancelled'
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          customer_id?: string | null
          user_id?: string | null
          total_amount: number
          discount_amount?: number
          final_amount: number
          payment_method: 'money' | 'credit_card' | 'debit_card' | 'pix' | 'fiado'
          status?: 'pending' | 'completed' | 'cancelled'
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          customer_id?: string | null
          user_id?: string | null
          total_amount?: number
          discount_amount?: number
          final_amount?: number
          payment_method?: 'money' | 'credit_card' | 'debit_card' | 'pix' | 'fiado'
          status?: 'pending' | 'completed' | 'cancelled'
          notes?: string | null
          updated_at?: string
        }
      }
      sale_items: {
        Row: {
          id: string
          sale_id: string
          product_id: string
          quantity: number
          unit_price: number
          total_price: number
          created_at: string
        }
        Insert: {
          id?: string
          sale_id: string
          product_id: string
          quantity: number
          unit_price: number
          total_price: number
          created_at?: string
        }
        Update: {
          id?: string
          sale_id?: string
          product_id?: string
          quantity?: number
          unit_price?: number
          total_price?: number
        }
      }
      accounts_payable: {
        Row: {
          id: string
          supplier_id: string | null
          description: string
          amount: number
          due_date: string
          payment_date: string | null
          status: 'pending' | 'paid' | 'overdue' | 'cancelled'
          category: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          supplier_id?: string | null
          description: string
          amount: number
          due_date: string
          payment_date?: string | null
          status?: 'pending' | 'paid' | 'overdue' | 'cancelled'
          category?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          supplier_id?: string | null
          description?: string
          amount?: number
          due_date?: string
          payment_date?: string | null
          status?: 'pending' | 'paid' | 'overdue' | 'cancelled'
          category?: string | null
          notes?: string | null
          updated_at?: string
        }
      }
      accounts_receivable: {
        Row: {
          id: string
          customer_id: string | null
          sale_id: string | null
          description: string
          amount: number
          due_date: string
          payment_date: string | null
          status: 'pending' | 'paid' | 'overdue' | 'cancelled'
          payment_method: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          customer_id?: string | null
          sale_id?: string | null
          description: string
          amount: number
          due_date: string
          payment_date?: string | null
          status?: 'pending' | 'paid' | 'overdue' | 'cancelled'
          payment_method?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          customer_id?: string | null
          sale_id?: string | null
          description?: string
          amount?: number
          due_date?: string
          payment_date?: string | null
          status?: 'pending' | 'paid' | 'overdue' | 'cancelled'
          payment_method?: string | null
          notes?: string | null
          updated_at?: string
        }
      }
      cash_flow_entries: {
        Row: {
          id: string
          type: 'income' | 'expense'
          description: string
          category: string | null
          amount: number
          payment_method: string | null
          account: string
          status: 'pending' | 'confirmed' | 'cancelled'
          date: string
          user_id: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          type: 'income' | 'expense'
          description: string
          category?: string | null
          amount: number
          payment_method?: string | null
          account?: string
          status?: 'pending' | 'confirmed' | 'cancelled'
          date: string
          user_id?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          type?: 'income' | 'expense'
          description?: string
          category?: string | null
          amount?: number
          payment_method?: string | null
          account?: string
          status?: 'pending' | 'confirmed' | 'cancelled'
          date?: string
          user_id?: string | null
          notes?: string | null
          updated_at?: string
        }
      }
    }
    Functions: {
      get_dashboard_stats: {
        Args: Record<PropertyKey, never>
        Returns: {
          total_sales: number
          total_customers: number
          total_products: number
          pending_receivables: number
          total_sales_today: number
          total_sales_month: number
          total_debt_outstanding: number
          customers_with_debt: number
          low_stock_count: number
        }
      }
    }
  }
}

// Funções auxiliares
export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export const signIn = async (email: string, password: string) => {
  return await supabase.auth.signInWithPassword({ email, password })
}

export const signUp = async (email: string, password: string, userData: { name: string; phone?: string }) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: userData
    }
  })
  return { data, error }
}

export const signOut = async () => {
  return await supabase.auth.signOut()
}

export const onAuthStateChange = (callback: (event: string, session: any) => void) => {
  return supabase.auth.onAuthStateChange(callback)
}
