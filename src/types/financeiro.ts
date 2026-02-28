export type PaymentMethod = "dinheiro" | "cartao" | "pix";
export type PaymentStatus = "pendente" | "pago" | "cancelado";

export interface Payment {
  id: string;
  appointment_id: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  date: string; // ISO date
  created_at?: string;
}

// Enriched type for display
export interface EnrichedPayment extends Payment {
  patient_name?: string;
  professional_name?: string;
}
