import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";
import { useOrganization } from "@/contexts/OrganizationContext";

export default function PaymentCallback() {
  const navigate = useNavigate();
  const { organization } = useOrganization();

  useEffect(() => {
    // Redirect to subscription page after a short delay to allow user to read success message
    // and for the webhook to potentially process (though we don't block on it here)
    const timer = setTimeout(() => {
       if (organization?.slug) {
         navigate(`/portal/${organization.slug}/assinatura`);
       } else {
         navigate('/dashboard');
       }
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate, organization]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md shadow-lg text-center">
        <CardHeader className="flex flex-col items-center gap-4">
          <CheckCircle2 className="h-16 w-16 text-green-500 animate-bounce" />
          <CardTitle className="text-2xl font-bold text-green-700">Pagamento Confirmado!</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">
            Sua assinatura foi processada com sucesso. Estamos atualizando o status da sua conta.
          </p>
          <p className="text-sm text-gray-400">
            Você será redirecionado em instantes...
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
