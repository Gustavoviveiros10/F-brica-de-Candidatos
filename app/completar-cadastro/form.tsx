"use client";
import { useActionState } from "react";
import { completar } from "./actions";
import { BotaoEnviar } from "@/components/botao-enviar";
import { CamposEmpresa, type ValoresEmpresa } from "@/components/campos-empresa";

export function FormCompletar({ iniciais, nome, erroInicial }: { iniciais: ValoresEmpresa; nome: string; erroInicial?: string }) {
  const [estado, acao] = useActionState(completar, erroInicial ? { erro: erroInicial } : null);
  return (
    <form action={acao}>
      {estado?.erro && <div className="form-erro" role="alert">{estado.erro}</div>}
      <div className="field">
        <label htmlFor="su-nome">Seu nome</label>
        <input className="input" id="su-nome" name="nome" autoComplete="name" defaultValue={nome} required />
      </div>
      <CamposEmpresa iniciais={iniciais} />
      <BotaoEnviar enviando="Salvando...">Concluir cadastro</BotaoEnviar>
    </form>
  );
}
