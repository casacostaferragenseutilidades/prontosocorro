// API principal - exporta funções da Supabase API
import * as supabaseApi from './supabase-api'
export * from './supabase-api'

// Funções adicionais necessárias
import { useQueryClient, useQuery, useMutation } from '@tanstack/react-query'
import { supabase } from './supabase'

export const useGetCustomer = (id: string) => {
  return useQuery({
    queryKey: ['customer', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('customers')
        .select(`
          *,
          sales (
            *,
            items:sale_items (
              *,
              product:products (name)
            )
          ),
          installments:accounts_receivable (*)
        `)
        .eq('id', id)
        .single()
      
      if (error) throw error
      if (!data) return null

      const mappedInstallments = (data.installments || []).map((i: any) => ({
        id: i.id,
        saleId: i.sale_id,
        amount: Number(i.amount),
        dueDate: i.due_date,
        status: i.status,
        paidAt: i.payment_date,
        installmentNumber: i.installment_number,
        totalInstallments: i.total_installments
      }));

      const calculatedDebt = mappedInstallments
        .filter(i => i.status === 'pending' || i.status === 'overdue')
        .reduce((sum, inst) => sum + inst.amount, 0);

      // Mapear dados para o formato esperado pelo frontend
      return {
        ...data,
        totalDebt: calculatedDebt,
        sales: (data.sales || []).map((s: any) => ({
          id: s.id,
          createdAt: s.created_at,
          paymentType: s.payment_method,
          total: Number(s.final_amount),
          status: s.status,
          numInstallments: s.num_installments,
          remainingDebt: s.payment_method === 'fiado' && s.status === 'pending' ? Number(s.final_amount) : 0,
          items: (s.items || []).map((i: any) => ({
            id: i.id,
            quantity: Number(i.quantity),
            productName: i.product?.name || "Produto",
            unitPrice: Number(i.unit_price || 0),
            totalPrice: Number(i.total_price || 0)
          }))
        })),
        installments: mappedInstallments
      }
    },
    enabled: !!id
  })
}

export const getGetCustomerQueryKey = (id: string) => ['customer', id]

export const useGetProduct = (id: string, options?: any) => {
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
