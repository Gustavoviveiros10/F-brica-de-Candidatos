import Link from "next/link";
import { exigirEmpresa } from "@/lib/conta";
import { CATEGORIAS, MENSAGEM_PADRAO } from "@/lib/formato";
import { supabaseServer } from "@/lib/supabase/server";
import type { Candidato } from "@/lib/tipos";
import type { PerguntaVaga } from "@/lib/cadastro-candidato";
import { perguntasFiltro, respostasDaUrl, um, type ParamsBusca } from "@/lib/filtros-busca";
import { comPrimeiroNome } from "@/lib/primeiros-nomes";
import { CabecalhoPagina } from "@/components/cabecalho-pagina";
import { CartaoCandidato } from "@/components/cartao-candidato";
import { FiltrosBusca } from "@/components/filtros-busca";

export const metadata = { title: "Buscar candidatos · Fábrica de Candidatos" };

const POR_PAGINA = 20;

type Opcoes = {
  cidades: { id: number; nome: string; uf: string; total: number }[];
  funcoes: { id: number; nome: string; categoria: string; familia: string | null; total: number }[];
  habilidades: string[];
  cursos: string[];
};

const num = (v?: string | string[]) => {
  const x = um(v);
  return x && /^\d+$/.test(x) ? Number(x) : null;
};
const txt = (v?: string | string[]) => um(v) ?? null;

export default async function Busca({ searchParams }: { searchParams: Promise<ParamsBusca> }) {
  const f = await searchParams;
  const { empresa } = await exigirEmpresa();
  const supabase = await supabaseServer();

  // Sem cidade na URL, a busca parte da cidade da empresa. "cidade=" vazio = Brasil todo.
  const cidade = f.cidade === undefined ? empresa.municipio_id : num(f.cidade);
  const raio = num(f.raio) ?? 30;
  const pagina = Math.max(1, num(f.pagina) ?? 1);
  // A home manda ?categoria=solda; o seletor de função manda funcao=cat:solda.
  const funcaoTxt = um(f.funcao);
  const catBruta = funcaoTxt?.startsWith("cat:") ? funcaoTxt.slice(4) : funcaoTxt ? null : um(f.categoria);
  const categoria = catBruta && catBruta in CATEGORIAS ? catBruta : null;
  const funcaoId = categoria ? null : num(f.funcao);
  // Perguntas da vaga (r_<codigo>). O banco só aplica as que são da família da função escolhida.
  const respostas = respostasDaUrl(f);

  const [{ data: opcoesRaw }, { data: perguntasRaw }, { data: linhas, error }] = await Promise.all([
    supabase.rpc("opcoes_filtros"),
    supabase.from("perguntas").select("codigo,familia,ordem,texto,dica,tipo,opcoes,opcao_nenhuma,so_funcoes,obrigatoria").eq("ativa", true),
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
      p_pretensao_max: num(f.pret),
      p_situacao: txt(f.sit),
      p_temperatura: txt(f.temp),
      p_ja_industria: txt(f.ind),
      p_segmento: txt(f.seg),
      p_cnh: txt(f.cnh),
      p_pcd: txt(f.pcd) === "sim",
      p_respostas: Object.keys(respostas).length ? respostas : null,
      p_limite: POR_PAGINA,
      p_offset: (pagina - 1) * POR_PAGINA,
    }),
  ]);
  const opcoes = (opcoesRaw ?? { cidades: [], funcoes: [], habilidades: [], cursos: [] }) as Opcoes;
  const candidatos = await comPrimeiroNome(supabase, (linhas ?? []) as Candidato[]);
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

  // Perguntas da vaga: só com uma função escolhida (cada família tem as suas).
  const escolhida = opcoes.funcoes.find((x) => x.id === funcaoId);
  const familia = escolhida?.familia ?? null;
  const perguntas = perguntasFiltro((perguntasRaw ?? []) as PerguntaVaga[], familia, funcaoId);
  const titulo = escolhida?.nome ?? null;

  const linkPagina = (p: number) => {
    const q = new URLSearchParams();
    for (const [k, v] of Object.entries({ ...f, pagina: String(p) })) for (const x of [v ?? []].flat()) q.append(k, x);
    if (f.cidade === undefined && cidade) q.set("cidade", String(cidade));
    return `/app/busca?${q}`;
  };
  const primeiroRelacionado = candidatos.findIndex((c) => c.relacionado);

  return (
    <>
      <CabecalhoPagina titulo="Buscar candidatos" texto="Pesquisar e comparar não gasta crédito." />
      <FiltrosBusca
        f={f}
        porCategoria={porCategoria}
        cidades={cidades}
        cidade={cidade}
        raio={raio}
        categoria={categoria}
        familia={familia}
        titulo={titulo}
        perguntas={perguntas}
        habilidades={opcoes.habilidades}
        cursos={opcoes.cursos}
      >
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
                <CartaoCandidato
                  c={c}
                  empresa={empresa.nome}
                  modelo={empresa.mensagem_whatsapp || MENSAGEM_PADRAO}
                  saldo={empresa.saldo_creditos}
                  cidadeBusca={cidades.find((x) => x.id === cidade)?.nome}
                />
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
      </FiltrosBusca>
    </>
  );
}

