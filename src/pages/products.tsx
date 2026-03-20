import React, { useState } from "react";
import { Layout } from "@/components/layout";
import { Card, Button, Input, Badge } from "@/components/ui-elements";
import { formatCurrency, cn } from "@/lib/utils";
import { Search, Plus, Edit2, Trash2, PackageSearch, X } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { 
  useListProducts, 
  useUpdateProduct, 
  useDeleteProduct, 
  getListProductsQueryKey, 
  useListSuppliers,
  useCreateAccountsPayable,
  getListAccountsPayableQueryKey 
} from "@/lib/api";
import { supabase } from "@/lib/supabase";

export default function Products() {
  const [search, setSearch] = useState("");
  const [stockModalOpen, setStockModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [stockForm, setStockForm] = useState({ quantity: 1, cost: 0, supplierId: "" });
  const { data: products, isLoading } = useListProducts();
  const { data: suppliers } = useListSuppliers();
  const updateProductMutation = useUpdateProduct();
  const createPayableMutation = useCreateAccountsPayable();
  const deleteMutation = useDeleteProduct();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const filtered = products?.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.sku?.toLowerCase().includes(search.toLowerCase()) ||
    p.category?.toLowerCase().includes(search.toLowerCase())
  ) || [];

  const handleStockEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;
    
    try {
      // 1. Atualizar estoque do produto
      await updateProductMutation.mutateAsync({
        id: selectedProduct.id,
        stock_quantity: (selectedProduct.stock_quantity || 0) + stockForm.quantity,
        cost: stockForm.cost > 0 ? stockForm.cost : selectedProduct.cost
      } as any);

      // 2. Gerar conta a pagar
      await createPayableMutation.mutateAsync({
        supplier_id: stockForm.supplierId || null,
        description: `Compra de estoque: ${selectedProduct.name} (${stockForm.quantity} un)`,
        amount: stockForm.cost * stockForm.quantity,
        due_date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        status: "pending",
        category: "Estoque",
        notes: `Entrada manual via módulo de Produtos`
      } as any);

      queryClient.invalidateQueries({ queryKey: getListProductsQueryKey() });
      queryClient.invalidateQueries({ queryKey: getListAccountsPayableQueryKey() });
      
      toast({ title: "Estoque atualizado e conta a pagar gerada!" });
      setStockModalOpen(false);
      setSelectedProduct(null);
    } catch (e) {
      toast({ title: "Erro ao processar entrada", variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este produto?")) return;
    try {
      await deleteMutation.mutateAsync({ id });
      queryClient.invalidateQueries({ queryKey: getListProductsQueryKey() });
      toast({ title: "Produto excluído com sucesso." });
    } catch (e) {
      toast({ title: "Erro ao excluir produto", variant: "destructive" });
    }
  };

  return (
    <Layout>
      <div className="space-y-8">
        {/* Premium Header with Gradient */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-violet-600 via-purple-700 to-fuchsia-800 p-8 text-white shadow-2xl">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-24 h-24 bg-white/5 rounded-full blur-2xl"></div>
          
          <div className="relative z-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <h1 className="text-4xl font-bold mb-2">Produtos</h1>
                <p className="text-violet-100 text-lg">Gerencie seu catálogo de produtos, estoques e precificação</p>
              </div>
              <Button 
                onClick={() => setLocation("/produtos/novo")} 
                size="lg" 
                className="bg-white text-violet-700 hover:bg-violet-50 border-none shadow-xl transform transition hover:scale-105"
              >
                <Plus className="w-6 h-6 mr-2" />
                Novo Produto
              </Button>
            </div>
          </div>
        </div>

        {/* Inventory Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 bg-white border-violet-100 shadow-lg relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:scale-125 transition-transform">
              <PackageSearch className="w-12 h-12 text-violet-600" />
            </div>
            <p className="text-sm font-medium text-muted-foreground mb-1 uppercase tracking-wider">Total de Itens</p>
            <p className="text-3xl font-bold text-foreground">{products?.length || 0}</p>
            <div className="mt-2 text-xs font-semibold text-violet-600 bg-violet-50 px-2 py-1 rounded-full inline-block">
              {products?.filter(p => p.status === 'active').length} produtos ativos
            </div>
          </Card>
          
          <Card className="p-6 bg-white border-amber-100 shadow-lg relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:scale-125 transition-transform">
              <Trash2 className="w-12 h-12 text-amber-600" />
            </div>
            <p className="text-sm font-medium text-muted-foreground mb-1 uppercase tracking-wider">Baixo Estoque</p>
            <p className="text-3xl font-bold text-amber-600">{products?.filter(p => p.stock <= 5).length || 0}</p>
            <div className="mt-2 text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-1 rounded-full inline-block">
              Abaixo de 5 unidades
            </div>
          </Card>

          <Card className="p-6 bg-white border-emerald-100 shadow-lg relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:scale-125 transition-transform">
              <Edit2 className="w-12 h-12 text-emerald-600" />
            </div>
            <p className="text-sm font-medium text-muted-foreground mb-1 uppercase tracking-wider">Valor de Inventário</p>
            <p className="text-3xl font-bold text-emerald-600">
              {formatCurrency(products?.reduce((acc, p) => acc + (p.price * p.stock), 0) || 0)}
            </p>
            <div className="mt-2 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full inline-block">
              Estimativa PV
            </div>
          </Card>
        </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
          <input
            className="w-full h-12 rounded-xl border-2 border-border bg-background px-11 text-sm focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all shadow-sm"
            placeholder="Buscar por nome, código ou categoria..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      <Card className="overflow-hidden shadow-xl border-border/50">
        <div className="px-6 py-5 border-b border-border bg-slate-50/50 flex items-center justify-between">
          <h2 className="text-xl font-bold">Lista de Produtos</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b border-border bg-secondary/10">
                <th className="p-4 font-bold text-xs text-muted-foreground uppercase tracking-wider">Produto</th>
                <th className="p-4 font-bold text-xs text-muted-foreground uppercase tracking-wider">Categoria</th>
                <th className="p-4 font-bold text-xs text-muted-foreground uppercase tracking-wider">Preço</th>
                <th className="p-4 font-bold text-xs text-muted-foreground uppercase tracking-wider">Estoque</th>
                <th className="p-4 font-bold text-xs text-muted-foreground uppercase tracking-wider">Status</th>
                <th className="p-4 font-bold text-xs text-muted-foreground uppercase tracking-wider text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
            {isLoading ? (
              <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">Carregando...</td></tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-16 text-center">
                  <PackageSearch className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium text-foreground">Nenhum produto encontrado</p>
                  <p className="text-muted-foreground mt-1">Ajuste sua busca ou cadastre novos itens.</p>
                </td>
              </tr>
            ) : (
              filtered.map((product) => (
                <tr key={product.id} className="hover:bg-secondary/20 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                        <PackageSearch className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{product.name}</p>
                        <p className="text-xs text-muted-foreground">SKU: {product.barcode || '-'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-sm">{product.category || '-'}</td>
                  <td className="p-4 font-medium">{formatCurrency(product.price)}</td>
                  <td className="p-4">
                    <span className={cn("font-medium px-2 py-1 rounded-lg text-xs", (product.stock_quantity || 0) <= (product.min_stock_alert || 5) ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700")}>
                      {product.stock_quantity || 0} {product.unit}
                    </span>
                  </td>
                  <td className="p-4">
                    <Badge variant={product.status === 'active' ? 'success' : 'default'}>
                      {product.status === 'active' ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-violet-600 border-violet-200 hover:bg-violet-50"
                        onClick={() => {
                          setSelectedProduct(product);
                          setStockForm({ quantity: 1, cost: Number(product.cost) || 0, supplierId: "" });
                          setStockModalOpen(true);
                        }}
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Compra
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => setLocation(`/produtos/${product.id}/editar`)}>
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleDelete(product.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </Card>
  </div>
      {/* Modal Entrada de Estoque */}
      {stockModalOpen && selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all animate-in zoom-in-95 duration-200">
            <div className="bg-gradient-to-r from-violet-600 to-purple-700 p-6 text-white">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold">🛒 Entrada de Estoque</h3>
                <button onClick={() => setStockModalOpen(false)} className="hover:bg-white/20 p-1 rounded-full transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <p className="text-violet-100 text-sm mt-1">{selectedProduct.name}</p>
            </div>
            
            <form onSubmit={handleStockEntry} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase">Quantidade ({selectedProduct.unit})</label>
                  <input 
                    type="number" 
                    required 
                    min="1"
                    className="w-full h-11 px-3 rounded-xl border-2 border-slate-100 focus:border-violet-500 focus:outline-none focus:ring-4 focus:ring-violet-500/10 font-bold transition-all text-lg"
                    value={stockForm.quantity}
                    onChange={e => setStockForm({...stockForm, quantity: Number(e.target.value)})}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase">Custo Unitário</label>
                  <input 
                    type="number" 
                    required 
                    step="0.01"
                    className="w-full h-11 px-3 rounded-xl border-2 border-slate-100 focus:border-violet-500 focus:outline-none focus:ring-4 focus:ring-violet-500/10 font-bold transition-all text-lg"
                    value={stockForm.cost}
                    onChange={e => setStockForm({...stockForm, cost: Number(e.target.value)})}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase">Fornecedor (Opcional)</label>
                <select 
                  className="w-full h-11 px-3 rounded-xl border-2 border-slate-100 focus:border-violet-500 focus:outline-none focus:ring-4 focus:ring-violet-500/10 transition-all bg-white"
                  value={stockForm.supplierId}
                  onChange={e => setStockForm({...stockForm, supplierId: e.target.value})}
                >
                  <option value="">Selecione um fornecedor...</option>
                  {suppliers?.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl">
                <div className="flex justify-between items-center text-emerald-900">
                  <span className="font-medium">Total da Compra</span>
                  <span className="text-xl font-extrabold">{formatCurrency(stockForm.cost * stockForm.quantity)}</span>
                </div>
                <p className="text-[10px] text-emerald-600 mt-1 font-medium italic">Uma conta a pagar será gerada automaticamente com vencimento em 15 dias.</p>
              </div>

              <div className="pt-2 flex gap-3">
                <Button type="button" variant="ghost" className="flex-1" onClick={() => setStockModalOpen(false)}>Cancelar</Button>
                <Button type="submit" className="flex-1 bg-violet-600 hover:bg-violet-700 shadow-lg shadow-violet-200">Confirmar Compra</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}
