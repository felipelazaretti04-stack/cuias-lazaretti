"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/Textarea";

type ShippingOption = {
  method: "PICKUP" | "PAC";
  provider: "MELHORENVIO" | "FALLBACK";
  serviceName: string;
  priceCents: number;
  deliveryDays?: number;
  debugMessage?: string;
};

function formatBRL(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function CheckoutPage() {
  const [method, setMethod] = useState<"PICKUP" | "PAC">("PICKUP");
  const [cep, setCep] = useState("");
  const [options, setOptions] = useState<ShippingOption[]>([]);
  const [selectedIdx, setSelectedIdx] = useState(0);

  // dados cliente
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  // endereço (PAC)
  const [addressLine, setAddressLine] = useState("");
  const [number, setNumber] = useState("");
  const [district, setDistrict] = useState("");
  const [city, setCity] = useState("");
  const [uf, setUf] = useState("");
  const [complement, setComplement] = useState("");

  // pickup: salva apenas city/uf + note
  const [note, setNote] = useState("");

  const [loadingQuote, setLoadingQuote] = useState(false);
  const [loadingPay, setLoadingPay] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const selected = options[selectedIdx];

  async function quote() {
    setErr(null);
    setLoadingQuote(true);
    const res = await fetch("/api/checkout/quote-shipping", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ method, cep }),
    });
    setLoadingQuote(false);

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setErr(data?.error || "Falha ao cotar frete");
      return;
    }
    const data = await res.json();
    setOptions(data.options || []);
    setSelectedIdx(0);
  }

  useEffect(() => {
    // sempre tenta cotar ao trocar método
    quote();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [method]);

  const showPAC = method === "PAC";

  const canPay = useMemo(() => {
    if (!name.trim()) return false;
    if (!email.trim()) return false;
    if (!phone.trim()) return false;
    if (!selected) return false;

    if (showPAC) {
      if (!cep.replace(/\D/g, "")) return false;
      if (!addressLine.trim()) return false;
      if (!number.trim()) return false;
      if (!district.trim()) return false;
      if (!city.trim()) return false;
      if (!uf.trim()) return false;
    } else {
      // pickup: não exigir endereço completo; apenas city/UF
      if (!city.trim()) return false;
      if (!uf.trim()) return false;
    }
    return true;
  }, [name, email, phone, selected, showPAC, cep, addressLine, number, district, city, uf]);

  async function pay() {
    setErr(null);
    setLoadingPay(true);

    const payload = {
      customer: { name, email, phone },
      shipping: {
        method,
        cep: showPAC ? cep : undefined,
        address: showPAC
          ? { addressLine, number, district, city, uf, complement, cep }
          : { city, uf, note },
        option: selected,
      },
    };

    const res = await fetch("/api/checkout/create", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });

    setLoadingPay(false);

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setErr(data?.error || "Falha ao iniciar pagamento");
      return;
    }

    const data = await res.json();
    window.location.href = data.initPoint; // redireciona MP
  }

  return (
    <div className="container py-10">
      <h1 className="text-2xl font-semibold">Checkout</h1>
      <p className="mt-1 text-sm text-[hsl(var(--muted))]">Finalize em poucos passos.</p>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="card p-6">
            <div className="text-sm font-semibold">Entrega</div>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              <label className="rounded-2xl border border-[hsl(var(--border))] bg-white p-4">
                <input type="radio" checked={method === "PICKUP"} onChange={() => setMethod("PICKUP")} />
                <div className="mt-2 text-sm font-medium">Retirada em Erechim/RS</div>
                <div className="mt-1 text-xs text-[hsl(var(--muted))]">Sem custo de frete</div>
              </label>
              <label className="rounded-2xl border border-[hsl(var(--border))] bg-white p-4">
                <input type="radio" checked={method === "PAC"} onChange={() => setMethod("PAC")} />
                <div className="mt-2 text-sm font-medium">PAC</div>
                <div className="mt-1 text-xs text-[hsl(var(--muted))]">Cotação por CEP</div>
              </label>
            </div>

            {showPAC ? (
              <div className="mt-4 grid gap-2 max-w-sm">
                <Label>CEP</Label>
                <div className="flex gap-2">
                  <Input value={cep} onChange={(e) => setCep(e.target.value)} placeholder="00000-000" />
                  <Button type="button" variant="secondary" onClick={quote} disabled={loadingQuote}>
                    {loadingQuote ? "..." : "Cotar"}
                  </Button>
                </div>
              </div>
            ) : null}

            <div className="mt-4">
              <div className="text-sm font-medium">Opções</div>
              <div className="mt-2 grid gap-2">
                {options.map((o, idx) => (
                  <label key={idx} className="flex items-start justify-between gap-3 rounded-2xl border border-[hsl(var(--border))] bg-white p-4">
                    <div className="flex gap-3">
                      <input type="radio" checked={selectedIdx === idx} onChange={() => setSelectedIdx(idx)} />
                      <div>
                        <div className="text-sm font-medium">{o.serviceName}</div>
                        <div className="mt-1 text-xs text-[hsl(var(--muted))]">
                          {o.deliveryDays ? `Entrega estimada: ${o.deliveryDays} dias` : "Prazo será informado após envio"}
                        </div>
                        {o.provider === "FALLBACK" && o.debugMessage ? (
                          <div className="mt-1 text-[11px] text-[hsl(var(--muted))]">
                            {o.debugMessage}
                          </div>
                        ) : null}
                      </div>
                    </div>
                    <div className="text-sm font-semibold">{formatBRL(o.priceCents)}</div>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="text-sm font-semibold">Seus dados</div>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Nome</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>E-mail</Label>
                <Input value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>WhatsApp</Label>
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(54) 99999-9999" />
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="text-sm font-semibold">
              {showPAC ? "Endereço (PAC)" : "Retirada (Erechim/RS)"}
            </div>

            {showPAC ? (
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div className="space-y-2 md:col-span-2">
                  <Label>Rua/Avenida</Label>
                  <Input value={addressLine} onChange={(e) => setAddressLine(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Número</Label>
                  <Input value={number} onChange={(e) => setNumber(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Bairro</Label>
                  <Input value={district} onChange={(e) => setDistrict(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Cidade</Label>
                  <Input value={city} onChange={(e) => setCity(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>UF</Label>
                  <Input value={uf} onChange={(e) => setUf(e.target.value)} placeholder="RS" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Complemento (opcional)</Label>
                  <Input value={complement} onChange={(e) => setComplement(e.target.value)} />
                </div>
              </div>
            ) : (
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Cidade</Label>
                  <Input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Erechim" />
                </div>
                <div className="space-y-2">
                  <Label>UF</Label>
                  <Input value={uf} onChange={(e) => setUf(e.target.value)} placeholder="RS" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Observação (opcional)</Label>
                  <Textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3} placeholder="Ex.: quero retirar no sábado / personalização: 'Lazaretti'..." />
                </div>
              </div>
            )}
          </div>

          {err ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
              {err}
            </div>
          ) : null}
        </div>

        <div className="card p-6 h-fit">
          <div className="text-sm font-semibold">Pagamento</div>
          <p className="mt-2 text-sm text-[hsl(var(--muted))]">
            Você será redirecionado ao Mercado Pago (Checkout Pro).
          </p>

          <Button className="mt-5 w-full" disabled={!canPay || loadingPay} onClick={pay}>
            {loadingPay ? "Iniciando..." : "Pagar com Mercado Pago"}
          </Button>

          <div className="mt-3 text-xs text-[hsl(var(--muted))]">
            Ao finalizar, você concorda com as políticas da loja.
          </div>
        </div>
      </div>
    </div>
  );
}
