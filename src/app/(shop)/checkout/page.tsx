// file: src/app/(shop)/checkout/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/Textarea";
import { track } from "@/lib/analytics";
import Link from "next/link";

type CartItem = {
  variantId: string;
  productName: string;
  variantLabel: string | null;
  sku: string;
  unitPriceCents: number;
  qty: number;
  lineTotalCents: number;
  imageUrl: string | null;
};

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

function onlyDigits(value: string) {
  return (value || "").replace(/\D/g, "");
}

export default function CheckoutPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [subtotalCents, setSubtotalCents] = useState(0);
  const [loadingCart, setLoadingCart] = useState(true);

  const [method, setMethod] = useState<"PICKUP" | "PAC">("PICKUP");
  const [cep, setCep] = useState("");
  const [options, setOptions] = useState<ShippingOption[]>([]);
  const [selectedIdx, setSelectedIdx] = useState(0);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const [addressLine, setAddressLine] = useState("");
  const [number, setNumber] = useState("");
  const [district, setDistrict] = useState("");
  const [city, setCity] = useState("");
  const [uf, setUf] = useState("");
  const [complement, setComplement] = useState("");

  const [note, setNote] = useState("");

  // Controle do autofill por CEP
  const [lastAutofillCep, setLastAutofillCep] = useState("");

  const [couponCode, setCouponCode] = useState("");
  const [couponApplied, setCouponApplied] = useState<{ code: string; type: string; value: number } | null>(null);
  const [couponErr, setCouponErr] = useState<string | null>(null);

  const [loadingQuote, setLoadingQuote] = useState(false);
  const [loadingPay, setLoadingPay] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const selected = options[selectedIdx];
  const showPAC = method === "PAC";

  useEffect(() => {
    fetch("/api/cart/get")
      .then((r) => r.json())
      .then((data) => {
        setCartItems(data.items || []);
        setSubtotalCents(data.subtotalCents || 0);
      })
      .finally(() => setLoadingCart(false));
  }, []);

  async function quote() {
    const cepDigits = onlyDigits(cep);

    if (method === "PAC" && cepDigits.length !== 8) {
      setOptions([]);
      setSelectedIdx(0);
      setErr("Informe um CEP válido");
      return;
    }

    setErr(null);
    setLoadingQuote(true);

    try {
      if (method === "PICKUP") {
        const res = await fetch("/api/checkout/quote-shipping", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ method, cep }),
        });

        if (!res.ok) {
          const data = await res.json().catch(() => null);
          setErr(data?.error || "Falha ao cotar frete");
          setOptions([]);
          setSelectedIdx(0);
          return;
        }

        const data = await res.json();
        setOptions(data.options || []);
        setSelectedIdx(0);
        return;
      }

      const [shipRes, cepRes] = await Promise.all([
        fetch("/api/checkout/quote-shipping", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ method, cep: cepDigits }),
        }),
        fetch("/api/checkout/address-by-cep", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ cep: cepDigits }),
        }),
      ]);

      const shipData = await shipRes.json().catch(() => null);
      const cepData = await cepRes.json().catch(() => null);

      if (!shipRes.ok) {
        setErr(shipData?.error || "Falha ao cotar frete");
        setOptions([]);
        setSelectedIdx(0);
      } else {
        setOptions(shipData?.options || []);
        setSelectedIdx(0);
      }

      // Autofill apenas se CEP mudou
      if (cepRes.ok && cepData) {
        const normalizedCep = onlyDigits(cepDigits);

        if (lastAutofillCep !== normalizedCep) {
          setAddressLine(cepData.addressLine || "");
          setDistrict(cepData.district || "");
          setCity(cepData.city || "");
          setUf(cepData.uf || "");
          setComplement(cepData.complement || "");
          setLastAutofillCep(normalizedCep);
        }
      }
    } finally {
      setLoadingQuote(false);
    }
  }

  useEffect(() => {
    if (method === "PICKUP") {
      quote();
      return;
    }

    if (onlyDigits(cep).length !== 8) {
      setOptions([]);
      setSelectedIdx(0);
      return;
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [method]);

  const shippingCents = selected?.priceCents || 0;

  const discountCents = useMemo(() => {
    if (!couponApplied) return 0;
    if (couponApplied.type === "PERCENT") {
      return Math.floor((subtotalCents * couponApplied.value) / 100);
    }
    return Math.min(couponApplied.value, subtotalCents);
  }, [couponApplied, subtotalCents]);

  const totalCents = Math.max(0, subtotalCents + shippingCents - discountCents);

  const canPay = useMemo(() => {
    if (cartItems.length === 0) return false;
    if (!name.trim()) return false;
    if (!email.trim()) return false;
    if (!phone.trim()) return false;
    if (!selected) return false;

    if (showPAC) {
      if (onlyDigits(cep).length !== 8) return false;
      if (!addressLine.trim()) return false;
      if (!number.trim()) return false;
      if (!district.trim()) return false;
      if (!city.trim()) return false;
      if (!uf.trim()) return false;
    } else {
      if (!city.trim()) return false;
      if (!uf.trim()) return false;
    }

    return true;
  }, [cartItems, name, email, phone, selected, showPAC, cep, addressLine, number, district, city, uf]);

  async function applyCoupon() {
    setCouponErr(null);
    if (!couponCode.trim()) return;

    const res = await fetch("/api/checkout/apply-coupon", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ code: couponCode }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setCouponApplied(null);
      setCouponErr(data?.error || "Cupom inválido");
      return;
    }

    const data = await res.json();
    setCouponApplied(data.coupon);
  }

  async function pay() {
    setErr(null);
    setLoadingPay(true);

    track("InitiateCheckout", { currency: "BRL" });

    const payload = {
      customer: { name, email, phone },
      couponCode: couponApplied?.code || null,
      shipping: {
        method,
        cep: showPAC ? onlyDigits(cep) : undefined,
        address: showPAC
          ? {
            addressLine,
            number,
            district,
            city,
            uf,
            complement,
            cep: onlyDigits(cep),
          }
          : {
            city,
            uf,
            note,
          },
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
    window.location.href = data.initPoint;
  }

  if (loadingCart) {
    return (
      <div className="container py-10">
        <div className="text-sm text-[hsl(var(--muted))]">Carregando carrinho...</div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="container py-10">
        <h1 className="text-2xl font-semibold">Checkout</h1>
        <div className="mt-6 card p-8">
          <div className="text-sm text-[hsl(var(--muted))]">Seu carrinho está vazio.</div>
          <Link
            href="/produtos"
            className="mt-4 inline-flex rounded-xl bg-[hsl(var(--primary))] px-4 py-2 text-sm font-medium text-white"
          >
            Ver produtos
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-10">
      <h1 className="text-2xl font-semibold">Checkout</h1>
      <p className="mt-1 text-sm text-[hsl(var(--muted))]">Finalize em poucos passos.</p>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="card p-6">
            <div className="text-sm font-semibold">Itens ({cartItems.length})</div>
            <div className="mt-4 space-y-3">
              {cartItems.map((item) => (
                <div key={item.variantId} className="flex gap-3">
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--accent))]">
                    {item.imageUrl ? (
                      <Image src={item.imageUrl} alt={item.productName} fill className="object-cover" sizes="64px" />
                    ) : null}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{item.productName}</div>
                    {item.variantLabel && (
                      <div className="text-xs text-[hsl(var(--muted))]">{item.variantLabel}</div>
                    )}
                    <div className="text-xs text-[hsl(var(--muted))]">Qtd: {item.qty}</div>
                  </div>
                  <div className="text-sm font-medium">{formatBRL(item.lineTotalCents)}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="card p-6">
            <div className="text-sm font-semibold">Entrega</div>

            <div className="mt-3 grid gap-3 md:grid-cols-2">
              <label className="rounded-2xl border border-[hsl(var(--border))] bg-white p-4 cursor-pointer">
                <input type="radio" checked={method === "PICKUP"} onChange={() => setMethod("PICKUP")} />
                <div className="mt-2 text-sm font-medium">Retirada em Erechim/RS</div>
                <div className="mt-1 text-xs text-[hsl(var(--muted))]">Sem custo de frete</div>
              </label>

              <label className="rounded-2xl border border-[hsl(var(--border))] bg-white p-4 cursor-pointer">
                <input type="radio" checked={method === "PAC"} onChange={() => setMethod("PAC")} />
                <div className="mt-2 text-sm font-medium">PAC</div>
                <div className="mt-1 text-xs text-[hsl(var(--muted))]">Cotação por CEP</div>
              </label>
            </div>

            {showPAC && (
              <div className="mt-4 grid gap-2 max-w-sm">
                <Label>CEP</Label>
                <div className="flex gap-2">
                  <Input
                    value={cep}
                    onChange={(e) => {
                      const digits = onlyDigits(e.target.value).slice(0, 8);
                      const masked =
                        digits.length > 5 ? `${digits.slice(0, 5)}-${digits.slice(5)}` : digits;
                      setCep(masked);
                      setLastAutofillCep(""); // Reseta ao digitar novo CEP
                    }}
                    placeholder="00000-000"
                  />
                  <Button type="button" variant="secondary" onClick={quote} disabled={loadingQuote}>
                    {loadingQuote ? "..." : "Cotar"}
                  </Button>
                </div>
              </div>
            )}

            <div className="mt-4">
              <div className="text-sm font-medium">Opções</div>
              <div className="mt-2 grid gap-2">
                {options.map((o, idx) => (
                  <label
                    key={idx}
                    className="flex items-start justify-between gap-3 rounded-2xl border border-[hsl(var(--border))] bg-white p-4 cursor-pointer"
                  >
                    <div className="flex gap-3">
                      <input type="radio" checked={selectedIdx === idx} onChange={() => setSelectedIdx(idx)} />
                      <div>
                        <div className="text-sm font-medium">{o.serviceName}</div>
                        <div className="mt-1 text-xs text-[hsl(var(--muted))]">
                          {o.deliveryDays ? `Entrega estimada: ${o.deliveryDays} dias` : "Prazo será informado após envio"}
                        </div>
                        {o.provider === "FALLBACK" && (
                          <div className="mt-1 text-[11px] text-[hsl(var(--muted))]">
                            Frete estimado para esta região. Confirmaremos o envio após a compra.
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-sm font-semibold">{formatBRL(o.priceCents)}</div>
                  </label>
                ))}

                {options.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-[hsl(var(--border))] p-4 text-sm text-[hsl(var(--muted))]">
                    {showPAC
                      ? "Informe um CEP válido e clique em Cotar."
                      : "Selecione uma opção de entrega."}
                  </div>
                ) : null}
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
            <div className="text-sm font-semibold">{showPAC ? "Endereço (PAC)" : "Retirada (Erechim/RS)"}</div>

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
                  <Textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    rows={3}
                    placeholder="Ex.: quero retirar no sábado / personalização: 'Lazaretti'..."
                  />
                </div>
              </div>
            )}
          </div>

          {err && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
              {err}
            </div>
          )}
        </div>

        <div className="card p-6 h-fit space-y-4">
          <div className="text-sm font-semibold">Resumo do pedido</div>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-[hsl(var(--muted))]">Subtotal</span>
              <span>{formatBRL(subtotalCents)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[hsl(var(--muted))]">Frete</span>
              <span>{shippingCents > 0 ? formatBRL(shippingCents) : "Grátis"}</span>
            </div>
            {discountCents > 0 && (
              <div className="flex justify-between text-emerald-700">
                <span>Desconto</span>
                <span>-{formatBRL(discountCents)}</span>
              </div>
            )}
            <div className="border-t border-[hsl(var(--border))] pt-2 flex justify-between font-semibold">
              <span>Total</span>
              <span>{formatBRL(totalCents)}</span>
            </div>
          </div>

          <div className="border-t border-[hsl(var(--border))] pt-4">
            <div className="text-sm font-medium">Cupom de desconto</div>
            <div className="mt-2 flex gap-2">
              <Input
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                placeholder="BEMVINDO10"
                className="flex-1"
              />
              <Button type="button" variant="secondary" onClick={applyCoupon}>
                Aplicar
              </Button>
            </div>

            {couponApplied && (
              <div className="mt-2 text-xs text-emerald-700">
                ✓ Cupom <b>{couponApplied.code}</b> aplicado
              </div>
            )}

            {couponErr && <div className="mt-2 text-xs text-red-700">{couponErr}</div>}
          </div>

          <Button className="w-full" disabled={!canPay || loadingPay} onClick={pay}>
            {loadingPay ? "Iniciando..." : "Pagar com Mercado Pago"}
          </Button>

          <div className="text-xs text-[hsl(var(--muted))] text-center">
            Você será redirecionado ao Mercado Pago para finalizar.
          </div>
        </div>
      </div>
    </div>
  );
}
