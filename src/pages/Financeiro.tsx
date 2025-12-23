import { useState, useEffect } from "react";
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
import { EnrichedPayment, Payment } from "@/types/financeiro";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function Financeiro() {
  const [payments, setPayments] = useState<EnrichedPayment[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Stats
  const totalRevenue = payments.reduce((acc, p) => p.status === 'pago' ? acc + p.amount : acc, 0);
  const pendingRevenue = payments.reduce((acc, p) => p.status === 'pendente' ? acc + p.amount : acc, 0);
  const monthlyRevenue = payments
      .filter(p => new Date(p.date).getMonth() === new Date().getMonth() && p.status === 'pago')
      .reduce((acc, p) => acc + p.amount, 0);

  useEffect(() => {
    // Initial Mock Data Load
    // In a real scenario, this would fetch from Supabase 'payments' table
    setPayments([
        {
            id: "1",
            appointment_id: "1",
            amount: 350.00,
            method: "cartao",
            status: "pago",
            date: "2024-03-20",
            patient_name: "Maria Silva"
        },
        {
            id: "2",
            appointment_id: "2",
            amount: 400.00,
            method: "pix",
            status: "pago",
            date: "2024-03-21",
            patient_name: "João Santos"
        },
        {
            id: "3",
            appointment_id: "3",
            amount: 250.00,
            method: "dinheiro",
            status: "pendente",
            date: "2024-03-22",
            patient_name: "Ana Oliveira"
        }
    ]);
  }, []);

  const handleSavePayment = async (data: Omit<Payment, "id" | "created_at">) => {
    setLoading(true);
    // Simulate API Call
    await new Promise(resolve => setTimeout(resolve, 1000));

    const newPayment: EnrichedPayment = {
        ...data,
        id: Math.random().toString(),
        patient_name: "Paciente Selecionado" // Ideally we fetch this from the appointment ID mapping
    };

    setPayments(prev => [newPayment, ...prev]);
    setIsModalOpen(false);
    setLoading(false);
    toast.success("Pagamento registrado com sucesso!");
  };

  const getStatusBadge = (status: string) => {
      switch (status) {
          case "pago": return <Badge className="bg-green-100 text-green-700 hover:bg-green-200">Pago</Badge>;
          case "pendente": return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-200">Pendente</Badge>;
          case "cancelado": return <Badge variant="destructive">Cancelado</Badge>;
          default: return <Badge variant="outline">{status}</Badge>;
      }
  };

  const getMethodIcon = (method: string) => {
      switch (method) {
          case "cartao": return <CreditCard className="h-4 w-4" />;
          case "pix": return <ArrowUpRight className="h-4 w-4" />; // Symbolizing transfer
          case "dinheiro": return <Wallet className="h-4 w-4" />;
          default: return <DollarSign className="h-4 w-4" />;
      }
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
                    <div className="text-2xl font-bold">R$ {totalRevenue.toFixed(2)}</div>
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
                    <div className="text-2xl font-bold">R$ {monthlyRevenue.toFixed(2)}</div>
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
                    <div className="text-2xl font-bold text-amber-600">R$ {pendingRevenue.toFixed(2)}</div>
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
                        <TableHead>Data</TableHead>
                        <TableHead>Paciente</TableHead>
                        <TableHead>Valor</TableHead>
                        <TableHead>Forma</TableHead>
                        <TableHead>Status</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {payments.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                                Nenhum pagamento registrado.
                            </TableCell>
                        </TableRow>
                    ) : (
                        payments.map((payment) => (
                            <TableRow key={payment.id}>
                                <TableCell>
                                    {format(new Date(payment.date), "dd/MM/yyyy")}
                                </TableCell>
                                <TableCell>{payment.patient_name || "-"}</TableCell>
                                <TableCell className="font-medium">
                                    R$ {payment.amount.toFixed(2)}
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2 capitalize">
                                        {getMethodIcon(payment.method)}
                                        {payment.method}
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
        loading={loading}
      />
    </div>
  );
}
