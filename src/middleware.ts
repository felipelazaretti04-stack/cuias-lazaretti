// file: src/middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Middleware de proteção básica para rotas admin.
 * 
 * IMPORTANTE: Este middleware apenas verifica a EXISTÊNCIA do cookie.
 * A validação REAL do token (assinatura, expiração, role) acontece
 * server-side em requireAdmin() (páginas) e nas rotas API.
 */
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/admin") && !pathname.startsWith("/admin/login")) {
    const token = req.cookies.get("clz_admin_session")?.value;

    if (!token) {
      const url = req.nextUrl.clone();
      url.pathname = "/admin/login";
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
