import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Search, Pencil, Trash2, Loader2, Calendar, Stethoscope } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Json } from "@/integrations/supabase/types";
import { TableSkeleton } from "@/components/TableSkeleton";
import { EmptyState } from "@/components/EmptyState";

type ScheduleDay = {
  enabled: boolean;
  start: string;
  end: string;
};

type Schedule = {
  [key: string]: ScheduleDay; // monday, tuesday, etc.
};

type Professional = {
  id: string;
  name: string;
  specialty: string;
  registration_number: string | null;
  consultation_fee: number | null;
  schedule: Schedule | null;
};

const DAYS_OF_WEEK = [
  { id: "monday", label: "Segunda" },
  { id: "tuesday", label: "Terça" },
  { id: "wednesday", label: "Quarta" },
  { id: "thursday", label: "Quinta" },
  { id: "friday", label: "Sexta" },
  { id: "saturday", label: "Sábado" },
  { id: "sunday", label: "Domingo" },
];

const DEFAULT_SCHEDULE_DAY: ScheduleDay = { enabled: false, start: "09:00", end: "18:00" };

export default function Profissionais() {
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProfessional, setEditingProfessional] = useState<Professional | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    specialty: "",
    registration_number: "",
    consultation_fee: "",
    schedule: {} as Schedule,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProfessionals();
  }, []);

  const fetchProfessionals = async () => {
    try {
      // Add timeout to force mock data if backend is unreachable
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Timeout")), 2000)
      );

      const supabasePromise = supabase
        .from("professionals")
        .select("*")
        .order("name");

      const { data, error } = await Promise.race([supabasePromise, timeoutPromise]) as { data: any[]; error: any };

      if (error) throw error;

      // Parse schedule JSON if needed, though supabase client usually handles it.
      // We need to ensure type safety manually sometimes.
      const parsedData = (data || []).map(p => ({
          ...p,
          schedule: p.schedule as Schedule | null
      }));

      setProfessionals(parsedData);
    } catch (error) {
      console.error("Error fetching professionals:", error);
      // Mock data
      if (professionals.length === 0) {
        setProfessionals([
          {
            id: "1",
            name: "Dr. Roberto Almeida",
            specialty: "Cardiologia",
            registration_number: "CRM/SP 123456",
            consultation_fee: 350.00,
            schedule: {
                monday: { enabled: true, start: "08:00", end: "12:00" },
                wednesday: { enabled: true, start: "14:00", end: "18:00" }
            }
          },
          {
            id: "2",
            name: "Dra. Juliana Costa",
            specialty: "Dermatologia",
            registration_number: "CRM/SP 654321",
            consultation_fee: 400.00,
            schedule: {
                tuesday: { enabled: true, start: "09:00", end: "17:00" },
                thursday: { enabled: true, start: "09:00", end: "17:00" }
            }
          },
        ]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
        const professionalData = {
            name: formData.name,
            specialty: formData.specialty,
            registration_number: formData.registration_number || null,
            consultation_fee: formData.consultation_fee ? parseFloat(formData.consultation_fee) : null,
            schedule: formData.schedule as unknown as Json,
        };

        if (editingProfessional) {
            const { error } = await supabase
                .from("professionals")
                .update(professionalData)
                .eq("id", editingProfessional.id);

            if (error) throw error;
            toast.success("Profissional atualizado com sucesso!");
        } else {
            const { error } = await supabase
                .from("professionals")
                .insert([professionalData]);

            if (error) throw error;
            toast.success("Profissional cadastrado com sucesso!");
        }

        setIsDialogOpen(false);
        resetForm();
        fetchProfessionals();
    } catch (error) {
        console.error("Error saving professional:", error);
        toast.error("Erro ao salvar profissional.");

        // Mock UI update
        const newProf = {
            id: editingProfessional ? editingProfessional.id : Math.random().toString(),
            name: formData.name,
            specialty: formData.specialty,
            registration_number: formData.registration_number || null,
            consultation_fee: formData.consultation_fee ? parseFloat(formData.consultation_fee) : null,
            schedule: formData.schedule,
        };

        if (editingProfessional) {
             setProfessionals(professionals.map(p => p.id === editingProfessional.id ? newProf : p));
        } else {
             setProfessionals([...professionals, newProf]);
        }
        setIsDialogOpen(false);
        resetForm();
    } finally {
        setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este profissional?")) return;

    try {
        const { error } = await supabase.from("professionals").delete().eq("id", id);
        if (error) throw error;
        toast.success("Profissional excluído com sucesso!");
        fetchProfessionals();
    } catch (error) {
        console.error("Error deleting professional:", error);
        toast.error("Erro ao excluir profissional.");
        setProfessionals(professionals.filter(p => p.id !== id));
    }
  };

  const resetForm = () => {
      // Initialize schedule with all days disabled
      const initialSchedule: Schedule = {};
      DAYS_OF_WEEK.forEach(day => {
          initialSchedule[day.id] = { ...DEFAULT_SCHEDULE_DAY };
      });

      setFormData({
          name: "",
          specialty: "",
          registration_number: "",
          consultation_fee: "",
          schedule: initialSchedule,
      });
      setEditingProfessional(null);
  };

  const openNewDialog = () => {
      resetForm();
      setIsDialogOpen(true);
  };

  const openEditDialog = (professional: Professional) => {
      setEditingProfessional(professional);

      // Merge saved schedule with default structure to ensure all days exist in state
      const currentSchedule = professional.schedule || {};
      const fullSchedule: Schedule = {};
      DAYS_OF_WEEK.forEach(day => {
          fullSchedule[day.id] = currentSchedule[day.id] || { ...DEFAULT_SCHEDULE_DAY };
      });

      setFormData({
          name: professional.name,
          specialty: professional.specialty,
          registration_number: professional.registration_number || "",
          consultation_fee: professional.consultation_fee?.toString() || "",
          schedule: fullSchedule,
      });
      setIsDialogOpen(true);
  };

  const updateScheduleDay = (dayId: string, field: keyof ScheduleDay, value: boolean | string) => {
      setFormData(prev => ({
          ...prev,
          schedule: {
              ...prev.schedule,
              [dayId]: {
                  ...prev.schedule[dayId],
                  [field]: value
              }
          }
      }));
  };

  const filteredProfessionals = professionals.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.specialty.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-hero">
      <Header />

      <main className="container py-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
            <div>
                <h1 className="text-3xl font-display font-bold text-foreground">Profissionais</h1>
                <p className="text-muted-foreground">Gerencie a equipe médica e horários</p>
            </div>
            <Button onClick={openNewDialog} className="gap-2">
                <Plus className="h-4 w-4" />
                Novo Profissional
            </Button>
        </div>

        <div className="bg-card rounded-lg border shadow-sm p-4 mb-6">
            <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    type="search"
                    placeholder="Buscar por nome ou especialidade..."
                    className="pl-9"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
        </div>

        <div className="bg-card rounded-lg border shadow-sm overflow-hidden">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead>Especialidade</TableHead>
                        <TableHead>Registro</TableHead>
                        <TableHead>Valor Consulta</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {loading ? (
                        <TableSkeleton columns={5} rows={5} />
                    ) : filteredProfessionals.length === 0 ? (
                        <TableRow>
                             <TableCell colSpan={5} className="h-64">
                                <EmptyState
                                    icon={Stethoscope}
                                    title="Nenhum profissional encontrado"
                                    description={searchTerm ? "Tente buscar com outros termos." : "Cadastre o primeiro profissional."}
                                    action={
                                        !searchTerm && (
                                            <Button onClick={openNewDialog} variant="outline" className="mt-2">
                                                <Plus className="h-4 w-4 mr-2" />
                                                Novo Profissional
                                            </Button>
                                        )
                                    }
                                />
                            </TableCell>
                        </TableRow>
                    ) : (
                        filteredProfessionals.map((professional) => (
                            <TableRow key={professional.id}>
                                <TableCell className="font-medium">{professional.name}</TableCell>
                                <TableCell>{professional.specialty}</TableCell>
                                <TableCell>{professional.registration_number || "-"}</TableCell>
                                <TableCell>
                                    {professional.consultation_fee
                                        ? `R$ ${professional.consultation_fee.toFixed(2)}`
                                        : "-"}
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-2">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => openEditDialog(professional)}
                                            title="Editar"
                                        >
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="text-destructive hover:text-destructive"
                                            onClick={() => handleDelete(professional.id)}
                                            title="Excluir"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
      </main>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
                <DialogTitle>{editingProfessional ? "Editar Profissional" : "Novo Profissional"}</DialogTitle>
                <DialogDescription>
                    Preencha as informações do profissional e defina sua agenda.
                </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSave} className="space-y-6 py-4">
                <div className="space-y-4">
                    <h3 className="text-lg font-medium">Dados Pessoais</h3>
                    <div className="grid gap-2">
                        <Label htmlFor="name">Nome completo</Label>
                        <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                            required
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="specialty">Especialidade</Label>
                            <Input
                                id="specialty"
                                value={formData.specialty}
                                onChange={(e) => setFormData({...formData, specialty: e.target.value})}
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="registration_number">Registro Profissional (CRM/etc)</Label>
                            <Input
                                id="registration_number"
                                value={formData.registration_number}
                                onChange={(e) => setFormData({...formData, registration_number: e.target.value})}
                            />
                        </div>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="consultation_fee">Valor da Consulta (R$)</Label>
                        <Input
                            id="consultation_fee"
                            type="number"
                            step="0.01"
                            value={formData.consultation_fee}
                            onChange={(e) => setFormData({...formData, consultation_fee: e.target.value})}
                        />
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <Calendar className="h-5 w-5" />
                        <h3 className="text-lg font-medium">Agenda Semanal</h3>
                    </div>

                    <div className="space-y-3 border rounded-md p-4 bg-muted/20">
                        {DAYS_OF_WEEK.map((day) => (
                            <div key={day.id} className="flex items-center gap-4">
                                <div className="flex items-center gap-2 w-32">
                                    <Checkbox
                                        id={`day-${day.id}`}
                                        checked={formData.schedule[day.id]?.enabled || false}
                                        onCheckedChange={(checked) => updateScheduleDay(day.id, 'enabled', checked === true)}
                                    />
                                    <Label htmlFor={`day-${day.id}`} className="cursor-pointer">
                                        {day.label}
                                    </Label>
                                </div>
                                {formData.schedule[day.id]?.enabled && (
                                    <div className="flex items-center gap-2 animate-fade-in">
                                        <Input
                                            type="time"
                                            value={formData.schedule[day.id]?.start}
                                            onChange={(e) => updateScheduleDay(day.id, 'start', e.target.value)}
                                            className="w-24 h-8"
                                        />
                                        <span className="text-muted-foreground">até</span>
                                        <Input
                                            type="time"
                                            value={formData.schedule[day.id]?.end}
                                            onChange={(e) => updateScheduleDay(day.id, 'end', e.target.value)}
                                            className="w-24 h-8"
                                        />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                        Cancelar
                    </Button>
                    <Button type="submit" disabled={saving}>
                        {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Salvar
                    </Button>
                </DialogFooter>
            </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
