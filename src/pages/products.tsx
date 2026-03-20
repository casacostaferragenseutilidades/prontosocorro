import React, { useState } from "react";
import { Layout } from "@/components/layout";
import { Card, Button, Input, Badge } from "@/components/ui-elements";
import { formatCurrency, cn } from "@/lib/utils";
import { Search, Plus, Edit2, Trash2, PackageSearch, X, AlertTriangle, RefreshCw } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { 
  useListProducts, 
  useUpdateProduct, 
  getListProductsQueryKey, 
  useListSuppliers,
  useCreateAccountsPayable,
  getListAccountsPayableQueryKey,
  useCreateProduct
} from "@/lib/api";

function ProductModal({ isOpen, onClose, product, onSuccess }: { isOpen: boolean, onClose: () => void, product?: any, onSuccess: () => void }) {
  const isEditing = !!product;
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();

  const [formData, setFormData] = useState({
    name: product?.name || "",
    description: product?.description || "",
    price: product?.price?.toString() || "",
    cost: product?.cost?.toString() || "",
    category: product?.category || "",
    stock_quantity: product?.stock_quantity?.toString() || "",
    unit: product?.unit || "un",
    barcode: product?.barcode || "",
    status: (product?.status as "active" | "inactive") || "active"
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.price || !formData.stock_quantity) {
      toast({ title: "Preencha os campos obrigatórios (*)", variant: "destructive" });
      return;
    }

    const data = {
      name: formData.name,
      description: formData.description || null,
      price: parseFloat(formData.price),
      cost: parseFloat(formData.cost) || 0,
      category: formData.category || null,
      stock_quantity: parseInt(formData.stock_quantity),
      unit: formData.unit,
      barcode: formData.barcode || null,
      status: formData.status
    };

    try {
      if (isEditing) {
        await updateMutation.mutateAsync({ id: product.id, ...data });
        toast({ title: "Produto atualizado!" });
      } else {
        await createMutation.mutateAsync(data);
        toast({ title: "Produto criado!" });
      }
      queryClient.invalidateQueries({ queryKey: getListProductsQueryKey() });
      onSuccess();
      onClose();
    } catch (error: any) {
      toast({ title: "Erro ao salvar", description: error.message, variant: "destructive" });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <Card className="w-full max-w-2xl bg-white shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-border flex justify-between items-center bg-slate-50">
          <h2 className="text-xl font-bold">{isEditing ? "Editar Produto" : "Novo Produto"}</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Nome do Produto *" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} autoFocus />
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">Categoria</label>
              <input 
                list="enxoval-categories"
                className="h-11 rounded-xl border-2 border-border bg-background px-3 text-sm focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                value={formData.category} 
                onChange={e => setFormData({...formData, category: e.target.value})}
                placeholder="Digite ou selecione..."
              />
              <datalist id="enxoval-categories">
                <option value="Almofadas" />
                <option value="Banho" />
                <option value="Bebê" />
                <option value="Cama" />
                <option value="Cortinas" />
                <option value="Cozinha" />
                <option value="Decoração" />
                <option value="Mesa" />
                <option value="Tapetes" />
                <option value="Utensílios" />
              </datalist>
            </div>
            <Input label="Preço de Venda *" type="number" step="0.01" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
            <Input label="Custo Unitário" type="number" step="0.01" value={formData.cost} onChange={e => setFormData({...formData, cost: e.target.value})} />
            <Input label="Estoque Atual *" type="number" value={formData.stock_quantity} onChange={e => setFormData({...formData, stock_quantity: e.target.value})} />
            <Input label="Código de Barras" value={formData.barcode} onChange={e => setFormData({...formData, barcode: e.target.value})} />
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">Unidade</label>
              <select className="h-11 rounded-xl border-2 border-border bg-background px-3" value={formData.unit} onChange={e => setFormData({...formData, unit: e.target.value})}>
                <option value="un">Unidade (un)</option>
                <option value="kg">Quilo (kg)</option>
                <option value="mt">Metro (mt)</option>
                <option value="pt">Pacote (pt)</option>
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">Status</label>
              <select className="h-11 rounded-xl border-2 border-border bg-background px-3" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as any})}>
                <option value="active">Ativo</option>
                <option value="inactive">Inativo</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button variant="outline" type="button" onClick={onClose}>Cancelar</Button>
            <Button type="submit" isLoading={createMutation.isPending || updateMutation.isPending}>Salvar Produto</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

