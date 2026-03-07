import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth(async (req) => {
  const isLoggedIn = !!req.auth;
  const { pathname } = req.nextUrl;
  
  const isAuthPage = pathname.startsWith("/login");
  const isSetupPage = pathname.startsWith("/setup");
  const isApiAuth = pathname.startsWith("/api/auth");
  const isApiSetup = pathname.startsWith("/api/setup");

  if (isApiAuth || isApiSetup) return NextResponse.next();

  // Permitir acesso à página de setup sem estar logado
  if (isSetupPage) return NextResponse.next();

  if (!isLoggedIn && !isAuthPage) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (isLoggedIn && (isAuthPage || isSetupPage)) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)"],
};
