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
  ChevronDown,
  ChevronRight
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

interface NavItem {
  href: string;
  label: string;
  icon: any;
}

interface NavGroup {
  label: string;
  items: NavItem[];
  collapsible?: boolean;
}

const navGroups: NavGroup[] = [
  {
    label: "Principal",
    items: [
      { href: "/", label: "Dashboard", icon: LayoutDashboard },
      { href: "/vendas", label: "Vendas", icon: ShoppingCart },
      { href: "/produtos", label: "Produtos", icon: PackageSearch },
      { href: "/clientes", label: "Clientes", icon: Users },
      { href: "/fornecedores", label: "Fornecedores", icon: Truck },
      { href: "/reports", label: "Relatórios", icon: PieChart },
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
    collapsible: true, // Deixar menu oculto por padrão
    items: [
      { href: "/users", label: "Usuários", icon: UserCheck },
      { href: "/roles", label: "Permissões", icon: Shield },
      { href: "/settings", label: "Configurações", icon: Settings },
      { href: "/logs", label: "Logs", icon: FileText },
      { href: "/backup", label: "Backup", icon: Database },
      { href: "/notifications", label: "Notificações", icon: Bell },
      { href: "/help", label: "Ajuda", icon: HelpCircle },
    ],
  },
  {
    label: "Monitoramento",
    collapsible: true, // Deixar menu oculto por padrão
    items: [
      { href: "/activity", label: "Atividade", icon: Activity },
      { href: "/analytics", label: "Análise", icon: PieChart },
    ],
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(["Principal", "Financeiro"]));

  const toggleGroup = (label: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(label)) {
      newExpanded.delete(label);
    } else {
      newExpanded.add(label);
    }
    setExpandedGroups(newExpanded);
  };

  const NavLinks = ({ onClick }: { onClick?: () => void }) => (
    <>
      {navGroups.map((group) => {
        const isExpanded = expandedGroups.has(group.label);
        
        return (
          <div key={group.label} className="mb-4">
            <button 
              onClick={() => group.collapsible ? toggleGroup(group.label) : null}
              className={cn(
                "w-full flex items-center justify-between px-4 mb-2 group transition-colors",
                group.collapsible ? "cursor-pointer hover:bg-slate-50 py-1 rounded-md" : "cursor-default"
              )}
            >
              <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">{group.label}</p>
              {group.collapsible && (
                isExpanded ? <ChevronDown className="w-3 h-3 text-muted-foreground/40" /> : <ChevronRight className="w-3 h-3 text-muted-foreground/40" />
              )}
            </button>
            
            <AnimatePresence initial={false}>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden space-y-1"
                >
                  {group.items.map((item) => {
                    const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={onClick}
                        className={cn(
                          "flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium transition-all duration-200 group relative text-sm",
                          isActive
                            ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                            : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                        )}
                      >
                        <item.icon className={cn("w-4 h-4", isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-primary")} />
                        {item.label}
                      </Link>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
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
              <nav className="flex flex-col flex-1 overflow-y-auto pr-2 custom-scrollbar">
                <NavLinks onClick={() => setIsMobileOpen(false)} />
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <div className="hidden md:flex flex-col w-72 bg-card border-r border-border min-h-screen sticky top-0 shadow-sm z-20">
        <div className="p-6">
          <div className="flex items-center gap-3 text-primary font-display font-bold text-2xl mb-8 px-2 transition-transform hover:scale-[1.02]">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Store className="w-6 h-6 text-primary" />
            </div>
            <span>VarejoPro</span>
          </div>
          <nav className="flex flex-col flex-1 overflow-y-auto pr-2 max-h-[calc(100vh-180px)] custom-scrollbar">
            <NavLinks />
          </nav>
        </div>
        
        <div className="mt-auto p-6 border-t border-border">
          <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10">
            <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-2 flex items-center gap-1.5">
              <Activity className="w-3 h-3" /> Sistema
            </p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
              Operacional Online
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 bg-slate-50/30">
        <div className="flex-1 p-4 md:p-8 xl:p-10 max-w-[1400px] w-full mx-auto">
          <motion.div
            key={location}
            initial={{ opacity: 0, scale: 0.99 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="w-full h-full"
          >
            {children}
          </motion.div>
        </div>
      </main>
    </div>
  );
}
