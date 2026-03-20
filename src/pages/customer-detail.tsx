import React, { useState } from "react";
import { Layout } from "@/components/layout";
import { Card, Button, Badge, Input } from "@/components/ui-elements";
import {
  useGetCustomer,
  useAddPayment,
  usePayInstallment,
  getGetCustomerQueryKey,
  getListSalesQueryKey,
  getGetDashboardQueryKey,
} from "@/lib/api";
import { useLocation, useParams } from "wouter";
import { formatCurrency, formatDate, cn } from "@/lib/utils";
import { ArrowLeft, User, Phone, MapPin, Mail, CreditCard, CalendarRange, CheckCircle2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

const PAYMENT_LABELS: Record<string, string> = {
  money: "Dinheiro",
  debit_card: "Cartão Débito",
  credit_card: "Cartão Crédito",
  pix: "Pix",
  fiado: "Fiado",
  installment: "Parcelado",
  cash: "À Vista",
};

export default function CustomerDetail() {
  const params = useParams();
  const id = Number(params.id);
  const [, setLocation] = useLocation();
  const { data: customer, isLoading } = useGetCustomer(id);
  const payMutation = useAddPayment();
  const payInstallmentMutation = usePayInstallment();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [paymentSaleId, setPaymentSaleId] = useState<number | null>(null);
  const [amount, setAmount] = useState("");
  const [activeTab, setActiveTab] = useState<"sales" | "installments">("sales");

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentSaleId || !amount) return;
    try {
      await payMutation.mutateAsync({ id: paymentSaleId, data: { amount: parseFloat(amount.replace(",", ".")) } });
      toast({ title: "Pagamento registrado com sucesso!" });
      setPaymentSaleId(null);
      setAmount("");
      queryClient.invalidateQueries({ queryKey: getGetCustomerQueryKey(id) });
      queryClient.invalidateQueries({ queryKey: getListSalesQueryKey() });
      queryClient.invalidateQueries({ queryKey: getGetDashboardQueryKey() });
    } catch (e: unknown) {
      toast({ title: "Erro ao registrar pagamento", description: e instanceof Error ? e.message : "", variant: "destructive" });
    }
  };

  const handlePayInstallment = async (installmentId: number) => {
    try {
      await payInstallmentMutation.mutateAsync({ id: installmentId });
      toast({ title: "Parcela paga com sucesso!" });
      queryClient.invalidateQueries({ queryKey: getGetCustomerQueryKey(id) });
      queryClient.invalidateQueries({ queryKey: getListSalesQueryKey() });
      queryClient.invalidateQueries({ queryKey: getGetDashboardQueryKey() });
    } catch (e: unknown) {
      toast({ title: "Erro ao pagar parcela", description: e instanceof Error ? e.message : "", variant: "destructive" });
    }
  };

  if (isLoading) return <Layout><div className="p-8 text-center text-muted-foreground">Carregando...</div></Layout>;
  if (!customer) return <Layout><div className="p-8">Cliente não encontrado.</div></Layout>;

  const pendingInstallments = customer.installments?.filter(i => i.status === "pending") ?? [];
  const paidInstallments = customer.installments?.filter(i => i.status === "paid") ?? [];

  return (
    <Layout>
      <button onClick={() => setLocation("/clientes")} className="flex items-center text-muted-foreground hover:text-foreground mb-6 font-medium transition-colors">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Voltar para Clientes
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile card */}
        <Card className="p-6 lg:col-span-1 h-fit">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <User className="w-10 h-10 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-center mb-6">{customer.name}</h2>

          <div className="space-y-4">
            <div className="flex items-center gap-3 text-muted-foreground">
              <Phone className="w-5 h-5 shrink-0" />
              <span>{customer.phone}</span>
            </div>
            {customer.email && (
              <div className="flex items-center gap-3 text-muted-foreground">
                <Mail className="w-5 h-5 shrink-0" />
                <span>{customer.email}</span>
              </div>
            )}
            {customer.address && (
              <div className="flex items-center gap-3 text-muted-foreground">
                <MapPin className="w-5 h-5 shrink-0" />
                <span>{customer.address}</span>
              </div>
            )}
          </div>

          <div className="mt-8 p-4 bg-secondary/50 rounded-xl border border-border">
            <p className="text-sm font-medium text-muted-foreground mb-1">Dívida Total em Aberto</p>
            <p className={cn("text-3xl font-bold font-display", customer.totalDebt > 0 ? "text-destructive" : "text-green-600")}>
              {formatCurrency(customer.totalDebt)}
            </p>
          </div>

          {pendingInstallments.length > 0 && (
            <div className="mt-4 p-4 bg-violet-50 rounded-xl border border-violet-200">
              <p className="text-sm font-medium text-violet-700 mb-1">Parcelas Pendentes</p>
              <p className="text-2xl font-bold text-violet-800">
                {pendingInstallments.length} parcela{pendingInstallments.length > 1 ? "s" : ""}
              </p>
              <p className="text-xs text-violet-600 mt-1">
                Total: {formatCurrency(pendingInstallments.reduce((s, i) => s + i.amount, 0))}
              </p>
            </div>
          )}
        </Card>

        {/* History */}
        <div className="lg:col-span-2 space-y-4">
          {/* Tabs */}
          <div className="flex gap-2 border-b border-border">
            <button
              onClick={() => setActiveTab("sales")}
              className={cn("pb-3 px-1 text-sm font-semibold border-b-2 transition-colors", activeTab === "sales" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground")}
            >
              Histórico de Compras ({customer.sales.length})
            </button>
            <button
              onClick={() => setActiveTab("installments")}
              className={cn("pb-3 px-1 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2", activeTab === "installments" ? "border-violet-500 text-violet-700" : "border-transparent text-muted-foreground hover:text-foreground")}
            >
              <CalendarRange className="w-4 h-4" />
              Parcelas ({customer.installments?.length ?? 0})
              {pendingInstallments.length > 0 && (
                <span className="bg-violet-100 text-violet-700 text-xs px-1.5 py-0.5 rounded-full font-bold">{pendingInstallments.length}</span>
              )}
            </button>
          </div>

          {/* Sales tab */}
          {activeTab === "sales" && (
            <div className="space-y-4">
              {customer.sales.length === 0 ? (
                <Card className="p-12 text-center text-muted-foreground">Nenhuma compra registrada.</Card>
              ) : (
                [...customer.sales].reverse().map(sale => (
                  <Card key={sale.id} className={cn("p-5", (sale.status === "pending" || sale.status === "partial") && "border-amber-300/70 bg-amber-50/50")}>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <span className="font-bold">Venda #{sale.id}</span>
                          <span className="text-sm text-muted-foreground">{formatDate(sale.createdAt, true)}</span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {sale.items.map(i => `${i.quantity}x ${i.productName}`).join(", ")}
                        </div>
                        {sale.paymentType === "installment" && sale.numInstallments && (
                          <div className="text-xs text-violet-600 mt-1 font-medium">
                            Parcelado em {sale.numInstallments}x de {formatCurrency(sale.total / sale.numInstallments)}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="font-bold text-lg">{formatCurrency(sale.total)}</p>
                          {sale.remainingDebt > 0 && (
                            <p className="text-xs text-destructive">Restam {formatCurrency(sale.remainingDebt)}</p>
                          )}
                          <div className="flex gap-2 justify-end mt-1">
                            <Badge variant={sale.paymentType === "money" || sale.paymentType === "cash" || sale.paymentType === "debit_card" || sale.paymentType === "credit_card" || sale.paymentType === "pix" ? "default" : sale.paymentType === "installment" ? "outline" : "warning"}>
                              {PAYMENT_LABELS[sale.paymentType] ?? sale.paymentType}
                            </Badge>
                            <Badge variant={sale.status === "paid" ? "success" : sale.status === "pending" ? "danger" : "warning"}>
                              {sale.status === "paid" ? "Pago" : sale.status === "pending" ? "Pendente" : "Parcial"}
                            </Badge>
                          </div>
                        </div>
                        {sale.paymentType === "fiado" && sale.remainingDebt > 0 && (
                          <Button onClick={() => setPaymentSaleId(sale.id)} size="sm">
                            <CreditCard className="w-4 h-4 mr-2" /> Pagar
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          )}

          {/* Installments tab */}
          {activeTab === "installments" && (
            <div className="space-y-3">
              {(customer.installments?.length ?? 0) === 0 ? (
                <Card className="p-12 text-center text-muted-foreground">Nenhuma parcela registrada.</Card>
              ) : (
                <>
                  {pendingInstallments.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-muted-foreground uppercase mb-2">Pendentes</h4>
                      <div className="space-y-2">
                        {pendingInstallments.map(inst => (
                          <Card key={inst.id} className="p-4 border-amber-200 bg-amber-50/50">
                            <div className="flex items-center justify-between gap-4">
                              <div>
                                <div className="font-semibold text-sm">
                                  Parcela {inst.installmentNumber}/{inst.totalInstallments} — Venda #{inst.saleId}
                                </div>
                                <div className="text-xs text-muted-foreground mt-0.5">
                                  Vence em {formatDate(inst.dueDate)}
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <div className="text-right">
                                  <div className="font-bold text-base">{formatCurrency(inst.amount)}</div>
                                  <Badge variant="danger">Pendente</Badge>
                                </div>
                                <Button
                                  size="sm"
                                  onClick={() => handlePayInstallment(inst.id)}
                                  isLoading={payInstallmentMutation.isPending}
                                >
                                  <CheckCircle2 className="w-4 h-4 mr-1.5" /> Pagar
                                </Button>
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}

                  {paidInstallments.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-muted-foreground uppercase mb-2">Pagas</h4>
                      <div className="space-y-2">
                        {paidInstallments.map(inst => (
                          <Card key={inst.id} className="p-4 opacity-70">
                            <div className="flex items-center justify-between gap-4">
                              <div>
                                <div className="font-semibold text-sm">
                                  Parcela {inst.installmentNumber}/{inst.totalInstallments} — Venda #{inst.saleId}
                                </div>
                                <div className="text-xs text-muted-foreground mt-0.5">
                                  Pago em {formatDate(inst.paidAt ?? "")}
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="font-bold text-base">{formatCurrency(inst.amount)}</div>
                                <Badge variant="success">Pago</Badge>
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
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
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md p-6">
            <h2 className="text-xl font-bold mb-2">Registrar Pagamento</h2>
            <p className="text-muted-foreground text-sm mb-6">
              Saldo da venda #{paymentSaleId}: {formatCurrency(customer.sales.find(s => s.id === paymentSaleId)?.remainingDebt)}
            </p>
            <form onSubmit={handlePayment} className="space-y-4">
              <Input label="Valor a Pagar (R$)" type="number" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} autoFocus />
              <div className="pt-2 flex justify-end gap-3">
                <Button variant="ghost" type="button" onClick={() => setPaymentSaleId(null)}>Cancelar</Button>
                <Button type="submit" isLoading={payMutation.isPending}>Confirmar</Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </Layout>
  );
}
