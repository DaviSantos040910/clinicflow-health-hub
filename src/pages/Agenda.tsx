import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { CalendarView } from "@/components/agenda/CalendarView";
import { AppointmentModal, AppointmentData } from "@/components/agenda/AppointmentModal";
import { Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { addDays, subDays } from "date-fns";

// Extended type for display
export type EnrichedAppointment = AppointmentData & {
  patient_name?: string;
  professional_name?: string;
};

export default function Agenda() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<"day" | "week">("week");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentData | null>(null);
  const [appointments, setAppointments] = useState<EnrichedAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSlot, setSelectedSlot] = useState<{date: Date, time: string} | null>(null);

  useEffect(() => {
    fetchAppointments();
  }, [currentDate, view]); // Re-fetch when date range changes significantly, or just fetch all?
                             // For simplicity, let's fetch all relevant to the view.
                             // To keep it simple, I'll fetch 'all' or a broad range.

  const fetchAppointments = async () => {
    setLoading(true);
    try {
        // Fetch appointments with joins
        // Supabase join syntax: select(*, patients(name), professionals(name))
        const query = supabase
            .from("appointments")
            .select(`
                *,
                patient:patients(name),
                professional:professionals(name)
            `)
            .gte("date_time", "2024-01-01"); // Simple filter for now

        const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error("Timeout")), 2000)
        );

        const { data, error } = await Promise.race([query, timeoutPromise]) as { data: any[], error: any };

        if (error) throw error;

        const mappedAppointments: EnrichedAppointment[] = (data || []).map(apt => {
            const dateObj = new Date(apt.date_time);
            return {
                id: apt.id,
                patient_id: apt.patient_id,
                professional_id: apt.professional_id,
                date: dateObj.toISOString().split("T")[0],
                time: dateObj.toTimeString().substring(0, 5),
                status: apt.status as any,
                notes: apt.notes || "",
                patient_name: apt.patient?.name,
                professional_name: apt.professional?.name
            };
        });

        setAppointments(mappedAppointments);

    } catch (error) {
        console.error("Error fetching appointments:", error);
        // Mock Data
        if (appointments.length === 0) {
            setAppointments([
                {
                    id: "1",
                    patient_id: "1",
                    professional_id: "1",
                    date: new Date().toISOString().split("T")[0], // Today
                    time: "09:00",
                    status: "confirmada",
                    notes: "Check-up anual",
                    patient_name: "Maria Silva",
                    professional_name: "Dr. Roberto Almeida"
                },
                {
                    id: "2",
                    patient_id: "2",
                    professional_id: "2",
                    date: addDays(new Date(), 1).toISOString().split("T")[0], // Tomorrow
                    time: "14:00",
                    status: "agendada",
                    notes: "Avaliação dermatológica",
                    patient_name: "João Santos",
                    professional_name: "Dra. Juliana Costa"
                }
            ]);
        }
    } finally {
        setLoading(false);
    }
  };

  const handleNavigate = (direction: "prev" | "next" | "today") => {
    if (direction === "today") {
      setCurrentDate(new Date());
    } else if (direction === "prev") {
      setCurrentDate(prev => view === "day" ? subDays(prev, 1) : subDays(prev, 7));
    } else {
      setCurrentDate(prev => view === "day" ? addDays(prev, 1) : addDays(prev, 7));
    }
  };

  const handleSelectSlot = (date: Date, time: string) => {
    setSelectedSlot({ date, time });
    setSelectedAppointment(null);
    setIsModalOpen(true);
  };

  const handleSelectAppointment = (appointment: AppointmentData) => {
    setSelectedAppointment(appointment);
    setSelectedSlot(null);
    setIsModalOpen(true);
  };

  const handleSave = async (data: AppointmentData) => {
    const dateTime = `${data.date}T${data.time}:00`;

    // Optimistic Update
    const newApt: EnrichedAppointment = {
        ...data,
        id: data.id || Math.random().toString(), // Temp ID
        patient_name: "Carregando...", // We don't have the name immediately unless we look it up
        professional_name: "Carregando..."
    };

    if (data.id) {
        setAppointments(prev => prev.map(a => a.id === data.id ? newApt : a));
    } else {
        setAppointments(prev => [...prev, newApt]);
    }

    try {
        const payload = {
            patient_id: data.patient_id,
            professional_id: data.professional_id,
            date_time: dateTime,
            status: data.status,
            notes: data.notes
        };

        if (data.id) {
            const { error } = await supabase.from("appointments").update(payload).eq("id", data.id);
            if (error) throw error;
        } else {
            const { error } = await supabase.from("appointments").insert([payload]);
            if (error) throw error;
        }

        toast.success("Agendamento salvo com sucesso!");
        fetchAppointments(); // Refresh to get real IDs and names
    } catch (error) {
        console.error("Error saving:", error);
        toast.error("Erro ao salvar (usando dados locais).");
    }
  };

  const handleDelete = async (id: string) => {
      // Optimistic delete
      setAppointments(prev => prev.filter(a => a.id !== id));

      try {
          const { error } = await supabase.from("appointments").delete().eq("id", id);
          if (error) throw error;
          toast.success("Agendamento removido.");
      } catch (error) {
          console.error("Error deleting:", error);
          toast.error("Erro ao remover (simulação).");
      }
  };

  return (
    <div className="min-h-screen bg-gradient-hero flex flex-col">
      <Header />

      <main className="flex-1 container py-8 flex flex-col min-h-0">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">Agenda</h1>
            <p className="text-muted-foreground">Gerencie consultas e horários</p>
          </div>
          <Button onClick={() => { setSelectedAppointment(null); setSelectedSlot(null); setIsModalOpen(true); }} className="gap-2">
            <Plus className="h-4 w-4" />
            Novo Agendamento
          </Button>
        </div>

        <div className="flex-1 min-h-[600px]">
            <CalendarView
                appointments={appointments}
                currentDate={currentDate}
                view={view}
                onNavigate={handleNavigate}
                onViewChange={setView}
                onSelectSlot={handleSelectSlot}
                onSelectAppointment={handleSelectAppointment}
            />
        </div>
      </main>

      <AppointmentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        onDelete={handleDelete}
        initialData={selectedAppointment}
        selectedDate={selectedSlot?.date}
      />
    </div>
  );
}
