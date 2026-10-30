"use client";
import { useActionState, useState } from "react";
import { BotaoEnviar } from "@/components/botao-enviar";
import { ajustarCreditos, ativarPlano, cancelarPlano, definirStatus, ocultarCandidato } from "@/app/admin/actions";
import type { EstadoForm } from "@/app/entrar/actions";

type Plano = { id: string; nome: string; creditos: number; preco_centavos: number };

const emReais = (centavos: number) => (centavos / 100).toLocaleString("pt-BR", { minimumFractionDigits: 0, maximumFractionDigits: 2 });

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

export function FormPlano({ empresaId, planos, atual, temPlano }: { empresaId: string; planos: Plano[]; atual: string | null; temPlano: boolean }) {
  const [estado, acao] = useActionState(ativarPlano, null);
  const [escolhido, setEscolhido] = useState(atual ?? "");
  const preco = planos.find((p) => p.id === escolhido)?.preco_centavos;
  return (
    <form action={acao}>
      <div className="adm-mini-h">{temPlano ? "Recebeu a mensalidade? Renove aqui" : "Vendeu um plano por fora? Ative aqui"}</div>
      <input type="hidden" name="empresa_id" value={empresaId} />
      <div className="adm-linha-form">
        <select className="select" name="plano" value={escolhido} onChange={(e) => setEscolhido(e.target.value)} aria-label="Plano" required>
          <option value="" disabled>
            Escolha o plano
          </option>
          {planos.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nome} · {p.creditos} créditos · R$ {emReais(p.preco_centavos)}
            </option>
          ))}
        </select>
        <select className="select" name="metodo" defaultValue="pix" aria-label="Forma de pagamento" style={{ flex: "0 1 130px", minWidth: 110 }}>
          <option value="pix">Pix</option>
          <option value="boleto">Boleto</option>
          <option value="cartao">Cartão</option>
        </select>
      </div>
      <div className="adm-linha-form">
        <input
          key={escolhido}
          className="input"
          style={{ flex: "0 1 150px", minWidth: 120 }}
          name="valor"
          inputMode="decimal"
          defaultValue={preco != null ? emReais(preco) : ""}
          placeholder="Valor recebido"
          aria-label="Valor recebido em reais"
        />
        <input className="input" style={{ flex: 2, minWidth: 180 }} name="motivo" placeholder="Observação (ex.: Pix de 15/10)" aria-label="Observação" maxLength={200} required />
      </div>
      <div className="adm-linha-form">
        <BotaoEnviar className="btn btn-secondary" enviando="Registrando...">
          {temPlano ? "Registrar pagamento e renovar" : "Registrar pagamento e ativar"}
        </BotaoEnviar>
        <span className="small muted">Lança os créditos do plano e conta no Financeiro.</span>
      </div>
      <Aviso estado={estado} />
    </form>
  );
}

export function FormCancelarPlano({ empresaId }: { empresaId: string }) {
  const [estado, acao] = useActionState(cancelarPlano, null);
  return (
    <form
      action={acao}
      onSubmit={(e) => {
        if (!confirm("Cancelar o plano desta empresa? Ela sai da lista de clientes pagantes. Os créditos que sobraram continuam com ela.")) e.preventDefault();
      }}
    >
      <input type="hidden" name="empresa_id" value={empresaId} />
      <div className="adm-linha-form">
        <BotaoEnviar className="btn btn-sm btn-secondary" enviando="Cancelando...">
          Cancelar plano
        </BotaoEnviar>
      </div>
      <Aviso estado={estado} />
    </form>
  );
}

export function FormOcultarCandidato({ candidatoId, ativo }: { candidatoId: string; ativo: boolean }) {
  const [estado, acao] = useActionState(ocultarCandidato, null);
  return (
    <form action={acao}>
      <input type="hidden" name="candidato_id" value={candidatoId} />
      <input type="hidden" name="ativo" value={ativo ? "0" : "1"} />
      <BotaoEnviar className="btn btn-secondary btn-block" enviando="Salvando...">
        {ativo ? "Ocultar da busca das empresas" : "Voltar a mostrar na busca"}
      </BotaoEnviar>
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
