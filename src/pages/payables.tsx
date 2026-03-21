import React, { useState, useCallback, useEffect } from "react";
import { Layout } from "@/components/layout";
import { Card, Button, Badge, Input } from "@/components/ui-elements";
import { formatCurrency, formatDate, cn } from "@/lib/utils";
import { 
  useListAccountsPayable, 
  useCreateAccountsPayable, 
  getListAccountsPayableQueryKey,
  useUpdateAccountsPayable,
  useDeleteAccountsPayable,
  usePayAccountsPayable,
  useListSuppliers
} from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import {
  TrendingDown, Plus, Pencil, Trash2, CheckCircle2, Calendar, RefreshCw, Search, X, Building2
} from "lucide-react";

type Payable = {
  id: string;
  supplierId: string | null;
  supplierName: string | null;
  description: string;
  amount: number;
  dueDate: string;
  category: string;
  status: string;
  isRecurring: boolean;
  paidAt: string | null;
  note: string | null;
  createdAt: string;
};

const CATEGORIES: { value: string; label: string; color: string }[] = [
  { value: "fornecedor",  label: "Fornecedor",  color: "bg-blue-100 text-blue-700" },
  { value: "aluguel",     label: "Aluguel",     color: "bg-purple-100 text-purple-700" },
  { value: "energia",     label: "Energia",     color: "bg-yellow-100 text-yellow-700" },
  { value: "salario",     label: "Salário",     color: "bg-green-100 text-green-700" },
  { value: "imposto",     label: "Imposto",     color: "bg-red-100 text-red-700" },
  { value: "outro",       label: "Outro",       color: "bg-gray-100 text-gray-700" },
];

const STATUS_LABEL: Record<string, string> = { pending: "Pendente", overdue: "Atrasado", paid: "Pago" };
const STATUS_VARIANT: Record<string, "default" | "danger" | "warning" | "success"> = {
  pending: "warning",
  overdue: "danger",
  paid: "success",
};

function getCategoryMeta(value: string) {
  return CATEGORIES.find(c => c.value === value) ?? CATEGORIES[CATEGORIES.length - 1];
}

type FormData = {
  description: string;
  amount: string;
  dueDate: string;
  category: string;
  supplierId: string;
  isRecurring: boolean;
  note: string;
};

const emptyForm: FormData = {
  description: "",
  amount: "",
  dueDate: new Date().toISOString().split("T")[0],
  category: "outro",
  supplierId: "",
  isRecurring: false,
  note: "",
};

// Removed custom usePayables hook

