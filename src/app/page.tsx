export default function Home() {
  return (
    <main className="container py-16">
      <section className="space-y-6">
        <h1 className="text-4xl font-bold">
          Cuias Lazaretti
        </h1>

        <p className="text-muted-foreground max-w-xl">
          Cuias artesanais em couro e madeira com acabamento premium.
        </p>

        <div className="flex gap-4">
          <a
            href="/produtos"
            className="rounded-xl bg-[hsl(var(--primary))] px-6 py-3 text-white"
          >
            Ver produtos
          </a>

          <a
            href="/admin"
            className="rounded-xl border px-6 py-3"
          >
            Área administrativa
          </a>
        </div>
      </section>
    </main>
  );
}
