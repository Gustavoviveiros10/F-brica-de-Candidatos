import Link from "next/link";
import { exigirEmpresa } from "@/lib/conta";
import { CATEGORIAS, DISPONIBILIDADES, MENSAGEM_PADRAO, TEMPERATURAS, experiencia } from "@/lib/formato";
import { Icon } from "@/lib/icons-component";
import { supabaseServer } from "@/lib/supabase/server";
import { CabecalhoPagina } from "@/components/cabecalho-pagina";
import { BotaoLiberar } from "@/components/botao-liberar";

export const metadata = { title: "Buscar candidatos · Fábrica de Candidatos" };

const POR_PAGINA = 20;
const RAIOS = [10, 20, 30, 50, 80, 150];
const EXPERIENCIAS = [1, 2, 3, 5, 8];
const TURNOS: Record<string, string> = { "1_turno": "1º turno", "2_turno": "2º turno", "3_turno": "3º turno", comercial: "Comercial" };
const ESCOLARIDADES = ["Ensino fundamental", "Ensino médio completo", "Técnico", "Superior"];
const CONTRATOS = ["CLT", "PJ", "Temporário"];

type Opcoes = {
  cidades: { id: number; nome: string; uf: string; total: number }[];
  funcoes: { id: number; nome: string; categoria: string; total: number }[];
  habilidades: string[];
  cursos: string[];
};

type Candidato = {
  id: string; funcao: string; categoria: string; cidade: string; uf: string; distancia_km: number | null;
  experiencia_anos: number | null; turno: string | null; disponibilidade: string; temperatura: string;
  habilidades: string[] | null; cursos: string[] | null; cnh: string | null; atualizado_ha_dias: number;
  relacionado: boolean; ja_liberado: boolean; total: number;
};

type Filtros = Partial<Record<"funcao" | "categoria" | "cidade" | "raio" | "exp" | "hab" | "curso" | "esc" | "turno" | "contrato" | "disp" | "temp" | "pagina", string>>;

const num = (v?: string) => (v && /^\d+$/.test(v) ? Number(v) : null);
const txt = (v?: string) => (v ? v : null);

