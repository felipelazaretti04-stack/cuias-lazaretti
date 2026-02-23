import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Políticas",
  description: "Políticas de entrega, trocas/devolução e atendimento da Cuias Lazaretti.",
};

export default function PoliticasPage() {
  return (
    <div className="container py-10">
      <div className="card p-8 prose prose-sm max-w-none">
        <h1>Políticas</h1>

        <h2>Entrega</h2>
        <ul>
          <li><b>Retirada em Erechim/RS</b>: sem custo de frete. Após a compra, combinamos a retirada.</li>
          <li><b>Envio por PAC</b>: prazo estimado informado no checkout (pode variar conforme CEP e operação logística).</li>
          <li>Produtos <b>personalizados</b> podem ter prazo de produção antes do envio (informado na página do produto).</li>
        </ul>

        <h2>Trocas e devoluções</h2>
        <ul>
          <li>Você pode solicitar troca/devolução em até <b>7 dias corridos</b> após o recebimento (conforme CDC), desde que o produto esteja sem sinais de uso indevido.</li>
          <li>Itens <b>personalizados</b> podem ter regras específicas. Em caso de defeito, garantimos suporte.</li>
        </ul>

        <h2>Garantia</h2>
        <p>
          Se houver defeito de fabricação, entre em contato com fotos e descrição do problema para avaliarmos a melhor solução.
        </p>

        <h2>Atendimento</h2>
        <p>
          Horário: Seg–Sáb 9h–18h (Erechim/RS). Canais: WhatsApp/Instagram/E-mail.
        </p>
      </div>
    </div>
  );
}
