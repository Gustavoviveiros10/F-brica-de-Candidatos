import Link from "next/link";
import { supabaseServer } from "@/lib/supabase/server";
import { CATEGORIAS, DISPONIBILIDADES, TEMPERATURAS, TURNOS, data as fdata, experiencia, reais, telefone } from "@/lib/formato";
import { Icon } from "@/lib/icons-component";
import { NOME_ETAPA } from "@/lib/etapas";
import { comParametros, hora, n, quando, type CandidatoAdmin, type FichaCandidatoAdmin, type ResumoCandidatos } from "@/lib/admin";
import { CabecalhoPagina } from "@/components/cabecalho-pagina";
import { Paginacao, Vazio } from "@/components/admin/blocos";
import { FecharComEsc } from "@/components/admin/fechar-com-esc";
import { FormOcultarCandidato } from "@/components/admin/formularios-empresa";

export const metadata = { title: "Candidatos · Painel admin" };

const POR_PAGINA = 30;
const FILTROS = [
  ["", "Todos", "todos"],
  ["quentes", "Quentes", "quentes"],
  ["com_cv", "Com currículo", "com_cv"],
  ["novos", "Novos em 7 dias", "novos"],
  ["ocultos", "Ocultos", "ocultos"],
] as const;

const SITUACOES: Record<string, string> = {
  desempregado: "Sem trabalho, disponível",
  empregado_aberto: "Trabalhando, aberto a propostas",
  empregado_temporario: "Em contrato temporário",
};
const ORIGENS: Record<string, string> = { ig: "Instagram", instagram: "Instagram", fb: "Facebook", facebook: "Facebook", meta: "Meta Ads", google: "Google" };

type Params = { q?: string; funcao?: string; cidade?: string; filtro?: string; pagina?: string; id?: string };

function Temperatura({ t }: { t: string }) {
  const x = TEMPERATURAS[t] ?? TEMPERATURAS.frio;
  return (
    <span className={`chip ${x.classe}`} title={x.dica}>
      <Icon name="flame" />
      {x.rotulo}
    </span>
  );
}

const linkWa = (w: string) => {
  const d = w.replace(/\D/g, "");
  return `https://wa.me/${d.startsWith("55") ? d : "55" + d}`;
};

