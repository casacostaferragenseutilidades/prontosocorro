import { supabase, Database } from './supabase'
import { useQuery, useMutation, useQueryClient, QueryKey } from '@tanstack/react-query'

// Tipos para compatibilidade
export type Customer = Database['public']['Tables']['customers']['Row']
export type CustomerInsert = Database['public']['Tables']['customers']['Insert']
export type CustomerUpdate = Database['public']['Tables']['customers']['Update']

export type Supplier = Database['public']['Tables']['suppliers']['Row']
export type SupplierInsert = Database['public']['Tables']['suppliers']['Insert']
export type SupplierUpdate = Database['public']['Tables']['suppliers']['Update']

export type Product = Database['public']['Tables']['products']['Row']
export type ProductInsert = Database['public']['Tables']['products']['Insert']
export type ProductUpdate = Database['public']['Tables']['products']['Update']

export type Sale = Database['public']['Tables']['sales']['Row']
export type SaleInsert = Database['public']['Tables']['sales']['Insert']
export type SaleUpdate = Database['public']['Tables']['sales']['Update']

export type SaleItem = Database['public']['Tables']['sale_items']['Row']
export type SaleItemInsert = Database['public']['Tables']['sale_items']['Insert']

export type AccountsPayable = Database['public']['Tables']['accounts_payable']['Row']
export type AccountsPayableInsert = Database['public']['Tables']['accounts_payable']['Insert']
export type AccountsPayableUpdate = Database['public']['Tables']['accounts_payable']['Update']

export type AccountsReceivable = Database['public']['Tables']['accounts_receivable']['Row']
export type AccountsReceivableInsert = Database['public']['Tables']['accounts_receivable']['Insert']
export type AccountsReceivableUpdate = Database['public']['Tables']['accounts_receivable']['Update']

export type CashFlowEntry = Database['public']['Tables']['cash_flow_entries']['Row']
export type CashFlowEntryInsert = Database['public']['Tables']['cash_flow_entries']['Insert']
export type CashFlowEntryUpdate = Database['public']['Tables']['cash_flow_entries']['Update']

// Dashboard
export const useGetDashboard = () => {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      // 1. Estatísticas Básicas via RPC
      const { data: stats, error: rpcError } = await supabase.rpc('get_dashboard_stats')
      if (rpcError) throw rpcError
      const s = stats && stats.length > 0 ? stats[0] : {}

      // 2. Vendas Recentes (últimas 7)
      const { data: recentSales } = await supabase
        .from('sales')
        .select(`
          *,
          customer:customers(name)
        `)
        .order('created_at', { ascending: false })
        .limit(7)

      // 3. Dados para Gráfico (últimos 30 dias)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const { data: chartSales } = await supabase
        .from('sales')
        .select('created_at, final_amount')
        .eq('status', 'completed')
        .gte('created_at', thirtyDaysAgo.toISOString())
        .order('created_at', { ascending: true });

      // Agrupar por data para o gráfico
      const salesByDate: Record<string, number> = {};
      (chartSales || []).forEach(sale => {
        const date = new Date(sale.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
        salesByDate[date] = (salesByDate[date] || 0) + Number(sale.final_amount);
      });

      const chartData = Object.entries(salesByDate).map(([name, sales]) => ({ name, sales }));

      // 4. Top Produtos
      const { data: topProductsRaw } = await supabase
        .from('sale_items')
        .select(`
          quantity,
          total_price,
          product:products(name)
        `)
        .order('quantity', { ascending: false })
        .limit(5);

      return {
        totalSales: Number(s.total_sales || 0),
        totalCustomers: Number(s.total_customers || 0),
        totalProducts: Number(s.total_products || 0),
        pendingReceivables: Number(s.pending_receivables || 0),
        totalSalesToday: Number(s.total_sales_today || 0),
        totalSalesMonth: Number(s.total_sales_month || 0),
        totalDebtOutstanding: Number(s.pending_receivables || 0),
        customersWithDebt: Number(s.customers_with_debt || 0),
        lowStockCount: Number(s.low_stock_count || 0),
        recentSales: recentSales || [],
        chartData: chartData.length > 0 ? chartData : [{ name: 'Sem dados', sales: 0 }],
        topProducts: (topProductsRaw || []).map((p: any) => ({
          product_name: p.product?.name || "Produto",
          quantity: p.quantity,
          total_price: p.total_price
        }))
      }
    }
  })
}

// Customers
export const getListCustomersQueryKey = () => ['customers']

export const useListCustomers = () => {
  return useQuery({
    queryKey: getListCustomersQueryKey(),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) throw error
      return data || []
    }
  })
}

export const useCreateCustomer = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (customer: CustomerInsert) => {
      const { data, error } = await supabase
        .from('customers')
        .insert(customer)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getListCustomersQueryKey() })
    }
  })
}

export const useUpdateCustomer = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ id, ...customer }: CustomerUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from('customers')
        .update(customer)
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getListCustomersQueryKey() })
    }
  })
}

