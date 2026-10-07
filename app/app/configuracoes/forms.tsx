"use client";
import { useActionState } from "react";
import { BotaoEnviar } from "@/components/botao-enviar";
import { SeletorCidade } from "@/components/campos-empresa";
import { salvarEmpresa, salvarMeusDados, trocarSenhaLogado } from "./actions";
import type { EstadoForm } from "@/app/entrar/actions";

function Aviso({ estado }: { estado: EstadoForm }) {
  if (estado?.erro) return <div className="form-erro" role="alert">{estado.erro}</div>;
  if (estado?.ok) return <div className="form-ok" role="status">{estado.ok}</div>;
  return null;
}

type DadosEmpresa = { nome: string; cnpj: string; whatsapp: string; uf?: string; municipioId: number | null; mensagem: string; podeEditar: boolean };

export function FormEmpresa({ d, mensagemPadrao }: { d: DadosEmpresa; mensagemPadrao: string }) {
  const [estado, acao] = useActionState(salvarEmpresa, null);
  const travado = !d.podeEditar;
  return (
    <form action={acao} className="form-stack">
      <Aviso estado={estado} />
      {travado && <p className="small muted" style={{ margin: 0 }}>Só o administrador da empresa pode mudar esses dados.</p>}
      <div className="grid2">
        <div className="field">
          <label htmlFor="cf-empresa">Nome da empresa</label>
          <input className="input" id="cf-empresa" name="empresa" defaultValue={d.nome} disabled={travado} required />
        </div>
        <div className="field">
          <label htmlFor="cf-cnpj">CNPJ</label>
          <input className="input" id="cf-cnpj" value={d.cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5")} disabled readOnly />
        </div>
      </div>
      <div className="field">
        <label htmlFor="cf-whatsapp">WhatsApp da empresa</label>
        <input className="input" id="cf-whatsapp" name="whatsapp" type="tel" defaultValue={d.whatsapp.replace(/^\+55/, "")} disabled={travado} required />
      </div>
      <SeletorCidade uf={d.uf} municipioId={d.municipioId ?? undefined} desabilitado={travado} />
      <div className="field">
        <label htmlFor="cf-mensagem">Mensagem do WhatsApp</label>
        <textarea className="textarea" id="cf-mensagem" name="mensagem" maxLength={600} defaultValue={d.mensagem} placeholder={mensagemPadrao} disabled={travado} />
        <span className="small muted">
          É o texto que já vem escrito quando você chama um candidato. Use {"{nome}"}, {"{cargo}"} e {"{empresa}"}. Em branco, usamos a mensagem padrão.
        </span>
      </div>
      {!travado && (
        <div className="acoes">
          <BotaoEnviar className="btn btn-primary" enviando="Salvando...">Salvar dados da empresa</BotaoEnviar>
        </div>
      )}
    </form>
  );
}

export function FormMeusDados({ nome, email }: { nome: string; email: string }) {
  const [estado, acao] = useActionState(salvarMeusDados, null);
  return (
    <form action={acao} className="form-stack">
      <Aviso estado={estado} />
      <div className="grid2">
        <div className="field">
          <label htmlFor="cf-nome">Seu nome</label>
          <input className="input" id="cf-nome" name="nome" defaultValue={nome} required />
        </div>
        <div className="field">
          <label htmlFor="cf-email">E-mail de acesso</label>
          <input className="input" id="cf-email" value={email} disabled readOnly />
        </div>
      </div>
      <div className="acoes">
        <BotaoEnviar className="btn btn-secondary" enviando="Salvando...">Salvar meu nome</BotaoEnviar>
      </div>
    </form>
  );
}

export function FormSenha() {
  const [estado, acao] = useActionState(trocarSenhaLogado, null);
  return (
    <form action={acao} className="form-stack">
      <Aviso estado={estado} />
      <div className="grid2">
        <div className="field">
          <label htmlFor="cf-senha">Nova senha</label>
          <input className="input" id="cf-senha" name="senha" type="password" minLength={8} autoComplete="new-password" required />
        </div>
        <div className="field">
          <label htmlFor="cf-confirmacao">Repita a nova senha</label>
          <input className="input" id="cf-confirmacao" name="confirmacao" type="password" minLength={8} autoComplete="new-password" required />
        </div>
      </div>
      <div className="acoes">
        <BotaoEnviar className="btn btn-secondary" enviando="Trocando...">Trocar senha</BotaoEnviar>
      </div>
    </form>
  );
}
