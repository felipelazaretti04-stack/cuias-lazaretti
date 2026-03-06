// file: src/lib/require-admin.ts
import { getAdminSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export async function requireAdmin() {
  const session = await getAdminSession();
  
  if (!session) {
    redirect("/login");
  }
  
  return session;
}
