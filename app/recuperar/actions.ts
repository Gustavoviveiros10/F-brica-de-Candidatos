"use server";
import { supabaseServer } from "@/lib/supabase/server";
import { origemSite } from "@/lib/origem";
import type { EstadoForm } from "../entrar/actions";

export async function recuperar(_: EstadoForm, form: FormData): Promise<EstadoForm> {
  const email = String(form.get("email") ?? "").trim();
  const supabase = await supabaseServer();
  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${await origemSite()}/auth/callback?next=/nova-senha`,
  });
  // Mesma resposta exista ou não a conta, para não revelar e-mails cadastrados.
  return { ok: `Se existir uma conta com ${email}, enviamos um link para criar uma nova senha.` };
}