export default function Payables() {
  const { data: rawData, isLoading, refetch } = useListAccountsPayable();
  const data = (rawData || []).map((p: any) => ({
    id: p.id,
    supplierId: p.supplier_id,
    supplierName: p.supplier?.name || null,
    description: p.description,
    amount: Number(p.amount),
    dueDate: p.due_date,
    category: p.category || "outro",
    status: p.status,
    isRecurring: false, // Não tem no schema por enquanto
    paidAt: p.payment_date,
    note: p.notes,
    createdAt: p.created_at
  })) as Payable[];

  const { toast } = useToast();
  const { data: suppliers } = useListSuppliers();
  const createMutation = useCreateAccountsPayable();
  const updateMutation = useUpdateAccountsPayable();
  const deleteMutation = useDeleteAccountsPayable();
  const payMutation = usePayAccountsPayable();

  const [filter, setFilter] = useState<"all" | "pending" | "overdue" | "paid">("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm);

  const apiBase = `${import.meta.env.BASE_URL}api/payables`;

  const filtered = data.filter(p => {
    if (filter !== "all" && p.status !== filter) return false;
    if (categoryFilter !== "all" && p.category !== categoryFilter) return false;
    if (search && !p.description.toLowerCase().includes(search.toLowerCase()) && !(p.supplierName ?? "").toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const totalPending = data.filter(p => p.status !== "paid").reduce((s, p) => s + p.amount, 0);
  const totalOverdue = data.filter(p => p.status === "overdue").reduce((s, p) => s + p.amount, 0);
  const totalPaid = data.filter(p => p.status === "paid").reduce((s, p) => s + p.amount, 0);

  const openCreate = () => { setForm(emptyForm); setEditingId(null); setShowForm(true); };
  const openEdit = (p: Payable) => {
    setForm({
      description: p.description,
      amount: String(p.amount),
      dueDate: p.dueDate,
      category: p.category,
      supplierId: p.supplierId ? String(p.supplierId) : "",
      isRecurring: p.isRecurring,
      note: p.note ?? "",
    });
    setEditingId(String(p.id));
    setShowForm(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.description || !form.amount || !form.dueDate) {
      toast({ title: "Preencha todos os campos obrigatórios", variant: "destructive" });
      return;
    }
    try {
      const payload = {
        description: form.description,
        amount: parseFloat(form.amount.replace(",", ".")),
        due_date: form.dueDate,
        category: form.category,
        supplier_id: form.supplierId || null,
        notes: form.note || null,
      };
      if (editingId) {
        await updateMutation.mutateAsync({ id: editingId, ...payload } as any);
        toast({ title: "Conta atualizada!" });
      } else {
        await createMutation.mutateAsync(payload as any);
        toast({ title: "Conta cadastrada!" });
      }
      setShowForm(false);
    } catch { toast({ title: "Erro ao salvar", variant: "destructive" }); }
  };

  const handlePay = async (id: string) => {
    try {
      await payMutation.mutateAsync({ id });
      toast({ title: "Conta marcada como paga!" });
    } catch { toast({ title: "Erro ao pagar", variant: "destructive" }); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Excluir esta conta?")) return;
    try {
      await deleteMutation.mutateAsync({ id });
      toast({ title: "Conta excluída." });
    } catch { toast({ title: "Erro ao excluir", variant: "destructive" }); }
  };

  return (
    <Layout>
      <div className="space-y-8">
        {/* Premium Header with Gradient */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-rose-600 via-red-700 to-orange-800 p-8 text-white shadow-2xl">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-24 h-24 bg-white/5 rounded-full blur-2xl"></div>
          
          <div className="relative z-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <h1 className="text-4xl font-bold mb-2">Contas a Pagar</h1>
                <p className="text-rose-100 text-lg">Controle suas despesas, fornecedores e obrigações mensais</p>
              </div>
              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => refetch()} 
                  disabled={isLoading}
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-md"
                >
                  <RefreshCw className={cn("w-5 h-5 mr-2", isLoading && "animate-spin")} />
                  Atualizar
                </Button>
                <Button onClick={openCreate} className="bg-white text-rose-700 hover:bg-rose-50 border-none shadow-xl">
                  <Plus className="w-5 h-5 mr-2" />
                  Nova Despesa
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Summary Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="p-6 bg-white border-rose-100 shadow-lg relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:scale-125 transition-transform">
              <TrendingDown className="w-12 h-12 text-rose-600" />
            </div>
            <p className="text-sm font-medium text-muted-foreground mb-1 uppercase tracking-wider">Total a Pagar</p>
            <p className="text-3xl font-bold text-foreground">{formatCurrency(totalPending)}</p>
            <div className="mt-2 text-xs font-semibold text-rose-600 bg-rose-50 px-2 py-1 rounded-full inline-block">
              {data.filter(p => p.status !== "paid").length} contas pendentes
            </div>
          </Card>
          
          <Card className="p-6 bg-white border-orange-100 shadow-lg relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:scale-125 transition-transform">
              <Calendar className="w-12 h-12 text-orange-600" />
            </div>
            <p className="text-sm font-medium text-muted-foreground mb-1 uppercase tracking-wider">Contas Atrasadas</p>
            <p className="text-3xl font-bold text-orange-600">{formatCurrency(totalOverdue)}</p>
            <div className="mt-2 text-xs font-semibold text-orange-600 bg-orange-50 px-2 py-1 rounded-full inline-block">
              Pagar imediatamente
            </div>
          </Card>

          <Card className="p-6 bg-white border-emerald-100 shadow-lg relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:scale-125 transition-transform">
              <CheckCircle2 className="w-12 h-12 text-emerald-600" />
            </div>
            <p className="text-sm font-medium text-muted-foreground mb-1 uppercase tracking-wider">Total Pago</p>
            <p className="text-3xl font-bold text-emerald-600">{formatCurrency(totalPaid)}</p>
            <div className="mt-2 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full inline-block">
              Histórico do mês
            </div>
          </Card>

          <Card className="p-6 bg-white border-blue-100 shadow-lg relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:scale-125 transition-transform">
              <Building2 className="w-12 h-12 text-blue-600" />
            </div>
            <p className="text-sm font-medium text-muted-foreground mb-1 uppercase tracking-wider">Fornecedores</p>
            <p className="text-3xl font-bold text-blue-600">{suppliers?.length || 0}</p>
            <div className="mt-2 text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded-full inline-block">
              Parceiros ativos
            </div>
          </Card>
        </div>

        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <input
              className="w-full h-12 rounded-xl border-2 border-border bg-background px-11 text-sm focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all shadow-sm"
              placeholder="Buscar por descrição ou fornecedor..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-2 items-center p-1 bg-secondary/30 rounded-2xl border border-border/50">
            {(["all", "pending", "overdue", "paid"] as const).map(s => (
              <button key={s} onClick={() => setFilter(s)}
                className={cn("px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap",
                  filter === s ? "bg-white text-primary shadow-sm" : "text-muted-foreground hover:text-foreground")}>
                {s === "all" ? "Todos" : STATUS_LABEL[s]}
              </button>
            ))}
            <div className="w-px h-6 bg-border mx-1 my-auto hidden sm:block" />
            <select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              className="px-3 py-2 rounded-xl text-sm font-bold border-none bg-transparent text-muted-foreground focus:outline-none cursor-pointer"
            >
              <option value="all">Todas categorias</option>
              {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>
        </div>

        <Card className="overflow-hidden shadow-xl border-border/50">
          <div className="px-6 py-5 border-b border-border bg-slate-50/50 flex items-center justify-between">
            <h2 className="text-xl font-bold">Histórico de Contas</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[750px]">
              <thead>
                <tr className="border-b border-border bg-secondary/10">
                  <th className="p-4 font-bold text-xs text-muted-foreground uppercase tracking-wider">Descrição</th>
                  <th className="p-4 font-bold text-xs text-muted-foreground uppercase tracking-wider">Categoria</th>
                  <th className="p-4 font-bold text-xs text-muted-foreground uppercase tracking-wider">Fornecedor</th>
                  <th className="p-4 font-bold text-xs text-muted-foreground uppercase tracking-wider">Vencimento</th>
                  <th className="p-4 font-bold text-xs text-muted-foreground uppercase tracking-wider">Status</th>
                  <th className="p-4 font-bold text-xs text-muted-foreground uppercase tracking-wider text-right">Valor</th>
                  <th className="p-4 font-bold text-xs text-muted-foreground uppercase tracking-wider text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
            {isLoading ? (
              <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">Carregando...</td></tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-16 text-center">
                  <TrendingDown className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-30" />
                  <p className="text-lg font-medium">Nenhuma conta encontrada.</p>
                  <p className="text-muted-foreground text-sm mt-1">Clique em "Nova Conta" para cadastrar.</p>
                </td>
              </tr>
            ) : (
              filtered.map(p => {
                const catMeta = getCategoryMeta(p.category);
                return (
                  <tr key={p.id} className={cn("hover:bg-secondary/20 transition-colors", p.status === "overdue" && "bg-red-50/40")}>
                    <td className="p-4">
                      <div className="font-medium text-sm">{p.description}</div>
                      {p.isRecurring && <span className="text-xs text-blue-600 font-semibold">↻ Recorrente</span>}
                      {p.note && <div className="text-xs text-muted-foreground mt-0.5 truncate max-w-[200px]">{p.note}</div>}
                    </td>
                    <td className="p-4">
                      <span className={cn("text-xs px-2 py-1 rounded-full font-semibold", catMeta.color)}>{catMeta.label}</span>
                    </td>
                    <td className="p-4">
                      {p.supplierName ? (
                        <div className="flex items-center gap-1.5 text-sm">
                          <Building2 className="w-3.5 h-3.5 text-muted-foreground" />
                          {p.supplierName}
                        </div>
                      ) : <span className="text-muted-foreground text-sm">—</span>}
                    </td>
                    <td className="p-4">
                      <div className={cn("flex items-center gap-1.5 text-sm", p.status === "overdue" ? "text-red-600 font-semibold" : "")}>
                        <Calendar className="w-3.5 h-3.5" />
                        {formatDate(p.dueDate)}
                      </div>
                    </td>
                    <td className="p-4">
                      <Badge variant={STATUS_VARIANT[p.status] ?? "default"}>{STATUS_LABEL[p.status] ?? p.status}</Badge>
                    </td>
                    <td className="p-4 text-right font-bold text-base">{formatCurrency(p.amount)}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2 justify-end">
                        {p.status !== "paid" && (
                          <Button size="sm" onClick={() => handlePay(p.id)} isLoading={payMutation.isPending && payMutation.variables?.id === p.id}>
                            <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Pagar
                          </Button>
                        )}
                        <button onClick={() => openEdit(p)} className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors">
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => handleDelete(p.id)} disabled={deleteMutation.isPending && deleteMutation.variables?.id === p.id} className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-red-50 rounded-lg transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Create/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-lg p-0 overflow-hidden shadow-2xl">
            <div className="bg-gradient-to-r from-rose-600 to-red-700 p-6 text-white">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">{editingId ? "Editar Conta" : "Nova Despesa"}</h2>
                <button onClick={() => setShowForm(false)} className="bg-white/10 p-1.5 rounded-lg hover:bg-white/20">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <Input
                label="O que está sendo pago? *"
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Ex: Conta de luz, Compra de mercadoria..."
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Valor (R$) *"
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.amount}
                  onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                  placeholder="0,00"
                />
                <Input
                  label="Vencimento *"
                  type="date"
                  value={form.dueDate}
                  onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-muted-foreground uppercase tracking-wider mb-1.5">Categoria</label>
                  <select
                    value={form.category}
                    onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                    className="w-full h-11 rounded-xl border-2 border-border bg-background px-3 text-sm focus:outline-none focus:border-primary"
                  >
                    {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-muted-foreground uppercase tracking-wider mb-1.5">Fornecedor</label>
                  <select
                    value={form.supplierId}
                    onChange={e => setForm(f => ({ ...f, supplierId: e.target.value }))}
                    className="w-full h-11 rounded-xl border-2 border-border bg-background px-3 text-sm focus:outline-none focus:border-primary"
                  >
                    <option value="">Nenhum fornecedor</option>
                    {suppliers?.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
              </div>
              <Input
                label="Observação (opcional)"
                value={form.note}
                onChange={e => setForm(f => ({ ...f, note: e.target.value }))}
                placeholder="Detalhes adicionais..."
              />
              <label className="flex items-center gap-4 cursor-pointer p-4 bg-slate-50 border border-border/50 rounded-xl hover:bg-slate-100 transition-colors">
                <input
                  type="checkbox"
                  checked={form.isRecurring}
                  onChange={e => setForm(f => ({ ...f, isRecurring: e.target.checked }))}
                  className="w-5 h-5 accent-rose-600 rounded"
                />
                <div>
                  <p className="text-sm font-bold text-foreground">Despesa recorrente</p>
                  <p className="text-xs text-muted-foreground font-medium">Esta conta se repete todos os meses</p>
                </div>
              </label>
              <div className="flex justify-end gap-3 pt-4 border-t border-border mt-2">
                <Button variant="ghost" type="button" onClick={() => setShowForm(false)} className="font-bold">Cancelar</Button>
                <Button type="submit" isLoading={createMutation.isPending || updateMutation.isPending} className="px-8 font-bold">
                  {editingId ? "Salvar Alterações" : "Cadastrar Conta"}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </Layout>
  );
}
