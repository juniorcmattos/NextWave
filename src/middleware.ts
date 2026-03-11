import { auth } from "./auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;

  const isApiAuthRoute = nextUrl.pathname.startsWith("/api/auth");
  const isAuthPage = nextUrl.pathname === "/login";
  const isSetupRoute = nextUrl.pathname.startsWith("/setup") || nextUrl.pathname.startsWith("/api/setup");

  // 1. Permitir sempre rotas de API de autenticação e Setup
  if (isApiAuthRoute || isSetupRoute) {
    return NextResponse.next();
  }

  // 2. Redirecionar para login se tentar acessar dashboard sem estar logado
  if (!isLoggedIn && !isAuthPage) {
    return NextResponse.redirect(new URL("/login", nextUrl));
  }

  // 3. Se estiver logado e for para login, manda pro dashboard
  if (isLoggedIn && isAuthPage) {
    return NextResponse.redirect(new URL("/", nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api/auth|_next/code|_next/static|_next/image|favicon.ico|.*\\.png$).*)"],
};
