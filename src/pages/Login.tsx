import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/Logo";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Eye, EyeOff, Mail, Lock, Shield, User, Stethoscope, CheckCircle2, X } from "lucide-react";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
});

const demoProfiles = [
  {
    role: "admin" as const,
    label: "Administrador",
    icon: Shield,
    email: "admin@vidasaudavel.com",
    password: "123456",
    color: "from-violet-500 to-purple-600",
    bgColor: "bg-violet-50 dark:bg-violet-950/20",
    borderColor: "border-violet-200 dark:border-violet-800",
    textColor: "text-violet-700 dark:text-violet-300",
    permissions: [
      "Acesso total ao sistema",
      "Gerenciar profissionais e equipe",
      "Controle financeiro completo",
      "Gerenciar pacientes e consultas",
    ],
    restrictions: []
  },
  {
    role: "receptionist" as const,
    label: "Recepcionista",
    icon: User,
    email: "ana@vidasaudavel.com",
    password: "123456",
    color: "from-blue-500 to-cyan-600",
    bgColor: "bg-blue-50 dark:bg-blue-950/20",
    borderColor: "border-blue-200 dark:border-blue-800",
    textColor: "text-blue-700 dark:text-blue-300",
    permissions: [
      "Agendar e gerenciar consultas",
      "Cadastrar e editar pacientes",
      "Visualizar profissionais",
      "Acesso ao financeiro",
    ],
    restrictions: [
      "Não pode editar profissionais",
      "Não pode excluir pacientes",
      "Sem acesso às observações médicas",
    ]
  },
  {
    role: "doctor" as const,
    label: "Médico",
    icon: Stethoscope,
    email: "silva@vidasaudavel.com",
    password: "123456",
    color: "from-emerald-500 to-green-600",
    bgColor: "bg-emerald-50 dark:bg-emerald-950/20",
    borderColor: "border-emerald-200 dark:border-emerald-800",
    textColor: "text-emerald-700 dark:text-emerald-300",
    permissions: [
      "Vê apenas seus pacientes",
      "Observações de consulta exclusivas",
      "Sua agenda pessoal",
      "Anotações privadas por paciente",
    ],
    restrictions: [
      "Sem acesso ao financeiro",
      "Sem acesso a profissionais",
      "Não pode editar dados do paciente",
    ]
  }
];

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDemoProfile, setSelectedDemoProfile] = useState<number | null>(null);
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const searchParams = new URLSearchParams(location.search);
  const isDemo = searchParams.get("demo") === "true";

  const from = location.state?.from?.pathname || "/dashboard";

  const handleDemoSelect = (index: number) => {
    const profile = demoProfiles[index];
    setEmail(profile.email);
    setPassword(profile.password);
    setSelectedDemoProfile(index);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validation = loginSchema.safeParse({ email, password });
    if (!validation.success) {
      toast.error(validation.error.errors[0].message);
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await signIn(email, password);
      if (error) {
        if (error.message.includes("Invalid login credentials")) {
          toast.error("Email ou senha incorretos");
        } else {
          toast.error(error.message);
        }
      } else {
        toast.success("Login realizado com sucesso!");
        navigate(from, { replace: true });
      }
    } catch {
      toast.error("Erro ao fazer login. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gradient-hero">
      {/* Left Side - Form */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md animate-fade-in">
          <div className="mb-8">
            <Link to="/">
              <Logo size="lg" />
            </Link>
          </div>

          <div className="glass-card p-8">
            <div className="mb-6">
              <h1 className="text-2xl font-display font-bold text-foreground">
                {isDemo ? "Acesso Demo" : "Bem-vindo de volta"}
              </h1>
              <p className="text-muted-foreground mt-1">
                {isDemo ? "Selecione um perfil para explorar o sistema" : "Entre para acessar sua conta"}
              </p>
            </div>

            {/* Demo Profile Selector */}
            {isDemo && (
              <div className="mb-6 space-y-3">
                {demoProfiles.map((profile, index) => {
                  const Icon = profile.icon;
                  const isSelected = selectedDemoProfile === index;
                  return (
                    <button
                      key={profile.role}
                      type="button"
                      onClick={() => handleDemoSelect(index)}
                      className={`w-full text-left rounded-xl border-2 p-4 transition-all duration-300 ${isSelected
                          ? `${profile.borderColor} ${profile.bgColor} shadow-md scale-[1.02]`
                          : 'border-border hover:border-muted-foreground/30 hover:bg-muted/50'
                        }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${profile.color} flex items-center justify-center text-white shrink-0`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-bold text-foreground">{profile.label}</p>
                            {isSelected && <CheckCircle2 className={`w-4 h-4 ${profile.textColor}`} />}
                          </div>
                          <div className="mt-2 grid grid-cols-1 gap-1">
                            {profile.permissions.map((perm, i) => (
                              <div key={i} className="flex items-center gap-1.5 text-xs">
                                <CheckCircle2 className="w-3 h-3 text-green-500 shrink-0" />
                                <span className="text-muted-foreground">{perm}</span>
                              </div>
                            ))}
                            {profile.restrictions.map((rest, i) => (
                              <div key={i} className="flex items-center gap-1.5 text-xs">
                                <X className="w-3 h-3 text-red-400 shrink-0" />
                                <span className="text-muted-foreground/70">{rest}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Senha</Label>
                  <Link
                    to="/esqueci-senha"
                    className="text-sm text-primary hover:underline"
                  >
                    Esqueceu a senha?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                variant="gradient"
                size="lg"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? "Entrando..." : isDemo && selectedDemoProfile !== null ? `Entrar como ${demoProfiles[selectedDemoProfile].label}` : "Entrar"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Quer ter um sistema como este?{" "}
                <Link
                  to="/contato"
                  className="font-medium text-primary hover:underline"
                >
                  Entre em contato
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Illustration (Desktop Only) */}
      <div className="hidden lg:flex flex-1 items-center justify-center p-12 bg-gradient-primary">
        <div className="text-center text-primary-foreground max-w-md animate-fade-in-up">
          <div className="mb-6">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary-foreground/20 backdrop-blur-sm animate-float">
              <svg
                className="w-10 h-10"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
            </div>
          </div>
          <h2 className="text-3xl font-display font-bold mb-4">
            {isDemo ? "Explore cada perfil" : "Gerencie sua clínica com eficiência"}
          </h2>
          <p className="text-primary-foreground/80 text-lg">
            {isDemo
              ? "Cada nível de acesso tem funcionalidades e restrições diferentes. Selecione um perfil à esquerda para experimentar."
              : "Simplifique agendamentos, prontuários e finanças em uma única plataforma intuitiva."
            }
          </p>
        </div>
      </div>
    </div>
  );
}
