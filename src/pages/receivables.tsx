import React, { useState } from "react";
import { Layout } from "@/components/layout";
import { Card, Button, Badge } from "@/components/ui-elements";
import { formatCurrency, formatDate, cn } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { 
  useListAccountsReceivable, 
  useCreateAccountsReceivable, 
  getListAccountsReceivableQueryKey,
  usePayInstallment,
  useAddPayment,
  getGetDashboardQueryKey,
  getListSalesQueryKey
} from "@/lib/api";
import { TrendingUp, RefreshCw, Calendar, User, Search, CreditCard, CalendarRange, CheckCircle2 } from "lucide-react";

type Receivable = {
  id: string;
  type: "fiado" | "installment";
  saleId: string | null;
  installmentId?: string;
  customerId: string | null;
  customerName: string;
  description: string;
  amount: number;
  dueDate: string | null;
  status: string;
  paidAt?: string | null;
  installmentNumber?: number;
  totalInstallments?: number;
};

const STATUS_LABEL: Record<string, string> = { pending: "Pendente", overdue: "Atrasado", paid: "Pago" };
const STATUS_VARIANT: Record<string, "default" | "danger" | "warning" | "success" | "outline"> = {
  pending: "warning",
  overdue: "danger",
  paid: "success",
};

// Removed custom useReceivables hook

