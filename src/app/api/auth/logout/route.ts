import { NextResponse } from "next/server";
import { destroyAdminSession } from "@/lib/auth";

export async function POST(req: Request) {
  await destroyAdminSession();

  const url = new URL(req.url);
  // redireciona para Home, mantendo origem correta (dev/prod)
  return NextResponse.redirect(new URL("/", url.origin), { status: 303 });
}
