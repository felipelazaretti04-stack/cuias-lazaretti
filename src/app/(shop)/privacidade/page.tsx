import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacidade",
  description: "Política de privacidade e LGPD — Cuias Lazaretti.",
};

export default function PrivacidadePage() {
  return (
    <div className="container py-10">
      <div className="card p-8 prose prose-sm max-w-none">
        <h1>Política de Privacidade (LGPD)</h1>

        <h2>Dados coletados</h2>
        <ul>
          <li>Dados de contato (nome, e-mail, telefone) para atendimento e execução do pedido.</li>
          <li>Endereço (somente em envios por PAC).</li>
          <li>Dados de pagamento são processados pelo Mercado Pago. Não armazenamos dados sensíveis de cartão.</li>
        </ul>

        <h2>Finalidade</h2>
        <p>
          Usamos os dados para processar pedidos, enviar comunicações relacionadas à compra e suporte.
        </p>

        <h2>Compartilhamento</h2>
        <p>
          Compartilhamos dados necessários com provedores de pagamento (Mercado Pago) e logística (Melhor Envio/Correios quando aplicável).
        </p>

        <h2>Segurança</h2>
        <p>
          Aplicamos medidas básicas de segurança (cookies httpOnly no carrinho/admin e validações no servidor).
        </p>

        <h2>Seus direitos</h2>
        <p>
          Você pode solicitar acesso/correção/exclusão de dados quando aplicável. Contate pelos canais oficiais.
        </p>
      </div>
    </div>
  );
}
