import React from "react";
import { Layout } from "@/components/layout";
import { Card, Badge, Button } from "@/components/ui-elements";
import { useGetDashboard } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/utils";
import { DollarSign, TrendingUp, AlertTriangle, Package, Loader2, ShoppingCart, CreditCard, Activity, Target, Zap, Users } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LineChart, Line, Area, AreaChart } from "recharts";

export default function Dashboard() {
  const { data, isLoading, error } = useGetDashboard();

  if (isLoading) return (
    <Layout>
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando dashboard...</p>
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
        <h2 className="text-2xl font-bold text-foreground mb-2">Erro ao carregar dashboard</h2>
        <p className="text-muted-foreground">Tente novamente mais tarde.</p>
      </div>
    </Layout>
  );

  const statCards = [
    { 
      title: "Vendas Hoje", 
      value: formatCurrency(data.totalSalesToday), 
      icon: DollarSign, 
      color: "text-emerald-600", 
      bg: "bg-gradient-to-r from-emerald-500/10 to-emerald-600/10",
      border: "border-emerald-200",
      trend: "+12.5%",
      iconBg: "bg-emerald-100"
    },
    { 
      title: "Vendas Mês", 
      value: formatCurrency(data.totalSalesMonth), 
      icon: TrendingUp, 
      color: "text-blue-600", 
      bg: "bg-gradient-to-r from-blue-500/10 to-blue-600/10",
      border: "border-blue-200",
      trend: "+8.2%",
      iconBg: "bg-blue-100"
    },
    { 
      title: "Fiado a Receber", 
      value: formatCurrency(data.totalDebtOutstanding), 
      icon: AlertTriangle, 
      color: "text-amber-600", 
      bg: "bg-gradient-to-r from-amber-500/10 to-amber-600/10",
      border: "border-amber-200",
      trend: "-3.1%",
      iconBg: "bg-amber-100"
    },
    { 
      title: "Clientes com Dívida", 
      value: data.customersWithDebt, 
      icon: Users, 
      color: "text-purple-600", 
      bg: "bg-gradient-to-r from-purple-500/10 to-purple-600/10",
      border: "border-purple-200",
      trend: "+2",
      iconBg: "bg-purple-100"
    },
    { 
      title: "Estoque Baixo", 
      value: data.lowStockCount, 
      icon: Package, 
      color: "text-red-600", 
      bg: "bg-gradient-to-r from-red-500/10 to-red-600/10",
      border: "border-red-200",
      trend: "0",
      iconBg: "bg-red-100"
    },
  ];

  // Enhanced data for charts
  const salesData = [
    { month: "Jan", sales: 4000, orders: 240 },
    { month: "Fev", sales: 3000, orders: 180 },
    { month: "Mar", sales: 5000, orders: 320 },
    { month: "Abr", sales: 4500, orders: 280 },
    { month: "Mai", sales: 6000, orders: 380 },
    { month: "Jun", sales: 5500, orders: 350 },
  ];

  const revenueData = [
    { name: "Seg", revenue: 1200, profit: 800 },
    { name: "Ter", revenue: 1800, profit: 1200 },
    { name: "Qua", revenue: 1500, profit: 900 },
    { name: "Qui", revenue: 2200, profit: 1400 },
    { name: "Sex", revenue: 2800, profit: 1800 },
    { name: "Sab", revenue: 3200, profit: 2100 },
    { name: "Dom", revenue: 2100, profit: 1300 },
  ];

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header with gradient background */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 p-8 text-white shadow-2xl">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-24 h-24 bg-white/5 rounded-full blur-2xl"></div>
          
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold mb-2">Visão Geral</h1>
                <p className="text-blue-100 text-lg">Acompanhe os resultados da sua loja em tempo real</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm text-blue-100">Meta Mensal</p>
                  <p className="text-2xl font-bold">R$ 50.000</p>
                </div>
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <Target className="w-6 h-6" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {statCards.map((stat, i) => (
            <Card key={i} className={`relative overflow-hidden border ${stat.border} bg-white shadow-lg hover:shadow-xl transition-all duration-300 group`}>
              {/* Gradient overlay */}
              <div className={`absolute inset-0 ${stat.bg} opacity-50`}></div>
              
              <div className="relative p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-14 h-14 ${stat.iconBg} rounded-2xl flex items-center justify-center shadow-lg`}>
                    <stat.icon className={`w-7 h-7 ${stat.color}`} />
                  </div>
                  <div className={`text-right`}>
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                      parseFloat(stat.trend) > 0 ? 'bg-emerald-100 text-emerald-700' : 
                      parseFloat(stat.trend) < 0 ? 'bg-red-100 text-red-700' : 
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {stat.trend}
                    </span>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-2">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
              
              {/* Hover effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            </Card>
          ))}
        </div>

        {/* Enhanced Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Chart */}
          <Card className="p-8 lg:col-span-2 shadow-xl border-gray-100">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Análise de Vendas</h2>
                <p className="text-gray-600 mt-1">Tendência dos últimos 6 meses</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">Mês</Button>
                <Button variant="outline" size="sm">Ano</Button>
              </div>
            </div>
            
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={salesData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} />
                  <Tooltip 
                    contentStyle={{borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 4px 20px rgba(0,0,0,0.1)'}}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="sales" 
                    stroke="#3B82F6" 
                    fillOpacity={1} 
                    fill="url(#colorRevenue)" 
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Revenue Stats */}
          <div className="space-y-6">
            <Card className="p-6 shadow-xl border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Receita Semanal</h3>
                <Activity className="w-5 h-5 text-gray-400" />
              </div>
              
              <div className="space-y-4">
                {revenueData.slice(0, 5).map((day, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        index === 0 ? 'bg-blue-100' : 
                        index === 1 ? 'bg-emerald-100' : 
                        index === 2 ? 'bg-purple-100' : 
                        index === 3 ? 'bg-amber-100' : 
                        'bg-pink-100'
                      }`}>
                        <span className="text-xs font-bold">
                          {day.name.substring(0, 3)}
                        </span>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{formatCurrency(day.revenue)}</p>
                        <p className="text-sm text-gray-500">Lucro: {formatCurrency(day.profit)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">85%</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Quick Actions */}
            <Card className="p-6 shadow-xl border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Ações Rápidas</h3>
              <div className="space-y-3">
                <Button className="w-full justify-start gap-3" variant="outline">
                  <ShoppingCart className="w-5 h-5" />
                  Nova Venda
                </Button>
                <Button className="w-full justify-start gap-3" variant="outline">
                  <Users className="w-5 h-5" />
                  Cadastrar Cliente
                </Button>
                <Button className="w-full justify-start gap-3" variant="outline">
                  <Package className="w-5 h-5" />
                  Adicionar Produto
                </Button>
                <Button className="w-full justify-start gap-3" variant="outline">
                  <CreditCard className="w-5 h-5" />
                  Registrar Pagamento
                </Button>
              </div>
            </Card>
          </div>
        </div>

        {/* Products Chart */}
        <Card className="p-8 shadow-xl border-gray-100">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Produtos Mais Vendidos</h2>
              <p className="text-gray-600 mt-1">Top 5 produtos este mês</p>
            </div>
            <Badge variant="success">Atualizado</Badge>
          </div>
          
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.topProducts} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="productName" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} />
                <Tooltip 
                  cursor={{fill: '#f3f4f6'}}
                  contentStyle={{borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 4px 20px rgba(0,0,0,0.1)'}}
                />
                <Bar dataKey="totalSold" radius={[8, 8, 0, 0]}>
                  {data.topProducts.map((_, index) => {
                    const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];
                    return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Recent Sales */}
        <Card className="shadow-xl border-gray-100">
          <div className="p-8 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Vendas Recentes</h2>
              <Button variant="outline" size="sm">Ver Todas</Button>
            </div>
          </div>
          <div className="divide-y divide-gray-100">
            {data.recentSales.length === 0 ? (
              <div className="p-16 text-center">
                <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhuma venda recente</h3>
                <p className="text-gray-600">Comece registrando suas vendas</p>
              </div>
            ) : (
              data.recentSales.slice(0, 5).map((sale) => (
                <div key={sale.id} className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white font-bold">
                      {sale.customerName?.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{sale.customerName || "Cliente Balcão"}</p>
                      <p className="text-sm text-gray-600">{formatDate(sale.createdAt, true)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg text-gray-900">{formatCurrency(sale.total)}</p>
                    <Badge variant={sale.status === 'paid' ? 'success' : sale.status === 'pending' ? 'warning' : 'outline'}>
                      {sale.status === 'paid' ? 'Pago' : sale.status === 'pending' ? 'Pendente' : 'Parcial'}
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </Layout>
  );
}
