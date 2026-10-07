"use server";
import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";

export type EstadoForm = { erro?: string; ok?: string } | null;

// Só aceita voltar para dentro do próprio site.
const destinoSeguro = (v: FormDataEntryValue | null) => {
  const s = typeof v === "string" ? v : "";
  return s.startsWith("/") && !s.startsWith("//") ? s : "/app";
};

export async function entrar(_: EstadoForm, form: FormData): Promise<EstadoForm> {
  const supabase = await supabaseServer();
  const { error } = await supabase.auth.signInWithPassword({
    email: String(form.get("email") ?? "").trim(),
    password: String(form.get("senha") ?? ""),
  });
  if (error) {
    if (error.code === "email_not_confirmed") return { erro: "Confirme seu e-mail pelo link que enviamos antes de entrar." };
    return { erro: "E-mail ou senha incorretos." };
  }
  redirect(destinoSeguro(form.get("voltar")));
}
