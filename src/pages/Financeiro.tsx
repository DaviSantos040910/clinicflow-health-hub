import { useState } from "react";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, DollarSign, CreditCard, Wallet, Calendar, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { PaymentModal } from "@/components/financeiro/PaymentModal";
import { Payment } from "@/types/financeiro";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { TableSkeleton } from "@/components/TableSkeleton";
import { EmptyState } from "@/components/EmptyState";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useOrganization } from "@/contexts/OrganizationContext";

// Define the shape of data returned from the DB
interface BillRow {
  id: string;
  amount: number;
  status: string;
  payment_method: string | null;
  due_date: string | null;
  created_at: string;
  patient: {
    name: string;
  } | null;
}

export default function Financeiro() {
  const { organization } = useOrganization();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 1. Fetch Metrics
  const { data: metrics } = useQuery({
    queryKey: ['financialMetrics', organization?.id],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_financial_metrics');
      if (error) throw error;
      // Returns an array, we take the first (and only) row
      return data?.[0] || { total_revenue: 0, pending_revenue: 0, monthly_revenue: 0 };
    },
    enabled: !!organization?.id
  });

  // 2. Fetch Bills (List)
  const { data: payments = [], isLoading } = useQuery({
    queryKey: ['patientBills', organization?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('patient_bills')
        .select(`
          id,
          amount,
          status,
          payment_method,
          due_date,
          created_at,
          patient:patients(name)
        `)
        .order('due_date', { ascending: false }); // Show upcoming/recent first

      if (error) throw error;
      return data as unknown as BillRow[]; // Casting needed due to complex join types
    },
    enabled: !!organization?.id
  });

  const handleSavePayment = async (data: Omit<Payment, "id" | "created_at">) => {
    // Note: The Payment type from types/financeiro doesn't perfectly match patient_bills,
    // but the modal passes the necessary fields. We adapt here.
    try {
        // We assume the modal gives us { appointment_id, amount, method, status, date }
        // Ideally, PaymentModal should be updated to select Patient if not linked to Appointment,
        // but for now we might rely on the modal's internal logic or simplified manual entry.
        // *Correction*: The current PaymentModal (legacy) was designed for appointments.
        // If we are reusing it, we need to ensure it fits the new schema.
        // For this refactor, I will map the legacy handler to the new table.
        // However, PaymentModal currently requires selecting an appointment.
        // If the user wants to add an ad-hoc payment, they might need a different flow or select 'null' appointment.
        // Given the prompt "substitua o mock pela chamada real", we will do a best-effort mapping.

        const payload = {
            appointment_id: data.appointment_id || null,
            amount: data.amount,
            status: data.status,
            payment_method: data.method, // 'pix' | 'card' | ...
            due_date: data.date,
            description: "Pagamento Manual",
            // We need a patient_id. The modal fetches appointments which HAVE patient_id.
            // We'll need to fetch the appointment to get the patient_id if not provided directly.
        };

        // If appointment_id is present, we need to fetch the patient_id from it to satisfy NOT NULL constraint
        if (payload.appointment_id) {
             const { data: apt } = await supabase.from('appointments').select('patient_id').eq('id', payload.appointment_id).single();
             if (apt) {
                 await supabase.from('patient_bills').insert({
                     ...payload,
                     patient_id: apt.patient_id
                 });
             } else {
                 throw new Error("Agendamento inválido");
             }
        } else {
            // If no appointment, we can't insert without patient_id (Schema constraint).
            // The legacy modal forces appointment selection, so we are safe for now.
            throw new Error("Erro: É necessário vincular a um agendamento.");
        }

        toast.success("Pagamento registrado com sucesso!");
        setIsModalOpen(false);
        queryClient.invalidateQueries({ queryKey: ['patientBills'] });
        queryClient.invalidateQueries({ queryKey: ['financialMetrics'] });

    } catch (error: any) {
        console.error(error);
        toast.error("Erro ao salvar: " + error.message);
    }
  };

  const getStatusBadge = (status: string) => {
      switch (status) {
          case "paid": return <Badge className="bg-green-100 text-green-700 hover:bg-green-200">Pago</Badge>;
          case "pending": return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-200">Pendente</Badge>;
          case "canceled": return <Badge variant="destructive">Cancelado</Badge>;
          case "refunded": return <Badge variant="secondary">Estornado</Badge>;
          default: return <Badge variant="outline">{status}</Badge>;
      }
  };

  const getMethodIcon = (method: string | null) => {
      if (!method) return <DollarSign className="h-4 w-4" />;
      const m = method.toLowerCase();
      if (m.includes('cart') || m.includes('card')) return <CreditCard className="h-4 w-4" />;
      if (m.includes('pix')) return <ArrowUpRight className="h-4 w-4" />;
      if (m.includes('dinheiro') || m.includes('cash')) return <Wallet className="h-4 w-4" />;
      return <DollarSign className="h-4 w-4" />;
  };

  return (
    <div className="min-h-screen bg-gradient-hero">
      <Header />

      <main className="container py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
            <div>
                <h1 className="text-3xl font-display font-bold text-foreground">Financeiro</h1>
                <p className="text-muted-foreground">Gestão de pagamentos e faturamento</p>
            </div>
            <Button onClick={() => setIsModalOpen(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Registrar Pagamento
            </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Faturamento Total</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">R$ {(metrics?.total_revenue || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                    <p className="text-xs text-muted-foreground">
                        Receita acumulada
                    </p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Receita Mensal</CardTitle>
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">R$ {(metrics?.monthly_revenue || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                    <p className="text-xs text-muted-foreground">
                        {format(new Date(), "MMMM", { locale: ptBR })}
                    </p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Pendente</CardTitle>
                    <ArrowDownRight className="h-4 w-4 text-amber-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-amber-600">R$ {(metrics?.pending_revenue || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                    <p className="text-xs text-muted-foreground">
                        A receber
                    </p>
                </CardContent>
            </Card>
        </div>

        {/* Payments List */}
        <div className="bg-card rounded-lg border shadow-sm overflow-hidden">
            <div className="p-4 border-b">
                <h3 className="font-semibold">Histórico de Pagamentos</h3>
            </div>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Vencimento</TableHead>
                        <TableHead>Paciente</TableHead>
                        <TableHead>Valor</TableHead>
                        <TableHead>Forma</TableHead>
                        <TableHead>Status</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {isLoading ? (
                        <TableSkeleton columns={5} rows={3} />
                    ) : payments.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={5} className="h-64">
                                <EmptyState
                                    icon={DollarSign}
                                    title="Nenhum pagamento registrado"
                                    description="Seus lançamentos aparecerão aqui."
                                    action={
                                        <Button onClick={() => setIsModalOpen(true)} variant="outline" className="mt-2">
                                            <Plus className="h-4 w-4 mr-2" />
                                            Registrar Pagamento
                                        </Button>
                                    }
                                />
                            </TableCell>
                        </TableRow>
                    ) : (
                        payments.map((payment) => (
                            <TableRow key={payment.id}>
                                <TableCell>
                                    {payment.due_date ? format(new Date(payment.due_date), "dd/MM/yyyy") : "-"}
                                </TableCell>
                                <TableCell>{payment.patient?.name || "Cliente Avulso"}</TableCell>
                                <TableCell className="font-medium">
                                    R$ {payment.amount.toFixed(2)}
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2 capitalize">
                                        {getMethodIcon(payment.payment_method)}
                                        {payment.payment_method?.replace('_', ' ') || '-'}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    {getStatusBadge(payment.status)}
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
      </main>

      <PaymentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSavePayment}
        loading={isLoading}
      />
    </div>
  );
}
