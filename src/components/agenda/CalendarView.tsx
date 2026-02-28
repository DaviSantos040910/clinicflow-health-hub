import { format, startOfWeek, addDays, isSameDay, parseISO, isSameWeek } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, Loader2, DollarSign, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AppointmentData } from "./AppointmentModal";
import { EnrichedAppointment } from "@/pages/Agenda";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface CalendarViewProps {
  appointments: EnrichedAppointment[];
  currentDate: Date;
  view: "day" | "week";
  onNavigate: (direction: "prev" | "next" | "today") => void;
  onViewChange: (view: "day" | "week") => void;
  onSelectSlot: (date: Date, time: string) => void;
  onSelectAppointment: (appointment: AppointmentData) => void;
  loading?: boolean;
}

const HOURS = Array.from({ length: 11 }, (_, i) => i + 8); // 8:00 to 18:00

export function CalendarView({
  appointments,
  currentDate,
  view,
  onNavigate,
  onViewChange,
  onSelectSlot,
  onSelectAppointment,
  loading = false,
}: CalendarViewProps) {
  // Use state to store bill statuses: { appointment_id: 'paid' | 'pending' | null }
  const [billStatuses, setBillStatuses] = useState<Record<string, string>>({});

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 }); // Monday start
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  // Helper to filter appointments for a specific slot
  const getAppointmentsForSlot = (date: Date, hour: number) => {
    return appointments.filter(apt => {
      const aptDate = parseISO(apt.date);
      const aptHour = parseInt(apt.time.split(":")[0]);
      return isSameDay(aptDate, date) && aptHour === hour;
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmada": return "bg-green-100 text-green-700 border-green-200 hover:bg-green-200";
      case "cancelada": return "bg-red-100 text-red-700 border-red-200 hover:bg-red-200";
      case "concluida": return "bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200";
      default: return "bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-200"; // agendada
    }
  };

  // Fetch billing statuses for displayed appointments
  useEffect(() => {
    if (appointments.length > 0) {
      const ids = appointments.map(a => a.id).filter(Boolean);
      const fetchBills = async () => {
        const { data } = await supabase
          .from("patient_bills")
          .select("appointment_id, status")
          .in("appointment_id", ids);

        if (data) {
          const statusMap: Record<string, string> = {};
          data.forEach(bill => {
            if (bill.appointment_id) statusMap[bill.appointment_id] = bill.status;
          });
          setBillStatuses(statusMap);
        }
      };

      fetchBills();
    }
  }, [appointments]);

  return (
    <div className="flex flex-col h-full bg-card border rounded-lg shadow-sm overflow-hidden">
      {/* Calendar Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => onNavigate("prev")}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={() => onNavigate("next")}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button variant="ghost" onClick={() => onNavigate("today")}>
            Hoje
          </Button>
          <h2 className="text-lg font-semibold ml-2 capitalize">
            {format(currentDate, "MMMM yyyy", { locale: ptBR })}
          </h2>
        </div>

        <div className="flex bg-muted p-1 rounded-md">
          <button
            onClick={() => onViewChange("day")}
            className={cn(
              "px-3 py-1.5 text-sm font-medium rounded-sm transition-all",
              view === "day" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
            )}
          >
            Dia
          </button>
          <button
            onClick={() => onViewChange("week")}
            className={cn(
              "px-3 py-1.5 text-sm font-medium rounded-sm transition-all",
              view === "week" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
            )}
          >
            Semana
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 overflow-y-auto relative">
        {loading && (
          <div className="absolute inset-0 bg-background/50 backdrop-blur-[1px] z-50 flex items-center justify-center">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground font-medium">Carregando agenda...</p>
            </div>
          </div>
        )}
        <div className="flex flex-col min-w-[800px]">
          {/* Header Row (Days) */}
          <div className="flex border-b sticky top-0 bg-card z-10">
            <div className="w-16 flex-shrink-0 border-r p-2 text-center text-xs text-muted-foreground bg-muted/30">
              <Clock className="h-4 w-4 mx-auto" />
            </div>
            {view === "week" ? (
              weekDays.map((day) => (
                <div
                  key={day.toISOString()}
                  className={cn(
                    "flex-1 p-2 text-center border-r last:border-r-0 min-w-[120px]",
                    isSameDay(day, new Date()) && "bg-accent/50"
                  )}
                >
                  <div className="text-xs text-muted-foreground uppercase">{format(day, "EEE", { locale: ptBR })}</div>
                  <div className={cn(
                    "text-lg font-semibold w-8 h-8 rounded-full flex items-center justify-center mx-auto mt-1",
                    isSameDay(day, new Date()) && "bg-primary text-primary-foreground"
                  )}>
                    {format(day, "d")}
                  </div>
                </div>
              ))
            ) : (
              <div className="flex-1 p-2 text-center">
                <div className="text-xs text-muted-foreground uppercase">{format(currentDate, "EEEE", { locale: ptBR })}</div>
                <div className="text-lg font-semibold text-primary">{format(currentDate, "d 'de' MMMM")}</div>
              </div>
            )}
          </div>

          {/* Time Slots */}
          {HOURS.map((hour) => (
            <div key={hour} className="flex border-b last:border-b-0 min-h-[100px]">
              {/* Time Label */}
              <div className="w-16 flex-shrink-0 border-r p-2 text-center text-sm text-muted-foreground sticky left-0 bg-card">
                {`${hour.toString().padStart(2, '0')}:00`}
              </div>

              {/* Day Columns */}
              {(view === "week" ? weekDays : [currentDate]).map((day) => {
                const dayApts = getAppointmentsForSlot(day, hour);

                return (
                  <div
                    key={`${day.toISOString()}-${hour}`}
                    className="flex-1 border-r last:border-r-0 p-1 relative group hover:bg-muted/10 transition-colors"
                    onClick={() => onSelectSlot(day, `${hour.toString().padStart(2, '0')}:00`)}
                  >
                    {/* Add Button on Hover */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 flex items-center justify-center pointer-events-none">
                      <div className="bg-primary/10 text-primary rounded-full p-1 transform scale-0 group-hover:scale-100 transition-transform">
                        <plus className="h-4 w-4" />
                      </div>
                    </div>

                    {dayApts.map((apt) => (
                      <div
                        key={apt.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectAppointment(apt);
                        }}
                        className={cn(
                          "mb-1 p-2 rounded text-xs border cursor-pointer shadow-sm transition-all hover:shadow-md relative",
                          getStatusColor(apt.status)
                        )}
                      >
                        {/* Bill Status Indicator */}
                        {apt.id && billStatuses[apt.id] === 'paid' && (
                           <div className="absolute top-1 right-1 bg-white rounded-full p-[1px] shadow-sm">
                              <CheckCircle2 className="h-3 w-3 text-green-600" />
                           </div>
                        )}
                        {apt.id && billStatuses[apt.id] === 'pending' && (
                           <div className="absolute top-1 right-1 bg-white rounded-full p-[1px] shadow-sm">
                              <DollarSign className="h-3 w-3 text-amber-500" />
                           </div>
                        )}

                        <div className="font-semibold truncate pr-4">
                           {apt.time} - {apt.patient_name || "Paciente"}
                        </div>
                        <div className="truncate opacity-75">
                           {apt.professional_name || "Profissional"}
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
