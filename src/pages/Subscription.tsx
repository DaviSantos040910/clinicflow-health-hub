import { useState } from "react";
import { useOrganization } from "@/contexts/OrganizationContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Loader2, AlertTriangle, ShieldCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Mock Price IDs - Replace with real Stripe Price IDs in production
const PLANS = {
  BASIC: {
    id: "price_1Q...Basic",
    name: "Plano Básico",
    price: "R$ 99,00",
    features: ["Até 2 profissionais", "Agenda simples", "Prontuário básico"]
  },
  PRO: {
    id: "price_1Q...Pro",
    name: "Plano Pro",
    price: "R$ 199,00",
    features: ["Profissionais ilimitados", "Financeiro completo", "Relatórios avançados", "Suporte prioritário"]
  }
};

export default function Subscription() {
  const { organization, isLoading: orgLoading } = useOrganization();
  const { profile } = useAuth();
  const [loadingPriceId, setLoadingPriceId] = useState<string | null>(null);

  if (orgLoading) return <Loader2 className="animate-spin h-8 w-8 m-auto" />;

  // Security Check (Frontend)
  if (profile?.role !== 'owner') {
    return (
        <div className="flex flex-col items-center justify-center h-[50vh] text-center p-4">
            <AlertTriangle className="h-12 w-12 text-amber-500 mb-4" />
            <h2 className="text-xl font-bold">Acesso Restrito</h2>
            <p className="text-gray-500">Apenas o dono da clínica pode gerenciar assinaturas.</p>
        </div>
    );
  }

  const handleSubscribe = async (priceId: string) => {
    setLoadingPriceId(priceId);
    try {
        const { data, error } = await supabase.functions.invoke('create-checkout', {
            body: { price_id: priceId }
        });

        if (error) throw error;
        if (data?.url) {
            window.location.href = data.url;
        } else {
            throw new Error("Não foi possível gerar o link de pagamento.");
        }
    } catch (err: any) {
        toast.error("Erro ao iniciar pagamento: " + err.message);
    } finally {
        setLoadingPriceId(null);
    }
  };

  const getStatusBadge = (status?: string) => {
      switch(status) {
          case 'active': return <Badge className="bg-green-500">Ativa</Badge>;
          case 'past_due': return <Badge variant="destructive">Pagamento Pendente</Badge>;
          case 'canceled': return <Badge variant="secondary">Cancelada</Badge>;
          case 'trial': return <Badge className="bg-blue-500">Período de Teste</Badge>;
          default: return <Badge variant="outline">Inativa</Badge>;
      }
  };

  return (
    <div className="container py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-display font-bold">Assinatura da Clínica</h1>
        <p className="text-muted-foreground">Gerencie o plano da {organization?.name}</p>
      </div>

      <div className="flex items-center gap-4 p-4 bg-card rounded-lg border">
          <ShieldCheck className="h-6 w-6 text-primary" />
          <div className="flex-1">
              <p className="text-sm font-medium text-muted-foreground">Status Atual</p>
              <div className="flex items-center gap-2 mt-1">
                  <span className="text-xl font-bold capitalize">
                      {organization?.subscription_status === 'trial' ? 'Período de Teste' : organization?.subscription_status || 'Sem Plano'}
                  </span>
                  {getStatusBadge(organization?.subscription_status)}
              </div>
          </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {/* Basic Plan */}
        <Card className={organization?.plan_type === 'basic' ? "border-primary border-2" : ""}>
            <CardHeader>
                <CardTitle>{PLANS.BASIC.name}</CardTitle>
                <CardDescription>Para pequenas clínicas começando agora.</CardDescription>
                <div className="text-3xl font-bold mt-2">{PLANS.BASIC.price}<span className="text-sm font-normal text-muted-foreground">/mês</span></div>
            </CardHeader>
            <CardContent>
                <ul className="space-y-2">
                    {PLANS.BASIC.features.map((feat, i) => (
                        <li key={i} className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-green-500" />
                            <span className="text-sm">{feat}</span>
                        </li>
                    ))}
                </ul>
            </CardContent>
            <CardFooter>
                <Button
                    className="w-full"
                    onClick={() => handleSubscribe(PLANS.BASIC.id)}
                    disabled={loadingPriceId !== null}
                    variant={organization?.plan_type === 'basic' && organization.subscription_status === 'active' ? "outline" : "default"}
                >
                    {loadingPriceId === PLANS.BASIC.id && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {organization?.plan_type === 'basic' && organization.subscription_status === 'active' ? "Plano Atual" : "Assinar Básico"}
                </Button>
            </CardFooter>
        </Card>

        {/* Pro Plan */}
        <Card className={organization?.plan_type === 'pro' ? "border-primary border-2 bg-slate-50 dark:bg-slate-900" : "bg-slate-50 dark:bg-slate-900"}>
             <CardHeader>
                <div className="flex justify-between items-center">
                    <CardTitle>{PLANS.PRO.name}</CardTitle>
                    <Badge variant="default">Recomendado</Badge>
                </div>
                <CardDescription>Para clínicas em crescimento.</CardDescription>
                <div className="text-3xl font-bold mt-2">{PLANS.PRO.price}<span className="text-sm font-normal text-muted-foreground">/mês</span></div>
            </CardHeader>
            <CardContent>
                <ul className="space-y-2">
                    {PLANS.PRO.features.map((feat, i) => (
                        <li key={i} className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-green-500" />
                            <span className="text-sm font-medium">{feat}</span>
                        </li>
                    ))}
                </ul>
            </CardContent>
            <CardFooter>
                <Button
                    className="w-full"
                    onClick={() => handleSubscribe(PLANS.PRO.id)}
                    disabled={loadingPriceId !== null}
                    variant={organization?.plan_type === 'pro' && organization.subscription_status === 'active' ? "outline" : "default"}
                >
                    {loadingPriceId === PLANS.PRO.id && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {organization?.plan_type === 'pro' && organization.subscription_status === 'active' ? "Plano Atual" : "Assinar Pro"}
                </Button>
            </CardFooter>
        </Card>
      </div>
    </div>
  );
}
