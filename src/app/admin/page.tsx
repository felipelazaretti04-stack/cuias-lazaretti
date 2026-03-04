// file: src/app/admin/page.tsx
import { AdminShell } from "@/components/admin/AdminShell";
import { DashboardClient } from "@/components/admin/DashboardClient";

export default async function AdminHome() {
  return (
    <AdminShell title="Painel">
      <DashboardClient />
    </AdminShell>
  );
}
