# 📁 Estrutura da API - Venda Varejo

## 🎯 **Objetivo**
Organizar e centralizar todas as funções da API para facilitar manutenção e uso.

## 📂 **Estrutura Final**

```
src/lib/
├── index.ts              # Export principal (barrel export)
├── api.ts                 # API completa com todas as funções
├── supabase.ts            # Cliente Supabase e tipos
├── supabase-api.ts        # Hooks React Query para Supabase
├── mock-api-backup.ts     # Backup da API Mock (referência)
└── utils.ts               # Utilitários compartilhados
```

## 🔧 **Arquivos e Responsabilidades**

### **1. `index.ts` - Export Principal**
```typescript
// Exportar tudo da API principal
export * from './api'

// Exportar utilitários
export * from './utils'

// Exportar cliente Supabase (se necessário)
export * from './supabase'
```

### **2. `api.ts` - API Completa**
- ✅ **Exporta tudo** de `supabase-api`
- ✅ **Funções adicionais** necessárias
- ✅ **Tipos re-exportados** para compatibilidade
- ✅ **Imports centralizados** de hooks

### **3. `supabase.ts` - Cliente Supabase**
- ✅ **Configuração do cliente**
- ✅ **Tipos TypeScript** completos
- ✅ **Funções de autenticação**
- ✅ **Validação de variáveis de ambiente**

### **4. `supabase-api.ts` - Hooks React Query**
- ✅ **CRUD completo** para todas as tabelas
- ✅ **React Query hooks** otimizados
- ✅ **Cache e invalidação** automática
- ✅ **Tipos TypeScript** fortes

### **5. `mock-api-backup.ts` - Backup**
- 📦 **Guardado para referência**
- 🔄 **Fallback** se necessário
- 📚 **Documentação** de estrutura antiga

## 🚀 **Como Usar**

### **Import Simples**
```typescript
// Em qualquer componente
import { 
  useListCustomers, 
  useCreateCustomer,
  Customer,
  formatCurrency 
} from '@/lib'
```

### **Import Específico**
```typescript
// Se precisar de algo específico
import { supabase } from '@/lib/supabase'
import { useListCustomers } from '@/lib/api'
```

## 📋 **Funções Disponíveis**

### **Clientes (Customers)**
- ✅ `useListCustomers()` - Listar clientes
- ✅ `useCreateCustomer()` - Criar cliente
- ✅ `useUpdateCustomer()` - Atualizar cliente
- ✅ `useDeleteCustomer()` - Excluir cliente
- ✅ `getListCustomersQueryKey()` - Chave de cache

### **Fornecedores (Suppliers)**
- ✅ `useListSuppliers()` - Listar fornecedores
- ✅ `useCreateSupplier()` - Criar fornecedor
- ✅ `useUpdateSupplier()` - Atualizar fornecedor
- ✅ `useDeleteSupplier()` - Excluir fornecedor
- ✅ `getListSuppliersQueryKey()` - Chave de cache

### **Produtos (Products)**
- ✅ `useListProducts()` - Listar produtos
- ✅ `useCreateProduct()` - Criar produto
- ✅ `useUpdateProduct()` - Atualizar produto
- ✅ `useDeleteProduct()` - Excluir produto
- ✅ `getListProductsQueryKey()` - Chave de cache

### **Vendas (Sales)**
- ✅ `useListSales()` - Listar vendas
- ✅ `useCreateSale()` - Criar venda
- ✅ `getListSalesQueryKey()` - Chave de cache

### **Contas a Pagar (Accounts Payable)**
- ✅ `useListAccountsPayable()` - Listar contas
- ✅ `useCreateAccountsPayable()` - Criar conta
- ✅ `getListAccountsPayableQueryKey()` - Chave de cache

### **Contas a Receber (Accounts Receivable)**
- ✅ `useListAccountsReceivable()` - Listar contas
- ✅ `useCreateAccountsReceivable()` - Criar conta
- ✅ `usePayInstallment()` - Pagar parcela
- ✅ `getListAccountsReceivableQueryKey()` - Chave de cache

### **Fluxo de Caixa (Cash Flow)**
- ✅ `useListCashFlowEntries()` - Listar movimentações
- ✅ `useCreateCashFlowEntry()` - Criar movimentação
- ✅ `getListCashFlowEntriesQueryKey()` - Chave de cache

### **Dashboard**
- ✅ `useGetDashboard()` - Estatísticas do dashboard
- ✅ `getGetDashboardQueryKey()` - Chave de cache

### **Funções Adicionais**
- ✅ `useGetCustomer(id)` - Buscar cliente específico
- ✅ `useAddPayment()` - Adicionar pagamento
- ✅ `getGetCustomerQueryKey(id)` - Chave de cliente

## 🎨 **Tipos TypeScript**

### **Tipos Principais**
```typescript
export type Customer = Database['public']['Tables']['customers']['Row']
export type CustomerInsert = Database['public']['Tables']['customers']['Insert']
export type CustomerUpdate = Database['public']['Tables']['customers']['Update']
```

### **Tipos Disponíveis**
- ✅ `Customer`, `CustomerInsert`, `CustomerUpdate`
- ✅ `Supplier`, `SupplierInsert`, `SupplierUpdate`
- ✅ `Product`, `ProductInsert`, `ProductUpdate`
- ✅ `Sale`, `SaleInsert`, `SaleUpdate`
- ✅ `SaleItem`, `SaleItemInsert`
- ✅ `AccountsPayable`, `AccountsPayableInsert`, `AccountsPayableUpdate`
- ✅ `AccountsReceivable`, `AccountsReceivableInsert`, `AccountsReceivableUpdate`
- ✅ `CashFlowEntry`, `CashFlowEntryInsert`, `CashFlowEntryUpdate`

## 🔄 **Migração Concluída**

### **✅ Status da Migração**
- ✅ **Imports atualizados** em todas as páginas
- ✅ **Funções centralizadas** em `api.ts`
- ✅ **Tipos consistentes** em toda aplicação
- ✅ **Cache React Query** otimizado
- ✅ **Backup seguro** do mock-api original

### **📁 Arquivos Modificados**
- ✅ `src/pages/dashboard.tsx`
- ✅ `src/pages/customers.tsx`
- ✅ `src/pages/products.tsx`
- ✅ `src/pages/sales.tsx`
- ✅ `src/pages/payables.tsx`
- ✅ `src/pages/receivables.tsx`
- ✅ `src/pages/customer-detail.tsx`
- ✅ `src/pages/suppliers.tsx`

### **🎯 Benefícios**
- 🚀 **Performance**: Cache otimizado
- 🔒 **TypeScript**: Tipos fortes
- 🧹 **Organização**: Código centralizado
- 🔄 **Manutenibilidade**: Fácil de atualizar
- 📦 **Imports**: Simples e consistentes

---

**API totalmente migrada para Supabase!** 🎉✨
