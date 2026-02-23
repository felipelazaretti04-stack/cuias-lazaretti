import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Termos de uso",
  description: "Termos de uso do site Cuias Lazaretti.",
};

export default function TermosPage() {
  return (
    <div className="container py-10">
      <div className="card p-8 prose prose-sm max-w-none">
        <h1>Termos de uso</h1>
        <p>
          Ao navegar e comprar na Cuias Lazaretti, você concorda com estes termos.
        </p>

        <h2>Produtos</h2>
        <p>
          As imagens são ilustrativas e podem variar conforme iluminação e lote. Descrições e especificações podem ser atualizadas sem aviso prévio.
        </p>

        <h2>Preços e pagamento</h2>
        <p>
          Pagamentos são processados via Mercado Pago (Checkout Pro). O pedido é confirmado após aprovação do pagamento.
        </p>

        <h2>Disponibilidade</h2>
        <p>
          O estoque é controlado por variante. Em caso raro de inconsistência, entraremos em contato para reembolso ou ajuste.
        </p>

        <h2>Contato</h2>
        <p>
          Dúvidas? Fale com a gente pelos canais oficiais listados em “Contato”.
        </p>
      </div>
    </div>
  );
}
