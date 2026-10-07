"use server";
import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import type { EstadoForm } from "../entrar/actions";

export async function trocarSenha(_: EstadoForm, form: FormData): Promise<EstadoForm> {
  const senha = String(form.get("senha") ?? "");
  if (senha.length < 8) return { erro: "A senha precisa ter pelo menos 8 caracteres." };
  const supabase = await supabaseServer();
  const { error } = await supabase.auth.updateUser({ password: senha });
  if (error) {
    if (error.code === "same_password") return { erro: "Use uma senha diferente da anterior." };
    return { erro: "O link expirou. Peça um novo em “Esqueci minha senha”." };
  }
  redirect("/app");
}
