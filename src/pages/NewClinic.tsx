import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Building2, User } from "lucide-react";
import { toast } from "sonner";

export default function NewClinic() {
  const navigate = useNavigate();
  const { signUp } = useAuth();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form Data
  const [clinicName, setClinicName] = useState("");
  const [slug, setSlug] = useState("");
  const [primaryColor, setPrimaryColor] = useState("#000000");
  const [ownerName, setOwnerName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSlugChange = (val: string) => {
    // Basic slugify
    const slugified = val.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-');
    setSlug(slugified);
  };

  const checkSlugAvailability = async (slugToCheck: string) => {
    const { data } = await supabase
        .from('organizations')
        .select('id')
        .eq('slug', slugToCheck)
        .maybeSingle();
    return !data;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
        // 1. Check Slug
        const isAvailable = await checkSlugAvailability(slug);
        if (!isAvailable) {
            throw new Error("Este endereço (URL) já está em uso por outra clínica.");
        }

        // 2. Create User (Sign Up)
        const { error: signUpError } = await signUp(email, password, ownerName, "admin");

        if (signUpError) throw signUpError;

        // Wait a moment for session to establish if auto-confirm is on
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            throw new Error("Não foi possível autenticar automaticamente. Por favor, verifique seu email.");
        }

        // 3. Create Organization & Link Profile via Secure RPC
        // This replaces the previous client-side logic that required loose RLS policies
        const { data: orgData, error: rpcError } = await supabase
            .rpc('create_organization_and_owner', {
                org_name: clinicName,
                org_slug: slug,
                org_color: primaryColor,
                user_name: ownerName
            });

        if (rpcError) throw rpcError;

        toast.success("Clínica criada com sucesso!");
        navigate(`/portal/${slug}`);

    } catch (err: any) {
        console.error(err);
        setError(err.message || "Ocorreu um erro ao criar a clínica.");
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-lg shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Criar Nova Clínica</CardTitle>
          <CardDescription>
            Comece a usar o ClinicFlow gratuitamente.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
                <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b">
                    <Building2 className="h-5 w-5 text-gray-500" />
                    <h3 className="font-semibold text-gray-700">Dados da Clínica</h3>
                </div>

                <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="clinicName">Nome da Clínica</Label>
                        <Input
                            id="clinicName"
                            placeholder="Ex: Clínica Saúde Vida"
                            value={clinicName}
                            onChange={(e) => {
                                setClinicName(e.target.value);
                                if (!slug) handleSlugChange(e.target.value);
                            }}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="slug">Endereço Personalizado</Label>
                        <div className="flex items-center">
                            <span className="text-sm text-gray-500 bg-gray-100 px-3 py-2 rounded-l-md border border-r-0 border-input">
                                meuapp.com/portal/
                            </span>
                            <Input
                                id="slug"
                                placeholder="clinica-vida"
                                value={slug}
                                onChange={(e) => handleSlugChange(e.target.value)}
                                className="rounded-l-none"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="color">Cor Principal</Label>
                        <div className="flex gap-2">
                            <Input
                                id="color"
                                type="color"
                                value={primaryColor}
                                onChange={(e) => setPrimaryColor(e.target.value)}
                                className="w-12 p-1 h-10"
                            />
                            <Input
                                value={primaryColor}
                                onChange={(e) => setPrimaryColor(e.target.value)}
                                className="flex-1"
                            />
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2 pb-2 border-b pt-4">
                    <User className="h-5 w-5 text-gray-500" />
                    <h3 className="font-semibold text-gray-700">Dados do Administrador</h3>
                </div>

                <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="ownerName">Seu Nome Completo</Label>
                        <Input
                            id="ownerName"
                            placeholder="Dr. João Silva"
                            value={ownerName}
                            onChange={(e) => setOwnerName(e.target.value)}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email">Email de Acesso</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="joao@clinica.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
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
                            minLength={6}
                        />
                    </div>
                </div>
            </div>

            <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={isLoading}
            >
                {isLoading ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Criando sua clínica...
                    </>
                ) : (
                    "Criar Clínica"
                )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="justify-center border-t pt-4">
            <span className="text-sm text-gray-500">
                Já tem uma conta? <a href="/login" className="text-primary hover:underline">Fazer Login</a>
            </span>
        </CardFooter>
      </Card>
    </div>
  );
}
