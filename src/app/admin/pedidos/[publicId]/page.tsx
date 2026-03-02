import PedidoDetalheClient from "./PedidoDetalheClient";

export default async function Page({ params }: { params: Promise<{ publicId: string }> }) {
  const { publicId } = await params;
  return <PedidoDetalheClient publicId={publicId} />;
}
