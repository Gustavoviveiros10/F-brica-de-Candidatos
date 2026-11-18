"use client";
import Link from "next/link";
import { use, useActionState } from "react";
import { recuperar } from "./actions";
import { BotaoEnviar } from "@/components/botao-enviar";
import { TelaAuth } from "@/components/marca";

export default function Recuperar({ searchParams }: { searchParams: Promise<{ erro?: string }> }) {
  const { erro } = use(searchParams);
  const [estado, acao] = useActionState(recuperar, null);
  return (
    <TelaAuth titulo="Busque primeiro. Pague só para liberar." texto="Pesquisar e comparar candidatos não gasta crédito.">
      <h1 className="display">Nova senha</h1>
      <p className="muted">Informe o e-mail da conta. Enviamos um link para criar outra senha.</p>
      {erro === "link" && !estado?.ok && (
        <div className="form-erro" style={{ marginTop: 16 }} role="alert">
          Esse link já foi usado ou foi trocado por um mais novo. Abra o e-mail mais recente ou peça outro abaixo.
        </div>
      )}
      {estado?.ok ? (
        <div className="form-ok" style={{ marginTop: 24 }} role="status">{estado.ok}</div>
      ) : (
        <form action={acao}>
          {estado?.erro && <div className="form-erro" role="alert">{estado.erro}</div>}
          <div className="field">
            <label htmlFor="rc-email">E-mail</label>
            <input className="input" id="rc-email" name="email" type="email" autoComplete="email" required />
          </div>
          <BotaoEnviar enviando="Enviando...">Enviar link</BotaoEnviar>
        </form>
      )}
      <p className="small muted" style={{ marginTop: 16 }}>
        <Link className="linklike" href="/entrar">Voltar para entrar</Link>
      </p>
    </TelaAuth>
  );
}
