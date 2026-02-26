export function orderStatusLabel(status: string) {
  const s = String(status).toUpperCase();
  if (s === "PENDING") return "Pendente";
  if (s === "PAID") return "Pago";
  if (s === "SHIPPED") return "Enviado";
  if (s === "CANCELLED") return "Cancelado";
  return s;
}
