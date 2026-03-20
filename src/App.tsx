import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import { useEffect, ReactNode } from "react";

import Dashboard from "@/pages/dashboard";
import Products from "@/pages/products";
import ProductForm from "@/pages/product-form";
import Customers from "@/pages/customers";
import CustomerDetail from "@/pages/customer-detail";
import Suppliers from "@/pages/suppliers";
import Sales from "@/pages/sales";
import UserManagement from "@/pages/users";
import Roles from "@/pages/roles";
import Login from "@/pages/login";
import Register from "@/pages/register";
import Payables from "@/pages/payables";
import Receivables from "@/pages/receivables";
import Reports from "@/pages/reports";
import ComingSoon from "@/pages/coming-soon";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient();

// Componente para rotas protegidas
function ProtectedRoute({ component: Component, ...rest }: { component: any; [key: string]: any }) {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!loading && !user) {
      setLocation("/login");
    }
  }, [user, loading, setLocation]);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return user ? <Component {...rest} /> : null;
}

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      
      {/* Rotas Protegidas */}
      <Route path="/">
        <ProtectedRoute component={Dashboard} />
      </Route>
      
      <Route path="/produtos">
        <ProtectedRoute component={Products} />
      </Route>
      <Route path="/produtos/novo">
        <ProtectedRoute component={ProductForm} />
      </Route>
      <Route path="/produtos/:id/editar">
        <ProtectedRoute component={ProductForm} />
      </Route>
      
      <Route path="/clientes">
        <ProtectedRoute component={Customers} />
      </Route>
      <Route path="/clientes/:id">
        <ProtectedRoute component={CustomerDetail} />
      </Route>
      
      <Route path="/fornecedores">
        <ProtectedRoute component={Suppliers} />
      </Route>
      
      <Route path="/vendas">
        <ProtectedRoute component={Sales} />
      </Route>
      
      <Route path="/contas-pagar">
        <ProtectedRoute component={Payables} />
      </Route>
      <Route path="/contas-receber">
        <ProtectedRoute component={Receivables} />
      </Route>
      
      <Route path="/users">
        <ProtectedRoute component={UserManagement} />
      </Route>
      <Route path="/roles">
        <ProtectedRoute component={Roles} />
      </Route>
      
      {/* Páginas em construção */}
      <Route path="/settings">
        <ProtectedRoute component={() => <ComingSoon title="Configurações" />} />
      </Route>
      <Route path="/logs">
        <ProtectedRoute component={() => <ComingSoon title="Logs do Sistema" />} />
      </Route>
      <Route path="/reports">
        <ProtectedRoute component={Reports} />
      </Route>
      <Route path="/backup">
        <ProtectedRoute component={() => <ComingSoon title="Backup" />} />
      </Route>
      <Route path="/notifications">
        <ProtectedRoute component={() => <ComingSoon title="Notificações" />} />
      </Route>
      <Route path="/help">
        <ProtectedRoute component={() => <ComingSoon title="Ajuda" />} />
      </Route>
      <Route path="/activity">
        <ProtectedRoute component={() => <ComingSoon title="Atividade" />} />
      </Route>
      <Route path="/analytics">
        <ProtectedRoute component={() => <ComingSoon title="Análise" />} />
      </Route>
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
