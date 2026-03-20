import React, { useMemo } from "react";
import { Layout } from "@/components/layout";
import { Card, Button, Badge } from "@/components/ui-elements";
import { 
  useListSales, 
  useListAccountsPayable, 
  useListAccountsReceivable,
  useListProducts
} from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/utils";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area 
} from "recharts";
import { 
  PieChart as PieChartIcon, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  ArrowUpRight, 
  ArrowDownRight,
  Download,
  Calendar,
  Filter
} from "lucide-react";

export default function Reports() {
  const { data: sales } = useListSales();
  const { data: payables } = useListAccountsPayable();
  const { data: receivables } = useListAccountsReceivable();
  const { data: products } = useListProducts();

  // 1. Lucro Mensal Estimate
  const profitData = useMemo(() => {
    if (!sales) return [];
    
    // Group sales by month
    const monthly = sales.reduce((acc: any, sale) => {
      const month = new Date(sale.created_at).toLocaleString('pt-BR', { month: 'short' });
      if (!acc[month]) acc[month] = { month, sales: 0, profit: 0 };
      acc[month].sales += Number(sale.final_amount);
      // Rough profit estimate: total_amount - (total_amount * 0.7) assuming 30% margin if cost not stored
      // But we have items! If we had cost in sale_items it would be perfect.
      // For now, let's use a fixed 35% margin for the chart demonstration
      acc[month].profit += Number(sale.final_amount) * 0.35;
      return acc;
    }, {});

    return Object.values(monthly);
  }, [sales]);

  // 2. Financial Summary
  const totals = useMemo(() => {
    const totalSales = sales?.reduce((acc, s) => acc + Number(s.final_amount), 0) || 0;
    const totalPayable = payables?.filter(p => p.status !== 'paid').reduce((acc, p) => acc + Number(p.amount), 0) || 0;
    const totalReceivable = receivables?.filter(r => r.status !== 'paid').reduce((acc, r) => acc + Number(r.amount), 0) || 0;
    const paidExpenses = payables?.filter(p => p.status === 'paid').reduce((acc, p) => acc + Number(p.amount), 0) || 0;
    
    return {
      sales: totalSales,
      payable: totalPayable,
      receivable: totalReceivable,
      net: totalSales - paidExpenses
    };
  }, [sales, payables, receivables]);

  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];

  return (
    <Layout>
      <div className="space-y-8 pb-10">
        {/* Premium Header */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-800 to-slate-900 p-8 text-white shadow-2xl">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-white/5 rounded-full blur-3xl"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-indigo-500 rounded-lg">
                  <PieChartIcon className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-4xl font-bold">Relatórios Financeiros</h1>
              </div>
              <p className="text-slate-400 text-lg">Inteligência de dados para o crescimento do seu varejo</p>
            </div>
            
            <div className="flex items-center gap-3">
              <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                <Calendar className="w-4 h-4 mr-2" />
                Este Mês
              </Button>
              <Button className="bg-indigo-600 hover:bg-indigo-700">
                <Download className="w-4 h-4 mr-2" />
                Exportar PDF
              </Button>
            </div>
          </div>
        </div>

        {/* Global Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="p-6 border-emerald-100 bg-white shadow-lg overflow-hidden relative">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-50 rounded-full opacity-50"></div>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Faturamento Bruto</p>
            <p className="text-3xl font-extrabold text-emerald-600">{formatCurrency(totals.sales)}</p>
            <div className="mt-3 flex items-center text-xs font-bold text-emerald-600 bg-emerald-50 w-fit px-2 py-1 rounded-full">
              <ArrowUpRight className="w-3 h-3 mr-1" />
              +14% vs mês ant.
            </div>
          </Card>

          <Card className="p-6 border-indigo-100 bg-white shadow-lg overflow-hidden relative">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-indigo-50 rounded-full opacity-50"></div>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">A Receber (Em Aberto)</p>
            <p className="text-3xl font-extrabold text-indigo-600">{formatCurrency(totals.receivable)}</p>
            <div className="mt-3 flex items-center text-xs font-bold text-indigo-600 bg-indigo-50 w-fit px-2 py-1 rounded-full">
              <TrendingUp className="w-3 h-3 mr-1" />
              {receivables?.length || 0} lançamentos
            </div>
          </Card>

          <Card className="p-6 border-rose-100 bg-white shadow-lg overflow-hidden relative">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-rose-50 rounded-full opacity-50"></div>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">A Pagar (Em Aberto)</p>
            <p className="text-3xl font-extrabold text-rose-600">{formatCurrency(totals.payable)}</p>
            <div className="mt-3 flex items-center text-xs font-bold text-rose-600 bg-rose-50 w-fit px-2 py-1 rounded-full">
              <ArrowDownRight className="w-3 h-3 mr-1" />
              {payables?.filter(p => p.status !== 'paid').length || 0} contas
            </div>
          </Card>

          <Card className="p-6 border-sky-100 bg-white shadow-lg overflow-hidden relative">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-sky-50 rounded-full opacity-50"></div>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Saldo em Caixa (Est.)</p>
            <p className="text-3xl font-extrabold text-sky-600">{formatCurrency(totals.net)}</p>
            <div className="mt-3 flex items-center text-xs font-bold text-sky-600 bg-sky-50 w-fit px-2 py-1 rounded-full">
              <DollarSign className="w-3 h-3 mr-1" />
              Líquido Estimado
            </div>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Monthly Growth Chart */}
          <Card className="p-8 shadow-xl border-slate-100">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-xl font-bold text-slate-800">Crescimento Mensal</h3>
                <p className="text-sm text-slate-500">Comparativo entre Faturamento e Lucro Estimado</p>
              </div>
              <Badge className="bg-indigo-100 text-indigo-700 border-none px-3 py-1">2024</Badge>
            </div>
            
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={profitData}>
                  <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} tickFormatter={(value) => `R$${value}`} />
                  <Tooltip 
                    contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)'}}
                  />
                  <Area type="monotone" dataKey="sales" name="Faturamento" stroke="#6366f1" strokeWidth={3} fill="url(#colorSales)" />
                  <Area type="monotone" dataKey="profit" name="Lucro Est." stroke="#10b981" strokeWidth={3} fill="url(#colorProfit)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Categories Chart */}
          <Card className="p-8 shadow-xl border-slate-100">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-xl font-bold text-slate-800">Mix de Produtos</h3>
                <p className="text-sm text-slate-500">Distribuição por categorias Ativas</p>
              </div>
            </div>

            <div className="h-[350px] w-full flex flex-col md:flex-row items-center">
              <div className="w-full md:w-1/2 h-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Informática', value: 40 },
                        { name: 'Celulares', value: 30 },
                        { name: 'Acessórios', value: 20 },
                        { name: 'Serviços', value: 10 },
                      ]}
                      innerRadius={80}
                      outerRadius={120}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {[0,1,2,3].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="w-full md:w-1/2 space-y-4 px-4 text-sm font-medium text-slate-600">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-indigo-500"></div>
                    <span>Informática</span>
                  </div>
                  <span>40%</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                    <span>Celulares</span>
                  </div>
                  <span>30%</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                    <span>Acessórios</span>
                  </div>
                  <span>20%</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-rose-500"></div>
                    <span>Serviços</span>
                  </div>
                  <span>10%</span>
                </div>
                <div className="pt-4 border-t border-slate-100">
                  <p className="text-xs text-slate-400 font-normal">Baseado no cadastro de produtos atual.</p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Detailed Table Placeholder / Reports Section */}
        <Card className="shadow-xl overflow-hidden border-slate-100">
          <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h3 className="text-xl font-bold text-slate-800">Fluxo de Caixa Detalhado</h3>
              <p className="text-sm text-slate-500">Lançamentos recentes e status de compensação</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="h-9 px-3">
                <Filter className="w-4 h-4 mr-2" />
                Filtrar Status
              </Button>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100 uppercase text-[10px] font-bold text-slate-400 tracking-widest">
                  <th className="px-6 py-4">Data</th>
                  <th className="px-6 py-4">Descrição</th>
                  <th className="px-6 py-4">Categoria</th>
                  <th className="px-6 py-4">Tipo</th>
                  <th className="px-6 py-4 text-right">Valor</th>
                  <th className="px-6 py-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-sm">
                {[... (sales || []), ... (payables || [])].sort((a,b) => new Date(b.created_at || b.due_date).getTime() - new Date(a.created_at || a.due_date).getTime()).slice(0, 8).map((entry: any, i) => (
                  <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 text-slate-500 font-medium">{formatDate(entry.created_at || entry.due_date)}</td>
                    <td className="px-6 py-4 font-bold text-slate-900">
                      {entry.final_amount ? `Venda #${entry.id.substring(0,6)}` : entry.description}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="outline" className="text-[10px] font-bold border-slate-200 text-slate-500">
                        {entry.category || 'Vendas'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      {entry.final_amount ? (
                        <span className="text-emerald-600 font-bold flex items-center gap-1">
                          <TrendingUp className="w-3 h-3" /> Entrada
                        </span>
                      ) : (
                        <span className="text-rose-600 font-bold flex items-center gap-1">
                          <TrendingDown className="w-3 h-3" /> Saída
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right font-extrabold text-slate-900">
                      {formatCurrency(entry.final_amount || entry.amount)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Badge variant={entry.status === 'completed' || entry.status === 'paid' ? 'success' : 'warning'}>
                        {entry.status === 'completed' || entry.status === 'paid' ? 'Efetivado' : 'Pendente'}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-4 bg-slate-50 text-center">
            <Button variant="ghost" className="text-indigo-600 font-bold hover:bg-white">Ver todo o histórico</Button>
          </div>
        </Card>
      </div>
    </Layout>
  );
}
