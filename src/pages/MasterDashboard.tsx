import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, TrendingUp, Users, Store, Ban, CheckCircle2, Eye, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface TenantStats {
  total_clinics: number;
  active_subscriptions: number;
  defaulting_clinics: number;
  total_patients: number;
}

interface Tenant {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  owner_email: string;
  subscription_status: string;
  created_at: string;
  is_blocked: boolean;
}

export default function MasterDashboard() {
  const { profile, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<TenantStats | null>(null);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading) {
      if (!profile?.is_super_admin) {
        navigate("/acesso-negado");
        return;
      }
      fetchData();
    }
  }, [authLoading, profile]);

  const fetchData = async () => {
    try {
      const { data: metrics, error: metricsError } = await supabase.rpc('get_master_metrics');
      if (metricsError) throw metricsError;
      setStats(metrics as any);

      const { data: tenantList, error: tenantError } = await supabase.rpc('get_all_tenants');
      if (tenantError) throw tenantError;
      setTenants(tenantList as any || []);

    } catch (error: any) {
      console.error("Error fetching admin data:", error);
      toast.error("Falha ao carregar dados do painel.");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleBlock = async (tenantId: string, currentStatus: string) => {
      const newStatus = currentStatus === 'canceled' ? 'active' : 'canceled';
      const actionName = newStatus === 'canceled' ? "Bloquear" : "Desbloquear";

      if (!confirm(`Tem certeza que deseja ${actionName} esta clínica?`)) return;

      try {
          const { error } = await supabase.rpc('admin_toggle_tenant_status', {
              target_org_id: tenantId,
              new_status: newStatus
          });

          if (error) throw error;

          toast.success(`Clínica ${newStatus === 'canceled' ? 'bloqueada' : 'desbloqueada'} com sucesso.`);
          fetchData();

      } catch (err: any) {
          console.error(err);
          toast.error("Erro ao atualizar status.");
      }
  };

  const handleImpersonate = (slug: string) => {
      // In a real robust system, we would mint a token or set a special cookie.
      // Since we updated RLS to allow is_super_admin to see everything,
      // we can simply navigate to their dashboard.
      // However, the OrganizationProvider might need to know we are impersonating if it checks 'profile.organization_id'.
      // For now, we rely on the RLS bypass.
      // Note: 'TenantLogin' might block us if we try to go through the login page logic.
      // But if we go directly to /dashboard (which is protected), the protection logic needs to allow Super Admins.
      // We'll handle the frontend permission check next.

      // We open in new tab for convenience
      window.open(`/portal/${slug}`, '_blank');
  };

  if (loading || authLoading) {
    return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin h-8 w-8" /></div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header */}
        <div className="flex justify-between items-center">
            <div>
                <h1 className="text-3xl font-display font-bold text-slate-900">Master Admin</h1>
                <p className="text-slate-500">Painel de Controle do SaaS</p>
            </div>
            <Button variant="outline" onClick={() => navigate('/')}>Voltar ao Site</Button>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Clínicas Totais</CardTitle>
                    <Store className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats?.total_clinics || 0}</div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Ativas</CardTitle>
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats?.active_subscriptions || 0}</div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Inadimplentes</CardTitle>
                    <AlertCircle className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-red-600">{stats?.defaulting_clinics || 0}</div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Pacientes</CardTitle>
                    <Users className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats?.total_patients || 0}</div>
                </CardContent>
            </Card>
        </div>

        {/* Tenants Table */}
        <Card>
            <CardHeader>
                <CardTitle>Gestão de Tenants</CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Clínica</TableHead>
                            <TableHead>Slug</TableHead>
                            <TableHead>Dono</TableHead>
                            <TableHead>Data Cadastro</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {tenants.map((tenant) => (
                            <TableRow key={tenant.id}>
                                <TableCell className="flex items-center gap-3 font-medium">
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src={tenant.logo_url || undefined} />
                                        <AvatarFallback>{tenant.name.substring(0,2).toUpperCase()}</AvatarFallback>
                                    </Avatar>
                                    {tenant.name}
                                </TableCell>
                                <TableCell className="font-mono text-xs">{tenant.slug}</TableCell>
                                <TableCell>{tenant.owner_email || "N/A"}</TableCell>
                                <TableCell>{new Date(tenant.created_at).toLocaleDateString()}</TableCell>
                                <TableCell>
                                    <Badge
                                        variant={tenant.subscription_status === 'active' || tenant.subscription_status === 'trial' ? 'default' : 'secondary'}
                                        className={tenant.subscription_status === 'active' ? 'bg-green-500' : ''}
                                    >
                                        {tenant.subscription_status}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right space-x-2">
                                    <Button variant="ghost" size="sm" onClick={() => handleImpersonate(tenant.slug)}>
                                        <Eye className="mr-2 h-4 w-4" />
                                        Acessar Painel
                                    </Button>
                                    <Button
                                        variant={tenant.subscription_status === 'canceled' ? 'outline' : 'destructive'}
                                        size="sm"
                                        onClick={() => handleToggleBlock(tenant.id, tenant.subscription_status)}
                                    >
                                        {tenant.subscription_status === 'canceled' ? (
                                            <><CheckCircle2 className="mr-2 h-4 w-4" /> Ativar</>
                                        ) : (
                                            <><Ban className="mr-2 h-4 w-4" /> Bloquear</>
                                        )}
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>

      </div>
    </div>
  );
}
