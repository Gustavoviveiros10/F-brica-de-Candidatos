import { CATEGORIAS, TEMPERATURAS, TURNOS } from "@/lib/formato";
import { DISPONIBILIDADES, type PerguntaVaga } from "@/lib/cadastro-candidato";
import {
  CNHS_FILTRO, CONTRATOS_FILTRO, FILTROS_EXTRAS, ESCOLARIDADES_FILTRO, EXPERIENCIAS_FILTRO, INDUSTRIA_FILTRO, PREFIXO,
  PRETENSOES_FILTRO, SEGMENTOS_FILTRO, SITUACOES_FILTRO, um, varios, type ParamsBusca,
} from "@/lib/filtros-busca";
import { Icon } from "@/lib/icons-component";
import { FormBusca } from "@/components/form-busca";

type Op = { valor: string; rotulo: string };

const RAIOS = [10, 20, 30, 50, 80, 150];
const TURNOS_FILTRO = Object.entries(TURNOS).filter(([k]) => k !== "qualquer").map(([valor, rotulo]) => ({ valor, rotulo }));
const TEMP_FILTRO = Object.entries(TEMPERATURAS).map(([valor, t]) => ({ valor, rotulo: t.rotulo }));
const lista = (xs: string[]): Op[] => xs.map((x) => ({ valor: x, rotulo: x }));

type Props = {
  f: ParamsBusca;
  porCategoria: { cat: string; funcoes: { id: number; nome: string }[] }[];
  cidades: { id: number; nome: string; uf: string }[];
  cidade: number | null;
  raio: number;
  categoria: string | null;
  familia: string | null;
  titulo: string | null;
  perguntas: PerguntaVaga[];
  habilidades: string[];
  cursos: string[];
  children: React.ReactNode;
};

