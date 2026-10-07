"use client";
import { useActionState } from "react";
import { trocarSenha } from "./actions";
import { BotaoEnviar } from "@/components/botao-enviar";
import { TelaAuth } from "@/components/marca";

export default function NovaSenha() {
  const [estado, acao] = useActionState(trocarSenha, null);
  return (
    <TelaAuth titulo="Busque primeiro. Pague só para liberar." texto="Pesquisar e comparar candidatos não gasta crédito.">
      <h1 className="display">Criar nova senha</h1>
      <form action={acao}>
        {estado?.erro && <div className="form-erro" role="alert">{estado.erro}</div>}
        <div className="field">
          <label htmlFor="ns-senha">Nova senha</label>
          <input className="input" id="ns-senha" name="senha" type="password" minLength={8} autoComplete="new-password" placeholder="Mínimo de 8 caracteres" required />
        </div>
        <BotaoEnviar enviando="Salvando...">Salvar e entrar</BotaoEnviar>
      </form>
    </TelaAuth>
  );
}
