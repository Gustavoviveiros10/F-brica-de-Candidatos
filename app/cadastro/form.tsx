"use client";
import Link from "next/link";
import { useActionState } from "react";
import { cadastrar } from "./actions";
import { BotaoEnviar } from "@/components/botao-enviar";
import { CamposEmpresa } from "@/components/campos-empresa";

export function FormCadastro() {
  const [estado, acao] = useActionState(cadastrar, null);
  if (estado?.ok) return <div className="form-ok" style={{ marginTop: 24 }} role="status">{estado.ok}</div>;
  return (
    <form action={acao}>
      {estado?.erro && <div className="form-erro" role="alert">{estado.erro}</div>}
      <div className="field">
        <label htmlFor="su-nome">Seu nome</label>
        <input className="input" id="su-nome" name="nome" autoComplete="name" required />
      </div>
      <div className="field">
        <label htmlFor="su-email">E-mail</label>
        <input className="input" id="su-email" name="email" type="email" autoComplete="email" required />
      </div>
      <CamposEmpresa />
      <div className="field">
        <label htmlFor="su-senha">Senha</label>
        <input className="input" id="su-senha" name="senha" type="password" minLength={8} autoComplete="new-password" placeholder="Mínimo de 8 caracteres" required />
      </div>
      <label className="check">
        <input type="checkbox" name="termos" required />
        <span>
          Li e aceito os <Link className="linklike" href="/termos" target="_blank">termos de uso</Link> e a{" "}
          <Link className="linklike" href="/privacidade" target="_blank">política de privacidade</Link>.
        </span>
      </label>
      <BotaoEnviar enviando="Criando conta...">Criar conta grátis</BotaoEnviar>
    </form>
  );
}
