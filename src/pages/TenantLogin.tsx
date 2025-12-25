import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useOrganization } from "@/contexts/OrganizationContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export default function TenantLogin() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { fetchOrganizationBySlug, organization, isLoading: isLoadingOrg, error: orgError } = useOrganization();
  const { signIn, user, profile, signOut, isLoading: isLoadingAuth } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Fetch Organization on Mount
  useEffect(() => {
    if (slug) {
      fetchOrganizationBySlug(slug).catch(() => {
        // Error handled by context state
      });
    }
  }, [slug]);

  // Handle Post-Login Redirection and Validation
  useEffect(() => {
    const checkAccess = async () => {
      if (user && profile && organization && !isLoadingOrg && !isLoadingAuth) {

        // 1. Check Organization Membership
        if (profile.organization_id !== organization.id) {
            setLoginError("Você não tem acesso a esta clínica.");
            await signOut();
            return;
        }

        // 2. Check Subscription Status (Block Access if Canceled/Suspended)
        // Accessing 'subscription_status' might require typing update on Organization Context
        const status = organization.subscription_status;
        if (status === 'canceled' || status === 'past_due' || status === 'incomplete') {
             setLoginError("O acesso desta clínica está temporariamente suspenso. Contate o administrador.");
             await signOut();
             return;
        }

        // Success
        navigate("/dashboard");
      }
    };

    checkAccess();
  }, [user, profile, organization, isLoadingOrg, isLoadingAuth, navigate, signOut]);


  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginError(null);

    const { error } = await signIn(email, password);

    if (error) {
      setLoginError(error.message === "Invalid login credentials" ? "Email ou senha incorretos" : error.message);
      setIsLoggingIn(false);
    }
    // Success is handled by the useEffect above
  };

  if (isLoadingOrg) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (orgError || !organization) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <Alert variant="destructive" className="max-w-md w-full mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Clínica não encontrada</AlertTitle>
          <AlertDescription>
            Não encontramos nenhuma clínica com o endereço "<strong>{slug}</strong>".
          </AlertDescription>
        </Alert>
        <Button variant="outline" onClick={() => navigate("/login")}>
          Ir para Login Geral
        </Button>
      </div>
    );
  }

  const primaryColor = organization.primary_color || "#000000";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-4 text-center pb-2">
          {organization.logo_url && (
            <div className="flex justify-center mb-2">
              <img
                src={organization.logo_url}
                alt={`${organization.name} Logo`}
                className="h-16 w-auto object-contain"
              />
            </div>
          )}
          <CardTitle className="text-2xl font-bold" style={{ color: primaryColor }}>
            {organization.name}
          </CardTitle>
          <CardDescription>
            Portal do Colaborador
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            {loginError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{loginError}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-white"
              />
            </div>

            <Button
              type="submit"
              className="w-full text-white hover:opacity-90 transition-opacity"
              style={{ backgroundColor: primaryColor }}
              disabled={isLoggingIn}
            >
              {isLoggingIn ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Entrando...
                </>
              ) : (
                "Entrar"
              )}
            </Button>

            <div className="text-center text-sm text-gray-500">
               <a href="/esqueci-senha" className="hover:underline">Esqueceu a senha?</a>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
