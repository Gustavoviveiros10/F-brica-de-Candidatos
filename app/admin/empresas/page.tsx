import Link from "next/link";
import { supabaseServer } from "@/lib/supabase/server";
import { Icon } from "@/lib/icons-component";
import { NOME_ETAPA } from "@/lib/etapas";
import { telefone } from "@/lib/formato";
import { MOTIVOS, PAPEIS, cnpj, comParametros, n, quando, type EmpresaLinha, type FichaEmpresa } from "@/lib/admin";
import { CabecalhoPagina } from "@/components/cabecalho-pagina";
import { ChipStatus, Paginacao, TabelaEmpresas, Vazio } from "@/components/admin/blocos";
import { FormAjuste, FormPlano, FormStatus } from "@/components/admin/formularios-empresa";
import { FecharComEsc } from "@/components/admin/fechar-com-esc";

export const metadata = { title: "Empresas · Painel admin" };

const POR_PAGINA = 50;
const FILTROS = [
  ["", "Todas", "todas"],
  ["teste", "Em teste", "teste"],
  ["ativas", "Ativas", "ativas"],
  ["sem_credito", "Sem crédito", "sem_credito"],
  ["paradas", "Paradas há 14 dias", "paradas"],
  ["inadimplentes", "Inadimplentes ou bloqueadas", "inadimplentes"],
] as const;

type Params = { filtro?: string; q?: string; pagina?: string; id?: string };