export const useDeleteCustomer = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getListCustomersQueryKey() })
    }
  })
}

// Suppliers
export const getListSuppliersQueryKey = () => ['suppliers']

export const useListSuppliers = () => {
  return useQuery({
    queryKey: getListSuppliersQueryKey(),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('suppliers')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) throw error
      return data || []
    }
  })
}

export const useCreateSupplier = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (supplier: SupplierInsert) => {
      const { data, error } = await supabase
        .from('suppliers')
        .insert(supplier)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getListSuppliersQueryKey() })
    }
  })
}

export const useUpdateSupplier = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ id, ...supplier }: SupplierUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from('suppliers')
        .update(supplier)
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getListSuppliersQueryKey() })
    }
  })
}

export const useDeleteSupplier = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      const { error } = await supabase
        .from('suppliers')
        .delete()
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getListSuppliersQueryKey() })
    }
  })
}

// Products
export const getListProductsQueryKey = () => ['products']

export const useListProducts = () => {
  return useQuery({
    queryKey: getListProductsQueryKey(),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) throw error
      return data || []
    }
  })
}

export const useCreateProduct = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (product: ProductInsert) => {
      const { data, error } = await supabase
        .from('products')
        .insert(product)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getListProductsQueryKey() })
    }
  })
}

export const useUpdateProduct = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ id, ...product }: ProductUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from('products')
        .update(product)
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getListProductsQueryKey() })
    }
  })
}

export const useDeleteProduct = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getListProductsQueryKey() })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    }
  })
}

// Sales
export const getListSalesQueryKey = () => ['sales']

export const useListSales = () => {
  return useQuery({
    queryKey: getListSalesQueryKey(),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sales')
        .select(`
          *,
          customer:customers(name, phone),
          user:profiles(name)
        `)
        .order('created_at', { ascending: false })
      if (error) throw error
      return data || []
    }
  })
}

export const useCreateSale = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ items, installments_data, ...sale }: SaleInsert & { 
      items: SaleItemInsert[], 
      installments_data?: { amount: number; due_date: string; notes?: string }[] 
    }) => {
      // 1. Criar a venda
      const { data: saleData, error: saleError } = await supabase
        .from('sales')
        .insert(sale)
        .select()
        .single()
      if (saleError) throw saleError

      // 2. Criar os itens da venda
      if (items && items.length > 0) {
        const itemsToInsert = items.map(i => ({ ...i, sale_id: saleData.id }))
        const { error: itemsError } = await supabase
          .from('sale_items')
          .insert(itemsToInsert)
        if (itemsError) throw itemsError

        // 2.1 Descontar estoque automaticamente
        for (const item of items) {
          try {
            const { data: prod } = await supabase
              .from('products')
              .select('stock_quantity')
              .eq('id', item.product_id)
              .single();
            
            if (prod) {
              await supabase
                .from('products')
                .update({ stock_quantity: (prod.stock_quantity || 0) - item.quantity })
                .eq('id', item.product_id);
            }
          } catch (err) {
            console.error("Erro ao dar baixa no estoque do produto:", item.product_id, err);
          }
        }
      }

      // 3. Gerar Contas a Receber (Automação Financeira)
      const records: AccountsReceivableInsert[] = [];
      
      if (sale.payment_method === 'fiado' || installments_data) {
        if (installments_data && installments_data.length > 0) {
          // Parcelamento manual
          installments_data.forEach((inst, idx) => {
            records.push({
              customer_id: sale.customer_id,
              sale_id: saleData.id,
              amount: inst.amount,
              due_date: inst.due_date,
              description: `Parcela ${idx + 1}/${installments_data.length} - Venda #${saleData.id.substring(0, 8)}`,
              status: 'pending',
              notes: inst.notes || sale.notes
            });
          });
        } else if (sale.payment_method === 'fiado') {
          // Fiado simples (vencimento em 30 dias se não especificado)
          records.push({
            customer_id: sale.customer_id,
            sale_id: saleData.id,
            amount: sale.final_amount,
            due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            description: `Fiado - Venda #${saleData.id.substring(0, 8)}`,
            status: 'pending',
            notes: sale.notes
          });
        }
      } else if (sale.status === 'completed') {
        // Vendas à vista já finalizadas (Dinheiro, Pix, Cartão) - registrar como recebido
        records.push({
          customer_id: sale.customer_id,
          sale_id: saleData.id,
          amount: sale.final_amount,
          due_date: new Date().toISOString().split('T')[0],
          payment_date: new Date().toISOString().split('T')[0],
          description: `Venda à Vista (${sale.payment_method}) - #${saleData.id.substring(0, 8)}`,
          status: 'paid',
          notes: sale.notes
        });
      }

      if (records.length > 0) {
        const { error: receivError } = await supabase
          .from('accounts_receivable')
          .insert(records)
        if (receivError) throw receivError
      }

      return saleData
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getListSalesQueryKey() })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      queryClient.invalidateQueries({ queryKey: ['products'] })
      queryClient.invalidateQueries({ queryKey: ['accounts-receivable'] })
    }
  })
}

