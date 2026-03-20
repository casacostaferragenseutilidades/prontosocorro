import React from "react";
import { Layout } from "@/components/layout";
import { Card, Badge, Button } from "@/components/ui-elements";
import { useGetDashboard } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/utils";
import { DollarSign, TrendingUp, AlertTriangle, Package, Loader2, ShoppingCart, CreditCard, Activity, Users, ChevronRight } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Area, AreaChart } from "recharts";
import { useLocation } from "wouter";

export default function Dashboard() {
  const { data, isLoading, error } = useGetDashboard();
  const [, setLocation] = useLocation();

  if (isLoading) return (
    <Layout>
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground font-medium">Sincronizando dados reais...</p>
        </div>
      </div>
    </Layout>
  );

  if (error || !data) return (
    <Layout>
      <div className="text-center py-20">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-destructive/10 rounded-full mb-4">
          <AlertTriangle className="w-8 h-8 text-destructive" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Erro ao carregar o Dashboard</h2>
        <p className="text-muted-foreground">Tente novamente ou verifique sua conexão.</p>
      </div>
    </Layout>
  );

  const stats = [
    { 
      title: "Vendas hoje", 
      value: formatCurrency(data.totalSalesToday), 
      icon: DollarSign, 
      color: "text-emerald-600", 
      bg: "bg-emerald-50",
      trend: "Tempo real"
    },
    { 
      title: "Faturamento Mensal", 
      value: formatCurrency(data.totalSalesMonth), 
      icon: TrendingUp, 
      color: "text-blue-600", 
      bg: "bg-blue-50",
      trend: "Meta 30 dias"
    },
    { 
      title: "Fiado a Receber", 
      value: formatCurrency(data.totalDebtOutstanding), 
      icon: AlertTriangle, 
      color: "text-amber-600", 
      bg: "bg-amber-50",
      trend: `${data.customersWithDebt} clientes`
    },
    { 
      title: "Estoque Baixo", 
      value: data.lowStockCount, 
      icon: Package, 
      color: "text-red-600", 
      bg: "bg-red-50",
      trend: "Itens críticos"
    },
  ];

  return (
    <Layout>
      <div className="space-y-8 pb-10">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-foreground">Dashboard Geral</h1>
            <p className="text-muted-foreground mt-1 text-lg font-medium">Análise de performance e operações em tempo real.</p>
          </div>
          <div className="flex gap-3">
            <Button onClick={() => setLocation("/vendas")} className="bg-primary shadow-lg shadow-primary/20 hover:scale-105 transition-transform font-bold">
              <ShoppingCart className="w-4 h-4 mr-2" /> Venda Rápida
            </Button>
          </div>
        </div>

        {/* Real Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <Card key={i} className="p-6 border-border/50 hover:shadow-2xl hover:border-primary/20 transition-all duration-300 group">
              <div className="flex justify-between items-start mb-4">
                <div className={`${stat.bg} p-3 rounded-2xl group-hover:scale-110 transition-transform`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-wider opacity-70">{stat.trend}</Badge>
              </div>
              <div>
                <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-1">{stat.title}</p>
                <p className="text-3xl font-extrabold text-foreground tracking-tight">{stat.value}</p>
              </div>
            </Card>
          ))}
        </div>

        {/* Main Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Revenue Chart */}
          <Card className="lg:col-span-2 p-8 shadow-xl border-border/40 overflow-hidden relative">
            <div className="flex items-center justify-between mb-8 relative z-10">
              <div>
                <h2 className="text-2xl font-bold">Histórico de Faturamento</h2>
                <p className="text-muted-foreground text-sm font-medium">Vendas dos últimos 30 dias agrupadas por data.</p>
              </div>
              <Activity className="w-8 h-8 text-primary/20" />
            </div>
            
            <div className="h-[400px] w-full relative z-10">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 600}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 600}} />
                  <Tooltip 
                    contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 40px rgba(0,0,0,0.1)', fontWeight: 'bold'}}
                    formatter={(val: number) => [formatCurrency(val), 'Vendas']}
                  />
                  <Area type="monotone" dataKey="sales" stroke="#3B82F6" strokeWidth={4} fillOpacity={1} fill="url(#colorSales)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Top Products */}
          <Card className="p-8 shadow-xl border-border/40">
             <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold">Produtos Top</h2>
              <Badge variant="success">Top 5</Badge>
            </div>
            <div className="space-y-6">
              {data.topProducts.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground italic">Sem vendas registradas</div>
              ) : (
                data.topProducts.map((p: any, i: number) => (
                  <div key={i} className="flex items-center justify-between group">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-bold text-slate-600 transition-colors group-hover:bg-primary group-hover:text-white">
                        {i + 1}
                      </div>
                      <div>
                        <p className="font-bold text-foreground text-sm truncate max-w-[120px]">{p.product_name}</p>
                        <p className="text-xs text-muted-foreground">{p.quantity} vendidos</p>
                      </div>
                    </div>
                    <p className="font-extrabold text-primary">{formatCurrency(p.total_price)}</p>
                  </div>
                ))
              )}
            </div>
            <div className="mt-8 pt-6 border-t border-border">
              <Button onClick={() => setLocation("/produtos")} variant="ghost" className="w-full justify-between font-bold text-primary hover:bg-primary/5">
                Gerenciar Estoque <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Sales with Real Data */}
          <Card className="shadow-xl border-border/40 overflow-hidden">
            <div className="p-8 border-b border-border flex items-center justify-between bg-slate-50/50">
              <h2 className="text-2xl font-bold">Transações Recentes</h2>
              <Button onClick={() => setLocation("/vendas")} variant="outline" size="sm" className="font-bold">Ver Tudo</Button>
            </div>
            <div className="divide-y divide-border">
              {data.recentSales.length === 0 ? (
                <div className="p-16 text-center text-muted-foreground italic">Nenhuma venda encontrada</div>
              ) : (
                data.recentSales.map((sale: any) => (
                  <div key={sale.id} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => setLocation("/vendas")}>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary font-bold">
                        {sale.customer?.name?.substring(0, 2).toUpperCase() || "CB"}
                      </div>
                      <div>
                        <p className="font-bold text-foreground">{sale.customer?.name || "Consumidor Final"}</p>
                        <p className="text-xs text-muted-foreground font-medium">{formatDate(sale.created_at, true)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-extrabold text-lg tracking-tight text-foreground">{formatCurrency(sale.final_amount)}</p>
                      <Badge variant={sale.status === 'completed' || sale.status === 'paid' ? 'success' : 'warning'} className="text-[10px] uppercase font-bold px-2 py-0">
                        {sale.status === 'completed' || sale.status === 'paid' ? 'Pago' : 'Pendente'}
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Card className="p-8 bg-gradient-to-br from-violet-600 to-indigo-700 text-white shadow-xl flex flex-col justify-between">
              <div>
                <Users className="w-10 h-10 mb-4 opacity-70" />
                <h3 className="text-xl font-bold mb-1">Base de Clientes</h3>
                <p className="text-violet-100 text-sm">Total de cadastros ativos.</p>
              </div>
              <p className="text-5xl font-black mt-6">{data.totalCustomers}</p>
            </Card>
            <Card className="p-8 bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-xl flex flex-col justify-between">
              <div>
                <Package className="w-10 h-10 mb-4 opacity-70" />
                <h3 className="text-xl font-bold mb-1">Produtos no Mix</h3>
                <p className="text-emerald-100 text-sm">Diversidade do catálogo.</p>
              </div>
              <p className="text-5xl font-black mt-6">{data.totalProducts}</p>
            </Card>
            <Card className="p-8 lg:col-span-2 bg-slate-900 text-white shadow-xl border-none relative overflow-hidden group">
               <div className="relative z-10 flex items-center justify-between">
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold">Resumo Financeiro</h3>
                  <p className="text-slate-400 font-medium">Contas e recebíveis pendentes hoje.</p>
                  <p className="text-4xl font-black text-amber-400 mt-4">{formatCurrency(data.pendingReceivables)}</p>
                </div>
                <CreditCard className="w-20 h-20 text-white/5 absolute -right-4 -bottom-4 group-hover:scale-110 transition-transform" />
              </div>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
