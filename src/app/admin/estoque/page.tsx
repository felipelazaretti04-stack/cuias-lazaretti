// file: src/app/admin/estoque/page.tsx
import { prisma } from "@/lib/prisma";
import { AdminShell } from "@/components/admin/AdminShell";
import EstoqueClient from "@/components/admin/EstoqueClient";

export default async function AdminEstoquePage() {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      slug: true,
    },
  });

  return (
    <AdminShell title="Estoque">
      <EstoqueClient categories={categories} />
    </AdminShell>
  );
}
