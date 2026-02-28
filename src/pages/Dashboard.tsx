import { Header } from "@/components/Header";
import { useAuth, AppRole } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  Calendar,
  Users,
  FileText,
  DollarSign,
  TrendingUp,
  Clock,
  ChevronRight,
  Plus,
  Shield,
  Stethoscope,
  User
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/EmptyState";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import { Loader2, FileText as FileTextIcon, CheckCircle2, AlertCircle } from "lucide-react";

interface DashboardStat {
  label: string;
  value: string;
  change: string;
  icon: any;
  color: string;
  roles: AppRole[];
}

type Patient = {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  birth_date: string | null;
  observations: string | null;
};

const rolePermissions: Record<AppRole, { label: string; icon: React.ElementType; description: string }> = {
  admin: {
    label: "Administrador",
    icon: Shield,
    description: "Acesso total ao sistema"
  },
  recepcionista: {
    label: "Recepcionista",
    icon: User,
    description: "Agenda e pacientes"
  },
  profissional: {
    label: "Profissional",
    icon: Stethoscope,
    description: "Sua agenda e seus pacientes"
  },
  financeiro: {
    label: "Financeiro",
    icon: DollarSign,
    description: "Gestão financeira e pacientes"
  }
};

export default function Dashboard() {
  const { profile, role, hasPermission, user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStat[]>([
    {
      label: "Consultas do dia",
      value: "...",
      change: "vs ontem",
      icon: Users,
      color: "text-primary",
      roles: ["admin", "recepcionista", "profissional", "financeiro"]
    },
    {
      label: "Total de consultas",
      value: "...",
      change: "Este mês",
      icon: Calendar,
      color: "text-secondary",
      roles: ["admin", "recepcionista", "profissional", "financeiro"]
    },
    {
      label: "Receita mensal",
      value: "R$ ...",
      change: "Estimado",
      icon: DollarSign,
      color: "text-green-500",
      roles: ["admin", "financeiro"]
    },
    {
      label: "Taxa de ocupação",
      value: "...",
      change: "vs média",
      icon: TrendingUp,
      color: "text-amber-500",
      roles: ["admin", "recepcionista", "financeiro"]
    },
  ]);

  const [upcomingAppointments, setUpcomingAppointments] = useState<any[]>([]);

  // Patient detail sheet
  const [isPatientSheetOpen, setIsPatientSheetOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [patientHistory, setPatientHistory] = useState<any[]>([]);
  const [loadingPatient, setLoadingPatient] = useState(false);
  const [consultationNotes, setConsultationNotes] = useState("");
  const [savingNotes, setSavingNotes] = useState(false);

  const isDoctor = role === 'profissional';
  const canEdit = role === 'admin' || role === 'recepcionista' || role === 'financeiro';

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch Appointments count for today
      const today = new Date().toISOString().split("T")[0];
      const { count: todayCount } = await supabase
        .from("appointments")
        .select("*", { count: "exact", head: true })
        .gte("date_time", `${today}T00:00:00`)
        .lte("date_time", `${today}T23:59:59`);

      // Fetch Total Appointments this month
      const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
      const nextMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1).toISOString();

      const { count: monthCount } = await supabase
        .from("appointments")
        .select("*", { count: "exact", head: true })
        .gte("date_time", startOfMonth)
        .lt("date_time", nextMonth);

      // Fetch Upcoming Appointments (limit 8)
      const todayStart = `${today}T00:00:00`;
      const { data: upcoming } = await supabase
        .from("appointments")
        .select(`
                *,
                patient:patients(id, name, phone, email, birth_date, observations)
            `)
        .gte("date_time", todayStart)
        .order("date_time", { ascending: true })
        .limit(8);

      // Update State
      setStats(prev => [
        { ...prev[0], value: (todayCount || 0).toString() },
        { ...prev[1], value: (monthCount || 0).toString() },
        { ...prev[2], value: "R$ 24.580" }, // Mocked for now
        { ...prev[3], value: "87%" } // Mocked
      ]);

      if (upcoming) {
        setUpcomingAppointments(upcoming.map(apt => {
          const dateObj = new Date(apt.date_time);
          return {
            time: dateObj.toTimeString().substring(0, 5),
            date: format(dateObj, "dd/MM (EEE)", { locale: ptBR }),
            patient: apt.patient?.name || "Paciente",
            patientData: apt.patient || null,
            type: "Consulta",
            status: apt.status
          };
        }));
      }

    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setStats(prev => [
        { ...prev[0], value: "12" },
        { ...prev[1], value: "128" },
        { ...prev[2], value: "R$ 24.580" },
        { ...prev[3], value: "87%" }
      ]);
      setUpcomingAppointments([
        { time: "09:00", date: "01/03 (sáb)", patient: "Maria Silva", patientData: null, type: "Consulta geral", status: "confirmado" },
        { time: "10:30", date: "01/03 (sáb)", patient: "João Santos", patientData: null, type: "Retorno", status: "confirmado" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handlePatientClick = async (appointment: any) => {
    if (!appointment.patientData) {
      toast.info("Dados do paciente não disponíveis.");
      return;
    }

    const patient = appointment.patientData as Patient;
    setSelectedPatient(patient);
    setConsultationNotes(patient.observations || "");
    setIsPatientSheetOpen(true);
    setLoadingPatient(true);

    try {
      const { data, error } = await supabase
        .from("appointments")
        .select("*")
        .eq("patient_id", patient.id)
        .order("date_time", { ascending: false })
        .limit(10);

      if (error) throw error;
      setPatientHistory(data || []);
    } catch (error) {
      console.error("Error fetching patient history:", error);
      setPatientHistory([]);
    } finally {
      setLoadingPatient(false);
    }
  };

  const handleSaveNotes = async () => {
    if (!selectedPatient) return;
    setSavingNotes(true);
    try {
      const { error } = await supabase
        .from("patients")
        .update({ observations: consultationNotes })
        .eq("id", selectedPatient.id);
      if (error) throw error;
      toast.success("Observações salvas!");
      setSelectedPatient({ ...selectedPatient, observations: consultationNotes });
    } catch (error) {
      console.error("Error saving notes:", error);
      toast.error("Erro ao salvar observações.");
    } finally {
      setSavingNotes(false);
    }
  };

  const roleInfo = role ? rolePermissions[role] : null;
  const RoleIcon = roleInfo?.icon || User;

  const filteredStats = stats.filter(stat =>
    role ? stat.roles.includes(role) : false
  );

  const quickActions = [
    {
      label: "Novo agendamento",
      icon: Plus,
      variant: "gradient" as const,
      roles: ["admin", "recepcionista", "financeiro"] as AppRole[],
      onClick: () => navigate('/agenda'),
    },
    {
      label: "Novo paciente",
      icon: Users,
      variant: "outline" as const,
      roles: ["admin", "recepcionista", "financeiro"] as AppRole[],
      onClick: () => navigate('/pacientes'),
    },
    {
      label: "Relatórios",
      icon: FileText,
      variant: "outline" as const,
      roles: ["admin", "financeiro"] as AppRole[],
      onClick: () => navigate('/financeiro'),
    },
  ];

  const filteredActions = quickActions.filter(action =>
    role ? action.roles.includes(role) : false
  );

  return (
    <div className="min-h-screen bg-gradient-hero">
      <Header />

      <main className="container py-8">
        {/* Welcome Section */}
        <div className="mb-8 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-2">
            <h1 className="text-3xl font-display font-bold text-foreground">
              Olá, {profile?.full_name?.split(" ")[0] || "Usuário"}! 👋
            </h1>
            {roleInfo && (
              <Badge variant="secondary" className="self-start flex items-center gap-1.5">
                <RoleIcon className="h-3.5 w-3.5" />
                {roleInfo.label}
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground">
            {roleInfo?.description} • Aqui está o resumo da sua clínica hoje
          </p>
        </div>

        {/* Quick Actions */}
        {filteredActions.length > 0 && (
          <div className="flex flex-wrap gap-3 mb-8 animate-fade-in" style={{ animationDelay: "0.1s" }}>
            {filteredActions.map((action) => (
              <Button key={action.label} variant={action.variant} size="lg" onClick={action.onClick}>
                <action.icon className="h-4 w-4 mr-2" />
                {action.label}
              </Button>
            ))}
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {filteredStats.map((stat, index) => (
            <div
              key={stat.label}
              className="glass-card p-6 animate-fade-in-up"
              style={{ animationDelay: `${0.1 + index * 0.05}s` }}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <div className="mt-1">
                    {loading ? (
                      <Skeleton className="h-8 w-24" />
                    ) : (
                      <p className="text-2xl font-display font-bold">{stat.value}</p>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{stat.change}</p>
                </div>
                <div className={`p-3 rounded-lg bg-accent ${stat.color}`}>
                  <stat.icon className="h-5 w-5" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Upcoming Appointments */}
          <div className="lg:col-span-2 glass-card p-6 animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-display font-semibold">
                {hasPermission(["profissional"]) && !hasPermission(["admin", "recepcionista"])
                  ? "Suas próximas consultas"
                  : "Próximas consultas"}
              </h2>
              <Button variant="ghost" size="sm" onClick={() => navigate('/agenda')}>
                Ver todas
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>

            <div className="space-y-4">
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
                    <Skeleton className="h-12 w-12 rounded-lg" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                    <div className="text-right space-y-2">
                      <Skeleton className="h-4 w-16 ml-auto" />
                      <Skeleton className="h-5 w-20 ml-auto rounded-full" />
                    </div>
                  </div>
                ))
              ) : upcomingAppointments.length === 0 ? (
                <EmptyState
                  title="Nenhuma consulta próxima"
                  description="Não há consultas agendadas para as próximas horas."
                  icon={Calendar}
                />
              ) : (
                upcomingAppointments.map((appointment, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-4 p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
                    onClick={() => handlePatientClick(appointment)}
                    title="Clique para ver detalhes do paciente"
                  >
                    <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-accent text-primary">
                      <Clock className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">{appointment.patient}</p>
                      <p className="text-sm text-muted-foreground">{appointment.type}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-foreground">{appointment.time}</p>
                      <p className="text-xs text-muted-foreground mb-1">{appointment.date}</p>
                      <span className={`text-xs px-2 py-1 rounded-full ${appointment.status === "confirmado" || appointment.status === "confirmada"
                        ? "bg-green-100 text-green-700"
                        : "bg-amber-100 text-amber-700"
                        }`}>
                        {appointment.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick Stats / Activity */}
          <div className="glass-card p-6 animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
            <h2 className="text-lg font-display font-semibold mb-6">Atividade recente</h2>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 mt-2 rounded-full bg-primary" />
                <div>
                  <p className="text-sm font-medium">Novo paciente cadastrado</p>
                  <p className="text-xs text-muted-foreground">Há 15 minutos</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 mt-2 rounded-full bg-secondary" />
                <div>
                  <p className="text-sm font-medium">Consulta confirmada</p>
                  <p className="text-xs text-muted-foreground">Há 1 hora</p>
                </div>
              </div>
              {hasPermission(["admin", "financeiro"]) && (
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 mt-2 rounded-full bg-green-500" />
                  <div>
                    <p className="text-sm font-medium">Pagamento recebido</p>
                    <p className="text-xs text-muted-foreground">Há 2 horas</p>
                  </div>
                </div>
              )}
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 mt-2 rounded-full bg-amber-500" />
                <div>
                  <p className="text-sm font-medium">Prontuário atualizado</p>
                  <p className="text-xs text-muted-foreground">Há 3 horas</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Patient Detail Sheet */}
      <Sheet open={isPatientSheetOpen} onOpenChange={setIsPatientSheetOpen}>
        <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Detalhes do Paciente</SheetTitle>
            <SheetDescription>{selectedPatient?.name}</SheetDescription>
          </SheetHeader>

          <div className="mt-6 space-y-6">
            {/* Patient Info */}
            <div className="space-y-3 bg-muted/30 rounded-lg p-4">
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Informações</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-muted-foreground">Telefone:</span>
                  <p className="font-medium">{selectedPatient?.phone || "-"}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Email:</span>
                  <p className="font-medium">{selectedPatient?.email || "-"}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Data de Nasc.:</span>
                  <p className="font-medium">
                    {selectedPatient?.birth_date
                      ? format(new Date(selectedPatient.birth_date + 'T00:00:00'), "dd/MM/yyyy")
                      : "-"}
                  </p>
                </div>
              </div>
            </div>

            {/* Doctor-only: Consultation Notes */}
            {isDoctor && (
              <div className="space-y-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                <div className="flex items-center gap-2">
                  <FileTextIcon className="w-4 h-4 text-blue-600" />
                  <h3 className="font-semibold text-sm text-blue-700 dark:text-blue-400 uppercase tracking-wide">Observações da Consulta</h3>
                </div>
                <p className="text-xs text-blue-600/70">Apenas você (médico) pode ver e editar estas observações.</p>
                <Textarea
                  value={consultationNotes}
                  onChange={(e) => setConsultationNotes(e.target.value)}
                  placeholder="Anotações sobre o andamento com o paciente..."
                  className="min-h-[100px] bg-white dark:bg-background"
                />
                <Button size="sm" onClick={handleSaveNotes} disabled={savingNotes}>
                  {savingNotes && <Loader2 className="mr-2 h-3 w-3 animate-spin" />}
                  Salvar Observações
                </Button>
              </div>
            )}

            {/* Appointment History */}
            <div className="space-y-3">
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Histórico de Consultas</h3>
              {loadingPatient ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : patientHistory.length === 0 ? (
                <p className="text-center text-muted-foreground py-4 text-sm">Nenhuma consulta registrada.</p>
              ) : (
                patientHistory.map((apt: any) => (
                  <div key={apt.id} className="border rounded-lg p-3 bg-card/50">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-sm">
                          {format(new Date(apt.date_time), "dd/MM/yyyy 'às' HH:mm")}
                        </p>
                        <p className="text-xs text-muted-foreground capitalize">{apt.status}</p>
                      </div>
                    </div>
                    {apt.notes && (
                      <p className="text-xs text-muted-foreground bg-muted p-2 rounded mt-2">{apt.notes}</p>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
