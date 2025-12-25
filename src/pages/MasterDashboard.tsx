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
import { Loader2, TrendingUp, Users, Store, Ban, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

interface TenantStats {
  total_clinics: number;
  active_subscriptions: number;
  total_patients: number;
}

interface Tenant {
  id: string;
  name: string;
  slug: string;
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
        navigate("/acesso-negado"); // Or 404
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
      // Toggle logic: If blocked (canceled), make active. If active, cancel.
      // NOTE: This is a simplification. In real life, 'blocked' might be a separate flag from 'subscription_status'.
      // Based on our RPC 'admin_toggle_tenant_status', we pass the new status enum string.

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
          fetchData(); // Refresh list

      } catch (err: any) {
          console.error(err);
          toast.error("Erro ao atualizar status.");
      }
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                    <CardTitle className="text-sm font-medium">Assinaturas Ativas</CardTitle>
                    <TrendingUp className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats?.active_subscriptions || 0}</div>
                    <p className="text-xs text-muted-foreground">MRR Estimado: R$ {(stats?.active_subscriptions || 0) * 97},00</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Pacientes na Base</CardTitle>
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
                                <TableCell className="font-medium">{tenant.name}</TableCell>
                                <TableCell className="font-mono text-xs">{tenant.slug}</TableCell>
                                <TableCell>{tenant.owner_email || "N/A"}</TableCell>
                                <TableCell>{new Date(tenant.created_at).toLocaleDateString()}</TableCell>
                                <TableCell>
                                    <Badge variant={tenant.subscription_status === 'active' ? 'default' : 'secondary'} className={tenant.subscription_status === 'active' ? 'bg-green-500' : ''}>
                                        {tenant.subscription_status}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right space-x-2">
                                    <Button variant="ghost" size="sm" onClick={() => window.open(`/portal/${tenant.slug}`, '_blank')}>
                                        Ver Portal
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