// Accounts Payable
export const getListAccountsPayableQueryKey = () => ['accounts-payable']

export const useListAccountsPayable = () => {
  return useQuery({
    queryKey: getListAccountsPayableQueryKey(),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('accounts_payable')
        .select(`
          *,
          supplier:suppliers(name, phone)
        `)
        .order('due_date', { ascending: true })
      if (error) throw error
      return data || []
    }
  })
}

export const useCreateAccountsPayable = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (account: AccountsPayableInsert) => {
      const { data, error } = await supabase
        .from('accounts_payable')
        .insert(account)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getListAccountsPayableQueryKey() })
    }
  })
}

export const useUpdateAccountsPayable = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ id, ...account }: AccountsPayableUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from('accounts_payable')
        .update(account)
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getListAccountsPayableQueryKey() })
    }
  })
}

export const useDeleteAccountsPayable = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      const { error } = await supabase
        .from('accounts_payable')
        .delete()
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getListAccountsPayableQueryKey() })
    }
  })
}

export const usePayAccountsPayable = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      const { data, error } = await supabase
        .from('accounts_payable')
        .update({ status: 'paid', payment_date: new Date().toISOString().split('T')[0] })
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getListAccountsPayableQueryKey() })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    }
  })
}

// Accounts Receivable
export const getListAccountsReceivableQueryKey = () => ['accounts-receivable']

export const useListAccountsReceivable = () => {
  return useQuery({
    queryKey: getListAccountsReceivableQueryKey(),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('accounts_receivable')
        .select(`
          *,
          customer:customers(name, phone)
        `)
        .order('due_date', { ascending: true })
      if (error) throw error
      return data || []
    }
  })
}

export const useCreateAccountsReceivable = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (account: AccountsReceivableInsert) => {
      const { data, error } = await supabase
        .from('accounts_receivable')
        .insert(account)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getListAccountsReceivableQueryKey() })
    }
  })
}

export const usePayInstallment = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      const { data, error } = await supabase
        .from('accounts_receivable')
        .update({ status: 'paid', payment_date: new Date().toISOString().split('T')[0] })
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getListAccountsReceivableQueryKey() })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    }
  })
}

export const useAddPayment = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ id, amount }: { id: string, amount: number }) => {
      // Aqui teríamos uma lógica mais complexa se fosse abater dívida parcial
      // Por enquanto vamos apenas marcar como pago
      const { data, error } = await supabase
        .from('accounts_receivable')
        .update({ status: 'paid', payment_date: new Date().toISOString().split('T')[0] })
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getListAccountsReceivableQueryKey() })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    }
  })
}

// Cash Flow Entries
export const getListCashFlowEntriesQueryKey = () => ['cash-flow-entries']

export const useListCashFlowEntries = () => {
  return useQuery({
    queryKey: getListCashFlowEntriesQueryKey(),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cash_flow_entries')
        .select('*')
        .order('date', { ascending: false })
      if (error) throw error
      return data || []
    }
  })
}

export const useCreateCashFlowEntry = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (entry: CashFlowEntryInsert) => {
      const { data, error } = await supabase
        .from('cash_flow_entries')
        .insert(entry)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getListCashFlowEntriesQueryKey() })
    }
  })
}

// Profiles (Users)
export const getListProfilesQueryKey = () => ['profiles']

export const useListProfiles = () => {
  return useQuery({
    queryKey: getListProfilesQueryKey(),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('name', { ascending: true })
      if (error) throw error
      return data || []
    }
  })
}

import { createClient } from '@supabase/supabase-js'

export const useCreateProfile = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ password, ...profile }: any) => {
      let user_id = null;
      
      // Se fornecer senha, tenta criar no Auth primeiro
      if (password) {
        // Criamos um cliente temporário que NÃO persiste sessão no localStorage
        // para não deslogar o administrador atual ao cadastrar um novo funcionário
        const tempClient = createClient(
          import.meta.env.VITE_SUPABASE_URL!,
          import.meta.env.VITE_SUPABASE_ANON_KEY!,
          { auth: { persistSession: false } }
        );
        
        const { data: authData, error: authError } = await tempClient.auth.signUp({
          email: profile.email,
          password: password,
          options: {
            data: { name: profile.name }
          }
        });

        if (authError) throw authError;
        user_id = authData.user?.id;
      }

      const { data, error } = await supabase
        .from('profiles')
        .insert({ ...profile, user_id })
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getListProfilesQueryKey() })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    }
  })
}

export const useUpdateProfile = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ id, ...profile }: Database['public']['Tables']['profiles']['Update'] & { id: string }) => {
      const { data, error } = await supabase
        .from('profiles')
        .update(profile)
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getListProfilesQueryKey() })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    }
  })
}
