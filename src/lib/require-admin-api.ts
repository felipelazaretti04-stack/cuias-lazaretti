// src/lib/require-admin-api.ts
import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";

export async function requireAdminApi() {
  const session = await getAdminSession();
  
  if (!session) {
    return {
      ok: false as const,
      response: NextResponse.json({ error: "Não autenticado" }, { status: 401 }),
    };
  }
  
  if (session.role !== "ADMIN") {
    return {
      ok: false as const,
      response: NextResponse.json({ error: "Não autorizado" }, { status: 403 }),
    };
  }
  
  return {
    ok: true as const,
    session,
  };
}