export default function Products() {
  const [search, setSearch] = useState("");
  const [stockModalOpen, setStockModalOpen] = useState(false);
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [showInactive, setShowInactive] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [stockForm, setStockForm] = useState({ quantity: 1, cost: 0, supplierId: "" });
  
  const { data: products, isLoading, refetch } = useListProducts();
  const { data: suppliers } = useListSuppliers();
  const updateMutation = useUpdateProduct();
  const createPayableMutation = useCreateAccountsPayable();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const filtered = (products || []).filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || 
                         p.barcode?.toLowerCase().includes(search.toLowerCase()) ||
                         p.category?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = showInactive ? p.status === 'inactive' : p.status === 'active';
    return matchesSearch && matchesStatus;
  });

  const handleStockEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;
    try {
      await updateMutation.mutateAsync({
        id: selectedProduct.id,
        stock_quantity: (selectedProduct.stock_quantity || 0) + stockForm.quantity,
        cost: stockForm.cost > 0 ? stockForm.cost : selectedProduct.cost
      } as any);

      await createPayableMutation.mutateAsync({
        supplier_id: stockForm.supplierId || null,
        description: `Entrada: ${selectedProduct.name} (${stockForm.quantity} ${selectedProduct.unit})`,
        amount: stockForm.cost * stockForm.quantity,
        due_date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        status: "pending",
        category: "Estoque"
      } as any);

      toast({ title: "Estoque atualizado e conta gerada!" });
      setStockModalOpen(false);
      refetch();
    } catch (e) {
      toast({ title: "Erro ao processar", variant: "destructive" });
    }
  };

  const handleToggleStatus = async (product: any) => {
    const isInactive = product.status === 'inactive';
    if (!confirm(isInactive ? "Reativar produto?" : "Inativar produto?")) return;
    try {
      await updateMutation.mutateAsync({ id: product.id, status: isInactive ? 'active' : 'inactive' });
      toast({ title: isInactive ? "Produto reativado!" : "Produto inativado!" });
      refetch();
    } catch (e: any) {
      toast({ title: "Erro", description: e.message, variant: "destructive" });
    }
  };

  return (
    <Layout>
      <div className="space-y-8">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-violet-600 via-purple-700 to-fuchsia-800 p-8 text-white shadow-2xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div>
              <h1 className="text-4xl font-bold mb-2">Produtos</h1>
              <p className="text-violet-100 text-lg">Catálogo e Controle de Estoque</p>
            </div>
            <Button onClick={() => { setSelectedProduct(null); setFormModalOpen(true); }} size="lg" className="bg-white text-violet-700 hover:bg-violet-50">
              <Plus className="w-6 h-6 mr-2" /> Novo Produto
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 bg-white border-violet-100 shadow-lg">
            <p className="text-sm font-medium text-muted-foreground uppercase">Total Ativos</p>
            <p className="text-3xl font-bold">{(products || []).filter(p => p.status === 'active').length}</p>
          </Card>
          <Card className="p-6 bg-white border-amber-100 shadow-lg">
            <p className="text-sm font-medium text-muted-foreground uppercase text-amber-600">Baixo Estoque</p>
            <p className="text-3xl font-bold text-amber-600">{(products || []).filter(p => p.status === 'active' && p.stock_quantity <= p.min_stock_alert).length}</p>
          </Card>
          <Card className="p-6 bg-white border-emerald-100 shadow-lg">
            <p className="text-sm font-medium text-muted-foreground uppercase text-emerald-600">Valor Estoque (Ativos)</p>
            <p className="text-3xl font-bold text-emerald-600">
              {formatCurrency((products || []).filter(p => p.status === 'active').reduce((acc, p) => acc + (Number(p.price) * Number(p.stock_quantity)), 0))}
            </p>
          </Card>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-6 items-end">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <input className="w-full h-12 rounded-xl border-2 border-border bg-background px-11 text-sm focus:outline-none focus:border-primary" placeholder="Buscar..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="flex gap-2 p-1 bg-secondary/30 rounded-2xl border border-border/50">
            <button onClick={() => setShowInactive(false)} className={cn("px-4 py-2 rounded-xl text-sm font-bold transition-all", !showInactive ? "bg-white text-primary shadow-sm" : "text-muted-foreground")}>Ativos</button>
            <button onClick={() => setShowInactive(true)} className={cn("px-4 py-2 rounded-xl text-sm font-bold transition-all", showInactive ? "bg-white text-destructive shadow-sm" : "text-muted-foreground")}>Inativos</button>
          </div>
        </div>

        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-secondary/10">
                  <th className="p-4 font-bold text-xs text-muted-foreground uppercase">Produto</th>
                  <th className="p-4 font-bold text-xs text-muted-foreground uppercase">Categoria</th>
                  <th className="p-4 font-bold text-xs text-muted-foreground uppercase text-right">Preço</th>
                  <th className="p-4 font-bold text-xs text-muted-foreground uppercase">Estoque</th>
                  <th className="p-4 font-bold text-xs text-muted-foreground uppercase text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td colSpan={5} className="p-8 text-center">Carregando...</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={5} className="p-16 text-center text-muted-foreground">Nenhum produto encontrado.</td></tr>
                ) : (
                  filtered.map(p => (
                    <tr key={p.id} className="hover:bg-secondary/20 transition-colors border-b border-border/50">
                      <td className="p-4 font-medium">{p.name} <span className="block text-xs text-muted-foreground">{p.barcode}</span></td>
                      <td className="p-4 text-sm">{p.category}</td>
                      <td className="p-4 text-right font-bold">{formatCurrency(p.price)}</td>
                      <td className="p-4 font-medium">
                        <span className={cn("px-2 py-1 rounded-lg text-xs", p.stock_quantity <= p.min_stock_alert ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700")}>
                          {p.stock_quantity} {p.unit}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="outline" size="sm" onClick={() => { setSelectedProduct(p); setStockForm({ quantity: 1, cost: Number(p.cost) || 0, supplierId: "" }); setStockModalOpen(true); }}><Plus className="w-4 h-4 mr-1"/></Button>
                          <Button variant="ghost" size="icon" onClick={() => { setSelectedProduct(p); setFormModalOpen(true); }}><Edit2 className="w-4 h-4"/></Button>
                          <Button variant="ghost" size="icon" className={p.status === 'active' ? "text-destructive" : "text-emerald-600"} onClick={() => handleToggleStatus(p)}>
                            {p.status === 'active' ? <Trash2 className="w-4 h-4" /> : <RefreshCw className="w-4 h-4" />}
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

      {stockModalOpen && selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <Card className="w-full max-w-md p-6 animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold mb-4">🛒 Entrada de Estoque</h3>
            <form onSubmit={handleStockEntry} className="space-y-4">
              <Input label={`Quantidade (${selectedProduct.unit})`} type="number" required value={stockForm.quantity} onChange={e => setStockForm({...stockForm, quantity: Number(e.target.value)})} />
              <Input label="Custo Unitário" type="number" step="0.01" required value={stockForm.cost} onChange={e => setStockForm({...stockForm, cost: Number(e.target.value)})} />
              <select className="w-full h-11 px-3 rounded-xl border-2 border-border" value={stockForm.supplierId} onChange={e => setStockForm({...stockForm, supplierId: e.target.value})}>
                <option value="">Selecione o Fornecedor...</option>
                {suppliers?.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="ghost" onClick={() => setStockModalOpen(false)}>Cancelar</Button>
                <Button type="submit">Confirmar</Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {formModalOpen && (
        <ProductModal isOpen={formModalOpen} onClose={() => { setFormModalOpen(false); setSelectedProduct(null); }} product={selectedProduct} onSuccess={() => refetch()} />
      )}
    </Layout>
  );
}