export function FiltrosBusca(p: Props) {
  const { f, perguntas } = p;
  const comunsAtivos = ["hab", "curso", "esc", "turno", "contrato", "disp", "temp", "ind", "seg", "sit", "cnh", "pret", "pcd"].filter((k) => um(f[k])).length;

  const funcao = (
    <Campo id="funcao" rotulo="Função">
      <select className="select" id="f-funcao" name="funcao" defaultValue={um(f.funcao) ?? (p.categoria ? `cat:${p.categoria}` : "")}>
        <option value="">Todas as funções</option>
        {p.porCategoria.map((g) => (
          <optgroup key={g.cat} label={CATEGORIAS[g.cat].nome}>
            <option value={`cat:${g.cat}`}>Toda a área de {CATEGORIAS[g.cat].nome}</option>
            {g.funcoes.map((x) => (
              <option key={x.id} value={x.id}>{x.nome}</option>
            ))}
          </optgroup>
        ))}
      </select>
    </Campo>
  );
  const cidade = (
    <Campo id="cidade" rotulo="Cidade">
      <select className="select" id="f-cidade" name="cidade" defaultValue={p.cidade ? String(p.cidade) : ""}>
        <option value="">Brasil todo</option>
        {p.cidades.map((c) => (
          <option key={c.id} value={c.id}>{c.nome} / {c.uf}</option>
        ))}
      </select>
    </Campo>
  );
  const raio = <Seletor id="raio" rotulo="Raio" valor={String(p.raio)} opcoes={RAIOS.map((r) => ({ valor: String(r), rotulo: `${r} km` }))} semQualquer />;
  const experiencia = <Seletor id="exp" rotulo="Experiência na função" valor={um(f.exp)} opcoes={EXPERIENCIAS_FILTRO} />;
  const buscar = (
    <button className="btn btn-primary">
      <Icon name="search" /> Buscar
    </button>
  );

  // Bloco comum do formulário (vale para qualquer função).
  const comuns = (
    <>
      {!perguntas.length && (
        <>
          <Seletor id="hab" rotulo="Máquina / técnica" valor={um(f.hab)} opcoes={lista(p.habilidades)} />
          <Seletor id="curso" rotulo="Curso / NR" valor={um(f.curso)} opcoes={lista(p.cursos)} />
        </>
      )}
      <Seletor id="ind" rotulo="Já trabalhou em indústria?" valor={um(f.ind)} opcoes={INDUSTRIA_FILTRO} />
      <Seletor id="seg" rotulo="Tipo de empresa em que trabalhou" valor={um(f.seg)} opcoes={SEGMENTOS_FILTRO} />
      <Seletor id="esc" rotulo="Até onde estudou" valor={um(f.esc)} opcoes={ESCOLARIDADES_FILTRO} />
      <Seletor id="disp" rotulo="Pode começar" valor={um(f.disp)} opcoes={DISPONIBILIDADES} />
      <Seletor id="sit" rotulo="Está trabalhando agora?" valor={um(f.sit)} opcoes={SITUACOES_FILTRO} />
      <Seletor id="turno" rotulo="Aceita o turno" valor={um(f.turno)} opcoes={TURNOS_FILTRO} />
      <Seletor id="contrato" rotulo="Aceita trabalhar como" valor={um(f.contrato)} opcoes={CONTRATOS_FILTRO} />
      {p.familia !== "motoristas" && <Seletor id="cnh" rotulo="CNH" valor={um(f.cnh)} opcoes={CNHS_FILTRO} />}
      <Seletor id="pret" rotulo="Pretensão salarial" valor={um(f.pret)} opcoes={PRETENSOES_FILTRO} />
      <Seletor id="temp" rotulo="Temperatura" valor={um(f.temp)} opcoes={TEMP_FILTRO} />
      <label className="check fb-pcd">
        <input type="checkbox" name="pcd" value="sim" defaultChecked={um(f.pcd) === "sim"} /> Só candidatos PcD
      </label>
    </>
  );

  const cabecalhoVaga = (
    <div className="fb-vaga-head">
      <b>Perguntas da vaga{p.titulo ? ` · ${p.titulo}` : ""}</b>
      <span className="small muted">As mesmas perguntas que o candidato respondeu no cadastro.</span>
    </div>
  );

  return (
    <>
      <FormBusca className="filters">
        <div className="filters-main">
          {funcao}
          {cidade}
          {raio}
          {experiencia}
          {buscar}
        </div>
        {FILTROS_EXTRAS && (
          <>
        {!um(f.funcao) || um(f.funcao)?.startsWith("cat:") ? (
          <p className="small muted fb-dica">Escolha uma função para filtrar pelas perguntas da vaga (máquinas, cursos, CNH...).</p>
        ) : null}
        {perguntas.length > 0 && (
          <div className="fb-vaga">
            {cabecalhoVaga}
              <div className="fb-b-grade">
                {perguntas.map((q) => (
                  <fieldset key={q.codigo} className="fb-b-pergunta">
                    <legend>
                      {q.texto} <span className="muted">{q.tipo === "varias" ? "· precisa ter todos os marcados" : "· aceita qualquer marcado"}</span>
                    </legend>
                    <div className="fb-b-ops">
                      {q.opcoes.map((o) => (
                        <label key={o} className="fb-op">
                          <input type="checkbox" name={PREFIXO + q.codigo} value={o} defaultChecked={varios(f[PREFIXO + q.codigo]).includes(o)} />
                          <span>{o}</span>
                        </label>
                      ))}
                    </div>
                  </fieldset>
                ))}
              </div>
          </div>
        )}
        <details open={comunsAtivos > 0}>
          <summary className="linklike small" style={{ display: "inline-flex", marginTop: 12, gap: 6 }}>
            <Icon name="sliders" className="" /> {perguntas.length ? "Filtros gerais (todas as vagas)" : "Mais filtros"}
            {comunsAtivos > 0 && ` (${comunsAtivos})`}
          </summary>
          <div className="filters-more">{comuns}</div>
        </details>
          </>
        )}
      </FormBusca>
      {p.children}
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

function Seletor({ id, rotulo, valor, opcoes, semQualquer }: { id: string; rotulo: string; valor?: string; opcoes: Op[]; semQualquer?: boolean }) {
  return (
    <Campo id={id} rotulo={rotulo}>
      <select className="select" id={`f-${id}`} name={id} defaultValue={valor ?? ""}>
        {!semQualquer && <option value="">Qualquer</option>}
        {opcoes.map((o) => (
          <option key={o.valor} value={o.valor}>{o.rotulo}</option>
        ))}
      </select>
    </Campo>
  );
}
