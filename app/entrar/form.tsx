"use client";
import Link from "next/link";
import { useActionState } from "react";
import { entrar } from "./actions";
import { BotaoEnviar } from "@/components/botao-enviar";

export function FormEntrar({ voltar }: { voltar: string }) {
  const [estado, acao] = useActionState(entrar, null);
  return (
    <form action={acao}>
      {estado?.erro && <div className="form-erro" role="alert">{estado.erro}</div>}
      <input type="hidden" name="voltar" value={voltar} />
      <div className="field">
        <label htmlFor="lg-email">E-mail</label>
        <input className="input" id="lg-email" name="email" type="email" autoComplete="email" placeholder="voce@empresa.com.br" required />
      </div>
      <div className="field">
        <label htmlFor="lg-senha">Senha</label>
        <input className="input" id="lg-senha" name="senha" type="password" autoComplete="current-password" required />
      </div>
      <BotaoEnviar enviando="Entrando...">Entrar</BotaoEnviar>
      <p className="small muted" style={{ margin: 0 }}>
        <Link className="linklike" href="/recuperar">Esqueci minha senha</Link>
      </p>
    </form>
  );
}
