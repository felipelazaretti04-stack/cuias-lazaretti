export function orderStatusLabel(status: string) {
  const map: Record<string, string> = {
    PENDING: "Pendente",
    PAID: "Pago",
    SHIPPED: "Enviado",
    CANCELLED: "Cancelado",
  };

  return map[status] ?? status;
}