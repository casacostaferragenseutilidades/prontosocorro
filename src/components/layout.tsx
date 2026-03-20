import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  PackageSearch, 
  Users, 
  Truck, 
  ShoppingCart,
  Menu,
  X,
  Store,
  TrendingDown,
  TrendingUp,
  Settings,
  Shield,
  UserCheck,
  Activity,
  FileText,
  PieChart,
  Database,
  Bell,
  HelpCircle,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

const navGroups = [
  {
    label: "Principal",
    items: [
      { href: "/", label: "Dashboard", icon: LayoutDashboard },
      { href: "/vendas", label: "Vendas", icon: ShoppingCart },
      { href: "/produtos", label: "Produtos", icon: PackageSearch },
      { href: "/clientes", label: "Clientes", icon: Users },
      { href: "/fornecedores", label: "Fornecedores", icon: Truck },
    ],
  },
  {
    label: "Financeiro",
    items: [
      { href: "/contas-receber", label: "A Receber", icon: TrendingUp },
      { href: "/contas-pagar", label: "A Pagar", icon: TrendingDown },
    ],
  },
  {
    label: "Administração",
    items: [
      { href: "/users", label: "Usuários", icon: UserCheck },
      { href: "/roles", label: "Permissões", icon: Shield },
      { href: "/settings", label: "Configurações", icon: Settings },
      { href: "/logs", label: "Logs", icon: FileText },
      { href: "/reports", label: "Relatórios", icon: PieChart },
      { href: "/backup", label: "Backup", icon: Database },
      { href: "/notifications", label: "Notificações", icon: Bell },
      { href: "/help", label: "Ajuda", icon: HelpCircle },
    ],
  },
  {
    label: "Monitoramento",
    items: [
      { href: "/activity", label: "Atividade", icon: Activity },
      { href: "/analytics", label: "Análise", icon: PieChart },
    ],
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const NavLinks = ({ onClick }: { onClick?: () => void }) => (
    <>
      {navGroups.map((group) => (
        <div key={group.label} className="mb-4">
          <p className="text-xs font-bold text-muted-foreground/60 uppercase tracking-widest px-4 mb-1.5">{group.label}</p>
          {group.items.map((item) => {
            const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClick}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 group relative",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
              >
                <item.icon className={cn("w-5 h-5", isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-primary")} />
                {item.label}
              </Link>
            );
          })}
        </div>
      ))}
    </>
  );

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row font-sans">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-card border-b border-border sticky top-0 z-30">
        <div className="flex items-center gap-2 text-primary font-display font-bold text-xl">
          <Store className="w-6 h-6" />
          <span>VarejoPro</span>
        </div>
        <button onClick={() => setIsMobileOpen(true)} className="p-2 -mr-2 text-foreground">
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsMobileOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden"
            />
            <motion.div
              initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-72 bg-card border-r border-border z-50 p-6 flex flex-col shadow-2xl md:hidden"
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2 text-primary font-display font-bold text-2xl">
                  <Store className="w-8 h-8" />
                  <span>VarejoPro</span>
                </div>
                <button onClick={() => setIsMobileOpen(false)} className="p-2 -mr-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-secondary">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <nav className="flex flex-col flex-1 overflow-y-auto">
                <NavLinks onClick={() => setIsMobileOpen(false)} />
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <div className="hidden md:flex flex-col w-72 bg-card border-r border-border min-h-screen p-6 sticky top-0">
        <div className="flex items-center gap-3 text-primary font-display font-bold text-2xl mb-8 px-2">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Store className="w-6 h-6 text-primary" />
          </div>
          <span>VarejoPro</span>
        </div>
        <nav className="flex flex-col flex-1 overflow-y-auto">
          <NavLinks />
        </nav>
        <div className="mt-auto p-4 bg-accent/50 rounded-xl border border-accent">
          <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-1">Status do Sistema</p>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="w-2 h-2 rounded-full bg-success"></span>
            Sincronizado
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        <div className="flex-1 p-4 md:p-8 xl:p-10 max-w-7xl mx-auto w-full">
          <motion.div
            key={location}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="w-full h-full"
          >
            {children}
          </motion.div>
        </div>
      </main>
    </div>
  );
}
