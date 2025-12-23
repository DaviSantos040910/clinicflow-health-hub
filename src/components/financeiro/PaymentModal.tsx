import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Payment, PaymentMethod, PaymentStatus } from "@/types/financeiro";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<Payment, "id" | "created_at">) => Promise<void>;
  loading?: boolean;
}

export function PaymentModal({
  isOpen,
  onClose,
  onSave,
  loading = false,
}: PaymentModalProps) {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loadingOpts, setLoadingOpts] = useState(false);

  const [formData, setFormData] = useState({
    appointment_id: "",
    amount: "",
    method: "pix" as PaymentMethod,
    status: "pago" as PaymentStatus,
    date: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    if (isOpen) {
      fetchAppointments();
      setFormData({
        appointment_id: "",
        amount: "",
        method: "pix",
        status: "pago",
        date: new Date().toISOString().split("T")[0],
      });
    }
  }, [isOpen]);

  const fetchAppointments = async () => {
    setLoadingOpts(true);
    try {
        // Fetch recent appointments that might need payment
        const { data, error } = await supabase
            .from("appointments")
            .select(`
                id,
                date_time,
                patient:patients(name),
                professional:professionals(name)
            `)
            .order("date_time", { ascending: false })
            .limit(20);

        if (error) throw error;
        setAppointments(data || []);
    } catch (error) {
        console.error("Error fetching appointments:", error);
        // Mock fallback
        setAppointments([
            { id: "1", date_time: "2024-03-20T09:00:00", patient: { name: "Maria Silva" }, professional: { name: "Dr. Roberto" } },
            { id: "2", date_time: "2024-03-20T10:00:00", patient: { name: "João Santos" }, professional: { name: "Dra. Juliana" } }
        ]);
    } finally {
        setLoadingOpts(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.appointment_id || !formData.amount || !formData.date) {
        toast.error("Preencha todos os campos obrigatórios");
        return;
    }

    await onSave({
        appointment_id: formData.appointment_id,
        amount: parseFloat(formData.amount),
        method: formData.method,
        status: formData.status,
        date: formData.date
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Novo Pagamento</DialogTitle>
          <DialogDescription>
            Registre um pagamento associado a uma consulta.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="appointment">Consulta Referência</Label>
            <Select
              value={formData.appointment_id}
              onValueChange={(val) => setFormData({...formData, appointment_id: val})}
              disabled={loadingOpts}
            >
              <SelectTrigger id="appointment">
                <SelectValue placeholder={loadingOpts ? "Carregando..." : "Selecione a consulta"} />
              </SelectTrigger>
              <SelectContent>
                {appointments.map(apt => (
                  <SelectItem key={apt.id} value={apt.id}>
                    {new Date(apt.date_time).toLocaleDateString()} - {apt.patient?.name} ({apt.professional?.name})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Valor (R$)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                value={formData.amount}
                onChange={(e) => setFormData({...formData, amount: e.target.value})}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="date">Data do Pagamento</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="method">Forma de Pagamento</Label>
              <Select
                value={formData.method}
                onValueChange={(val: PaymentMethod) => setFormData({...formData, method: val})}
              >
                <SelectTrigger id="method">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dinheiro">Dinheiro</SelectItem>
                  <SelectItem value="cartao">Cartão</SelectItem>
                  <SelectItem value="pix">Pix</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(val: PaymentStatus) => setFormData({...formData, status: val})}
              >
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pendente">Pendente</SelectItem>
                  <SelectItem value="pago">Pago</SelectItem>
                  <SelectItem value="cancelado">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Salvar Pagamento
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