export default function Receivables() {
  const { data: rawData, isLoading, refetch } = useListAccountsReceivable();
  const data = (rawData || []).map(r => ({
    id: r.id,
    type: r.sale_id ? "installment" : "fiado", // Simplificação para o componente
    saleId: r.sale_id,
    installmentId: r.id,
    customerId: r.customer_id,
    customerName: (r as any).customer?.name || "Cliente Balcão",
    description: r.description,
    amount: r.amount,
    dueDate: r.due_date,
    status: r.status,
    paidAt: r.payment_date
  })) as any[];
  
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const payInstallmentMutation = usePayInstallment();
  const addPaymentMutation = useAddPayment();

  const [filter, setFilter] = useState<"all" | "pending" | "overdue" | "paid">("all");
  const [search, setSearch] = useState("");
  const [payingFiadoId, setPayingFiadoId] = useState<string | null>(null);
  const [fiadoAmount, setFiadoAmount] = useState("");

  const filtered = data.filter(r => {
    if (filter !== "all" && r.status !== filter) return false;
    if (search && !r.customerName.toLowerCase().includes(search.toLowerCase()) && !r.description.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const totalPending = data.filter(r => r.status === "pending" || r.status === "overdue").reduce((s, r) => s + r.amount, 0);
  const totalOverdue = data.filter(r => r.status === "overdue").reduce((s, r) => s + r.amount, 0);
  const countPending = data.filter(r => r.status === "pending" || r.status === "overdue").length;

  const handlePayInstallment = async (r: Receivable) => {
    if (!r.installmentId) return;
    try {
      await payInstallmentMutation.mutateAsync({ id: r.installmentId });
      toast({ title: "Parcela recebida com sucesso!" });
      refetch();
      queryClient.invalidateQueries({ queryKey: getGetDashboardQueryKey() });
    } catch (e: unknown) {
      toast({ title: "Erro", description: e instanceof Error ? e.message : "", variant: "destructive" });
    }
  };

  const handlePayFiado = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payingFiadoId || !fiadoAmount) return;
    try {
      await addPaymentMutation.mutateAsync({ 
        id: payingFiadoId, 
        amount: parseFloat(fiadoAmount.replace(",", ".")) 
      });
      toast({ title: "Pagamento registrado!" });
      setPayingFiadoId(null);
      setFiadoAmount("");
      refetch();
      queryClient.invalidateQueries({ queryKey: getListSalesQueryKey() });
      queryClient.invalidateQueries({ queryKey: getGetDashboardQueryKey() });
    } catch (e: unknown) {
      toast({ title: "Erro", description: e instanceof Error ? e.message : "", variant: "destructive" });
    }
  };

  const fiadoForPayment = data.find(r => r.type === "fiado" && r.saleId === payingFiadoId);

  return (
    <Layout>
      <div className="space-y-8">
        {/* Premium Header with Gradient */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-700 to-violet-800 p-8 text-white shadow-2xl">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-24 h-24 bg-white/5 rounded-full blur-2xl"></div>
          
          <div className="relative z-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <h1 className="text-4xl font-bold mb-2">Contas a Receber</h1>
                <p className="text-blue-100 text-lg">Gerencie fiados, parcelamentos e recebimentos de clientes</p>
              </div>
              <Button 
                variant="outline" 
                onClick={() => refetch()} 
                disabled={isLoading}
                className="bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-md"
              >
                <RefreshCw className={cn("w-5 h-5 mr-2", isLoading && "animate-spin")} />
                Atualizar Dados
              </Button>
            </div>
          </div>
        </div>

        {/* Summary Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 bg-white border-blue-100 shadow-lg relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:scale-125 transition-transform">
              <TrendingUp className="w-12 h-12 text-blue-600" />
            </div>
            <p className="text-sm font-medium text-muted-foreground mb-1 uppercase tracking-wider">Total em Aberto</p>
            <p className="text-3xl font-bold text-foreground">{formatCurrency(totalPending)}</p>
            <div className="mt-2 text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded-full inline-block">
              {countPending} registros ativos
            </div>
          </Card>
          
          <Card className="p-6 bg-white border-red-100 shadow-lg relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:scale-125 transition-transform">
              <CalendarRange className="w-12 h-12 text-red-600" />
            </div>
            <p className="text-sm font-medium text-muted-foreground mb-1 uppercase tracking-wider">Total em Atraso</p>
            <p className="text-3xl font-bold text-red-600">{formatCurrency(totalOverdue)}</p>
            <div className="mt-2 text-xs font-semibold text-red-600 bg-red-50 px-2 py-1 rounded-full inline-block">
              Atenção necessária
            </div>
          </Card>

          <Card className="p-6 bg-white border-emerald-100 shadow-lg relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:scale-125 transition-transform">
              <CreditCard className="w-12 h-12 text-emerald-600" />
            </div>
            <p className="text-sm font-medium text-muted-foreground mb-1 uppercase tracking-wider">Total Recebido</p>
            <p className="text-3xl font-bold text-emerald-600">
              {formatCurrency(data.filter(r => r.status === "paid").reduce((s, r) => s + r.amount, 0))}
            </p>
            <div className="mt-2 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full inline-block">
              Total liquidado
            </div>
          </Card>
        </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
          <input
            className="w-full h-12 rounded-xl border-2 border-border bg-background px-11 text-sm focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all shadow-sm"
            placeholder="Buscar por cliente ou descrição..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2 p-1 bg-secondary/30 rounded-2xl border border-border/50 overflow-x-auto">
          {(["all", "pending", "overdue", "paid"] as const).map(s => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={cn(
                "px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap",
                filter === s ? "bg-white text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {s === "all" ? "Todos" : STATUS_LABEL[s]}
            </button>
          ))}
        </div>
      </div>

      <Card className="overflow-hidden shadow-xl border-border/50">
        <div className="px-6 py-5 border-b border-border bg-slate-50/50 flex items-center justify-between">
          <h2 className="text-xl font-bold">Listagem de Recebíveis</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[750px]">
            <thead>
              <tr className="border-b border-border bg-secondary/10">
                <th className="p-4 font-bold text-xs text-muted-foreground uppercase tracking-wider">Tipo</th>
                <th className="p-4 font-bold text-xs text-muted-foreground uppercase tracking-wider">Cliente</th>
                <th className="p-4 font-bold text-xs text-muted-foreground uppercase tracking-wider">Descrição</th>
                 <th className="p-4 font-bold text-xs text-muted-foreground uppercase tracking-wider">Vencimento</th>
                 <th className="p-4 font-bold text-xs text-muted-foreground uppercase tracking-wider">Pagamento</th>
                 <th className="p-4 font-bold text-xs text-muted-foreground uppercase tracking-wider">Status</th>
                <th className="p-4 font-bold text-xs text-muted-foreground uppercase tracking-wider text-right">Valor</th>
                <th className="p-4 font-bold text-xs text-muted-foreground uppercase tracking-wider text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
            {isLoading ? (
              <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">Carregando...</td></tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-16 text-center">
                  <TrendingUp className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-30" />
                  <p className="text-lg font-medium">Nenhum lançamento encontrado.</p>
                </td>
              </tr>
            ) : (
              filtered.map(r => (
                <tr key={r.id} className={cn("transition-colors hover:bg-secondary/20", r.status === "overdue" && "bg-red-50/50")}>
                  <td className="p-4">
                    {r.type === "fiado" ? (
                      <span className="inline-flex items-center gap-1 text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full font-semibold">
                        <CreditCard className="w-3 h-3" /> Fiado
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs bg-violet-100 text-violet-700 px-2 py-1 rounded-full font-semibold">
                        <CalendarRange className="w-3 h-3" /> Parcela
                      </span>
                    )}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-muted-foreground shrink-0" />
                      <span className="font-medium text-sm">{r.customerName}</span>
                    </div>
                  </td>
                  <td className="p-4 text-sm text-muted-foreground">{r.description}</td>
                   <td className="p-4">
                     {r.dueDate ? (
                       <div className="flex items-center gap-1.5 text-sm">
                         <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                         <span className={r.status === "overdue" ? "text-red-600 font-semibold" : ""}>{formatDate(r.dueDate)}</span>
                       </div>
                     ) : (
                       <span className="text-muted-foreground text-sm italic">Sem vencimento</span>
                     )}
                   </td>
                   <td className="p-4">
                     {r.paidAt ? (
                       <div className="flex items-center gap-1.5 text-sm text-green-600 font-medium">
                         <CheckCircle2 className="w-3.5 h-3.5" />
                         {formatDate(r.paidAt)}
                       </div>
                     ) : (
                       <span className="text-muted-foreground text-sm italic">-</span>
                     )}
                   </td>
                  <td className="p-4">
                    <Badge variant={STATUS_VARIANT[r.status] ?? "default"}>{STATUS_LABEL[r.status] ?? r.status}</Badge>
                  </td>
                  <td className="p-4 text-right font-bold text-base">{formatCurrency(r.amount)}</td>
                  <td className="p-4 text-right">
                    {r.status !== "paid" && (
                      r.type === "installment" ? (
                        <Button size="sm" onClick={() => handlePayInstallment(r)} isLoading={payInstallmentMutation.isPending}>
                          Receber
                        </Button>
                      ) : (
                        <Button size="sm" variant="outline" onClick={() => setPayingFiadoId(r.id)}>
                          Receber
                        </Button>
                      )
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </Card>

      {/* Pay fiado modal */}
      {payingFiadoId && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md p-6">
            <h2 className="text-xl font-bold mb-1">Registrar Recebimento</h2>
            <p className="text-muted-foreground text-sm mb-5">
              Venda #{payingFiadoId} — {fiadoForPayment?.customerName}
              {fiadoForPayment && <strong className="ml-2">({formatCurrency(fiadoForPayment.amount)} em aberto)</strong>}
            </p>
            <form onSubmit={handlePayFiado} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Valor Recebido (R$)</label>
                <input
                  type="number" step="0.01" min="0.01"
                  className="w-full h-11 rounded-xl border-2 border-border bg-background px-3 text-sm focus:outline-none focus:border-primary transition-all"
                  value={fiadoAmount}
                  onChange={e => setFiadoAmount(e.target.value)}
                  autoFocus
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <Button variant="ghost" type="button" onClick={() => { setPayingFiadoId(null); setFiadoAmount(""); }}>Cancelar</Button>
                <Button type="submit" isLoading={addPaymentMutation.isPending}>Confirmar</Button>
              </div>
            </form>
          </Card>
        </div>
      )}
        </div>
      </Layout>
    );
  }
