// Mock API para substituir @workspace/api-client-react

export const mockCustomers = [
  { id: 1, name: "João Silva", phone: "(11) 99999-9999", address: "Rua das Flores, 123" },
  { id: 2, name: "Maria Santos", phone: "(11) 88888-8888", address: "Avenida Principal, 456" },
];

export const mockSales = [
  { id: 1, customerId: 1, total: 150.00, status: "pending", date: "2024-01-15", createdAt: "2024-01-15T10:00:00Z", customerName: "João Silva", paymentType: "fiado", numInstallments: 3 },
  { id: 2, customerId: 2, total: 200.00, status: "paid", date: "2024-01-16", createdAt: "2024-01-16T14:30:00Z", customerName: "Maria Santos", paymentType: "cash", numInstallments: 1 },
];

export const mockSuppliers = [
  { id: 1, name: "Fornecedor ABC", phone: "(11) 77777-7777" },
  { id: 2, name: "Distribuidora XYZ", phone: "(11) 66666-6666" },
];

export const mockProducts = [
  { id: 1, name: "Café Premium", price: 15.00, stock: 50 },
  { id: 2, name: "Pão Francês", price: 0.50, stock: 100 },
];

// Mock hooks
export const useGetCustomer = (id: number) => ({
  data: mockCustomers.find(c => c.id === id),
  isLoading: false,
  error: null
});

export const useListCustomers = () => ({
  data: mockCustomers,
  isLoading: false,
  error: null
});

export const useListSuppliers = () => ({
  data: mockSuppliers,
  isLoading: false,
  error: null
});

export const useListSales = () => ({
  data: mockSales,
  isLoading: false,
  error: null
});

export const useListProducts = () => ({
  data: mockProducts,
  isLoading: false,
  error: null
});

export const useAddPayment = () => ({
  mutate: async (data: any) => {
    console.log('Mock add payment:', data);
    return { success: true };
  }
});

export const usePayInstallment = () => ({
  mutate: async (data: any) => {
    console.log('Mock pay installment:', data);
    return { success: true };
  }
});

export const useCreateSale = () => ({
  mutate: async (data: any) => {
    console.log('Mock create sale:', data);
    return { success: true };
  }
});

export const useCreateCustomer = () => ({
  mutate: async (data: any) => {
    console.log('Mock create customer:', data);
    return { success: true };
  }
});

export const useDeleteCustomer = () => ({
  mutate: async (id: number) => {
    console.log('Mock delete customer:', id);
    return { success: true };
  }
});

export const useCreateSupplier = () => ({
  mutate: async (data: any) => {
    console.log('Mock create supplier:', data);
    return { success: true };
  }
});

export const useDeleteSupplier = () => ({
  mutate: async (id: number) => {
    console.log('Mock delete supplier:', id);
    return { success: true };
  }
});

export const useCreateProduct = () => ({
  mutate: async (data: any) => {
    console.log('Mock create product:', data);
    return { success: true };
  }
});

export const useUpdateProduct = () => ({
  mutate: async (data: any) => {
    console.log('Mock update product:', data);
    return { success: true };
  }
});

export const useGetProduct = (id: number) => ({
  data: mockProducts.find(p => p.id === id),
  isLoading: false,
  error: null
});

export const useDeleteProduct = () => ({
  mutate: async (id: number) => {
    console.log('Mock delete product:', id);
    return { success: true };
  }
});

export const useGetDashboard = () => ({
  data: {
    totalSalesToday: 150.00,
    totalSalesMonth: 350.00,
    totalDebtOutstanding: 150.00,
    customersWithDebt: 1,
    lowStockCount: 0,
    topProducts: [
      { productName: "Café Premium", totalSold: 15 },
      { productName: "Pão Francês", totalSold: 50 }
    ],
    recentSales: [
      { id: 1, customerName: "João Silva", total: 150.00, status: "pending", createdAt: "2024-01-15T10:00:00Z" },
      { id: 2, customerName: "Maria Santos", total: 200.00, status: "paid", createdAt: "2024-01-16T14:30:00Z" }
    ]
  },
  isLoading: false,
  error: null
});

// Mock query keys
export const getGetCustomerQueryKey = (id: number) => ['customer', id];
export const getListSalesQueryKey = () => ['sales'];
export const getListCustomersQueryKey = () => ['customers'];
export const getListSuppliersQueryKey = () => ['suppliers'];
export const getListProductsQueryKey = () => ['products'];
export const getGetDashboardQueryKey = () => ['dashboard'];
