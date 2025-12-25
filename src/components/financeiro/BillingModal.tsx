import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Copy, Check, Send, Mail } from "lucide-react";
import { useOrganization } from "@/contexts/OrganizationContext";

interface BillingModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointmentId: string;
  patientName: string;
  patientEmail?: string;
  professionalName: string;
  initialAmount?: number;
}

export function BillingModal({
  isOpen,
  onClose,
  appointmentId,
  patientName,
  patientEmail,
  professionalName,
  initialAmount = 150.00,
}: BillingModalProps) {
  const { organization } = useOrganization();
  const [step, setStep] = useState<"input" | "success">("input");
  const [amount, setAmount] = useState<number>(initialAmount);
  const [loading, setLoading] = useState(false);
  const [billData, setBillData] = useState<{ url: string; bill_id: string } | null>(null);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-patient-payment-link', {
        body: {
          appointment_id: appointmentId,
          amount: amount,
          description: `Consulta com ${professionalName}`
        }
      });

      if (error) throw error;
      if (!data.url) throw new Error("Link não retornado");

      setBillData(data);
      setStep("success");
      toast.success("Link de pagamento gerado!");
    } catch (err: any) {
      console.error(err);
      toast.error("Erro ao gerar link: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (billData?.url) {
      navigator.clipboard.writeText(billData.url);
      toast.success("Link copiado!");
    }
  };

  const sendWhatsApp = () => {
    if (!billData?.url) return;
    const message = `Olá ${patientName}, aqui é da ${organization?.name}. Segue o link para pagamento da sua consulta: ${billData.url}`;
    const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const sendEmail = async () => {
    if (!billData?.url || !patientEmail) {
       toast.error("Email do paciente não disponível");
       return;
    }

    setLoading(true);
    try {
       const { error } = await supabase.functions.invoke('send-email', {
          body: {
             to: patientEmail,
             subject: `Pagamento de Consulta - ${organization?.name}`,
             html: `
                <h1>Olá ${patientName},</h1>
                <p>Aqui está o link para pagamento da sua consulta com ${professionalName}.</p>
                <p><a href="${billData.url}">Clique aqui para pagar</a></p>
                <p>Valor: R$ ${amount.toFixed(2)}</p>
             `
          }
       });
       if (error) throw error;
       toast.success("Email enviado com sucesso!");
    } catch (err: any) {
       toast.error("Erro ao enviar email: " + err.message);
    } finally {
       setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Gerar Cobrança</DialogTitle>
          <DialogDescription>
            Crie um link de pagamento para esta consulta.
          </DialogDescription>
        </DialogHeader>

        {step === "input" ? (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Valor da Consulta (R$)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                value={amount}
                onChange={(e) => setAmount(parseFloat(e.target.value))}
              />
            </div>
            <DialogFooter>
               <Button variant="outline" onClick={onClose}>Cancelar</Button>
               <Button onClick={handleGenerate} disabled={loading}>
                 {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                 Gerar Link
               </Button>
            </DialogFooter>
          </div>
        ) : (
          <div className="space-y-6 py-4">
             <div className="flex flex-col items-center justify-center text-center space-y-2">
                <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                   <Check className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-semibold text-lg">Link Gerado com Sucesso!</h3>
             </div>

             <div className="flex items-center space-x-2">
                <Input value={billData?.url} readOnly />
                <Button size="icon" variant="outline" onClick={copyToClipboard}>
                   <Copy className="h-4 w-4" />
                </Button>
             </div>

             <div className="grid grid-cols-2 gap-3">
                <Button className="w-full bg-green-600 hover:bg-green-700" onClick={sendWhatsApp}>
                   <Send className="mr-2 h-4 w-4" />
                   WhatsApp
                </Button>
                <Button className="w-full" variant="secondary" onClick={sendEmail} disabled={loading || !patientEmail}>
                   {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Mail className="mr-2 h-4 w-4" />}
                   Email
                </Button>
             </div>

             <DialogFooter>
                <Button variant="ghost" onClick={onClose}>Fechar</Button>
             </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
