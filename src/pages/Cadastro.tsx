import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/Logo";
import { useAuth, AppRole } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Eye, EyeOff, Mail, Lock, User } from "lucide-react";
import { z } from "zod";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const registerSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres").max(100),
  email: z.string().email("Email inválido").max(255),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
  confirmPassword: z.string(),
  role: z.enum(["admin", "recepcionista", "profissional"]),
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
});

const roleLabels: Record<AppRole, string> = {
  admin: "Administrador",
  recepcionista: "Recepcionista",
  profissional: "Profissional de Saúde",
};

export default function Cadastro() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<AppRole>("profissional");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validation = registerSchema.safeParse({
      name,
      email,
      password,
      confirmPassword,
      role,
    });

    if (!validation.success) {
      toast.error(validation.error.errors[0].message);
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await signUp(email, password, name, role);
      if (error) {
        if (error.message.includes("already registered")) {
          toast.error("Este email já está cadastrado");
        } else {
          toast.error(error.message);
        }
      } else {
        toast.success("Conta criada com sucesso!");
        navigate("/dashboard");
      }
    } catch {
      toast.error("Erro ao criar conta. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gradient-hero">
      {/* Left Side - Illustration (Desktop Only) */}
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
                  d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                />
              </svg>
            </div>
          </div>
          <h2 className="text-3xl font-display font-bold mb-4">
            Comece sua jornada agora
          </h2>
          <p className="text-primary-foreground/80 text-lg">
            Junte-se a milhares de profissionais que já transformaram a gestão de suas clínicas.
          </p>
        </div>
      </div>

      {/* Right Side - Form */}
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
                Criar sua conta
              </h1>
              <p className="text-muted-foreground mt-1">
                Comece grátis, sem cartão de crédito
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome completo</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="Seu nome"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="pl-10"
                    autoComplete="name"
                  />
                </div>
              </div>

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
                <Label htmlFor="role">Tipo de usuário</Label>
                <Select value={role} onValueChange={(value) => setRole(value as AppRole)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione seu tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(roleLabels) as AppRole[]).map((roleKey) => (
                      <SelectItem key={roleKey} value={roleKey}>
                        {roleLabels[roleKey]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Mínimo 6 caracteres"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10"
                    autoComplete="new-password"
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

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="Repita a senha"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10"
                    autoComplete="new-password"
                  />
                </div>
              </div>

              <Button
                type="submit"
                variant="gradient"
                size="lg"
                className="w-full mt-2"
                disabled={isLoading}
              >
                {isLoading ? "Criando conta..." : "Criar conta grátis"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Já tem uma conta?{" "}
                <Link
                  to="/login"
                  className="font-medium text-primary hover:underline"
                >
                  Faça login
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