async function Ficha({ id, fechar }: { id: string; fechar: string }) {
  const supabase = await supabaseServer();
  const [{ data, error }, { data: planos }] = await Promise.all([
    supabase.rpc("admin_empresa", { p_id: id }),
    supabase.from("planos").select("id,nome,creditos").eq("ativo", true).order("ordem"),
  ]);
  if (error || !data) return null;
  const e = data as FichaEmpresa;
  const contratados = e.funil.contratado ?? 0;

  return (
    <div className="overlay adm-overlay">
      <Link className="adm-fundo" href={fechar} scroll={false} aria-label="Fechar ficha" />
      <FecharComEsc href={fechar} />
      <aside className="drawer adm-gaveta" aria-label={`Ficha de ${e.nome}`}>
        <div className="adm-gaveta-top">
          <Link className="icon-btn drawer-close" href={fechar} scroll={false} aria-label="Fechar">
            <Icon name="close" />
          </Link>
          <ChipStatus status={e.status} />
          <h2>{e.nome}</h2>
          <p>
            CNPJ {cnpj(e.cnpj)} · {e.cidade ?? "cidade não informada"}
            {e.uf && `/${e.uf}`} · desde {new Date(e.criado_em).toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" })}
            {e.whatsapp && ` · WhatsApp ${telefone(e.whatsapp)}`}
          </p>
        </div>
        <div className="drawer-body">
          <div className="adm-saldo-box">
            <div>
              <div className="small muted">Saldo atual</div>
              <div className="big num">
                {n(e.saldo)}
                {e.plano_creditos ? <span className="small muted"> de {e.plano_creditos}</span> : null}
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div className="small muted">Plano</div>
              <b>{e.plano ?? (e.status === "teste" ? "Teste grátis" : "Sem plano")}</b>
              <div className="small muted">última atividade {quando(e.ultima_atividade)}</div>
            </div>
          </div>

          <div className="adm-numeros">
            <div>
              <b className="num">{n(e.lib_total)}</b>
              <span>contatos liberados</span>
            </div>
            <div>
              <b className="num">{n(e.lib_30d)}</b>
              <span>nos últimos 30 dias</span>
            </div>
            <div>
              <b className="num">{n(contratados)}</b>
              <span>{contratados === 1 ? "contratado" : "contratados"}</span>
            </div>
          </div>

          <div className="adm-forms">
            <FormAjuste empresaId={e.id} />
            <FormPlano empresaId={e.id} planos={planos ?? []} atual={e.plano_id} />
            <FormStatus empresaId={e.id} status={e.status} />
          </div>

          <div>
            <div className="adm-mini-h">Últimas liberações</div>
            {e.liberacoes.length ? (
              <div className="list">
                {e.liberacoes.slice(0, 8).map((l) => (
                  <div key={l.id}>
                    <span>
                      {[l.candidato, l.funcao].filter(Boolean).join(" · ") || "Candidato"}
                      <br />
                      <span className="small muted">{[l.cidade, quando(l.criado_em)].filter(Boolean).join(" · ")}</span>
                    </span>
                    <span className={`etapa-chip etapa-${l.etapa}`}>{NOME_ETAPA[l.etapa] ?? l.etapa}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="small muted">Ainda não liberou nenhum contato.</p>
            )}
          </div>

          <div>
            <div className="adm-mini-h">Extrato de créditos</div>
            <div className="list">
              {e.movimentos.slice(0, 8).map((m) => (
                <div key={m.id}>
                  <span>
                    {MOTIVOS[m.motivo] ?? m.motivo}
                    {m.justificativa && <span className="small muted"> · {m.justificativa}</span>}
                    <br />
                    <span className="small muted">{quando(m.criado_em)}</span>
                  </span>
                  <b className="num" style={{ color: m.delta > 0 ? "var(--ok)" : "var(--ink)" }}>
                    {m.delta > 0 ? `+${m.delta}` : m.delta}
                  </b>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="adm-mini-h">O que buscou por último</div>
            {e.buscas.length ? (
              <div className="list">
                {e.buscas.slice(0, 5).map((b, i) => (
                  <div key={i}>
                    <span>
                      {b.descricao}
                      <br />
                      <span className="small muted">{quando(b.criado_em)}</span>
                    </span>
                    <span className={`chip ${b.total === 0 ? "chip-warn" : ""}`}>{b.total === 0 ? "nenhum resultado" : `${n(b.total)} resultados`}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="small muted">Ainda não fez buscas.</p>
            )}
          </div>

          <div>
            <div className="adm-mini-h">Usuários</div>
            <div className="list">
              {e.usuarios.map((u, i) => (
                <div key={i}>
                  <span>
                    {u.nome}
                    <br />
                    <span className="small muted">
                      {u.email ?? "sem e-mail"} · último acesso {quando(u.ultimo_acesso)}
                    </span>
                  </span>
                  <span className="chip">{PAPEIS[u.papel] ?? u.papel}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}

export default async function AdminEmpresas({ searchParams }: { searchParams: Promise<Params> }) {
  const p = await searchParams;
  const filtro = FILTROS.some(([v]) => v && v === p.filtro) ? p.filtro! : "";
  const q = (p.q ?? "").trim().slice(0, 80);
  const pagina = Math.max(1, Number(p.pagina) || 1);
  const atuais = { filtro: filtro || undefined, q: q || undefined, pagina: pagina > 1 ? String(pagina) : undefined };

  const supabase = await supabaseServer();
  const [{ data, error }, { data: contagem }] = await Promise.all([
    supabase.rpc("admin_empresas", { p_filtro: filtro || null, p_busca: q || null, p_limite: POR_PAGINA, p_offset: (pagina - 1) * POR_PAGINA }),
    supabase.rpc("admin_empresas_contagem"),
  ]);
  if (error) throw new Error(error.message);
  const empresas = (data ?? []) as EmpresaLinha[];
  const total = Number(empresas[0]?.total ?? 0);
  const cont = (contagem ?? {}) as Record<string, number>;
  const fechar = comParametros("/admin/empresas", atuais, {});

  return (
    <>
      <CabecalhoPagina titulo="Empresas" texto={`${n(cont.todas ?? 0)} empresas · clique numa linha para ver créditos, liberações e usuários.`} />
      <div className="adm-busca">
        <nav className="adm-chips" aria-label="Filtrar empresas">
          {FILTROS.map(([v, rotulo, chave]) => (
            <Link key={v} href={comParametros("/admin/empresas", { q: atuais.q }, { filtro: v || null })} aria-current={filtro === v ? "true" : undefined}>
              {rotulo} <b>{n(cont[chave] ?? 0)}</b>
            </Link>
          ))}
        </nav>
        <form action="/admin/empresas" role="search">
          {filtro && <input type="hidden" name="filtro" value={filtro} />}
          <input className="input" name="q" defaultValue={q} placeholder="Buscar por nome ou CNPJ" aria-label="Buscar empresa" />
        </form>
      </div>
      <div className="panel">
        {empresas.length ? (
          <>
            <TabelaEmpresas empresas={empresas} selecionada={p.id} href={(id) => comParametros("/admin/empresas", atuais, { id })} />
            <Paginacao pagina={pagina} total={total} porPagina={POR_PAGINA} href={(pg) => comParametros("/admin/empresas", atuais, { pagina: pg > 1 ? String(pg) : null })} />
          </>
        ) : (
          <Vazio titulo="Nenhuma empresa encontrada" texto={q || filtro ? "Tente outro filtro ou outra busca." : undefined} />
        )}
      </div>
      {p.id && /^[0-9a-f-]{36}$/i.test(p.id) && <Ficha id={p.id} fechar={fechar} />}
    </>
  );
}
