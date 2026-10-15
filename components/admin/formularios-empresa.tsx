"use client";
import { useActionState } from "react";
import { BotaoEnviar } from "@/components/botao-enviar";
import { ajustarCreditos, ativarPlano, definirStatus } from "@/app/admin/actions";
import type { EstadoForm } from "@/app/entrar/actions";

type Plano = { id: string; nome: string; creditos: number };

function Aviso({ estado }: { estado: EstadoForm }) {
  if (estado?.erro) return <div className="form-erro" role="alert">{estado.erro}</div>;
  if (estado?.ok) return <div className="form-ok" role="status">{estado.ok}</div>;
  return null;
}

export function FormAjuste({ empresaId }: { empresaId: string }) {
  const [estado, acao] = useActionState(ajustarCreditos, null);
  return (
    <form action={acao}>
      <div className="adm-mini-h">Ajustar créditos</div>
      <input type="hidden" name="empresa_id" value={empresaId} />
      <div className="adm-ajuste">
        <input className="input" name="delta" inputMode="numeric" placeholder="+10 ou -5" aria-label="Quantidade de créditos" required />
        <input className="input" name="motivo" placeholder="Motivo (sai no extrato da empresa)" aria-label="Motivo" maxLength={200} required />
        <BotaoEnviar className="btn btn-primary" enviando="Lançando...">
          Lançar
        </BotaoEnviar>
      </div>
      <Aviso estado={estado} />
    </form>
  );
}

export function FormPlano({ empresaId, planos, atual }: { empresaId: string; planos: Plano[]; atual: string | null }) {
  const [estado, acao] = useActionState(ativarPlano, null);
  return (
    <form action={acao}>
      <div className="adm-mini-h">Vendeu um plano por fora? Ative aqui</div>
      <input type="hidden" name="empresa_id" value={empresaId} />
      <div className="adm-linha-form">
        <select className="select" name="plano" defaultValue={atual ?? ""} aria-label="Plano" required>
          <option value="" disabled>
            Escolha o plano
          </option>
          {planos.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nome} · {p.creditos} créditos
            </option>
          ))}
        </select>
        <input className="input" style={{ flex: 2, minWidth: 180 }} name="motivo" placeholder="Como pagou (ex.: Pix de 15/10)" aria-label="Como pagou" maxLength={200} required />
        <BotaoEnviar className="btn btn-secondary" enviando="Ativando...">
          Ativar e lançar créditos
        </BotaoEnviar>
      </div>
      <Aviso estado={estado} />
    </form>
  );
}

export function FormStatus({ empresaId, status }: { empresaId: string; status: string }) {
  const [estado, acao] = useActionState(definirStatus, null);
  return (
    <form action={acao}>
      <div className="adm-mini-h">Status da conta</div>
      <input type="hidden" name="empresa_id" value={empresaId} />
      <div className="adm-linha-form">
        <select className="select" name="status" defaultValue={status} aria-label="Status">
          <option value="teste">Teste</option>
          <option value="ativa">Ativa</option>
          <option value="inadimplente">Inadimplente</option>
          <option value="bloqueada">Bloqueada (não libera contatos)</option>
        </select>
        <BotaoEnviar className="btn btn-secondary" enviando="Salvando...">
          Salvar status
        </BotaoEnviar>
      </div>
      <Aviso estado={estado} />
    </form>
  );
}
