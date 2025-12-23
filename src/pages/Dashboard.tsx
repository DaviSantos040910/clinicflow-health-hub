import { Header } from "@/components/Header";
import { useAuth, AppRole } from "@/contexts/AuthContext";
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

const stats = [
  { 
    label: "Consultas do dia",
    value: "12", 
    change: "+3 vs ontem",
    icon: Users,
    color: "text-primary",
    roles: ["admin", "recepcionista", "profissional"] as AppRole[]
  },
  { 
    label: "Total de consultas",
    value: "128",
    change: "Este mês",
    icon: Calendar,
    color: "text-secondary",
    roles: ["admin", "recepcionista", "profissional"] as AppRole[]
  },
  { 
    label: "Receita mensal", 
    value: "R$ 24.580", 
    change: "+12% vs mês anterior",
    icon: DollarSign,
    color: "text-green-500",
    roles: ["admin"] as AppRole[]
  },
  { 
    label: "Taxa de ocupação", 
    value: "87%", 
    change: "+5% vs média",
    icon: TrendingUp,
    color: "text-amber-500",
    roles: ["admin", "recepcionista"] as AppRole[]
  },
];

const upcomingAppointments = [
  { time: "09:00", patient: "Maria Silva", type: "Consulta geral", status: "confirmado" },
  { time: "10:30", patient: "João Santos", type: "Retorno", status: "confirmado" },
  { time: "14:00", patient: "Ana Oliveira", type: "Exame", status: "pendente" },
  { time: "15:30", patient: "Carlos Lima", type: "Consulta geral", status: "confirmado" },
];

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
  }
};

export default function Dashboard() {
  const { profile, role, hasPermission } = useAuth();

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
      roles: ["admin", "recepcionista"] as AppRole[]
    },
    { 
      label: "Novo paciente", 
      icon: Users, 
      variant: "outline" as const,
      roles: ["admin", "recepcionista"] as AppRole[]
    },
    { 
      label: "Relatórios", 
      icon: FileText, 
      variant: "outline" as const,
      roles: ["admin"] as AppRole[]
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
              <Button key={action.label} variant={action.variant} size="lg">
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
                  <p className="text-2xl font-display font-bold mt-1">{stat.value}</p>
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
              <Button variant="ghost" size="sm">
                Ver todas
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
            
            <div className="space-y-4">
              {upcomingAppointments.map((appointment, index) => (
                <div 
                  key={index}
                  className="flex items-center gap-4 p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
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
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      appointment.status === "confirmado" 
                        ? "bg-green-100 text-green-700" 
                        : "bg-amber-100 text-amber-700"
                    }`}>
                      {appointment.status}
                    </span>
                  </div>
                </div>
              ))}
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
              {hasPermission(["admin"]) && (
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
    </div>
  );
}
