"use client";
import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import { liberarContato, type Contato } from "@/app/app/busca/actions";
import { alternarSalvo } from "@/app/app/salvos/actions";
import { CATEGORIAS, DISPONIBILIDADES, TEMPERATURAS, TURNOS, experiencia, linkWhatsApp } from "@/lib/formato";
import { Icon } from "@/lib/icons-component";
import type { Candidato } from "@/lib/tipos";
import { FichaCandidato } from "./ficha-candidato";

type Props = { c: Candidato; empresa: string; modelo: string; saldo: number; cidadeBusca?: string };

export function CartaoCandidato({ c, empresa, modelo, saldo: saldoInicial, cidadeBusca }: Props) {
  const [ficha, setFicha] = useState(false);
  const [confirmar, setConfirmar] = useState(false);
  const [contato, setContato] = useState<Contato | null>(null);
  const [liberado, setLiberado] = useState(c.ja_liberado);
  const [salvo, setSalvo] = useState(c.salvo);
  const [saldo, setSaldo] = useState(saldoInicial);
  const [erro, setErro] = useState<{ msg: string; semCreditos?: boolean } | null>(null);
  const [pendente, iniciar] = useTransition();

  const t = TEMPERATURAS[c.temperatura] ?? TEMPERATURAS.frio;
  const cat = CATEGORIAS[c.categoria] ?? CATEGORIAS.outros;

  useEffect(() => {
    if (!confirmar) return;
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setConfirmar(false);
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [confirmar]);

  // Busca o contato (não cobra de novo se já foi liberado) e abre a ficha completa.
  const buscarContato = () =>
    iniciar(async () => {
      const r = await liberarContato(c.id);
      if (r?.contato) {
        setContato(r.contato);
        setLiberado(true);
        if (r.saldo != null) setSaldo(r.saldo);
        setErro(null);
        setConfirmar(false);
        setFicha(true);
      } else {
        setErro({ msg: r?.erro ?? "Algo deu errado. Tente de novo.", semCreditos: r?.semCreditos });
      }
    });

  const abrirFicha = () => {
    setFicha(true);
    if (liberado && !contato) buscarContato();
  };
  const pedirLiberacao = () => {
    setErro(null);
    if (liberado) buscarContato();
    else setConfirmar(true);
  };
  const salvar = () =>
    iniciar(async () => {
      const novo = !salvo;
      setSalvo(novo);
      if (!(await alternarSalvo(c.id, novo))) setSalvo(!novo);
    });

  const wa = contato ? linkWhatsApp(contato.whatsapp, modelo, { nome: contato.nome, cargo: c.funcao, empresa }) : null;
  const nome = contato?.nome.split(" ")[0] ?? c.primeiro_nome;

  return (
    <>
      <div className="cand">
        <div className="cand-thumb">
          <img className="art photo" src={cat.foto} alt="" loading="lazy" />
        </div>
        <div className="cand-main">
          <div className="cand-title">
            {nome ? (
              <span>
                {nome} <span className="muted" style={{ fontWeight: 500 }}>· {c.funcao}</span>
              </span>
            ) : (
              c.funcao
            )}
            {liberado && <span className="chip chip-ok">Liberado</span>}
            <span className={`chip ${t.classe}`} title={t.dica}>
              <Icon name="flame" />
              {t.rotulo}
            </span>
          </div>
          <div className="cand-meta">
            <span>
              <Icon name="pin" />
              {c.cidade}/{c.uf}
              {c.distancia_km != null && ` · ${c.distancia_km} km`}
            </span>
            <span>
              <Icon name="briefcase" />
              {experiencia(c.experiencia_anos)}
            </span>
            <span>
              <Icon name="clock" />
              {c.disponibilidade === "imediata" ? <b className="avail-now">Imediata</b> : `Em ${DISPONIBILIDADES[c.disponibilidade] ?? c.disponibilidade}`}
            </span>
            {c.turno && c.turno !== "qualquer" && <span>{TURNOS[c.turno] ?? c.turno}</span>}
            {c.cnh && <span>CNH {c.cnh}</span>}
          </div>
          <div className="chips">
            {(c.habilidades ?? []).slice(0, 3).map((s) => (
              <span key={s} className="chip chip-brand">{s}</span>
            ))}
            {(c.cursos ?? []).slice(0, 2).map((s) => (
              <span key={s} className="chip">{s}</span>
            ))}
          </div>
          {erro && !ficha && !confirmar && (
            <span className="small" style={{ color: "var(--warn)" }}>
              {erro.msg} {erro.semCreditos && <Link className="linklike" href="/app/creditos">Ver planos</Link>}
            </span>
          )}
        </div>
        <div className="cand-actions">
          <button className="icon-btn" aria-pressed={salvo} aria-label={salvo ? "Remover dos salvos" : "Salvar"} onClick={salvar}>
            <Icon name="star" />
          </button>
          <button className="btn btn-secondary btn-sm" onClick={abrirFicha}>
            Ver perfil
          </button>
          {liberado && wa ? (
            <a className="btn btn-wa btn-sm" href={wa} target="_blank" rel="noopener">
              <Icon name="wa" /> WhatsApp
            </a>
          ) : (
            <button className={`btn btn-sm ${liberado ? "btn-secondary" : "btn-primary"}`} onClick={pedirLiberacao} disabled={pendente}>
              <Icon name="unlock" /> {pendente ? "Abrindo..." : liberado ? "Ver contato" : "Liberar"}
            </button>
          )}
        </div>
      </div>

      {ficha && (
        <FichaCandidato
          c={c}
          liberado={liberado}
          contato={contato}
          linkWa={wa}
          cidadeBusca={cidadeBusca}
          onFechar={() => setFicha(false)}
          rodapeBloqueado={
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => setConfirmar(true)}>
                <Icon name="unlock" /> Liberar contato (1 crédito)
              </button>
              <button className="btn btn-secondary" onClick={salvar}>
                <Icon name="star" /> {salvo ? "Salvo" : "Salvar"}
              </button>
            </div>
          }
        />
      )}

      {confirmar && (
        <div className="overlay center" role="dialog" aria-modal="true" aria-label="Liberar contato" onClick={(e) => e.target === e.currentTarget && setConfirmar(false)}>
          <div className="modal">
            <h2>Liberar contato</h2>
            <p>Você vai usar 1 crédito para liberar este contato e abrir a ficha completa.</p>
            <p style={{ marginTop: 10, fontWeight: 600, color: "var(--ink)" }}>
              {c.primeiro_nome ? `${c.primeiro_nome} · ` : ""}
              {c.funcao} · {c.cidade}/{c.uf} · {experiencia(c.experiencia_anos)}
            </p>
            <div className="bal">
              <span>Créditos disponíveis</span>
              <b className="num">{saldo}</b>
            </div>
            {erro && <div className="lock-box" style={{ marginBottom: 16 }}><Icon name="alert" /><div>{erro.msg}</div></div>}
            {saldo > 0 && !erro?.semCreditos ? (
              <div className="actions">
                <button className="btn btn-secondary" onClick={() => setConfirmar(false)}>Cancelar</button>
                <button className="btn btn-primary" onClick={buscarContato} disabled={pendente} autoFocus>
                  {pendente ? "Liberando..." : "Liberar contato"}
                </button>
              </div>
            ) : (
              <>
                {!erro && (
                  <div className="lock-box" style={{ marginBottom: 16 }}>
                    <Icon name="alert" />
                    <div>Seus créditos acabaram. Escolha um plano para liberar este contato.</div>
                  </div>
                )}
                <div className="actions">
                  <button className="btn btn-secondary" onClick={() => setConfirmar(false)}>Fechar</button>
                  <Link className="btn btn-primary" href="/app/creditos">Ver planos</Link>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
