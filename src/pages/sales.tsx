import React, { useState, useEffect, useRef } from "react";
import { Layout } from "@/components/layout";
import { Card, Button, Badge, Input } from "@/components/ui-elements";
import { 
  useListSales, 
  useCreateSale, 
  getListSalesQueryKey, 
  useListProducts, 
  useListCustomers, 
  useCreateCustomer,
  getListCustomersQueryKey,
  getGetDashboardQueryKey
} from "@/lib/api";
import { formatCurrency, formatDate, cn } from "@/lib/utils";
import {
  Plus,
  ShoppingCart,
  X,
  Search,
  Minus,
  Trash2,
  ShoppingBag,
  UserPlus,
  ChevronDown,
  ChevronUp,
  Banknote,
  CreditCard,
  Smartphone,
  DollarSign,
  CalendarRange,
  Users,
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

type CartItem = { productId: string; name: string; price: number; quantity: number };

type PaymentType = "money" | "debit_card" | "credit_card" | "pix" | "fiado" | "installment";

const PAYMENT_METHODS: { value: PaymentType; label: string; icon: React.ReactNode; needsCustomer?: boolean; color?: string }[] = [
  { value: "money",        label: "Dinheiro",       icon: <Banknote className="w-4 h-4" /> },
  { value: "debit_card",   label: "Cartão Débito",  icon: <CreditCard className="w-4 h-4" /> },
  { value: "credit_card",  label: "Cartão Crédito", icon: <CreditCard className="w-4 h-4" /> },
  { value: "pix",          label: "Pix",            icon: <Smartphone className="w-4 h-4" /> },
  { value: "fiado",        label: "Fiado",          icon: <DollarSign className="w-4 h-4" />, needsCustomer: true, color: "amber" },
  { value: "installment",  label: "Parcelado",      icon: <CalendarRange className="w-4 h-4" />, needsCustomer: true, color: "violet" },
];

function NewSaleModal({ onClose }: { onClose: () => void }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: products } = useListProducts();
  const { data: customers } = useListCustomers();
  const createSaleMutation = useCreateSale();
  const createCustomerMutation = useCreateCustomer();

  const [productSearch, setProductSearch] = useState("");
  const [customerSearch, setCustomerSearch] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerId, setCustomerId] = useState<string | null>(null);
  const [paymentType, setPaymentType] = useState<PaymentType>("money");
  const [numInstallments, setNumInstallments] = useState(2);
  const [firstDueDate, setFirstDueDate] = useState<string>(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]);
  const [customerDropdownOpen, setCustomerDropdownOpen] = useState(false);
  const [showNewCustomerForm, setShowNewCustomerForm] = useState(false);
  const [newCustomer, setNewCustomer] = useState({ name: "", phone: "", email: "" });
  const [newCustomerErrors, setNewCustomerErrors] = useState<{ name?: string; phone?: string }>({});
  const [discount, setDiscount] = useState(0);
  const [surcharge, setSurcharge] = useState(0);

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node))
        setCustomerDropdownOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedCustomer = customers?.find((c) => c.id === customerId);
  const selectedMethod = PAYMENT_METHODS.find(m => m.value === paymentType)!;
  const needsCustomer = selectedMethod.needsCustomer;
  const totalItems = cart.reduce((acc, i) => acc + i.price * i.quantity, 0);
  const finalTotal = Math.max(0, totalItems - (Number(discount) || 0) + (Number(surcharge) || 0));
  const installmentAmount = paymentType === "installment" ? finalTotal / numInstallments : 0;

  const filteredProducts = products?.filter(p =>
    p.status === "active" &&
    (p.name.toLowerCase().includes(productSearch.toLowerCase()) || p.sku?.toLowerCase().includes(productSearch.toLowerCase()))
  ) || [];

  const filteredCustomers = customers?.filter(c =>
    c.name.toLowerCase().includes(customerSearch.toLowerCase()) || c.phone.includes(customerSearch)
  ) || [];

  const addToCart = (product: (typeof filteredProducts)[0]) => {
    setCart(prev => {
      const exists = prev.find(i => i.productId === product.id);
      if (exists) return prev.map(i => i.productId === product.id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { productId: product.id, name: product.name, price: product.price, quantity: 1 }];
    });
  };

  const updateQty = (productId: string, delta: number) => {
    setCart(prev => prev.map(i => i.productId === productId ? { ...i, quantity: i.quantity + delta } : i).filter(i => i.quantity > 0));
  };

  const handleCreateCustomer = async () => {
    const errors: { name?: string; phone?: string } = {};
    if (!newCustomer.name.trim()) errors.name = "Nome é obrigatório";
    if (!newCustomer.phone.trim()) errors.phone = "Telefone é obrigatório";
    if (Object.keys(errors).length > 0) { setNewCustomerErrors(errors); return; }
    try {
      const created = await createCustomerMutation.mutateAsync(newCustomer);
      queryClient.invalidateQueries({ queryKey: getListCustomersQueryKey() });
      setCustomerId(created.id);
      setShowNewCustomerForm(false);
      setCustomerDropdownOpen(false);
      setCustomerSearch("");
      setNewCustomer({ name: "", phone: "", email: "" });
      setNewCustomerErrors({});
      toast({ title: `Cliente "${created.name}" cadastrado!` });
    } catch {
      toast({ title: "Erro ao cadastrar cliente", variant: "destructive" });
    }
  };

  const handleFinish = async () => {
    if (cart.length === 0) { toast({ title: "Adicione produtos ao carrinho", variant: "destructive" }); return; }
    if (needsCustomer && !customerId) {
      toast({ title: `Selecione um cliente para ${selectedMethod.label}`, variant: "destructive" });
      return;
    }
    try {
      const installments_data = paymentType === "installment" ? Array.from({ length: numInstallments }).map((_, i) => {
        const d = new Date(firstDueDate);
        d.setMonth(d.getMonth() + i);
        return {
          amount: finalTotal / numInstallments,
          due_date: d.toISOString().split("T")[0],
          notes: `Parcela ${i + 1}/${numInstallments}`
        };
      }) : undefined;

      await createSaleMutation.mutateAsync({
        customer_id: customerId,
        total_amount: totalItems,
        discount_amount: Number(discount) || 0,
        final_amount: finalTotal,
        payment_method: paymentType === "installment" ? "fiado" : paymentType as any,
        status: (paymentType === "fiado" || paymentType === "installment") ? "pending" : "completed",
        notes: (Number(surcharge) > 0 ? `Taxa: ${formatCurrency(surcharge)}. ` : "") + (paymentType === "installment" ? `Parcelado em ${numInstallments}x` : ""),
        installments_data,
        items: cart.map(item => ({
          product_id: item.productId,
          quantity: item.quantity,
          unit_price: item.price,
          total_price: item.price * item.quantity
        }))
      } as any);
      
      queryClient.invalidateQueries({ queryKey: getListSalesQueryKey() });
      queryClient.invalidateQueries({ queryKey: getGetDashboardQueryKey() });
      toast({ title: "Venda finalizada com sucesso!" });
      onClose();
    } catch (e: unknown) {
      toast({ title: "Erro ao finalizar venda", description: e instanceof Error ? e.message : "Erro", variant: "destructive" });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center lg:p-4 bg-black/60 backdrop-blur-sm transition-all duration-300">
      <div className="relative w-full max-w-5xl h-[100dvh] lg:h-auto lg:max-h-[95vh] flex flex-col bg-background lg:rounded-2xl shadow-2xl overflow-hidden border-border/50 lg:border">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-primary text-primary-foreground shrink-0">
          <div className="flex items-center gap-3">
            <ShoppingBag className="w-6 h-6" />
            <h2 className="text-xl font-bold">Nova Venda</h2>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 hover:bg-white/20 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-col lg:flex-row flex-1 min-h-0 overflow-y-auto lg:overflow-hidden">
          {/* LEFT: Products */}
          <div className="flex flex-col min-h-[50vh] lg:min-h-0 lg:flex-1 shrink-0 border-b lg:border-b-0 lg:border-r border-border">
            <div className="px-4 py-3 border-b border-border bg-secondary/20 shrink-0">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <input
                  className="w-full h-10 rounded-xl border-2 border-border bg-background pl-9 pr-3 text-sm focus:outline-none focus:border-primary transition-all"
                  placeholder="Buscar produto..."
                  value={productSearch}
                  onChange={e => setProductSearch(e.target.value)}
                  autoFocus
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-3 grid grid-cols-2 sm:grid-cols-3 gap-3 content-start">
              {filteredProducts.length === 0 && (
                <div className="col-span-3 py-12 text-center text-muted-foreground text-sm">Nenhum produto encontrado</div>
              )}
              {filteredProducts.map(p => {
                const inCart = cart.find(c => c.productId === p.id);
                return (
                  <button
                    key={p.id}
                    onClick={() => addToCart(p)}
                    className={cn(
                      "relative flex flex-col text-left p-3 rounded-xl border-2 transition-all active:scale-95 bg-background",
                      inCart ? "border-primary shadow-md shadow-primary/20" : "border-border hover:border-primary/50 hover:shadow-sm"
                    )}
                  >
                    {inCart && (
                      <span className="absolute top-2 right-2 bg-primary text-primary-foreground text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                        {inCart.quantity}
                      </span>
                    )}
                    <div className="font-semibold text-sm line-clamp-2 mb-1 pr-5">{p.name}</div>
                    {p.sku && <div className="text-xs text-muted-foreground mb-1">#{p.sku}</div>}
                    <div className="text-xs text-muted-foreground mb-2">Estoque: {p.stock}</div>
                    <div className="mt-auto font-bold text-base text-primary">{formatCurrency(p.price)}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* RIGHT: Cart + Checkout */}
          <div className="flex flex-col w-full lg:w-[400px] shrink-0 min-h-[50vh] lg:min-h-0">
            {/* Customer selector */}
            <div className="px-4 py-3 border-b border-border bg-secondary/10 shrink-0">
              <label className="block text-xs font-semibold text-muted-foreground uppercase mb-2">Cliente</label>
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => { setCustomerDropdownOpen(o => !o); setShowNewCustomerForm(false); }}
                  className="w-full flex items-center justify-between h-12 rounded-xl border-2 border-border bg-background px-4 text-sm hover:border-primary hover:shadow-md transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <Users className={cn("w-5 h-5 transition-colors", selectedCustomer ? "text-primary" : "text-muted-foreground group-hover:text-primary")} />
                    <span className={selectedCustomer ? "text-foreground font-semibold" : "text-muted-foreground font-medium"}>
                      {selectedCustomer ? selectedCustomer.name : "Venda avulsa (Balcão)"}
                    </span>
                  </div>
                  {customerDropdownOpen ? <ChevronUp className="w-5 h-5 text-muted-foreground" /> : <ChevronDown className="w-5 h-5 text-muted-foreground group-hover:text-primary" />}
                </button>

                {customerDropdownOpen && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-background border-2 border-border rounded-xl shadow-xl z-10 overflow-hidden">
                    <div className="p-2 border-b border-border">
                      <input
                        className="w-full h-9 rounded-lg border border-border bg-muted/50 px-3 text-sm focus:outline-none focus:border-primary"
                        placeholder="Buscar por nome ou telefone..."
                        value={customerSearch}
                        onChange={e => setCustomerSearch(e.target.value)}
                        autoFocus
                      />
                    </div>
                    <div className="max-h-44 overflow-y-auto">
                      <button type="button" onClick={() => { setCustomerId(null); setCustomerDropdownOpen(false); setCustomerSearch(""); }}
                        className="w-full text-left px-4 py-3 text-sm text-foreground hover:bg-secondary flex items-center gap-3 transition-colors border-b border-border/50">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <div className="font-semibold">Venda avulsa (Balcão)</div>
                          <div className="text-xs text-muted-foreground">Sem registro de cliente</div>
                        </div>
                      </button>
                      {filteredCustomers.map(c => (
                        <button key={c.id} type="button"
                          onClick={() => { setCustomerId(c.id); setCustomerDropdownOpen(false); setCustomerSearch(""); }}
                          className={cn("w-full text-left px-4 py-3 hover:bg-primary/5 flex items-center gap-3 transition-colors border-b border-border/50 last:border-0", customerId === c.id && "bg-primary/10")}>
                          <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs uppercase">
                            {c.name.substring(0, 2)}
                          </div>
                          <div>
                            <div className="font-semibold text-sm">{c.name}</div>
                            <div className="text-xs text-muted-foreground">{c.phone}</div>
                          </div>
                        </button>
                      ))}
                      {filteredCustomers.length === 0 && customerSearch && (
                        <div className="px-3 py-2 text-sm text-muted-foreground">Nenhum cliente encontrado</div>
                      )}
                    </div>
                    <div className="border-t border-border p-2">
                      <button type="button"
                        onClick={() => { setShowNewCustomerForm(true); setCustomerDropdownOpen(false); }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm font-semibold text-primary hover:bg-primary/10 rounded-lg transition-colors">
                        <UserPlus className="w-4 h-4" /> Cadastrar novo cliente
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {showNewCustomerForm && (
                <div className="mt-3 p-3 bg-primary/5 border-2 border-primary/30 rounded-xl space-y-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-bold text-primary flex items-center gap-1.5"><UserPlus className="w-4 h-4" /> Novo Cliente</span>
                    <button type="button" onClick={() => { setShowNewCustomerForm(false); setNewCustomerErrors({}); }} className="text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
                  </div>
                  <Input placeholder="Nome completo *" value={newCustomer.name} onChange={e => { setNewCustomer(p => ({ ...p, name: e.target.value })); setNewCustomerErrors(p => ({ ...p, name: undefined })); }} error={newCustomerErrors.name} className="h-9 text-sm" />
                  <Input placeholder="Telefone *" value={newCustomer.phone} onChange={e => { setNewCustomer(p => ({ ...p, phone: e.target.value })); setNewCustomerErrors(p => ({ ...p, phone: undefined })); }} error={newCustomerErrors.phone} className="h-9 text-sm" />
                  <Input placeholder="E-mail (opcional)" value={newCustomer.email} onChange={e => setNewCustomer(p => ({ ...p, email: e.target.value }))} className="h-9 text-sm" />
                  <Button size="sm" className="w-full" onClick={handleCreateCustomer} isLoading={createCustomerMutation.isPending}>
                    <UserPlus className="w-4 h-4 mr-1.5" /> Salvar e selecionar
                  </Button>
                </div>
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-4 min-h-0 bg-secondary/5">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-muted-foreground p-8 text-center bg-background/50 rounded-2xl border-2 border-dashed border-border/50">
                  <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mb-4 transition-transform hover:scale-110">
                    <ShoppingBag className="w-8 h-8 opacity-40 text-primary" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-1">Seu carrinho está vazio</h3>
                  <p className="text-sm max-w-[200px]">Clique nos produtos à esquerda para começar a vender</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {cart.map(item => (
                    <div key={item.productId} className="flex items-center gap-3 p-3 rounded-xl border border-border bg-card">
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm truncate">{item.name}</div>
                        <div className="text-xs text-muted-foreground">{formatCurrency(item.price)} un</div>
                      </div>
                      <div className="flex items-center gap-1 border border-border rounded-lg bg-secondary/50 p-0.5">
                        <button onClick={() => updateQty(item.productId, -1)} className="p-1 rounded hover:bg-background transition-colors"><Minus className="w-3.5 h-3.5" /></button>
                        <span className="font-bold text-sm w-6 text-center">{item.quantity}</span>
                        <button onClick={() => updateQty(item.productId, 1)} className="p-1 rounded hover:bg-background transition-colors"><Plus className="w-3.5 h-3.5" /></button>
                      </div>
                      <div className="font-bold text-sm w-20 text-right shrink-0">{formatCurrency(item.price * item.quantity)}</div>
                      <button onClick={() => setCart(prev => prev.filter(i => i.productId !== item.productId))} className="text-muted-foreground hover:text-destructive transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Checkout footer */}
            <div className="p-4 border-t border-border bg-card shrink-0 space-y-4">
              
              {/* Discount and Surcharge Inputs */}
              <div className="grid grid-cols-2 gap-3 pb-2 border-b border-border/50">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Desconto (-)</label>
                  <div className="relative">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">R$</span>
                    <input 
                      type="number"
                      step="0.01"
                      min="0"
                      value={discount || ""}
                      onChange={e => setDiscount(Number(e.target.value) || 0)}
                      className="w-full h-9 rounded-lg border border-border bg-background pl-8 pr-2 text-sm focus:outline-none focus:border-red-400 focus:ring-1 focus:ring-red-100 transition-all font-medium text-red-600"
                      placeholder="0,00"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Acréscimo (+)</label>
                  <div className="relative">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">R$</span>
                    <input 
                      type="number"
                      step="0.01"
                      min="0"
                      value={surcharge || ""}
                      onChange={e => setSurcharge(Number(e.target.value) || 0)}
                      className="w-full h-9 rounded-lg border border-border bg-background pl-8 pr-2 text-sm focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-100 transition-all font-medium text-emerald-600"
                      placeholder="0,00"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-muted-foreground font-medium">Total</span>
                <span className="text-2xl font-bold">{formatCurrency(finalTotal)}</span>
              </div>

              {/* Payment methods — 3-column grid */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">Forma de Pagamento</p>
                <div className="grid grid-cols-3 gap-1.5">
                  {PAYMENT_METHODS.map(method => {
                    const isSelected = paymentType === method.value;
                    const colorClass = isSelected
                      ? method.color === "amber"
                        ? "border-amber-500 bg-amber-50 text-amber-700"
                        : method.color === "violet"
                        ? "border-violet-500 bg-violet-50 text-violet-700"
                        : "border-primary bg-primary/10 text-primary"
                      : "border-border bg-background text-muted-foreground hover:border-muted-foreground/50";
                    return (
                      <button
                        key={method.value}
                        onClick={() => setPaymentType(method.value)}
                        className={cn("flex flex-col items-center gap-1 py-2 px-1 rounded-xl border-2 text-xs font-semibold transition-all", colorClass)}
                      >
                        {method.icon}
                        <span className="leading-tight text-center">{method.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

               {/* Installments picker */}
              {paymentType === "installment" && (
                <div className="bg-violet-50 border border-violet-200 rounded-xl p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-violet-700 uppercase tracking-wider">Número de parcelas</label>
                    <div className="flex items-center gap-2">
                      <button onClick={() => setNumInstallments(n => Math.max(2, n - 1))} className="w-8 h-8 rounded-lg border border-violet-300 bg-white text-violet-700 font-bold hover:bg-violet-100 flex items-center justify-center transition-all shadow-sm">−</button>
                      <span className="font-bold text-violet-800 w-6 text-center text-lg">{numInstallments}</span>
                      <button onClick={() => setNumInstallments(n => Math.min(24, n + 1))} className="w-8 h-8 rounded-lg border border-violet-300 bg-white text-violet-700 font-bold hover:bg-violet-100 flex items-center justify-center transition-all shadow-sm">+</button>
                    </div>
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-violet-700 uppercase tracking-wider">Primeiro Vencimento</label>
                    <input 
                      type="date"
                      value={firstDueDate}
                      onChange={e => setFirstDueDate(e.target.value)}
                      className="w-full h-10 px-3 rounded-lg border border-violet-200 bg-white text-sm focus:outline-none focus:border-violet-500 text-violet-900 font-medium"
                    />
                  </div>

                  {finalTotal > 0 && (
                    <div className="p-3 bg-white/60 rounded-lg border border-violet-100">
                      <div className="text-xs text-violet-600 leading-relaxed font-medium">
                        {numInstallments}x de <strong className="text-violet-900">{formatCurrency(installmentAmount)}</strong>
                        <div className="mt-1 opacity-80">Total parcelado: {formatCurrency(finalTotal)}</div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Warnings */}
              {needsCustomer && !customerId && (
                <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                  ⚠️ {selectedMethod.label} requer um cliente selecionado
                </p>
              )}

              <Button
                size="lg"
                className="w-full h-12 text-base"
                onClick={handleFinish}
                isLoading={createSaleMutation.isPending}
                disabled={cart.length === 0 || (needsCustomer && !customerId)}
              >
                Finalizar Venda
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const PAYMENT_LABELS: Record<string, string> = {
  money: "Dinheiro",
  debit_card: "Cartão Débito",
  credit_card: "Cartão Crédito",
  pix: "Pix",
  fiado: "Fiado",
  installment: "Parcelado",
  cash: "À Vista",
};

export default function Sales() {
  const { data: sales, isLoading } = useListSales();
  const [showModal, setShowModal] = useState(false);

  return (
    <Layout>
      <div className="space-y-8">
        {/* Premium Header with Gradient */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-800 p-8 text-white shadow-2xl">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-24 h-24 bg-white/5 rounded-full blur-2xl"></div>
          
          <div className="relative z-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <h1 className="text-4xl font-bold mb-2">Vendas</h1>
                <p className="text-emerald-100 text-lg">Gerencie transações e acompanhe o desempenho em tempo real</p>
              </div>
              <Button 
                onClick={() => setShowModal(true)} 
                size="lg" 
                className="shrink-0 bg-white text-emerald-700 hover:bg-emerald-50 border-none shadow-xl transform transition hover:scale-105"
              >
                <Plus className="w-6 h-6 mr-2" />
                Nova Venda
              </Button>
            </div>
          </div>
        </div>

        {/* Sales Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="p-6 bg-white border-emerald-100 shadow-lg relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:scale-125 transition-transform">
              <ShoppingCart className="w-12 h-12 text-emerald-600" />
            </div>
            <p className="text-sm font-medium text-muted-foreground mb-1 uppercase tracking-wider">Total de Vendas</p>
            <p className="text-3xl font-bold text-foreground">{(sales || []).length}</p>
          </Card>
          
          <Card className="p-6 bg-white border-blue-100 shadow-lg relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:scale-125 transition-transform">
              <DollarSign className="w-12 h-12 text-blue-600" />
            </div>
            <p className="text-sm font-medium text-muted-foreground mb-1 uppercase tracking-wider">Volume Total</p>
            <p className="text-3xl font-bold text-foreground">{formatCurrency((sales || []).reduce((acc, s) => acc + Number(s.final_amount), 0))}</p>
          </Card>

          <Card className="p-6 bg-white border-amber-100 shadow-lg relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:scale-125 transition-transform">
              <CreditCard className="w-12 h-12 text-amber-600" />
            </div>
            <p className="text-sm font-medium text-muted-foreground mb-1 uppercase tracking-wider">Pendente</p>
            <p className="text-3xl font-bold text-foreground">
              {formatCurrency((sales || []).filter(s => s.status === 'pending').reduce((acc, s) => acc + Number(s.final_amount), 0))}
            </p>
          </Card>

          <Card className="p-6 bg-white border-purple-100 shadow-lg relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:scale-125 transition-transform">
              <Smartphone className="w-12 h-12 text-purple-600" />
            </div>
            <p className="text-sm font-medium text-muted-foreground mb-1 uppercase tracking-wider">Ticket Médio</p>
            <p className="text-3xl font-bold text-foreground">
              {formatCurrency(sales && sales.length > 0 ? (sales.reduce((acc, s) => acc + Number(s.final_amount), 0) / sales.length) : 0)}
            </p>
          </Card>
        </div>

        <Card className="overflow-hidden shadow-xl border-border/50">
          <div className="px-6 py-5 border-b border-border bg-slate-50/50 flex items-center justify-between">
            <h2 className="text-xl font-bold">Histórico de Transações</h2>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input placeholder="Buscar venda..." className="pl-9 h-10 w-64" />
              </div>
            </div>
          </div>
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse min-w-[700px]">
          <thead>
            <tr className="border-b border-border bg-secondary/30">
              <th className="p-4 font-semibold text-sm text-muted-foreground">ID / Data</th>
              <th className="p-4 font-semibold text-sm text-muted-foreground">Cliente</th>
              <th className="p-4 font-semibold text-sm text-muted-foreground">Pagamento</th>
              <th className="p-4 font-semibold text-sm text-muted-foreground">Status</th>
              <th className="p-4 font-semibold text-sm text-muted-foreground text-right">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading ? (
              <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">Carregando...</td></tr>
            ) : !sales || sales.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-16 text-center">
                  <ShoppingCart className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">Nenhuma venda registrada.</p>
                  <p className="text-muted-foreground text-sm mt-1">Clique em "Nova Venda" para começar.</p>
                </td>
              </tr>
            ) : (
              [...sales].sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).map(sale => (
                <tr key={sale.id} className="hover:bg-secondary/20 transition-colors">
                  <td className="p-4">
                    <div className="font-bold text-foreground">#{sale.id.substring(0, 8)}</div>
                    <div className="text-xs text-muted-foreground">{formatDate(sale.created_at, true)}</div>
                  </td>
                  <td className="p-4 font-medium">
                    {sale.customer?.name || <span className="text-muted-foreground italic">Cliente Balcão</span>}
                  </td>
                  <td className="p-4">
                    <Badge variant={sale.payment_method === "fiado" ? "warning" : "default"}>
                      {PAYMENT_LABELS[sale.payment_method] ?? sale.payment_method}
                      {sale.notes?.includes('Parcelado') ? " (Parcelado)" : ""}
                    </Badge>
                  </td>
                  <td className="p-4">
                    <Badge 
                      variant={sale.status === "completed" ? "success" : sale.status === "pending" ? "warning" : "default"}
                      className={sale.status === "pending" ? "bg-amber-100 text-amber-800 border-amber-200" : ""}
                    >
                      {sale.status === "completed" ? "Finalizada" : sale.status === "pending" ? "Pendente" : sale.status}
                    </Badge>
                  </td>
                  <td className="p-4 text-right font-bold text-lg">{formatCurrency(sale.final_amount)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        </div>
        </Card>
      </div>

      {showModal && <NewSaleModal onClose={() => setShowModal(false)} />}
    </Layout>
  );
}