async function Ficha({ id, fechar }: { id: string; fechar: string }) {
  const supabase = await supabaseServer();
  const { data, error } = await supabase.rpc("admin_candidato", { p_id: id });
  if (error || !data) return null;
  const c = data as FichaCandidatoAdmin;
  const formacao = c.formacao_curso ? `${c.formacao_curso}${c.formacao_status === "cursando" ? " (cursando)" : ""}` : c.escolaridade;
  const perfil: [string, string | null][] = [
    ["Experiência", c.experiencia_anos ? experiencia(c.experiencia_anos) : null],
    ["Disponibilidade", c.disponibilidade === "imediata" ? "Imediata" : `Em ${DISPONIBILIDADES[c.disponibilidade] ?? c.disponibilidade}`],
    ["Turno", c.turnos?.length ? c.turnos.map((t) => TURNOS[t] ?? t).join(", ") : c.turno ? (TURNOS[c.turno] ?? c.turno) : null],
    ["Contrato", c.contratos?.length ? c.contratos.join(", ") : null],
    ["Pretensão", c.pretensao_salarial ? reais(c.pretensao_salarial * 100) : null],
    ["Situação", c.situacao ? (SITUACOES[c.situacao] ?? c.situacao) : null],
    ["Formação", formacao],
    ["CNH", c.cnh],
    ["PcD", c.pcd === "sim" ? "Sim" : c.pcd === "nao" ? "Não" : null],
  ];
  const origem = c.captacao[0];

  return (
    <div className="overlay adm-overlay">
      <Link className="adm-fundo" href={fechar} scroll={false} aria-label="Fechar ficha" />
      <FecharComEsc href={fechar} />
      <aside className="drawer adm-gaveta" aria-label={`Ficha de ${c.nome ?? "candidato"}`}>
        <div className="adm-gaveta-top">
          <Link className="icon-btn drawer-close" href={fechar} scroll={false} aria-label="Fechar">
            <Icon name="close" />
          </Link>
          <div className="chips">
            {c.ativo ? (
              <span className="chip chip-ok">
                <Icon name="check" /> Aparece na busca
              </span>
            ) : (
              <span className="chip chip-warn">
                <Icon name="eye" /> Oculto da busca
              </span>
            )}
            <Temperatura t={c.temperatura} />
          </div>
          <h2>{c.nome ?? "Sem nome"}</h2>
          <p>
            {c.funcao ?? "Função não informada"} · {c.cidade ?? "cidade não informada"}
            {c.uf && `/${c.uf}`} · cadastro {quando(c.criado_em)}
          </p>
        </div>
        <div className="drawer-body">
          <div className="contact-box">
            <div className="row">
              <span>WhatsApp</span>
              <b className="num">{c.whatsapp ? telefone(c.whatsapp) : "Não informado"}</b>
            </div>
            <div className="row">
              <span>E-mail</span>
              <b>{c.email || "Não informado"}</b>
            </div>
            {c.bairro && (
              <div className="row">
                <span>Bairro</span>
                <b>{c.bairro}</b>
              </div>
            )}
            <div className="row">
              <span>Currículo</span>
              <b>{c.cv_path ? "Enviado" : "Não enviado"}</b>
            </div>
          </div>
          <div className="adm-linha-form">
            {c.whatsapp && (
              <a className="btn btn-wa" style={{ flex: 1 }} href={linkWa(c.whatsapp)} target="_blank" rel="noopener">
                <Icon name="wa" /> WhatsApp
              </a>
            )}
            {c.cv_path && (
              <a className="btn btn-secondary" style={{ flex: 1 }} href={`/admin/candidatos/curriculo?id=${c.id}`} target="_blank" rel="noopener">
                <Icon name="file" /> Currículo
              </a>
            )}
          </div>

          <div>
            <div className="adm-mini-h">Perfil</div>
            <div className="adm-respostas">
              {perfil
                .filter(([, v]) => v)
                .map(([k, v]) => (
                  <div key={k}>
                    <span>{k}</span>
                    <b>{v}</b>
                  </div>
                ))}
            </div>
          </div>

          {c.respostas.length > 0 && (
            <div>
              <div className="adm-mini-h">Respostas do formulário</div>
              <div className="adm-respostas">
                {c.respostas.map((r, i) => (
                  <div key={i}>
                    <span>{r.pergunta}</span>
                    <b>{r.resposta || "—"}</b>
                  </div>
                ))}
              </div>
            </div>
          )}

          {(c.habilidades?.length || c.cursos?.length) && (
            <div>
              <div className="adm-mini-h">Habilidades e cursos</div>
              <div className="chips" style={{ marginTop: 8 }}>
                {[...(c.habilidades ?? []), ...(c.cursos ?? [])].map((h) => (
                  <span key={h} className="chip">
                    {h}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div>
            <div className="adm-mini-h">De onde veio</div>
            <div className="adm-respostas">
              <div>
                <span>Origem</span>
                <b>{origem?.utm_source ? (ORIGENS[origem.utm_source.toLowerCase()] ?? origem.utm_source) : c.origem === "landing" ? "Formulário do site" : (c.origem ?? "—")}</b>
              </div>
              {origem?.utm_campaign && (
                <div>
                  <span>Campanha</span>
                  <b>{origem.utm_campaign}</b>
                </div>
              )}
              {origem?.utm_content && (
                <div>
                  <span>Anúncio</span>
                  <b>{origem.utm_content}</b>
                </div>
              )}
              {origem?.funcao_informada && (
                <div>
                  <span>Função que digitou</span>
                  <b>{origem.funcao_informada}</b>
                </div>
              )}
              {c.captacao.length > 1 && (
                <div>
                  <span>Cadastros</span>
                  <b>{c.captacao.length} vezes (último {quando(c.captacao[0].criado_em)})</b>
                </div>
              )}
              <div>
                <span>Aceitou os termos (LGPD)</span>
                <b>{c.consentimento_em ? `${fdata(c.consentimento_em)}, ${hora(c.consentimento_em)}` : "—"}</b>
              </div>
            </div>
          </div>

          <div>
            <div className="adm-mini-h">Empresas que liberaram</div>
            {c.liberacoes.length ? (
              <div className="list">
                {c.liberacoes.map((l, i) => (
                  <Link key={i} href={`/admin/empresas?id=${l.empresa_id}`}>
                    <span>
                      {l.empresa}
                      <br />
                      <span className="small muted">{quando(l.criado_em)}</span>
                    </span>
                    <span className={`etapa-chip etapa-${l.etapa}`}>{NOME_ETAPA[l.etapa] ?? l.etapa}</span>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="small muted">Nenhuma empresa liberou ainda.</p>
            )}
          </div>

          <FormOcultarCandidato candidatoId={c.id} ativo={c.ativo} />
        </div>
      </aside>
    </div>
  );
}

export default async function AdminCandidatos({ searchParams }: { searchParams: Promise<Params> }) {
  const p = await searchParams;
  const filtro = FILTROS.some(([v]) => v && v === p.filtro) ? p.filtro! : "";
  const q = (p.q ?? "").trim().slice(0, 80);
  const funcao = /^\d+$/.test(p.funcao ?? "") ? p.funcao! : "";
  const cidade = /^\d+$/.test(p.cidade ?? "") ? p.cidade! : "";
  const pagina = Math.max(1, Number(p.pagina) || 1);
  const atuais = {
    filtro: filtro || undefined,
    q: q || undefined,
    funcao: funcao || undefined,
    cidade: cidade || undefined,
    pagina: pagina > 1 ? String(pagina) : undefined,
  };

  const supabase = await supabaseServer();
  const [{ data, error }, { data: resumo }] = await Promise.all([
    supabase.rpc("admin_candidatos", {
      p_busca: q || null,
      p_funcao_id: funcao ? Number(funcao) : null,
      p_municipio_id: cidade ? Number(cidade) : null,
      p_filtro: filtro || null,
      p_limite: POR_PAGINA,
      p_offset: (pagina - 1) * POR_PAGINA,
    }),
    supabase.rpc("admin_candidatos_resumo"),
  ]);
  if (error) throw new Error(error.message);
  const lista = (data ?? []) as CandidatoAdmin[];
  const total = Number(lista[0]?.total ?? 0);
  const r = (resumo ?? { contagem: {}, funcoes: [], cidades: [] }) as ResumoCandidatos;
  const k = r.contagem;
  const variacao = k.novos_antes > 0 ? Math.round(((k.novos - k.novos_antes) / k.novos_antes) * 100) : null;
  const fechar = comParametros("/admin/candidatos", atuais, {});

  return (
    <>
      <CabecalhoPagina titulo="Candidatos" texto="Todo mundo que se cadastrou pelo formulário, com contato completo. Clique num card para ver a ficha." />

      <div className="kpis adm-kpis">
        <div className="kpi adm-kpi">
          <div className="l">Candidatos na base</div>
          <div className="v num">{n(k.todos ?? 0)}</div>
          <div className="s">
            {n(k.ativos ?? 0)} aparecem na busca · {n(k.ocultos ?? 0)} {k.ocultos === 1 ? "oculto" : "ocultos"}
          </div>
        </div>
        <div className="kpi adm-kpi">
          <div className="l">Novos em 7 dias</div>
          <div className="v num">{n(k.novos ?? 0)}</div>
          <div className="s">
            {variacao === null ? (
              `${n(k.novos_antes ?? 0)} nos 7 dias antes`
            ) : (
              <>
                <span className={`adm-delta${variacao < 0 ? " neg" : ""}`}>
                  {variacao < 0 ? "▼" : "▲"} {Math.abs(variacao)}%
                </span>{" "}
                vs. 7 dias antes
              </>
            )}
          </div>
        </div>
        <div className="kpi adm-kpi">
          <div className="l">Com currículo</div>
          <div className="v num">{n(k.com_cv ?? 0)}</div>
          <div className="s">{k.todos ? Math.round(((k.com_cv ?? 0) / k.todos) * 100) : 0}% da base</div>
        </div>
        <div className="kpi adm-kpi">
          <div className="l">Quentes agora</div>
          <div className="v num">{n(k.quentes ?? 0)}</div>
          <div className="s">disponíveis e com cadastro recente</div>
        </div>
      </div>

      <form className="cands-filtros" action="/admin/candidatos" role="search">
        {filtro && <input type="hidden" name="filtro" value={filtro} />}
        <input className="input" name="q" defaultValue={q} placeholder="Nome, WhatsApp ou e-mail" aria-label="Buscar candidato" />
        <select className="select" name="funcao" defaultValue={funcao} aria-label="Função">
          <option value="">Todas as funções</option>
          {r.funcoes.map((f) => (
            <option key={f.id} value={f.id}>
              {f.nome} ({n(f.n)})
            </option>
          ))}
        </select>
        <select className="select" name="cidade" defaultValue={cidade} aria-label="Cidade">
          <option value="">Todas as cidades</option>
          {r.cidades.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nome}/{c.uf} ({n(c.n)})
            </option>
          ))}
        </select>
        <button className="btn btn-secondary">Filtrar</button>
        {(q || funcao || cidade) && (
          <Link className="small" href={comParametros("/admin/candidatos", { filtro: atuais.filtro }, {})}>
            Limpar
          </Link>
        )}
      </form>
      <nav className="adm-chips" aria-label="Filtros rápidos" style={{ marginBottom: 14 }}>
        {FILTROS.map(([v, rotulo, chave]) => (
          <Link key={v} href={comParametros("/admin/candidatos", { q: atuais.q, funcao: atuais.funcao, cidade: atuais.cidade }, { filtro: v || null })} aria-current={filtro === v ? "true" : undefined}>
            {rotulo} <b>{n((k as Record<string, number>)[chave] ?? 0)}</b>
          </Link>
        ))}
      </nav>

      {lista.length ? (
        <>
          <div className="adm-ccards adm-lista-anim">
            {lista.map((c) => {
              const cat = CATEGORIAS[c.categoria] ?? CATEGORIAS.outros;
              return (
                <Link key={c.id} className={`adm-ccard${p.id === c.id ? " sel" : ""}${c.ativo ? "" : " oculto"}`} href={comParametros("/admin/candidatos", atuais, { id: c.id })} scroll={false}>
                  <img src={cat.foto} alt="" loading="lazy" />
                  <div className="b">
                    <b>{c.nome ?? "Sem nome"}</b>
                    <p>
                      {c.funcao ?? "Função não informada"} · {c.cidade ?? "—"}
                    </p>
                    <div className="chips">
                      <Temperatura t={c.temperatura} />
                      <span className="chip">Cadastro {quando(c.criado_em)}</span>
                      {c.tem_cv && <span className="chip chip-brand">Currículo</span>}
                      {!c.ativo && <span className="chip chip-warn">Oculto</span>}
                    </div>
                  </div>
                  <div className="cont">
                    <span className="num">{c.whatsapp ? telefone(c.whatsapp) : "Sem WhatsApp"}</span>
                    <span className="muted">
                      {n(c.liberacoes)} {c.liberacoes === 1 ? "liberação" : "liberações"}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
          <div className="panel" style={{ marginTop: 14 }}>
            <Paginacao pagina={pagina} total={total} porPagina={POR_PAGINA} href={(pg) => comParametros("/admin/candidatos", atuais, { pagina: pg > 1 ? String(pg) : null })} />
          </div>
        </>
      ) : (
        <div className="panel">
          <Vazio titulo="Nenhum candidato encontrado" texto={q || filtro || funcao || cidade ? "Tente outro filtro ou outra busca." : "Os cadastros do formulário aparecem aqui."} />
        </div>
      )}
      {p.id && /^[0-9a-f-]{36}$/i.test(p.id) && <Ficha id={p.id} fechar={fechar} />}
    </>
  );
}
