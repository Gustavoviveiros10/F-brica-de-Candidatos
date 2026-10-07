"use client";
import { useMemo, useState, useTransition } from "react";
import { mudarEtapa, salvarNota } from "@/app/app/liberados/actions";
import { ETAPAS, NOME_ETAPA } from "@/lib/etapas";
import { data as fdata, linkWhatsApp } from "@/lib/formato";
import { Icon } from "@/lib/icons-component";
import type { ContatoCrm } from "@/lib/tipos";
import { FichaCandidato } from "./ficha-candidato";

type Vista = "lista" | "quadro";
type Props = { contatos: ContatoCrm[]; empresa: string; modelo: string };

const semAcento = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

export function CrmLiberados({ contatos: iniciais, empresa, modelo }: Props) {
  const [contatos, setContatos] = useState(iniciais);
  const [vista, setVista] = useState<Vista>("lista");
  const [filtro, setFiltro] = useState<string | null>(null);
  const [busca, setBusca] = useState("");
  const [abertoId, setAbertoId] = useState<string | null>(null);
  const [, iniciar] = useTransition();

  const contagem = useMemo(() => {
    const n: Record<string, number> = {};
    contatos.forEach((c) => (n[c.etapa] = (n[c.etapa] ?? 0) + 1));
    return n;
  }, [contatos]);

  const visiveis = useMemo(() => {
    const q = semAcento(busca.trim());
    return contatos.filter(
      (c) => (vista === "quadro" || !filtro || c.etapa === filtro) && (!q || semAcento(`${c.nome} ${c.funcao} ${c.cidade}`).includes(q)),
    );
  }, [contatos, filtro, busca, vista]);

  const atualizar = (id: string, mudanca: Partial<ContatoCrm>) =>
    setContatos((lista) => lista.map((c) => (c.liberacao_id === id ? { ...c, ...mudanca } : c)));

  const trocarEtapa = (c: ContatoCrm, etapa: string) => {
    const anterior = c.etapa;
    atualizar(c.liberacao_id, { etapa });
    iniciar(async () => {
      if (!(await mudarEtapa(c.liberacao_id, etapa))) atualizar(c.liberacao_id, { etapa: anterior });
    });
  };

  const wa = (c: ContatoCrm) => linkWhatsApp(c.whatsapp, modelo, { nome: c.nome, cargo: c.funcao, empresa });
  const aberto = contatos.find((c) => c.liberacao_id === abertoId) ?? null;

  const seletorEtapa = (c: ContatoCrm) => (
    <select
      className={`etapa-select etapa-${c.etapa}`}
      aria-label={`Etapa de ${c.nome}`}
      value={c.etapa}
      onClick={(e) => e.stopPropagation()}
      onChange={(e) => trocarEtapa(c, e.target.value)}
    >
      {ETAPAS.map((e) => (
        <option key={e.id} value={e.id}>{e.nome}</option>
      ))}
    </select>
  );

  return (
    <>
      <div className="crm-bar">
        <div className="crm-filtros" role="group" aria-label="Filtrar por etapa">
          {vista === "lista" && (
            <button aria-pressed={!filtro} onClick={() => setFiltro(null)}>
              Todos <b>{contatos.length}</b>
            </button>
          )}
          {ETAPAS.map((e) => (
            <button
              key={e.id}
              className={`etapa-${e.id}`}
              aria-pressed={vista === "lista" && filtro === e.id}
              onClick={() => {
                setVista("lista");
                setFiltro(filtro === e.id ? null : e.id);
              }}
            >
              <span className={`etapa-chip etapa-${e.id}`} style={{ padding: 0, background: "none" }}>{e.nome}</span>
              <b>{contagem[e.id] ?? 0}</b>
            </button>
          ))}
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          <input className="input crm-busca" type="search" placeholder="Buscar nome, função ou cidade" value={busca} onChange={(e) => setBusca(e.target.value)} aria-label="Buscar contato" />
          <div className="seg" role="group" aria-label="Modo de visualização">
            <button aria-pressed={vista === "lista"} onClick={() => setVista("lista")}>
              <Icon name="list" /> Lista
            </button>
            <button aria-pressed={vista === "quadro"} onClick={() => setVista("quadro")}>
              <Icon name="grid" /> Quadro
            </button>
          </div>
        </div>
      </div>

      {vista === "lista" ? (
        visiveis.length ? (
          <div className="crm-lista">
            {visiveis.map((c) => (
              <div key={c.liberacao_id} className={`crm-linha etapa-${c.etapa}`}>
                <div className="quem">
                  <b>{c.nome}</b>
                  <span>
                    {c.funcao} · {c.cidade}/{c.uf} · liberado em {fdata(c.liberado_em)}
                  </span>
                </div>
                <div className="nota" title={c.nota ?? ""}>{c.nota || <span style={{ color: "var(--ink-3)" }}>Sem anotação</span>}</div>
                <div className="acoes">
                  {seletorEtapa(c)}
                  <button className="btn btn-secondary btn-sm" onClick={() => setAbertoId(c.liberacao_id)}>
                    Ficha
                  </button>
                  <a className="btn btn-wa btn-sm" href={wa(c)} target="_blank" rel="noopener">
                    <Icon name="wa" /> WhatsApp
                  </a>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="panel">
            <div className="empty">
              <b>Nenhum contato aqui</b>
              {filtro ? `Ninguém na etapa ${NOME_ETAPA[filtro]}.` : "Tente outra busca."}
            </div>
          </div>
        )
      ) : (
        <div className="crm-quadro">
          {ETAPAS.map((e) => {
            const daEtapa = visiveis.filter((c) => c.etapa === e.id);
            return (
              <section key={e.id} className={`crm-coluna etapa-${e.id}`} aria-label={e.nome}>
                <h3>
                  {e.nome} <span>{daEtapa.length}</span>
                </h3>
                {daEtapa.length ? (
                  daEtapa.map((c) => (
                    <div key={c.liberacao_id} className="crm-card" role="button" tabIndex={0} onClick={() => setAbertoId(c.liberacao_id)} onKeyDown={(ev) => ev.key === "Enter" && setAbertoId(c.liberacao_id)}>
                      <b>{c.nome}</b>
                      <span>{c.funcao}</span>
                      <span>{c.cidade}/{c.uf}</span>
                      {c.nota && <span style={{ fontStyle: "italic" }}>“{c.nota.length > 70 ? c.nota.slice(0, 70) + "…" : c.nota}”</span>}
                      <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
                        {seletorEtapa(c)}
                        <a className="btn btn-wa btn-sm" href={wa(c)} target="_blank" rel="noopener" onClick={(ev) => ev.stopPropagation()} aria-label={`WhatsApp de ${c.nome}`}>
                          <Icon name="wa" />
                        </a>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="crm-vazio">Ninguém nesta etapa</div>
                )}
              </section>
            );
          })}
        </div>
      )}

      {aberto && (
        <FichaCandidato
          c={aberto}
          liberado
          contato={{ nome: aberto.nome, whatsapp: aberto.whatsapp, email: aberto.email }}
          linkWa={wa(aberto)}
          onFechar={() => setAbertoId(null)}
          extra={<BlocoFunil c={aberto} seletor={seletorEtapa(aberto)} onNota={(nota) => atualizar(aberto.liberacao_id, { nota })} />}
        />
      )}
    </>
  );
}

function BlocoFunil({ c, seletor, onNota }: { c: ContatoCrm; seletor: React.ReactNode; onNota: (n: string) => void }) {
  const [nota, setNota] = useState(c.nota ?? "");
  const [estado, setEstado] = useState<"" | "salvando" | "salvo" | "erro">("");
  const [, iniciar] = useTransition();
  const salvar = () =>
    iniciar(async () => {
      setEstado("salvando");
      const ok = await salvarNota(c.liberacao_id, nota);
      setEstado(ok ? "salvo" : "erro");
      if (ok) onNota(nota.trim());
    });
  return (
    <div className="form-stack" style={{ gap: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <span className="small muted">Etapa do processo</span>
        {seletor}
      </div>
      <div className="field">
        <label htmlFor="crm-nota">Anotações</label>
        <textarea className="textarea" id="crm-nota" value={nota} maxLength={2000} placeholder="Ex.: entrevista marcada para quinta às 14h" onChange={(e) => (setNota(e.target.value), setEstado(""))} />
      </div>
      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        <button className="btn btn-secondary btn-sm" onClick={salvar} disabled={estado === "salvando" || nota === (c.nota ?? "")}>
          {estado === "salvando" ? "Salvando..." : "Salvar anotação"}
        </button>
        {estado === "salvo" && <span className="small" style={{ color: "var(--ok)" }}>Salvo</span>}
        {estado === "erro" && <span className="small" style={{ color: "var(--warn)" }}>Não deu para salvar. Tente de novo.</span>}
      </div>
      <p className="small muted" style={{ margin: 0 }}>Liberado em {fdata(c.liberado_em)}. Abrir esta ficha não gasta crédito.</p>
    </div>
  );
}