export default async function Busca({ searchParams }: { searchParams: Promise<Filtros> }) {
  const f = await searchParams;
  const { empresa } = await exigirEmpresa();
  const supabase = await supabaseServer();

  // Sem cidade na URL, a busca parte da cidade da empresa. "cidade=" vazio = Brasil todo.
  const cidade = f.cidade === undefined ? empresa.municipio_id : num(f.cidade);
  const raio = num(f.raio) ?? 30;
  const pagina = Math.max(1, num(f.pagina) ?? 1);
  // A home manda ?categoria=solda; o seletor de função manda funcao=cat:solda.
  const catBruta = f.funcao?.startsWith("cat:") ? f.funcao.slice(4) : f.funcao ? null : f.categoria;
  const categoria = catBruta && catBruta in CATEGORIAS ? catBruta : null;
  const funcaoId = categoria ? null : num(f.funcao);

  const [{ data: opcoesRaw }, { data: linhas, error }] = await Promise.all([
    supabase.rpc("opcoes_filtros"),
    supabase.rpc("buscar_candidatos", {
      p_funcao_id: funcaoId,
      p_categoria: categoria,
      p_municipio_id: cidade,
      p_raio_km: raio,
      p_experiencia_min: num(f.exp),
      p_habilidade: txt(f.hab),
      p_curso: txt(f.curso),
      p_escolaridade: txt(f.esc),
      p_turno: txt(f.turno),
      p_contrato: txt(f.contrato),
      p_disponibilidade: txt(f.disp),
      p_temperatura: txt(f.temp),
      p_limite: POR_PAGINA,
      p_offset: (pagina - 1) * POR_PAGINA,
    }),
  ]);
  const opcoes = (opcoesRaw ?? { cidades: [], funcoes: [], habilidades: [], cursos: [] }) as Opcoes;
  const candidatos = (linhas ?? []) as Candidato[];
  const total = Number(candidatos[0]?.total ?? 0);
  const paginas = Math.ceil(total / POR_PAGINA);

  // Registra a busca (aba Demanda do admin) só na primeira página.
  if (pagina === 1 && !error) {
    const filtros = Object.fromEntries(Object.entries({ ...f, cidade: cidade ?? "" }).filter(([k, v]) => v && k !== "pagina"));
    await supabase.rpc("registrar_busca", { p_filtros: filtros, p_total: total });
  }

  // A cidade da empresa pode não ter candidatos ainda; garante que ela aparece no seletor.
  const cidades = [...opcoes.cidades];
  if (cidade && !cidades.some((c) => c.id === cidade)) {
    const { data: m } = await supabase.from("municipios").select("id,nome,uf").eq("id", cidade).maybeSingle();
    if (m) cidades.unshift({ ...m, total: 0 });
  }

  const porCategoria = Object.keys(CATEGORIAS)
    .filter((k) => k !== "outros")
    .map((cat) => ({ cat, funcoes: opcoes.funcoes.filter((x) => x.categoria === cat) }))
    .filter((g) => g.funcoes.length);

  const maisAberto = Boolean(f.hab || f.curso || f.esc || f.turno || f.contrato || f.disp || f.temp);
  const linkPagina = (p: number) => {
    const q = new URLSearchParams(Object.entries({ ...f, pagina: String(p) }).filter(([, v]) => v !== undefined) as [string, string][]);
    if (f.cidade === undefined && cidade) q.set("cidade", String(cidade));
    return `/app/busca?${q}`;
  };
  const primeiroRelacionado = candidatos.findIndex((c) => c.relacionado);

  return (
    <>
      <CabecalhoPagina titulo="Buscar candidatos" texto="Pesquisar e comparar não gasta crédito." />
      <form className="filters" method="get">
        <div className="filters-main">
          <Campo id="funcao" rotulo="Função">
            <select className="select" id="f-funcao" name="funcao" defaultValue={f.funcao ?? (categoria ? `cat:${categoria}` : "")}>
              <option value="">Todas as funções</option>
              {porCategoria.map((g) => (
                <optgroup key={g.cat} label={CATEGORIAS[g.cat].nome}>
                  <option value={`cat:${g.cat}`}>Toda a área de {CATEGORIAS[g.cat].nome}</option>
                  {g.funcoes.map((x) => (
                    <option key={x.id} value={x.id}>{x.nome}</option>
                  ))}
                </optgroup>
              ))}
            </select>
          </Campo>
          <Campo id="cidade" rotulo="Cidade">
            <select className="select" id="f-cidade" name="cidade" defaultValue={cidade ? String(cidade) : ""}>
              <option value="">Brasil todo</option>
              {cidades.map((c) => (
                <option key={c.id} value={c.id}>{c.nome} / {c.uf}</option>
              ))}
            </select>
          </Campo>
          <Campo id="raio" rotulo="Raio">
            <select className="select" id="f-raio" name="raio" defaultValue={String(raio)}>
              {RAIOS.map((r) => (
                <option key={r} value={r}>{r} km</option>
              ))}
            </select>
          </Campo>
          <Campo id="exp" rotulo="Experiência">
            <select className="select" id="f-exp" name="exp" defaultValue={f.exp ?? ""}>
              <option value="">Qualquer</option>
              {EXPERIENCIAS.map((r) => (
                <option key={r} value={r}>{r}+ anos</option>
              ))}
            </select>
          </Campo>
          <button className="btn btn-primary">
            <Icon name="search" /> Buscar
          </button>
        </div>
        <details open={maisAberto}>
          <summary className="linklike small" style={{ display: "inline-flex", marginTop: 12, gap: 6 }}>
            <Icon name="sliders" className="" /> Mais filtros
          </summary>
          <div className="filters-more">
            <Seletor id="hab" rotulo="Máquina / técnica" valor={f.hab} opcoes={opcoes.habilidades} />
            <Seletor id="curso" rotulo="Curso / NR" valor={f.curso} opcoes={opcoes.cursos} />
            <Seletor id="esc" rotulo="Formação" valor={f.esc} opcoes={ESCOLARIDADES} />
            <Seletor id="turno" rotulo="Turno" valor={f.turno} opcoes={Object.keys(TURNOS)} rotulos={TURNOS} />
            <Seletor id="contrato" rotulo="Contrato" valor={f.contrato} opcoes={CONTRATOS} />
            <Seletor id="disp" rotulo="Disponibilidade até" valor={f.disp} opcoes={Object.keys(DISPONIBILIDADES)} rotulos={DISPONIBILIDADES} />
            <Seletor
              id="temp"
              rotulo="Temperatura"
              valor={f.temp}
              opcoes={Object.keys(TEMPERATURAS)}
              rotulos={Object.fromEntries(Object.entries(TEMPERATURAS).map(([k, v]) => [k, v.rotulo]))}
            />
          </div>
        </details>
      </form>

      {error ? (
        <div className="panel">
          <div className="empty">
            <b>Não deu para buscar agora</b>Tente de novo em instantes.
          </div>
        </div>
      ) : (
        <>
          <div className="result-bar">
            <span>
              <b>{total.toLocaleString("pt-BR")}</b> {total === 1 ? "candidato encontrado" : "candidatos encontrados"}
              {paginas > 1 && ` · página ${pagina} de ${paginas}`}
            </span>
            <Link className="linklike" href="/app/busca?cidade=">Limpar filtros</Link>
          </div>
          {candidatos.length ? (
            candidatos.map((c, i) => (
              <div key={c.id}>
                {i === primeiroRelacionado && (
                  <div className="small muted" style={{ margin: "16px 2px 8px", fontWeight: 600 }}>
                    Funções parecidas
                  </div>
                )}
                <LinhaCandidato c={c} empresa={empresa.nome} modelo={empresa.mensagem_whatsapp || MENSAGEM_PADRAO} />
              </div>
            ))
          ) : (
            <div className="panel">
              <div className="empty">
                <b>Nenhum candidato com esses filtros</b>Aumente o raio ou tire algum filtro.
                <br />
                <Link className="btn btn-secondary" href="/app/busca?cidade=">Limpar filtros</Link>
              </div>
            </div>
          )}
          {paginas > 1 && (
            <nav className="pager" aria-label="Páginas">
              {pagina > 1 && <Link className="btn btn-secondary btn-sm" href={linkPagina(pagina - 1)}>Anterior</Link>}
              <span className="muted">Página {pagina} de {paginas}</span>
              {pagina < paginas && <Link className="btn btn-secondary btn-sm" href={linkPagina(pagina + 1)}>Próxima</Link>}
            </nav>
          )}
        </>
      )}
    </>
  );
}

