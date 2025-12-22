import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/Logo";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Mail, ArrowLeft, CheckCircle2 } from "lucide-react";
import { z } from "zod";

const emailSchema = z.object({
  email: z.string().email("Email inválido"),
});

export default function EsqueciSenha() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const { resetPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validation = emailSchema.safeParse({ email });
    if (!validation.success) {
      toast.error(validation.error.errors[0].message);
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await resetPassword(email);
      if (error) {
        toast.error(error.message);
      } else {
        setEmailSent(true);
        toast.success("Email de recuperação enviado!");
      }
    } catch {
      toast.error("Erro ao enviar email. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-hero">
      <div className="w-full max-w-md animate-fade-in">
        <div className="mb-8 text-center">
          <Link to="/" className="inline-block">
            <Logo size="lg" />
          </Link>
        </div>

        <div className="glass-card p-8">
          {emailSent ? (
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 text-green-600 mb-6">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <h1 className="text-2xl font-display font-bold text-foreground mb-2">
                Email enviado!
              </h1>
              <p className="text-muted-foreground mb-6">
                Verifique sua caixa de entrada e siga as instruções para redefinir sua senha.
              </p>
              <Button variant="outline" asChild className="w-full">
                <Link to="/login">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar para o login
                </Link>
              </Button>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <h1 className="text-2xl font-display font-bold text-foreground">
                  Esqueceu sua senha?
                </h1>
                <p className="text-muted-foreground mt-1">
                  Digite seu email para receber as instruções de recuperação
                </p>
              </div>

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

                <Button
                  type="submit"
                  variant="gradient"
                  size="lg"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? "Enviando..." : "Enviar email de recuperação"}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <Link
                  to="/login"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Voltar para o login
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
