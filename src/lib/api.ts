// API principal - exporta funções da Supabase API
import * as supabaseApi from './supabase-api'
export * from './supabase-api'

// Funções adicionais necessárias
import { useQueryClient, useQuery, useMutation } from '@tanstack/react-query'
import { supabase } from './supabase'

export const useGetCustomer = (id: string) => {
  const { data: customers } = supabaseApi.useListCustomers()
  return {
    data: customers?.find((c: any) => c.id === id),
    isLoading: false,
    error: null
  }
}

export const getGetCustomerQueryKey = (id: string) => ['customer', id]

export const useGetProduct = (id: number, options?: any) => {
  return useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single()
      if (error) throw error
      return data
    },
    enabled: options?.query?.enabled !== false
  })
}

// O useAddPayment e usePayInstallment já existem no supabase-api com as lógicas corretas para o banco de dados.
// O arquivo api.ts agora apenas re-exporta eles através do 'export * from "./supabase-api"'

export const getGetDashboardQueryKey = () => ['dashboard']
export const getListSalesQueryKey = () => ['sales']

// Re-exportar tipos para compatibilidade
export type {
  Customer,
  CustomerInsert,
  CustomerUpdate,
  Supplier,
  SupplierInsert,
  SupplierUpdate,
  Product,
  ProductInsert,
  ProductUpdate,
  Sale,
  SaleInsert,
  SaleUpdate,
  SaleItem,
  SaleItemInsert,
  AccountsPayable,
  AccountsPayableInsert,
  AccountsPayableUpdate,
  AccountsReceivable,
  AccountsReceivableInsert,
  AccountsReceivableUpdate,
  CashFlowEntry,
  CashFlowEntryInsert,
  CashFlowEntryUpdate
} from './supabase-api'
