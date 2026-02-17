export function Footer() {
  return (
    <footer className="mt-16 border-t border-[hsl(var(--border))] bg-white">
      <div className="container py-10">
        <div className="grid gap-6 md:grid-cols-3">
          <div>
            <div className="text-sm font-semibold">Cuias Lazaretti</div>
            <p className="mt-2 text-sm text-[hsl(var(--muted))]">
              A cuia certa pro teu mate. Cuias, bombas e acessórios com acabamento premium.
            </p>
          </div>
          <div>
            <div className="text-sm font-semibold">Atendimento</div>
            <p className="mt-2 text-sm text-[hsl(var(--muted))]">
              Erechim/RS • Seg–Sáb 9h–18h
            </p>
          </div>
          <div>
            <div className="text-sm font-semibold">Confiança</div>
            <p className="mt-2 text-sm text-[hsl(var(--muted))]">
              Envio para todo o Brasil • Garantia • Troca facilitada
            </p>
          </div>
        </div>
        <div className="mt-8 text-xs text-[hsl(var(--muted))]">
          © {new Date().getFullYear()} Cuias Lazaretti. Todos os direitos reservados.
        </div>
      </div>
    </footer>
  );
}
