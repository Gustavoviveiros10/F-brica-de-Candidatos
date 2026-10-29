"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { CATEGORIAS, DISPONIBILIDADES, TEMPERATURAS, TURNOS, dataCadastro, experiencia, reais, telefone } from "@/lib/formato";
import { Icon } from "@/lib/icons-component";
import { supabaseBrowser } from "@/lib/supabase/client";
import type { PerfilCandidato } from "@/lib/tipos";

export type ContatoFicha = { nome: string; whatsapp: string; email: string | null };

type Props = {
  c: PerfilCandidato;
  liberado: boolean;
  contato: ContatoFicha | null;
  linkWa: string | null;
  onFechar: () => void;
  cidadeBusca?: string;
  // Rodapé quando o contato está trancado (liberar / salvar).
  rodapeBloqueado?: React.ReactNode;
  // Bloco extra logo abaixo do contato (etapa e nota no CRM).
  extra?: React.ReactNode;
};

const SITUACOES: Record<string, string> = {
  desempregado: "Sem trabalho, disponível",
  empregado_aberto: "Trabalhando, aberto a propostas",
  empregado_temporario: "Em contrato temporário",
};

// Dados que não vêm nas listas (detalhes_candidato): curso e, depois de liberar, o currículo.
type Detalhes = { formacao_curso: string | null; formacao_status: string | null; cv_path: string | null };

const atualizado = (d: number) => (d <= 0 ? "hoje" : d === 1 ? "há 1 dia" : `há ${d} dias`);

// Ficha do candidato (modal central), usada na busca, nos salvos e no CRM.
export function FichaCandidato({ c, liberado, contato, linkWa, onFechar, cidadeBusca, rodapeBloqueado, extra }: Props) {
  const t = TEMPERATURAS[c.temperatura] ?? TEMPERATURAS.frio;
  const cat = CATEGORIAS[c.categoria] ?? CATEGORIAS.outros;

  const fechar = useRef(onFechar);
  fechar.current = onFechar;
  useEffect(() => {
    document.body.style.overflow = "hidden";
    const esc = (e: KeyboardEvent) => e.key === "Escape" && fechar.current();
    window.addEventListener("keydown", esc);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", esc);
    };
  }, []);

  const [det, setDet] = useState<Detalhes | null>(null);
  const [abrindoCv, setAbrindoCv] = useState(false);
  useEffect(() => {
    let vivo = true;
    supabaseBrowser()
      .rpc("detalhes_candidato", { p_id: c.id })
      .then(({ data }) => vivo && setDet(((data as Detalhes[] | null) ?? [])[0] ?? null));
    return () => {
      vivo = false;
    };
  }, [c.id, liberado]);

  // Link temporário (5 min): o arquivo nunca fica público.
  async function baixarCv() {
    if (!det?.cv_path) return;
    const aba = window.open("", "_blank");
    setAbrindoCv(true);
    const { data } = await supabaseBrowser().storage.from("curriculos").createSignedUrl(det.cv_path, 300);
    setAbrindoCv(false);
    if (data?.signedUrl && aba) aba.location.href = data.signedUrl;
    else aba?.close();
  }

  const formacao = c.escolaridade
    ? det?.formacao_curso
      ? `${det.formacao_curso}${det.formacao_status === "cursando" ? " (cursando)" : ""}`
      : c.escolaridade
    : "Não informada";

  const campos: [string, string][] = [
    ["Experiência", experiencia(c.experiencia_anos)],
    ["Turno", c.turno ? (TURNOS[c.turno] ?? c.turno) : "Não informado"],
    ["Contrato", c.contratos?.length ? c.contratos.join(", ") : "Não informado"],
    ["Pretensão salarial", c.pretensao_salarial ? reais(c.pretensao_salarial * 100) : "Não informada"],
    ["Disponibilidade", c.disponibilidade === "imediata" ? "Imediata" : `Em ${DISPONIBILIDADES[c.disponibilidade] ?? c.disponibilidade}`],
    ["Status profissional", c.situacao ? (SITUACOES[c.situacao] ?? c.situacao) : "Não informado"],
    ["Formação", formacao],
    ["CNH", c.cnh ?? "Não informada"],
  ];
  const nome = contato?.nome ?? c.primeiro_nome;

  return (
    <div className="overlay center" role="dialog" aria-modal="true" aria-label="Perfil profissional" onClick={(e) => e.target === e.currentTarget && onFechar()}>
      <section className="drawer ficha-modal">
        <div className="drawer-art">
          <img className="art photo" src={cat.foto} alt="" />
          <button className="icon-btn drawer-close" aria-label="Fechar perfil" onClick={onFechar} autoFocus>
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
              <span className="chip">Cadastro em {dataCadastro(c)} ({atualizado(c.atualizado_ha_dias)})</span>
            </div>
            <h2>{nome || c.funcao}</h2>
            <p className="muted" style={{ marginTop: 6 }}>
              {nome && <>{c.funcao} · </>}
              {c.cidade}/{c.uf}
              {c.distancia_km != null && cidadeBusca && ` · a ${c.distancia_km} km de ${cidadeBusca}`}
            </p>
          </div>

          {liberado &&
            (contato ? (
              <>
                <div className="contact-box">
                  <div className="row"><span>Nome</span><b>{contato.nome}</b></div>
                  <div className="row"><span>WhatsApp</span><b className="num">{telefone(contato.whatsapp)}</b></div>
                  <div className="row"><span>E-mail</span><b>{contato.email || "Não informado"}</b></div>
                  <div className="row"><span>Currículo</span><b>{c.tem_cv || det?.cv_path ? "Enviado" : "Não enviado"}</b></div>
                </div>
                {det?.cv_path && (
                  <button type="button" className="btn btn-secondary btn-block" onClick={baixarCv} disabled={abrindoCv}>
                    <Icon name="file" /> {abrindoCv ? "Abrindo..." : "Baixar currículo"}
                  </button>
                )}
                {linkWa && (
                  <a className="btn btn-wa btn-block" href={linkWa} target="_blank" rel="noopener">
                    <Icon name="wa" /> Chamar no WhatsApp
                  </a>
                )}
              </>
            ) : (
              <div className="contact-box"><div className="row"><span>Carregando contato...</span></div></div>
            ))}

          {extra}

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
                  <b>Sobrenome, WhatsApp e e-mail ficam trancados.</b>
                  <br />
                  Você vê só o que ajuda a decidir. O contato completo aparece quando você libera.
                </div>
              </div>
              {rodapeBloqueado}
            </>
          )}
          {liberado && !extra && (
            <p className="small muted" style={{ margin: 0 }}>
              Abrir este perfil de novo não gasta crédito. Acompanhe a etapa em{" "}
              <Link className="linklike" href="/app/liberados">Contatos liberados</Link>.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
