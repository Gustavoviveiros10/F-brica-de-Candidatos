import { NextResponse, type NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { supabaseServer } from "@/lib/supabase/server";

// Destino dos links de e-mail do Supabase (confirmação de conta e nova senha).
// Aceita os dois formatos de link:
// - token_hash (template do e-mail aponta direto pra cá): funciona mesmo se o link
//   abrir em outro navegador, como o navegador interno do app do Gmail.
// - code (formato padrão do Supabase): só funciona no mesmo navegador que pediu o e-mail.
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const tokenHash = searchParams.get("token_hash");
  const tipo = searchParams.get("type") as EmailOtpType | null;
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? (tipo === "recovery" ? "/nova-senha" : "/app");
  const destino = next.startsWith("/") && !next.startsWith("//") ? next : "/app";
  const recuperacao = tipo === "recovery" || destino === "/nova-senha";

  const supabase = await supabaseServer();
  if (tokenHash && tipo) {
    const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type: tipo });
    if (!error) return NextResponse.redirect(`${origin}${destino}`);
  } else if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(`${origin}${destino}`);
  }
  return NextResponse.redirect(recuperacao ? `${origin}/recuperar?erro=link` : `${origin}/entrar?erro=link`);
}
