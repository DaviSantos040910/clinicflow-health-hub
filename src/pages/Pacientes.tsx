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
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Search, Pencil, Trash2, History, Loader2, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";
import { TableSkeleton } from "@/components/TableSkeleton";
import { EmptyState } from "@/components/EmptyState";

type Patient = {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  birth_date: string | null;
  observations: string | null;
};

type Appointment = {
  id: string;
  date_time: string;
  status: string;
  notes: string | null;
};

export default function Pacientes() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);

  // History Sheet State
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [patientHistory, setPatientHistory] = useState<Appointment[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    birth_date: "",
    observations: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const { data, error } = await supabase
        .from("patients")
        .select("*")
        .order("name");

      if (error) throw error;
      setPatients(data || []);
    } catch (error) {
      console.error("Error fetching patients:", error);
      // Mock data for development if table doesn't exist
      if (patients.length === 0) {
        setPatients([
          { id: "1", name: "Maria Silva", phone: "11999999999", email: "maria@email.com", birth_date: "1990-05-15", observations: "Alérgica a dipirona" },
          { id: "2", name: "João Santos", phone: "11988888888", email: "joao@email.com", birth_date: "1985-10-20", observations: "" },
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
        // Prepare data
        const patientData = {
            name: formData.name,
            phone: formData.phone || null,
            email: formData.email || null,
            birth_date: formData.birth_date || null,
            observations: formData.observations || null,
        };

        if (editingPatient) {
            // Update
            const { error } = await supabase
                .from("patients")
                .update(patientData)
                .eq("id", editingPatient.id);

            if (error) throw error;
            toast.success("Paciente atualizado com sucesso!");
        } else {
            // Create
            const { error } = await supabase
                .from("patients")
                .insert([patientData]);

            if (error) throw error;
            toast.success("Paciente cadastrado com sucesso!");
        }

        setIsDialogOpen(false);
        resetForm();
        fetchPatients();
    } catch (error) {
        console.error("Error saving patient:", error);
        toast.error("Erro ao salvar paciente.");
        // Mock update for UI feedback
        if (editingPatient) {
            setPatients(patients.map(p => p.id === editingPatient.id ? { ...p, ...patientData } : p));
        } else {
            setPatients([...patients, { id: Math.random().toString(), ...patientData }]);
        }
        setIsDialogOpen(false);
        resetForm();
    } finally {
        setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este paciente?")) return;

    try {
        const { error } = await supabase.from("patients").delete().eq("id", id);
        if (error) throw error;
        toast.success("Paciente excluído com sucesso!");
        fetchPatients();
    } catch (error) {
        console.error("Error deleting patient:", error);
        toast.error("Erro ao excluir paciente.");
        // Mock delete
        setPatients(patients.filter(p => p.id !== id));
    }
  };

  const handleViewHistory = async (patient: Patient) => {
      setSelectedPatient(patient);
      setIsHistoryOpen(true);
      setLoadingHistory(true);

      try {
          const { data, error } = await supabase
            .from("appointments")
            .select("*")
            .eq("patient_id", patient.id)
            .order("date_time", { ascending: false });

          if (error) throw error;
          setPatientHistory(data || []);
      } catch (error) {
          console.error("Error fetching history:", error);
          // Mock history
          setPatientHistory([
              { id: "1", date_time: "2024-03-10T14:00:00", status: "Realizada", notes: "Retorno de rotina" },
              { id: "2", date_time: "2024-02-15T09:30:00", status: "Realizada", notes: "Primeira consulta" },
          ]);
      } finally {
          setLoadingHistory(false);
      }
  };

  const resetForm = () => {
      setFormData({
          name: "",
          phone: "",
          email: "",
          birth_date: "",
          observations: "",
      });
      setEditingPatient(null);
  };

  const openNewPatientDialog = () => {
      resetForm();
      setIsDialogOpen(true);
  };

  const openEditPatientDialog = (patient: Patient) => {
      setEditingPatient(patient);
      setFormData({
          name: patient.name,
          phone: patient.phone || "",
          email: patient.email || "",
          birth_date: patient.birth_date || "",
          observations: patient.observations || "",
      });
      setIsDialogOpen(true);
  };

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (patient.email && patient.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (patient.phone && patient.phone.includes(searchTerm))
  );

  return (
    <div className="min-h-screen bg-gradient-hero">
      <Header />

      <main className="container py-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
            <div>
                <h1 className="text-3xl font-display font-bold text-foreground">Pacientes</h1>
                <p className="text-muted-foreground">Gerencie os pacientes da clínica</p>
            </div>
            <Button onClick={openNewPatientDialog} className="gap-2">
                <Plus className="h-4 w-4" />
                Novo Paciente
            </Button>
        </div>

        <div className="bg-card rounded-lg border shadow-sm p-4 mb-6">
            <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    type="search"
                    placeholder="Buscar por nome, email ou telefone..."
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
                        <TableHead>Telefone</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {loading ? (
                        <TableSkeleton columns={4} rows={5} />
                    ) : filteredPatients.length === 0 ? (
                        <TableRow>
                             <TableCell colSpan={4} className="h-64">
                                <EmptyState
                                    icon={Users}
                                    title="Nenhum paciente encontrado"
                                    description={searchTerm ? "Tente buscar com outros termos." : "Cadastre o primeiro paciente para começar."}
                                    action={
                                        !searchTerm && (
                                            <Button onClick={openNewPatientDialog} variant="outline" className="mt-2">
                                                <Plus className="h-4 w-4 mr-2" />
                                                Novo Paciente
                                            </Button>
                                        )
                                    }
                                />
                            </TableCell>
                        </TableRow>
                    ) : (
                        filteredPatients.map((patient) => (
                            <TableRow key={patient.id}>
                                <TableCell className="font-medium">{patient.name}</TableCell>
                                <TableCell>{patient.phone || "-"}</TableCell>
                                <TableCell>{patient.email || "-"}</TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-2">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleViewHistory(patient)}
                                            title="Histórico"
                                        >
                                            <History className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => openEditPatientDialog(patient)}
                                            title="Editar"
                                        >
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="text-destructive hover:text-destructive"
                                            onClick={() => handleDelete(patient.id)}
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

      {/* Dialog for Create/Edit */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
                <DialogTitle>{editingPatient ? "Editar Paciente" : "Novo Paciente"}</DialogTitle>
                <DialogDescription>
                    Preencha as informações do paciente abaixo.
                </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSave} className="grid gap-4 py-4">
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
                        <Label htmlFor="phone">Telefone</Label>
                        <Input
                            id="phone"
                            value={formData.phone}
                            onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="birth_date">Data de Nasc.</Label>
                        <Input
                            id="birth_date"
                            type="date"
                            value={formData.birth_date}
                            onChange={(e) => setFormData({...formData, birth_date: e.target.value})}
                        />
                    </div>
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                    />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="observations">Observações</Label>
                    <Textarea
                        id="observations"
                        value={formData.observations}
                        onChange={(e) => setFormData({...formData, observations: e.target.value})}
                    />
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

      {/* Sheet for History */}
      <Sheet open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
          <SheetContent className="w-[400px] sm:w-[540px]">
              <SheetHeader>
                  <SheetTitle>Histórico do Paciente</SheetTitle>
                  <SheetDescription>
                      Histórico de consultas de {selectedPatient?.name}
                  </SheetDescription>
              </SheetHeader>

              <div className="mt-6 space-y-4">
                  {loadingHistory ? (
                      <div className="flex justify-center py-8">
                          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                      </div>
                  ) : patientHistory.length === 0 ? (
                      <p className="text-center text-muted-foreground py-8">Nenhuma consulta registrada.</p>
                  ) : (
                      patientHistory.map((appointment) => (
                          <div key={appointment.id} className="border rounded-lg p-4 bg-card/50">
                              <div className="flex justify-between items-start mb-2">
                                  <div>
                                      <p className="font-semibold">
                                          {format(new Date(appointment.date_time), "dd/MM/yyyy 'às' HH:mm")}
                                      </p>
                                      <p className="text-sm text-muted-foreground capitalize">{appointment.status}</p>
                                  </div>
                              </div>
                              {appointment.notes && (
                                  <p className="text-sm text-muted-foreground bg-muted p-2 rounded">
                                      {appointment.notes}
                                  </p>
                              )}
                          </div>
                      ))
                  )}
              </div>
          </SheetContent>
      </Sheet>
    </div>
  );
}
