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
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

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
  const [loading, setLoading] = useState(false);
  const [patients, setPatients] = useState<{ id: string; name: string }[]>([]);
  const [professionals, setProfessionals] = useState<{ id: string; name: string }[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(false);

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
      }
    }
  }, [isOpen, initialData, selectedDate]);

  const fetchOptions = async () => {
    setLoadingOptions(true);
    try {
      // Fetch Patients
      const patientsPromise = supabase.from("patients").select("id, name").order("name");
      const professionalsPromise = supabase.from("professionals").select("id, name").order("name");

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Timeout")), 2000)
      );

      const [patientsRes, professionalsRes] = await Promise.all([
        Promise.race([patientsPromise, timeoutPromise]) as Promise<{ data: any[], error: any }>,
        Promise.race([professionalsPromise, timeoutPromise]) as Promise<{ data: any[], error: any }>,
      ]);

      if (patientsRes.error) throw patientsRes.error;
      if (professionalsRes.error) throw professionalsRes.error;

      setPatients(patientsRes.data || []);
      setProfessionals(professionalsRes.data || []);

    } catch (error) {
      console.error("Error fetching options:", error);
      // Fallback mock data if fetch fails
      if (patients.length === 0) {
        setPatients([
          { id: "1", name: "Maria Silva" },
          { id: "2", name: "João Santos" },
          { id: "3", name: "Ana Oliveira" }
        ]);
        setProfessionals([
          { id: "1", name: "Dr. Roberto Almeida" },
          { id: "2", name: "Dra. Juliana Costa" }
        ]);
      }
    } finally {
      setLoadingOptions(false);
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{initialData ? "Editar Agendamento" : "Novo Agendamento"}</DialogTitle>
          <DialogDescription>
            Preencha os detalhes da consulta abaixo.
          </DialogDescription>
        </DialogHeader>

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
      </DialogContent>
    </Dialog>
  );
}
