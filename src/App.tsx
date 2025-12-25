import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { OrganizationProvider } from "@/contexts/OrganizationContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Cadastro from "./pages/Cadastro";
import EsqueciSenha from "./pages/EsqueciSenha";
import RedefinirSenha from "./pages/RedefinirSenha";
import AcessoNegado from "./pages/AcessoNegado";
import Dashboard from "./pages/Dashboard";
import Pacientes from "./pages/Pacientes";
import Profissionais from "./pages/Profissionais";
import Agenda from "./pages/Agenda";
import Financeiro from "./pages/Financeiro";
import NotFound from "./pages/NotFound";
import TenantLogin from "./pages/TenantLogin";
import NewClinic from "./pages/NewClinic";
import Subscription from "./pages/Subscription";
import PaymentCallback from "./pages/PaymentCallback";
import WhatsappConfigPage from "./pages/WhatsappConfig";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <OrganizationProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Public Global Routes */}
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/cadastro" element={<Cadastro />} />
              <Route path="/nova-clinica" element={<NewClinic />} />
              <Route path="/esqueci-senha" element={<EsqueciSenha />} />
              <Route path="/redefinir-senha" element={<RedefinirSenha />} />
              <Route path="/acesso-negado" element={<AcessoNegado />} />

              {/* Tenant Login Portal */}
              <Route path="/portal/:slug" element={<TenantLogin />} />
              <Route path="/portal/callback" element={<PaymentCallback />} />

              {/* Protected Routes (Dashboard) */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/financeiro"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <Financeiro />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/agenda"
                element={
                  <ProtectedRoute>
                    <Agenda />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/pacientes"
                element={
                  <ProtectedRoute>
                    <Pacientes />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profissionais"
                element={
                  <ProtectedRoute>
                    <Profissionais />
                  </ProtectedRoute>
                }
              />

              {/* Subscription Management */}
              <Route
                path="/portal/:slug/assinatura"
                element={
                  <ProtectedRoute>
                     <Subscription />
                  </ProtectedRoute>
                }
              />

               {/* Whatsapp Config */}
               <Route
                path="/portal/:slug/configuracoes/whatsapp"
                element={
                  <ProtectedRoute allowedRoles={['admin', 'recepcionista']}>
                     <WhatsappConfigPage />
                  </ProtectedRoute>
                }
              />

              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </OrganizationProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
