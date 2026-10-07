"use client";
import Link from "next/link";
import { useActionState } from "react";
import { recuperar } from "./actions";
import { BotaoEnviar } from "@/components/botao-enviar";
import { TelaAuth } from "@/components/marca";

export default function Recuperar() {
  const [estado, acao] = useActionState(recuperar, null);
  return (
    <TelaAuth titulo="Busque primeiro. Pague só para liberar." texto="Pesquisar e comparar candidatos não gasta crédito.">
      <h1 className="display">Nova senha</h1>
      <p className="muted">Informe o e-mail da conta. Enviamos um link para criar outra senha.</p>
      {estado?.ok ? (
        <div className="form-ok" style={{ marginTop: 24 }} role="status">{estado.ok}</div>
      ) : (
        <form action={acao}>
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
