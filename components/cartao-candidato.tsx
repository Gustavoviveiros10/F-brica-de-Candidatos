"use client";
import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import { liberarContato, type Contato } from "@/app/app/busca/actions";
import { alternarSalvo } from "@/app/app/salvos/actions";
import { CATEGORIAS, DISPONIBILIDADES, TEMPERATURAS, TURNOS, experiencia, linkWhatsApp, reais, telefone } from "@/lib/formato";
import { Icon } from "@/lib/icons-component";
import type { Candidato } from "@/lib/tipos";

type Props = { c: Candidato; empresa: string; modelo: string; saldo: number; cidadeBusca?: string };

const atualizado = (d: number) => (d <= 0 ? "hoje" : d === 1 ? "há 1 dia" : `há ${d} dias`);

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
  const aberto = ficha || confirmar;

  useEffect(() => {
    if (!aberto) return;
    document.body.style.overflow = "hidden";
    const esc = (e: KeyboardEvent) => e.key === "Escape" && (setFicha(false), setConfirmar(false));
    window.addEventListener("keydown", esc);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", esc);
    };
  }, [aberto]);

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

  const campos: [string, string][] = [
    ["Experiência", experiencia(c.experiencia_anos)],
    ["Turno", c.turno ? (TURNOS[c.turno] ?? c.turno) : "Não informado"],
    ["Contrato", c.contratos?.length ? c.contratos.join(", ") : "Não informado"],
    ["Pretensão salarial", c.pretensao_salarial ? reais(c.pretensao_salarial * 100) : "Não informada"],
    ["Disponibilidade", c.disponibilidade === "imediata" ? "Imediata" : `Em ${DISPONIBILIDADES[c.disponibilidade] ?? c.disponibilidade}`],
    ["Status profissional", c.situacao ?? "Não informado"],
    ["Formação", c.escolaridade ?? "Não informada"],
    ["CNH", c.cnh ?? "Não informada"],
  ];

  return (
    <>
      <div className="cand">
        <div className="cand-thumb">
          <img className="art photo" src={cat.foto} alt="" loading="lazy" />
        </div>
        <div className="cand-main">
          <div className="cand-title">
            {c.funcao}
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
          {erro && !aberto && (
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
        <div className="overlay" role="dialog" aria-modal="true" aria-label="Perfil profissional" onClick={(e) => e.target === e.currentTarget && setFicha(false)}>
          <aside className="drawer">
            <div className="drawer-art">
              <img className="art photo" src={cat.foto} alt="" />
              <button className="icon-btn drawer-close" aria-label="Fechar perfil" onClick={() => setFicha(false)} autoFocus>
                <Icon name="close" />
              </button>
            </div>
            <div className="drawer-body">
              <div>
                <div className="chips" style={{ marginBottom: 10 }}>
                  {liberado ? (
                    <span className="chip chip-ok"><Icon name="unlock" /> Contato liberado</span>
                  ) : (
                    <span className="chip"><Icon name="lock" /> Contato bloqueado</span>
                  )}
                  <span className={`chip ${t.classe}`} title={t.dica}>
                    <Icon name="flame" />
                    {t.rotulo}
                  </span>
                  <span className="chip">Perfil atualizado {atualizado(c.atualizado_ha_dias)}</span>
                </div>
                <h2>{c.funcao}</h2>
                <p className="muted" style={{ marginTop: 6 }}>
                  {c.cidade}/{c.uf}
                  {c.distancia_km != null && cidadeBusca && ` · a ${c.distancia_km} km de ${cidadeBusca}`}
                </p>
              </div>

              {liberado && (
                contato ? (
                  <>
                    <div className="contact-box">
                      <div className="row"><span>Nome</span><b>{contato.nome}</b></div>
                      <div className="row"><span>WhatsApp</span><b className="num">{telefone(contato.whatsapp)}</b></div>
                      <div className="row"><span>E-mail</span><b>{contato.email || "Não informado"}</b></div>
                      <div className="row"><span>Currículo</span><b>{c.tem_cv ? "Enviado" : "Não enviado"}</b></div>
                    </div>
                    <a className="btn btn-wa btn-block" href={wa!} target="_blank" rel="noopener">
                      <Icon name="wa" /> Chamar no WhatsApp
                    </a>
                    <p className="small muted" style={{ margin: 0 }}>
                      Abrir este perfil de novo não gasta crédito. Acompanhe a etapa em{" "}
                      <Link className="linklike" href="/app/liberados">Contatos liberados</Link>.
                    </p>
                  </>
                ) : (
                  <div className="contact-box"><div className="row"><span>Carregando contato...</span></div></div>
                )
              )}

              <div className="fields">
                {campos.map(([k, v]) => (
                  <div key={k}>
                    <div className="k">{k}</div>
                    <div className="v">{v}</div>
                  </div>
                ))}
              </div>
              <div>
                <div className="k small muted" style={{ marginBottom: 6 }}>Máquinas e conhecimentos técnicos</div>
                <div className="chips">
                  {c.habilidades?.length ? c.habilidades.map((s) => <span key={s} className="chip chip-brand">{s}</span>) : <span className="muted small">Não informado</span>}
                </div>
              </div>
              <div>
                <div className="k small muted" style={{ marginBottom: 6 }}>Cursos e certificações</div>
                <div className="chips">
                  {c.cursos?.length ? c.cursos.map((s) => <span key={s} className="chip">{s}</span>) : <span className="muted small">Não informado</span>}
                </div>
              </div>

              {!liberado && (
                <>
                  <div className="lock-box">
                    <Icon name="lock" />
                    <div>
                      <b>Nome, WhatsApp e e-mail ficam trancados.</b>
                      <br />
                      Você vê só o que ajuda a decidir. O contato completo aparece quando você libera.
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => setConfirmar(true)}>
                      <Icon name="unlock" /> Liberar contato (1 crédito)
                    </button>
                    <button className="btn btn-secondary" onClick={salvar}>
                      <Icon name="star" /> {salvo ? "Salvo" : "Salvar"}
                    </button>
                  </div>
                </>
              )}
            </div>
          </aside>
        </div>
      )}

      {confirmar && (
        <div className="overlay center" role="dialog" aria-modal="true" aria-label="Liberar contato" onClick={(e) => e.target === e.currentTarget && setConfirmar(false)}>
          <div className="modal">
            <h2>Liberar contato</h2>
            <p>Você vai usar 1 crédito para liberar este contato e abrir a ficha completa.</p>
            <p style={{ marginTop: 10, fontWeight: 600, color: "var(--ink)" }}>
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
