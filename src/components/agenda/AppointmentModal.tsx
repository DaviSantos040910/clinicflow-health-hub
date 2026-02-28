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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, DollarSign, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { BillingModal } from "@/components/financeiro/BillingModal";
import { Badge } from "@/components/ui/badge";

export type AppointmentData = {
  id?: string;
  patient_id: string;
  professional_id: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  status: "agendada" | "confirmada" | "cancelada" | "concluida";
  notes: string;
};

interface AppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: AppointmentData) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
  initialData?: AppointmentData | null;
  selectedDate?: Date;
}

export function AppointmentModal({
  isOpen,
  onClose,
  onSave,
  onDelete,
  initialData,
  selectedDate,
}: AppointmentModalProps) {
  const { hasPermission } = useAuth();
  const [loading, setLoading] = useState(false);
  const [patients, setPatients] = useState<{ id: string; name: string; email?: string }[]>([]);
  const [professionals, setProfessionals] = useState<{ id: string; name: string }[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [billingModalOpen, setBillingModalOpen] = useState(false);
  const [currentBill, setCurrentBill] = useState<{ status: string; due_date: string; amount: number } | null>(null);

  const [formData, setFormData] = useState<AppointmentData>({
    patient_id: "",
    professional_id: "",
    date: "",
    time: "09:00",
    status: "agendada",
    notes: "",
  });

  useEffect(() => {
    if (isOpen) {
      fetchOptions();
      if (initialData) {
        setFormData(initialData);
        if (initialData.id) {
            fetchBillStatus(initialData.id);
        }
      } else {
        // Reset or set default date
        const defaultDate = selectedDate ? selectedDate.toISOString().split("T")[0] : new Date().toISOString().split("T")[0];
        setFormData({
          patient_id: "",
          professional_id: "",
          date: defaultDate,
          time: "09:00",
          status: "agendada",
          notes: "",
        });
        setCurrentBill(null);
      }
    }
  }, [isOpen, initialData, selectedDate]);

  const fetchOptions = async () => {
    setLoadingOptions(true);
    try {
      const patientsPromise = supabase.from("patients").select("id, name, email").order("name");
      const professionalsPromise = supabase.from("professionals").select("id, name").order("name");

      const [patientsRes, professionalsRes] = await Promise.all([patientsPromise, professionalsPromise]);

      if (patientsRes.error) throw patientsRes.error;
      if (professionalsRes.error) throw professionalsRes.error;

      setPatients(patientsRes.data || []);
      setProfessionals(professionalsRes.data || []);

    } catch (error) {
      console.error("Error fetching options:", error);
    } finally {
      setLoadingOptions(false);
    }
  };

  const fetchBillStatus = async (appointmentId: string) => {
    try {
       const { data, error } = await supabase
         .from('patient_bills')
         .select('status, due_date, amount')
         .eq('appointment_id', appointmentId)
         .maybeSingle();

       if (error) throw error;
       setCurrentBill(data);
    } catch (err) {
       console.error("Error fetching bill:", err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.patient_id || !formData.professional_id || !formData.date || !formData.time) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }
    setLoading(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error(error);
      toast.error("Erro ao salvar agendamento");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!initialData?.id || !onDelete) return;
    if (!confirm("Tem certeza que deseja cancelar/excluir este agendamento?")) return;

    setLoading(true);
    try {
      await onDelete(initialData.id);
      onClose();
    } catch (error) {
      console.error(error);
      toast.error("Erro ao excluir agendamento");
    } finally {
      setLoading(false);
    }
  };

  const canManageBilling = hasPermission(['admin', 'receptionist', 'owner']);

  const getPatientInfo = () => {
     const p = patients.find(pat => pat.id === formData.patient_id);
     return { name: p?.name || "Paciente", email: p?.email };
  };

  const getProfessionalName = () => {
     return professionals.find(prof => prof.id === formData.professional_id)?.name || "Profissional";
  };

  return (
    <>
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{initialData ? "Editar Agendamento" : "Novo Agendamento"}</DialogTitle>
          <DialogDescription>
            Preencha os detalhes da consulta abaixo.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="details">Detalhes</TabsTrigger>
            <TabsTrigger value="financial" disabled={!initialData?.id}>Financeiro</TabsTrigger>
          </TabsList>

          <TabsContent value="details">
            <form onSubmit={handleSubmit} className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="patient">Paciente *</Label>
                  <Select
                    value={formData.patient_id}
                    onValueChange={(val) => setFormData({...formData, patient_id: val})}
                    disabled={loadingOptions}
                  >
                    <SelectTrigger id="patient">
                      <SelectValue placeholder={loadingOptions ? "Carregando..." : "Selecione"} />
                    </SelectTrigger>
                    <SelectContent>
                      {patients.map(p => (
                        <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="professional">Profissional *</Label>
                  <Select
                    value={formData.professional_id}
                    onValueChange={(val) => setFormData({...formData, professional_id: val})}
                    disabled={loadingOptions}
                  >
                    <SelectTrigger id="professional">
                      <SelectValue placeholder={loadingOptions ? "Carregando..." : "Selecione"} />
                    </SelectTrigger>
                    <SelectContent>
                      {professionals.map(p => (
                        <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Data *</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="time">Horário *</Label>
                  <Input
                    id="time"
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData({...formData, time: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(val: any) => setFormData({...formData, status: val})}
                >
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="agendada">Agendada</SelectItem>
                    <SelectItem value="confirmada">Confirmada</SelectItem>
                    <SelectItem value="concluida">Concluída</SelectItem>
                    <SelectItem value="cancelada">Cancelada</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Observações</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  placeholder="Detalhes adicionais..."
                  rows={3}
                />
              </div>

              <DialogFooter className="flex justify-between sm:justify-between">
                {initialData && onDelete ? (
                  <Button type="button" variant="destructive" onClick={handleDelete} disabled={loading}>
                    Excluir
                  </Button>
                ) : <div />}

                <div className="flex gap-2">
                  <Button type="button" variant="outline" onClick={onClose}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Salvar
                  </Button>
                </div>
              </DialogFooter>
            </form>
          </TabsContent>

          <TabsContent value="financial" className="space-y-4 py-4">
              {!canManageBilling ? (
                 <div className="text-center py-8 text-muted-foreground">
                    Você não tem permissão para gerenciar cobranças.
                 </div>
              ) : (
                <div className="space-y-6">
                    {currentBill?.status === 'paid' ? (
                        <div className="flex flex-col items-center justify-center p-6 bg-green-50 rounded-lg border border-green-100">
                             <CheckCircle2 className="h-12 w-12 text-green-600 mb-2" />
                             <h3 className="text-lg font-bold text-green-800">Pagamento Confirmado</h3>
                             <p className="text-green-600">Valor: R$ {currentBill.amount.toFixed(2)}</p>
                             <Badge className="bg-green-600 mt-2">PAGO</Badge>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="bg-slate-50 p-4 rounded-lg border">
                                <h4 className="font-semibold mb-2">Status do Pagamento</h4>
                                {currentBill ? (
                                    <div className="flex items-center justify-between">
                                        <span>Pendente (R$ {currentBill.amount.toFixed(2)})</span>
                                        <Badge variant="outline" className="border-yellow-500 text-yellow-600 bg-yellow-50">
                                            Aguardando
                                        </Badge>
                                    </div>
                                ) : (
                                    <p className="text-sm text-muted-foreground">Nenhuma cobrança gerada para este agendamento.</p>
                                )}
                            </div>

                            {(!currentBill || currentBill.status !== 'paid') && (
                                <Button className="w-full" onClick={() => setBillingModalOpen(true)}>
                                    <DollarSign className="mr-2 h-4 w-4" />
                                    Gerar Link de Pagamento
                                </Button>
                            )}
                        </div>
                    )}
                </div>
              )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>

    {initialData?.id && billingModalOpen && (
        <BillingModal
            isOpen={billingModalOpen}
            onClose={() => {
                setBillingModalOpen(false);
                if (initialData.id) fetchBillStatus(initialData.id); // Refresh status
            }}
            appointmentId={initialData.id}
            patientName={getPatientInfo().name}
            patientEmail={getPatientInfo().email}
            professionalName={getProfessionalName()}
        />
    )}
    </>
  );
}
