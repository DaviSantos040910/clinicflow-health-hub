import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { OrganizationProvider } from "@/contexts/OrganizationContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Contato from "./pages/Contato";
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
import MasterDashboard from "./pages/MasterDashboard";
import { WhatsAppCTA } from "@/components/WhatsAppCTA";

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
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/contato" element={<Contato />} />
              <Route path="/cadastro" element={<Contato />} />
              <Route path="/nova-clinica" element={<Contato />} />
              <Route path="/esqueci-senha" element={<EsqueciSenha />} />
              <Route path="/redefinir-senha" element={<RedefinirSenha />} />
              <Route path="/acesso-negado" element={<AcessoNegado />} />

              {/* Tenant Login Portal */}
              <Route path="/portal/:slug" element={<TenantLogin />} />
              <Route path="/portal/callback" element={<PaymentCallback />} />

              {/* Master Admin Route - Custom Protection Check inside Page Component */}
              <Route path="/master-admin" element={<MasterDashboard />} />

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
                  // Updated roles to match new DB schema + added 'owner'
                  <ProtectedRoute allowedRoles={['admin', 'recepcionista', 'financeiro']}>
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
                  <ProtectedRoute allowedRoles={['admin', 'recepcionista', 'financeiro']}>
                    <Profissionais />
                  </ProtectedRoute>
                }
              />

              {/* Subscription Management */}
              <Route
                path="/portal/:slug/assinatura"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <Subscription />
                  </ProtectedRoute>
                }
              />

              {/* Whatsapp Config */}
              <Route
                path="/portal/:slug/configuracoes/whatsapp"
                element={
                  // Updated roles to match new DB schema + added 'owner'
                  <ProtectedRoute allowedRoles={['admin', 'recepcionista', 'financeiro']}>
                    <WhatsappConfigPage />
                  </ProtectedRoute>
                }
              />

              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
            <WhatsAppCTA />
          </BrowserRouter>
        </TooltipProvider>
      </OrganizationProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
