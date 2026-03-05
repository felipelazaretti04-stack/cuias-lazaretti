// file: src/app/(shop)/checkout/retorno/page.tsx
import { redirect } from "next/navigation";

type SP = { [key: string]: string | string[] | undefined };
const pick = (sp: SP, key: string) => (Array.isArray(sp[key]) ? sp[key]?.[0] : sp[key]) ?? "";

export default async function CheckoutRetornoPage({
  searchParams,
}: {
  searchParams: Promise<SP>;
}) {
  const sp = await searchParams;

  const publicId = pick(sp, "external_reference") || pick(sp, "externalReference");
  const paymentId = pick(sp, "payment_id") || pick(sp, "paymentId");
  const status = (pick(sp, "status") || "unknown").toLowerCase();

  if (publicId) {
    redirect(
      `/pedido/${encodeURIComponent(publicId)}?status=${encodeURIComponent(status)}&payment_id=${encodeURIComponent(paymentId)}`
    );
  }

  redirect("/checkout");
}
