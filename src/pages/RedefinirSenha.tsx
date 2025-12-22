import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/Logo";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Eye, EyeOff, Lock, CheckCircle2 } from "lucide-react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";

const passwordSchema = z.object({
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
});

export default function RedefinirSenha() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isValidSession, setIsValidSession] = useState(false);
  const { updatePassword } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user has a valid recovery session
    supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setIsValidSession(true);
      }
    });

    // Also check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setIsValidSession(true);
      }
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validation = passwordSchema.safeParse({ password, confirmPassword });
    if (!validation.success) {
      toast.error(validation.error.errors[0].message);
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await updatePassword(password);
      if (error) {
        toast.error(error.message);
      } else {
        setIsSuccess(true);
        toast.success("Senha redefinida com sucesso!");
        setTimeout(() => {
          navigate("/dashboard");
        }, 2000);
      }
    } catch {
      toast.error("Erro ao redefinir senha. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isValidSession) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-hero">
        <div className="w-full max-w-md animate-fade-in">
          <div className="mb-8 text-center">
            <Link to="/" className="inline-block">
              <Logo size="lg" />
            </Link>
          </div>

          <div className="glass-card p-8 text-center">
            <h1 className="text-2xl font-display font-bold text-foreground mb-2">
              Link inválido ou expirado
            </h1>
            <p className="text-muted-foreground mb-6">
              Este link de recuperação não é mais válido. Solicite um novo.
            </p>
            <Button variant="gradient" asChild className="w-full">
              <Link to="/esqueci-senha">Solicitar novo link</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-hero">
      <div className="w-full max-w-md animate-fade-in">
        <div className="mb-8 text-center">
          <Link to="/" className="inline-block">
            <Logo size="lg" />
          </Link>
        </div>

        <div className="glass-card p-8">
          {isSuccess ? (
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 text-green-600 mb-6">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <h1 className="text-2xl font-display font-bold text-foreground mb-2">
                Senha redefinida!
              </h1>
              <p className="text-muted-foreground">
                Você será redirecionado em instantes...
              </p>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <h1 className="text-2xl font-display font-bold text-foreground">
                  Redefinir senha
                </h1>
                <p className="text-muted-foreground mt-1">
                  Digite sua nova senha abaixo
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="password">Nova senha</Label>
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
                  <Label htmlFor="confirmPassword">Confirmar nova senha</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      type={showPassword ? "text" : "password"}
                      placeholder="Repita a nova senha"
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
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? "Redefinindo..." : "Redefinir senha"}
                </Button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
