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
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Pencil, Trash2, History, Loader2, Users, DollarSign, FileText, CheckCircle2, AlertCircle, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";
import { TableSkeleton } from "@/components/TableSkeleton";
import { EmptyState } from "@/components/EmptyState";
import { useAuth } from "@/contexts/AuthContext";

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
    professional_id: string | null;
};

type PatientBill = {
    id: string;
    amount: number;
    status: string;
    description: string | null;
    payment_method: string | null;
    paid_at: string | null;
    created_at: string;
};

export default function Pacientes() {
    const [patients, setPatients] = useState<Patient[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
    const { role, user } = useAuth();

    const canEdit = role === 'admin' || role === 'recepcionista';
    const isDoctor = role === 'profissional';

    // History Sheet State
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
    const [patientHistory, setPatientHistory] = useState<Appointment[]>([]);
    const [patientBills, setPatientBills] = useState<PatientBill[]>([]);
    const [loadingHistory, setLoadingHistory] = useState(false);

    // Doctor notes state
    const [consultationNotes, setConsultationNotes] = useState("");
    const [savingNotes, setSavingNotes] = useState(false);

    // Professional ID for doctor filtering
    const [myProfessionalId, setMyProfessionalId] = useState<string | null>(null);

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
        if (isDoctor && user) {
            // Find the professional record linked to the user
            supabase
                .from("professionals")
                .select("id")
                .eq("user_id", user.id)
                .maybeSingle()
                .then(({ data }) => {
                    if (data) {
                        setMyProfessionalId(data.id);
                    }
                });
        }
    }, [isDoctor, user]);

    useEffect(() => {
        if (isDoctor && myProfessionalId === null && user) return; // Wait for professional ID
        fetchPatients();
    }, [myProfessionalId]);

    const fetchPatients = async () => {
        try {
            if (isDoctor && myProfessionalId) {
                // Fetch only patients that have appointments with this doctor
                const { data: appointmentData, error: aptError } = await supabase
                    .from("appointments")
                    .select("patient_id")
                    .eq("professional_id", myProfessionalId);

                if (aptError) throw aptError;

                const patientIds = [...new Set((appointmentData || []).map(a => a.patient_id))];

                if (patientIds.length === 0) {
                    setPatients([]);
                    setLoading(false);
                    return;
                }

                const { data, error } = await supabase
                    .from("patients")
                    .select("*")
                    .in("id", patientIds)
                    .order("name");

                if (error) throw error;
                setPatients(data || []);
            } else {
                const { data, error } = await supabase
                    .from("patients")
                    .select("*")
                    .order("name");

                if (error) throw error;
                setPatients(data || []);
            }
        } catch (error) {
            console.error("Error fetching patients:", error);
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
            const patientData = {
                name: formData.name,
                phone: formData.phone || null,
                email: formData.email || null,
                birth_date: formData.birth_date || null,
                observations: formData.observations || null,
            };

            if (editingPatient) {
                const { error } = await supabase
                    .from("patients")
                    .update(patientData)
                    .eq("id", editingPatient.id);
                if (error) throw error;
                toast.success("Paciente atualizado com sucesso!");
            } else {
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
            const patientData = {
                name: formData.name,
                phone: formData.phone || null,
                email: formData.email || null,
                birth_date: formData.birth_date || null,
                observations: formData.observations || null,
            };
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
            setPatients(patients.filter(p => p.id !== id));
        }
    };

    const handleViewHistory = async (patient: Patient) => {
        setSelectedPatient(patient);
        setIsHistoryOpen(true);
        setLoadingHistory(true);
        setConsultationNotes(patient.observations || "");

        try {
            // Fetch appointment history
            const appointmentQuery = supabase
                .from("appointments")
                .select("*")
                .eq("patient_id", patient.id)
                .order("date_time", { ascending: false });

            // If doctor, only show their appointments
            const query = isDoctor && myProfessionalId
                ? appointmentQuery.eq("professional_id", myProfessionalId)
                : appointmentQuery;

            const { data, error } = await query;
            if (error) throw error;
            setPatientHistory(data || []);

            // Fetch financial data (for admin and recepcionista)
            if (canEdit) {
                const { data: billData, error: billError } = await supabase
                    .from("patient_bills")
                    .select("*")
                    .eq("patient_id", patient.id)
                    .order("created_at", { ascending: false });

                if (!billError) {
                    setPatientBills(billData || []);
                }
            }
        } catch (error) {
            console.error("Error fetching history:", error);
            setPatientHistory([
                { id: "1", date_time: "2024-03-10T14:00:00", status: "Realizada", notes: "Retorno de rotina", professional_id: null },
                { id: "2", date_time: "2024-02-15T09:30:00", status: "Realizada", notes: "Primeira consulta", professional_id: null },
            ]);
        } finally {
            setLoadingHistory(false);
        }
    };

    const handleSaveNotes = async () => {
        if (!selectedPatient) return;
        setSavingNotes(true);
        try {
            const { error } = await supabase
                .from("patients")
                .update({ observations: consultationNotes })
                .eq("id", selectedPatient.id);
            if (error) throw error;
            toast.success("Observações salvas com sucesso!");
            // Update local state
            setPatients(patients.map(p => p.id === selectedPatient.id ? { ...p, observations: consultationNotes } : p));
            setSelectedPatient({ ...selectedPatient, observations: consultationNotes });
        } catch (error) {
            console.error("Error saving notes:", error);
            toast.error("Erro ao salvar observações.");
        } finally {
            setSavingNotes(false);
        }
    };

    const handleConfirmPayment = async (billId: string) => {
        try {
            const { error } = await supabase
                .from("patient_bills")
                .update({ status: 'paid', paid_at: new Date().toISOString(), payment_method: 'cash' })
                .eq("id", billId);
            if (error) throw error;
            toast.success("Pagamento confirmado!");
            setPatientBills(patientBills.map(b => b.id === billId ? { ...b, status: 'paid', paid_at: new Date().toISOString() } : b));
        } catch (error) {
            console.error("Error confirming payment:", error);
            toast.error("Erro ao confirmar pagamento.");
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

    const getBillStatusBadge = (status: string) => {
        switch (status) {
            case 'paid':
                return <Badge className="bg-green-100 text-green-700 hover:bg-green-100"><CheckCircle2 className="w-3 h-3 mr-1" /> Pago</Badge>;
            case 'pending':
                return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100"><Clock className="w-3 h-3 mr-1" /> Pendente</Badge>;
            case 'canceled':
                return <Badge className="bg-red-100 text-red-700 hover:bg-red-100"><AlertCircle className="w-3 h-3 mr-1" /> Cancelado</Badge>;
            default:
                return <Badge variant="secondary">{status}</Badge>;
        }
    };

    return (
        <div className="min-h-screen bg-gradient-hero">
            <Header />

            <main className="container py-8">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-display font-bold text-foreground">
                            {isDoctor ? "Meus Pacientes" : "Pacientes"}
                        </h1>
                        <p className="text-muted-foreground">
                            {isDoctor ? "Pacientes que você atende" : "Gerencie os pacientes da clínica"}
                        </p>
                    </div>
                    {canEdit && (
                        <Button onClick={openNewPatientDialog} className="gap-2">
                            <Plus className="h-4 w-4" />
                            Novo Paciente
                        </Button>
                    )}
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
                                            description={searchTerm ? "Tente buscar com outros termos." : isDoctor ? "Nenhum paciente vinculado a você ainda." : "Cadastre o primeiro paciente para começar."}
                                            action={
                                                !searchTerm && canEdit && (
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
                                                    title="Ver detalhes"
                                                >
                                                    <History className="h-4 w-4" />
                                                </Button>
                                                {canEdit && (
                                                    <>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => openEditPatientDialog(patient)}
                                                            title="Editar"
                                                        >
                                                            <Pencil className="h-4 w-4" />
                                                        </Button>
                                                        {role === 'admin' && (
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="text-destructive hover:text-destructive"
                                                                onClick={() => handleDelete(patient.id)}
                                                                title="Excluir"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        )}
                                                    </>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </main>

            {/* Dialog for Create/Edit (only admin/recepcionista) */}
            {canEdit && (
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
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="phone">Telefone</Label>
                                    <Input
                                        id="phone"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="birth_date">Data de Nasc.</Label>
                                    <Input
                                        id="birth_date"
                                        type="date"
                                        value={formData.birth_date}
                                        onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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
            )}

            {/* Sheet for Patient Details */}
            <Sheet open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
                <SheetContent className="w-[400px] sm:w-[600px] overflow-y-auto">
                    <SheetHeader>
                        <SheetTitle>Detalhes do Paciente</SheetTitle>
                        <SheetDescription>
                            {selectedPatient?.name}
                        </SheetDescription>
                    </SheetHeader>

                    <div className="mt-6 space-y-6">
                        {/* Patient Info */}
                        <div className="space-y-3 bg-muted/30 rounded-lg p-4">
                            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Informações</h3>
                            <div className="grid grid-cols-2 gap-3 text-sm">
                                <div>
                                    <span className="text-muted-foreground">Telefone:</span>
                                    <p className="font-medium">{selectedPatient?.phone || "-"}</p>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">Email:</span>
                                    <p className="font-medium">{selectedPatient?.email || "-"}</p>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">Data de Nasc.:</span>
                                    <p className="font-medium">{selectedPatient?.birth_date ? format(new Date(selectedPatient.birth_date + 'T00:00:00'), "dd/MM/yyyy") : "-"}</p>
                                </div>
                            </div>
                        </div>

                        {/* Doctor-only: Consultation Notes */}
                        {isDoctor && (
                            <div className="space-y-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                                <div className="flex items-center gap-2">
                                    <FileText className="w-4 h-4 text-blue-600" />
                                    <h3 className="font-semibold text-sm text-blue-700 dark:text-blue-400 uppercase tracking-wide">Observações da Consulta</h3>
                                </div>
                                <p className="text-xs text-blue-600/70 dark:text-blue-400/70">Apenas você (médico) pode ver e editar estas observações.</p>
                                <Textarea
                                    value={consultationNotes}
                                    onChange={(e) => setConsultationNotes(e.target.value)}
                                    placeholder="Anotações sobre o andamento com o paciente..."
                                    className="min-h-[100px] bg-white dark:bg-background"
                                />
                                <Button size="sm" onClick={handleSaveNotes} disabled={savingNotes}>
                                    {savingNotes && <Loader2 className="mr-2 h-3 w-3 animate-spin" />}
                                    Salvar Observações
                                </Button>
                            </div>
                        )}

                        {/* Financial Section (Admin & Recepcionista only) */}
                        {canEdit && (
                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <DollarSign className="w-4 h-4 text-green-600" />
                                    <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Financeiro</h3>
                                </div>
                                {patientBills.length === 0 ? (
                                    <p className="text-sm text-muted-foreground text-center py-4">Nenhuma cobrança registrada.</p>
                                ) : (
                                    <div className="space-y-2">
                                        {patientBills.map((bill) => (
                                            <div key={bill.id} className="border rounded-lg p-3 bg-card/50 flex items-center justify-between">
                                                <div>
                                                    <p className="text-sm font-medium">{bill.description || "Consulta"}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        R$ {bill.amount.toFixed(2)} • {format(new Date(bill.created_at), "dd/MM/yyyy")}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {getBillStatusBadge(bill.status)}
                                                    {bill.status === 'pending' && (
                                                        <Button size="sm" variant="outline" onClick={() => handleConfirmPayment(bill.id)}>
                                                            Confirmar Pgto
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Appointment History */}
                        <div className="space-y-3">
                            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Histórico de Consultas</h3>
                            {loadingHistory ? (
                                <div className="flex justify-center py-8">
                                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                                </div>
                            ) : patientHistory.length === 0 ? (
                                <p className="text-center text-muted-foreground py-4 text-sm">Nenhuma consulta registrada.</p>
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
                    </div>
                </SheetContent>
            </Sheet>
        </div>
    );
}