function Campo({ id, rotulo, children }: { id: string; rotulo: string; children: React.ReactNode }) {
  return (
    <div className="field">
      <label htmlFor={`f-${id}`}>{rotulo}</label>
      {children}
    </div>
  );
}

function Seletor({ id, rotulo, valor, opcoes, rotulos }: { id: string; rotulo: string; valor?: string; opcoes: string[]; rotulos?: Record<string, string> }) {
  return (
    <Campo id={id} rotulo={rotulo}>
      <select className="select" id={`f-${id}`} name={id} defaultValue={valor ?? ""}>
        <option value="">Qualquer</option>
        {opcoes.map((o) => (
          <option key={o} value={o}>{rotulos?.[o] ?? o}</option>
        ))}
      </select>
    </Campo>
  );
}

function LinhaCandidato({ c, empresa, modelo }: { c: Candidato; empresa: string; modelo: string }) {
  const t = TEMPERATURAS[c.temperatura] ?? TEMPERATURAS.frio;
  const cat = CATEGORIAS[c.categoria] ?? CATEGORIAS.outros;
  return (
    <div className="cand">
      <div className="cand-thumb">
        <img className="art photo" src={cat.foto} alt="" loading="lazy" />
      </div>
      <div className="cand-main">
        <div className="cand-title">
          {c.funcao}
          {c.ja_liberado && <span className="chip chip-ok">Liberado</span>}
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
      </div>
      <div className="cand-actions">
        <BotaoLiberar candidatoId={c.id} jaLiberado={c.ja_liberado} cargo={c.funcao} empresa={empresa} modelo={modelo} />
      </div>
    </div>
  );
}
