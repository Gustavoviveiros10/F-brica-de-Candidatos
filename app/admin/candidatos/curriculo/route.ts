import { NextResponse, type NextRequest } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

// Abre o currículo com um link temporário (1 min). admin_candidato confere se quem pede é admin.
export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id") ?? "";
  if (!/^[0-9a-f-]{36}$/i.test(id)) return new NextResponse("Pedido inválido.", { status: 400 });
  const supabase = await supabaseServer();
  const { data, error } = await supabase.rpc("admin_candidato", { p_id: id });
  const caminho = (data as { cv_path?: string | null } | null)?.cv_path;
  if (error || !caminho) return new NextResponse("Currículo não encontrado.", { status: 404 });
  const { data: link } = await supabase.storage.from("curriculos").createSignedUrl(caminho, 60);
  if (!link?.signedUrl) return new NextResponse("Não deu para abrir o currículo.", { status: 500 });
  return NextResponse.redirect(link.signedUrl);
}
