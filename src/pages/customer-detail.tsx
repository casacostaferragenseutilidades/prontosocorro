import { useState } from "react";
import { useRoute, useLocation } from "wouter";
import { Layout } from "@/components/layout";
import { Card, Button, Input, Badge } from "@/components/ui-elements";
import { formatCurrency, formatDate, cn } from "@/lib/utils";
import { 
  User, 
  Phone, 
  MapPin, 
  CreditCard, 
  CalendarRange, 
  CheckCircle2, 
  ChevronLeft,
  ShoppingBag,
  History,
  TrendingDown
} from "lucide-react";
import { 
  useGetCustomer, 
  useAddPayment, 
  usePayInstallment,
  getGetCustomerQueryKey,
  getListSalesQueryKey,
  getGetDashboardQueryKey
} from "@/lib/api";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

const PAYMENT_LABELS: Record<string, string> = {
  money: "Dinheiro",
  cash: "Dinheiro",
  pix: "Pix",
  credit_card: "Cartão de Crédito",
  debit_card: "Cartão de Débito",
  fiado: "Fiado",
  installment: "Parcelado"
};

export default function CustomerDetail() {
  const [, params] = useRoute("/clientes/:id");
  const id = params.id as string;
  const [, setLocation] = useLocation();
  const { data: customer, isLoading } = useGetCustomer(id);
  const payMutation = useAddPayment();
  const payInstallmentMutation = usePayInstallment();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [paymentSaleId, setPaymentSaleId] = useState<string | null>(null);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [activeTab, setActiveTab] = useState<"sales" | "installments">("sales");
  const [expandedSales, setExpandedSales] = useState<Set<string>>(new Set());

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentSaleId || !paymentAmount) return;
    try {
      await payMutation.mutateAsync({ id: paymentSaleId, amount: parseFloat(paymentAmount.replace(",", ".")) });
      toast({ title: "Pagamento registrado com sucesso!" });
      setPaymentSaleId(null);
      setPaymentAmount("");
      queryClient.invalidateQueries({ queryKey: getGetCustomerQueryKey(id) });
      queryClient.invalidateQueries({ queryKey: getListSalesQueryKey() });
      queryClient.invalidateQueries({ queryKey: getGetDashboardQueryKey() });
    } catch (e: unknown) {
      toast({ title: "Erro ao registrar pagamento", description: e instanceof Error ? e.message : "", variant: "destructive" });
    }
  };

  const toggleSaleExpansion = (saleId: string) => {
    const newExpanded = new Set(expandedSales);
    if (newExpanded.has(saleId)) {
      newExpanded.delete(saleId);
    } else {
      newExpanded.add(saleId);
    }
    setExpandedSales(newExpanded);
  };

  const handlePayInstallment = async (installmentId: string) => {
    try {
      await payInstallmentMutation.mutateAsync({ id: installmentId });
      toast({ title: "Parcela paga com sucesso!" });
      queryClient.invalidateQueries({ queryKey: getGetCustomerQueryKey(id) });
      queryClient.invalidateQueries({ queryKey: getListSalesQueryKey() });
      queryClient.invalidateQueries({ queryKey: getGetDashboardQueryKey() });
    } catch (e: any) {
      toast({ title: "Erro ao pagar parcela", description: e.message, variant: "destructive" });
    }
  };

  if (isLoading) return <Layout><div className="p-8 text-center">Carregando detalhes...</div></Layout>;
  if (!customer) return <Layout><div className="p-8 text-center">Cliente não encontrado.</div></Layout>;

  const pendingInstallments = (customer.installments || []).filter(i => i.status === "pending");
  const paidInstallments = (customer.installments || []).filter(i => i.status === "paid");

  return (
    <Layout>
      <div className="mb-6">
        <Button variant="ghost" onClick={() => setLocation("/clientes")} className="-ml-4 text-muted-foreground hover:text-foreground">
          <ChevronLeft className="w-4 h-4 mr-1" /> Voltar para Clientes
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Info Sidebar */}
        <Card className="p-8 h-fit lg:sticky lg:top-24">
          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-4 ring-4 ring-primary/5">
              <User className="w-12 h-12 text-primary" />
            </div>
            <h1 className="text-2xl font-bold font-display">{customer.name}</h1>
            <Badge variant="outline" className="mt-2 px-3 py-1">ID: #{customer.id.substring(0, 8)}</Badge>
          </div>

          <div className="space-y-6 border-y border-border py-8">
            {customer.phone && (
              <div className="flex items-center gap-3 text-muted-foreground">
                <Phone className="w-5 h-5 shrink-0" />
                <span>{customer.phone}</span>
              </div>
            )}
            {customer.address && (
              <div className="flex items-center gap-3 text-muted-foreground">
                <MapPin className="w-5 h-5 shrink-0" />
                <span>{customer.address}</span>
              </div>
            )}
          </div>

          <div className="mt-8 space-y-4">
            <div className="p-4 bg-secondary/50 rounded-xl border border-border">
              <p className="text-sm font-medium text-muted-foreground mb-1">Dívida Total em Aberto</p>
              <p className={cn("text-3xl font-bold font-display", customer.totalDebt > 0 ? "text-destructive" : "text-green-600")}>
                {formatCurrency(customer.totalDebt)}
              </p>
            </div>

            {pendingInstallments.length > 0 && (
              <div className="p-4 bg-violet-50 rounded-xl border border-violet-200">
                <p className="text-sm font-medium text-violet-700 mb-1 flex items-center gap-2">
                  <CalendarRange className="w-4 h-4" /> Parcelas Pendentes
                </p>
                <p className="text-2xl font-bold text-violet-800">
                  {pendingInstallments.length} parcela{pendingInstallments.length > 1 ? "s" : ""}
                </p>
                <p className="text-xs text-violet-600 mt-1">
                  Subtotal: {formatCurrency(pendingInstallments.reduce((s, i) => s + i.amount, 0))}
                </p>
              </div>
            )}
          </div>
        </Card>

        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex gap-4 border-b border-border">
            <button
              onClick={() => setActiveTab("sales")}
              className={cn("pb-4 px-2 text-sm font-bold border-b-2 transition-all flex items-center gap-2", activeTab === "sales" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground")}
            >
              <History className="w-4 h-4" /> Compras ({customer.sales.length})
            </button>
            <button
              onClick={() => setActiveTab("installments")}
              className={cn("pb-4 px-2 text-sm font-bold border-b-2 transition-all flex items-center gap-2", activeTab === "installments" ? "border-violet-500 text-violet-700" : "border-transparent text-muted-foreground hover:text-foreground")}
            >
              <CalendarRange className="w-4 h-4" /> Parcelas ({customer.installments?.length ?? 0})
            </button>
          </div>

          {activeTab === "sales" && (
            <div className="space-y-4">
              {customer.sales.length === 0 ? (
                <Card className="p-16 text-center text-muted-foreground">
                  <ShoppingBag className="w-12 h-12 mx-auto mb-4 opacity-20" />
                  Nenhuma compra registrada.
                </Card>
              ) : (
                [...customer.sales].reverse().map(sale => (
                  <Card key={sale.id} className={cn("p-6 transition-all border-l-4", (sale.status === "pending" || sale.status === "partial") ? "border-l-amber-500 bg-amber-50/20" : "border-l-emerald-500")}>
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <span className="font-bold text-lg">Venda #{sale.id}</span>
                          <span className="text-sm text-muted-foreground font-medium">{formatDate(sale.createdAt, true)}</span>
                        </div>
                        <div className="text-sm text-muted-foreground mb-3 font-medium">
                          {sale.items.length} itens — {sale.items.slice(0, 2).map(i => i.productName).join(", ")}{sale.items.length > 2 ? "..." : ""}
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-8 text-xs font-bold"
                            onClick={() => toggleSaleExpansion(sale.id)}
                          >
                            {expandedSales.has(sale.id) ? "Ocultar Itens" : "Ver Itens Comprados"}
                          </Button>
                          {sale.paymentType === "fiado" && sale.remainingDebt > 0 && (
                            <Button onClick={() => setPaymentSaleId(sale.id)} size="sm" className="h-8 text-xs font-bold bg-amber-600 hover:bg-amber-700 border-none">
                              <CreditCard className="w-3.5 h-3.5 mr-1.5" /> Pagar Dívida
                            </Button>
                          )}
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="font-extrabold text-2xl mb-1 tracking-tight text-foreground">{formatCurrency(sale.total)}</p>
                        {sale.remainingDebt > 0 && (
                          <p className="text-xs text-destructive font-bold mb-1.5 flex items-center justify-end gap-1">
                            <TrendingDown className="w-3 h-3" /> Falta {formatCurrency(sale.remainingDebt)}
                          </p>
                        )}
                        <div className="flex gap-2 justify-end">
                          <Badge variant={sale.paymentType === "fiado" ? "warning" : "default"} className="font-bold">
                            {PAYMENT_LABELS[sale.paymentType] ?? sale.paymentType}
                          </Badge>
                          <Badge variant={sale.status === "paid" ? "success" : sale.status === "pending" ? "danger" : "warning"} className="font-bold uppercase tracking-wider text-[10px]">
                            {sale.status === "paid" ? "Finalizada" : sale.status === "pending" ? "Pendente" : "Parcial"}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {expandedSales.has(sale.id) && (
                      <div className="mt-6 pt-6 border-t border-border animate-in slide-in-from-top-4 duration-300">
                        <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">Detalhamento dos Itens</h4>
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="text-muted-foreground/60 text-left border-b border-border/50">
                                <th className="pb-2 font-bold uppercase text-[10px]">Produto</th>
                                <th className="pb-2 font-bold uppercase text-[10px] text-center">Qtd</th>
                                <th className="pb-2 font-bold uppercase text-[10px] text-right">Unitário</th>
                                <th className="pb-2 font-bold uppercase text-[10px] text-right">Subtotal</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-border/30">
                              {sale.items.map((item: any) => (
                                <tr key={item.id} className="group hover:bg-slate-50">
                                  <td className="py-3 font-semibold text-foreground">{item.productName}</td>
                                  <td className="py-3 text-center text-muted-foreground font-mono font-bold">{item.quantity}</td>
                                  <td className="py-3 text-right text-muted-foreground font-medium">{formatCurrency(item.unitPrice)}</td>
                                  <td className="py-3 text-right font-extrabold text-primary">{formatCurrency(item.totalPrice)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </Card>
                ))
              )}
            </div>
          )}

          {activeTab === "installments" && (
            <div className="space-y-6">
              {(customer.installments?.length ?? 0) === 0 ? (
                <Card className="p-16 text-center text-muted-foreground">
                  <CalendarRange className="w-12 h-12 mx-auto mb-4 opacity-20" />
                  Nenhuma parcela enviada ou gerada.
                </Card>
              ) : (
                <>
                  {pendingInstallments.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold text-destructive uppercase tracking-widest flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-destructive animate-pulse" /> Pendentes / Vencidas
                      </h4>
                      {pendingInstallments.map(inst => (
                        <Card key={inst.id} className="p-5 border-l-4 border-l-amber-500 bg-amber-50/30">
                          <div className="flex items-center justify-between gap-4">
                            <div>
                              <div className="font-bold text-base text-foreground">
                                Parcela {inst.installmentNumber}/{inst.totalInstallments} — Venda #{inst.saleId}
                              </div>
                              <div className="text-xs text-muted-foreground mt-1 font-medium italic">
                                Vencimento: {formatDate(inst.dueDate)}
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="text-right">
                                <div className="font-extrabold text-xl text-foreground">{formatCurrency(inst.amount)}</div>
                                <Badge variant="danger" className="font-bold text-[10px]">PENDENTE</Badge>
                              </div>
                              <Button
                                size="sm"
                                onClick={() => handlePayInstallment(inst.id)}
                                isLoading={payInstallmentMutation.isPending}
                                className="bg-primary hover:bg-primary/90 font-bold"
                              >
                                <CheckCircle2 className="w-4 h-4 mr-1.5" /> Pagar
                              </Button>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}

                  {paidInstallments.length > 0 && (
                    <div className="space-y-3 pt-4">
                      <h4 className="text-xs font-bold text-emerald-600 uppercase tracking-widest flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4" /> Pagamentos Concluídos
                      </h4>
                      {paidInstallments.map(inst => (
                        <Card key={inst.id} className="p-4 opacity-75 grayscale-[0.5] hover:grayscale-0 transition-all border-l-4 border-l-emerald-500">
                          <div className="flex items-center justify-between gap-4">
                            <div>
                              <div className="font-bold text-sm text-foreground">
                                Parcela {inst.installmentNumber}/{inst.totalInstallments} — Venda #{inst.saleId}
                              </div>
                              <div className="text-xs text-muted-foreground mt-0.5 font-medium">
                                Pago em {formatDate(inst.paidAt ?? "", true)}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-bold text-lg text-emerald-700">{formatCurrency(inst.amount)}</div>
                              <Badge variant="success" className="font-bold text-[10px]">PAGO</Badge>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Pay fiado modal */}
      {paymentSaleId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md p-8 shadow-2xl animate-in zoom-in-95 duration-200">
            <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
              <CreditCard className="w-6 h-6 text-primary" /> Registrar Pagamento
            </h2>
            <p className="text-muted-foreground text-sm mb-6">
              Saldo em aberto para a venda #{paymentSaleId}: <span className="font-bold text-foreground">{formatCurrency(customer.sales.find(s => s.id === paymentSaleId)?.remainingDebt || 0)}</span>
            </p>
            <form onSubmit={handlePayment} className="space-y-6">
              <Input 
                label="Valor a Pagar (R$)" 
                type="number" 
                step="0.01" 
                value={paymentAmount} 
                onChange={e => setPaymentAmount(e.target.value)} 
                autoFocus 
                className="text-2xl font-bold h-16"
              />
              <div className="flex gap-3">
                <Button variant="outline" type="button" onClick={() => setPaymentSaleId(null)} className="flex-1 h-12 font-bold">Cancelar</Button>
                <Button type="submit" isLoading={payMutation.isPending} className="flex-1 h-12 font-bold">Confirmar Pagamento</Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </Layout>
  );
}
