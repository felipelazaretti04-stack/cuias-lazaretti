import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container py-16">
      <div className="card p-8">
        <h1 className="text-2xl font-semibold">Página não encontrada</h1>
        <p className="mt-2 text-sm text-[hsl(var(--muted))]">
          Talvez o link esteja errado — ou o produto saiu do catálogo.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex rounded-xl bg-[hsl(var(--primary))] px-4 py-2 text-sm font-medium text-white"
        >
          Voltar pra Home
        </Link>
      </div>
    </div>
  );
}
