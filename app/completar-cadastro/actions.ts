"use server";
import { redirect } from "next/navigation";
import { criarEmpresa, lerDadosEmpresa } from "@/lib/empresa";
import type { EstadoForm } from "../entrar/actions";

export async function completar(_: EstadoForm, form: FormData): Promise<EstadoForm> {
  const dados = lerDadosEmpresa(form);
  if ("erro" in dados) return dados;
  const erro = await criarEmpresa(dados);
  if (erro) return { erro };
  redirect("/app?bemvindo=1");
}
