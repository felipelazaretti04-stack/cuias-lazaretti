// file: src/lib/orderLabels.ts
import type { OrderStatus, PaymentStatus } from "@prisma/client";

export function orderStatusLabel(s: OrderStatus) {
  switch (s) {
    case "PENDING": return "Pendente";
    case "PAID": return "Pago";
    case "SHIPPED": return "Enviado";
    case "CANCELLED": return "Cancelado";
    default: return "—";
  }
}

export function paymentStatusLabel(s: PaymentStatus) {
  switch (s) {
    case "PENDING": return "Pendente";
    case "APPROVED": return "Aprovado";
    case "REJECTED": return "Rejeitado";
    case "CANCELLED": return "Cancelado";
    case "REFUNDED": return "Reembolsado";
    case "UNKNOWN": return "Desconhecido";
    default: return "—";
  }
}
