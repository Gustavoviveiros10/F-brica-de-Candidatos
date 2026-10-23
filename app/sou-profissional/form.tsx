"use client";
import Link from "next/link";
import { useEffect, useRef, useState, useTransition } from "react";
import { Icon } from "@/lib/icons-component";
import { supabaseBrowser } from "@/lib/supabase/client";
import { eventoMeta } from "@/components/pixel-meta";
import {
  AREAS,
  CNHS,
  CONTRATOS,
  DISPONIBILIDADES,
  ESCOLARIDADES,
  EXPERIENCIAS,
  FUNCOES,
  FUNCAO_OUTRA,
  JA_INDUSTRIA,
  PCD,
  POPULARES,
  PRETENSOES,
  SEGMENTOS,
  SITUACOES,
  TODAS_FUNCOES,
  TURNOS,
  acharFuncao,
  emailValido,
  mascaraWhatsapp,
  normalizarWhatsapp,
  perguntasDa,
  respondida,
  semAcento,
  type DadosCadastro,
  type PerguntaVaga,
  type Resposta,
} from "@/lib/cadastro-candidato";
import { enviarCadastro, type Captacao } from "./actions";

type Cidade = { id: number; nome: string; uf: string };
type Rascunho = Omit<DadosCadastro, "cnh"> & { cnh: string | null };

const VAZIO: Rascunho = {
  funcao_id: 0,
  funcao_informada: "",
  municipio_id: 0,
  bairro: "",
  experiencia_faixa: "",
  respostas: {},
  ja_industria: "",
  segmentos: [],
  escolaridade_nivel: "",
  cnh: null,
  disponibilidade: "",
  situacao: "",
  turnos: [],
  contratos: [],
  pretensao_salarial: 0,
  pcd: "",
  nome: "",
  whatsapp: "",
  email: "",
  consentimento: false,
};

const ETAPAS = ["Sua função", "Sua experiência", "Sobre você", "Quando pode começar", "Seu contato"];
const CAMPOS_UTM = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "fbclid"] as const;

// Motorista responde a categoria da CNH nas perguntas da vaga.
const ehMotorista = (familia?: string) => familia === "motoristas";

// O que falta em cada etapa (null = pode seguir).
function falta(etapa: number, d: Rascunho, perguntas: PerguntaVaga[], familia?: string): string | null {
  if (etapa === 0 && !d.funcao_id) return "Escolha sua função.";
  if (etapa === 0 && d.funcao_id === FUNCAO_OUTRA && d.funcao_informada.trim().length < 3) return "Escreva qual é a sua função.";
  if (etapa === 1) {
    if (!d.experiencia_faixa) return "Diga quanto tempo de experiência você tem.";
    const p = perguntas.find((q) => q.obrigatoria && !respondida(q, d.respostas[q.codigo]));
    if (p) return `Responda: ${p.texto}`;
    if (!d.ja_industria) return "Diga se já trabalhou em indústria.";
  }
  if (etapa === 2) {
    if (!d.municipio_id) return "Escolha sua cidade na lista.";
    if (!d.escolaridade_nivel) return "Escolha até onde você estudou.";
    if (!ehMotorista(familia) && d.cnh === null) return "Diga se você tem CNH.";
  }
  if (etapa === 3) {
    if (!d.disponibilidade) return "Diga quando você pode começar.";
    if (!d.situacao) return "Diga se está trabalhando agora.";
    if (!d.turnos.length) return "Marque pelo menos um turno.";
    if (!d.contratos.length) return "Marque pelo menos um tipo de contrato.";
  }
  if (etapa === 4) {
    if (d.nome.trim().split(/\s+/).length < 2) return "Escreva seu nome e sobrenome.";
    if (!normalizarWhatsapp(d.whatsapp)) return "Confira o WhatsApp: DDD + número de celular.";
    if (!emailValido(d.email.trim())) return "Confira o e-mail ou deixe em branco.";
    if (!d.consentimento) return "Marque que concorda em compartilhar seu perfil.";
  }
  return null;
}

export function FormCandidato({ funcaoInicial, perguntas: todas, familias }: {
  funcaoInicial?: number;
  perguntas: PerguntaVaga[];
  familias: Record<number, string>;
}) {
  const [d, setD] = useState<Rascunho>(VAZIO);
  const [etapa, setEtapa] = useState(0);
  const [erro, setErro] = useState<string | null>(null);
  const [feito, setFeito] = useState<{ nome: string; funcao: string } | null>(null);
  const [enviando, iniciar] = useTransition();
  const armadilha = useRef<HTMLInputElement>(null);
  const topo = useRef<HTMLDivElement>(null);
  const captacao = useRef<Captacao>({ pagina: "sou-profissional" });

  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    for (const k of CAMPOS_UTM) {
      const v = q.get(k);
      if (v) captacao.current[k] = v;
    }
  }, []);

  useEffect(() => {
    if (funcaoInicial) setD((x) => ({ ...x, funcao_id: funcaoInicial }));
  }, [funcaoInicial]);

  const mudar = <K extends keyof Rascunho>(k: K, v: Rascunho[K]) => {
    setErro(null);
    setD((x) => ({ ...x, [k]: v }));
  };
  const alternar = (k: "segmentos" | "turnos" | "contratos", v: string) =>
    mudar(k, d[k].includes(v) ? d[k].filter((x) => x !== v) : [...d[k], v]);
  const responder = (codigo: string, r: Resposta) => mudar("respostas", { ...d.respostas, [codigo]: r });

  const funcao = d.funcao_id ? acharFuncao(d.funcao_id) : null;
  const familia = familias[d.funcao_id];
  const perguntas = perguntasDa(d.funcao_id, familia, todas);
  const rolarTopo = () => topo.current?.scrollIntoView({ behavior: "smooth", block: "start" });

  function avancar() {
    const f = falta(etapa, d, perguntas, familia);
    if (f) return setErro(f);
    if (etapa === 0) eventoMeta("ViewContent", { content_category: funcao?.nome });
    setEtapa(etapa + 1);
    rolarTopo();
  }

  function enviar() {
    for (let i = 0; i < ETAPAS.length; i++) {
      const f = falta(i, d, perguntas, familia);
      if (f) {
        setErro(f);
        setEtapa(i);
        return;
      }
    }
    // Só vão as respostas das perguntas desta função (a pessoa pode ter trocado de função no meio).
    const respostas = Object.fromEntries(perguntas.filter((p) => d.respostas[p.codigo]).map((p) => [p.codigo, d.respostas[p.codigo]]));
    const dados: DadosCadastro = { ...d, respostas, cnh: ehMotorista(familia) ? "" : (d.cnh ?? "") };
    iniciar(async () => {
      const r = await enviarCadastro(dados, captacao.current, armadilha.current?.value ?? "");
      if (!r.ok) return setErro(r.erro);
      eventoMeta("Lead", { content_category: r.funcao || funcao?.nome });
      setFeito({ nome: d.nome.trim().split(/\s+/)[0], funcao: r.funcao || funcao?.nome || "" });
      rolarTopo();
    });
  }

  if (feito) return <Pronto ref={topo} nome={feito.nome} funcao={feito.funcao} />;

  const nomeFuncao = d.funcao_id === FUNCAO_OUTRA ? d.funcao_informada.trim() : funcao?.nome;
  const secoes = [
    <SecaoFuncao key="f" d={d} mudar={mudar} />,
    <SecaoExperiencia key="e" d={d} mudar={mudar} alternar={alternar} responder={responder} perguntas={perguntas} nomeFuncao={nomeFuncao} />,
    <SecaoSobre key="s" d={d} mudar={mudar} motorista={ehMotorista(familia)} />,
    <SecaoDisponibilidade key="d" d={d} mudar={mudar} alternar={alternar} />,
    <SecaoContato key="ct" d={d} mudar={mudar} />,
  ];

  const armadilhaInput = (
    <input ref={armadilha} name="site" tabIndex={-1} autoComplete="off" aria-hidden="true" className="lp-armadilha" />
  );

  return (
    <div ref={topo} className="lp-form">
      <div className="lp-progresso" aria-label={`Etapa ${etapa + 1} de ${ETAPAS.length}`}>
        <div className="lp-progresso-txt">
          <b>{ETAPAS[etapa]}</b>
          <span>{etapa + 1} de {ETAPAS.length}</span>
        </div>
        <div className="lp-barra"><span style={{ width: `${((etapa + 1) / ETAPAS.length) * 100}%` }} /></div>
      </div>
      {secoes[etapa]}
      {armadilhaInput}
      {erro && <p className="lp-erro" role="alert">{erro}</p>}
      <div className="lp-nav">
        {etapa > 0 && (
          <button type="button" className="btn btn-ghost" onClick={() => { setErro(null); setEtapa(etapa - 1); }}>
            Voltar
          </button>
        )}
        {etapa < ETAPAS.length - 1 ? (
          <button type="button" className="btn btn-primary btn-lg" onClick={avancar}>
            Continuar <Icon name="arrow" />
          </button>
        ) : (
          <button type="button" className="btn btn-primary btn-lg" onClick={enviar} disabled={enviando}>
            {enviando ? "Enviando..." : "Enviar meu cadastro"}
          </button>
        )}
      </div>
    </div>
  );
}

type Props = { d: Rascunho; mudar: <K extends keyof Rascunho>(k: K, v: Rascunho[K]) => void };

function Opcoes<T extends string | number>({ opcoes, valor, onChange, multi, colunas }: {
  opcoes: { valor: T; rotulo: string }[];
  valor: T | T[] | null;
  onChange: (v: T) => void;
  multi?: boolean;
  colunas?: number;
}) {
  const marcado = (v: T) => (Array.isArray(valor) ? valor.includes(v) : valor === v);
  return (
    <div className="lp-ops" role={multi ? "group" : "radiogroup"} style={colunas ? { gridTemplateColumns: `repeat(${colunas}, minmax(0, 1fr))` } : undefined}>
      {opcoes.map((o) => (
        <button
          key={String(o.valor)}
          type="button"
          role={multi ? "checkbox" : "radio"}
          aria-checked={marcado(o.valor)}
          className="lp-op"
          onClick={() => onChange(o.valor)}
        >
          {multi && <span className="lp-caixa">{marcado(o.valor) && <Icon name="check" />}</span>}
          {/* Deixa quebrar a linha depois da barra ("Plástico/borracha") em vez de no meio da palavra. */}
          {o.rotulo.replaceAll("/", "/\u200b")}
        </button>
      ))}
    </div>
  );
}

function Pergunta({ titulo, dica, children }: { titulo: string; dica?: string | null; children: React.ReactNode }) {
  return (
    <div className="lp-pergunta">
      <div className="lp-pergunta-titulo">{titulo}</div>
      {dica && <div className="lp-dica">{dica}</div>}
      {children}
    </div>
  );
}

function SecaoFuncao({ d, mudar }: Props) {
  const [texto, setTexto] = useState("");
  const [todas, setTodas] = useState(false);
  const escolhida = d.funcao_id ? acharFuncao(d.funcao_id) : null;
  const termo = semAcento(texto.trim());
  const achadas = termo.length >= 2 ? TODAS_FUNCOES.filter((f) => semAcento(f.nome).includes(termo)).slice(0, 8) : [];
  const escolher = (id: number) => {
    mudar("funcao_id", id);
    setTexto("");
  };

  if (escolhida && d.funcao_id !== FUNCAO_OUTRA) {
    return (
      <Pergunta titulo="Sua função">
        <div className="lp-cidade-ok">
          <Icon name="briefcase" />
          <b>{escolhida.nome}</b>
          <button type="button" className="linklike" onClick={() => mudar("funcao_id", 0)}>Trocar</button>
        </div>
      </Pergunta>
    );
  }

  if (d.funcao_id === FUNCAO_OUTRA) {
    return (
      <Pergunta titulo="Qual é a sua função?" dica="Escreva do jeito que aparece na carteira ou nas vagas.">
        <input
          className="input lp-input"
          value={d.funcao_informada}
          maxLength={80}
          onChange={(e) => mudar("funcao_informada", e.target.value)}
          placeholder="Ex.: Operador de Rosqueadeira"
          autoFocus
        />
        <button type="button" className="linklike lp-link" onClick={() => mudar("funcao_id", 0)}>Voltar para a lista</button>
      </Pergunta>
    );
  }

  return (
    <>
      <Pergunta titulo="Qual é a sua função?" dica="Digite e escolha na lista. Se trabalha em mais de uma, escolha a que mais quer.">
        <input
          className="input lp-input"
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          placeholder="Ex.: soldador, empilhadeira, CNC"
          aria-label="Buscar função"
        />
        {achadas.length > 0 && (
          <ul className="lp-sugestoes">
            {achadas.map((f) => (
              <li key={f.id}>
                <button type="button" onClick={() => escolher(f.id)}>{f.nome}</button>
              </li>
            ))}
          </ul>
        )}
        {termo.length >= 2 && achadas.length === 0 && <div className="lp-dica">Não achamos essa função. Tente outro nome ou use o link abaixo.</div>}
      </Pergunta>
      {termo.length < 2 && (
        <Pergunta titulo="Mais procuradas pelas fábricas do ABC">
          <Opcoes opcoes={POPULARES.map((id) => ({ valor: id, rotulo: acharFuncao(id)?.nome ?? "" }))} valor={null} onChange={escolher} />
        </Pergunta>
      )}
      <div className="lp-links">
        <button type="button" className="linklike" onClick={() => setTodas(!todas)}>
          {todas ? "Esconder a lista completa" : `Ver todas as ${TODAS_FUNCOES.length} funções`}
        </button>
        <button type="button" className="linklike" onClick={() => mudar("funcao_id", FUNCAO_OUTRA)}>Não achei minha função</button>
      </div>
      {todas && AREAS.map((a) => (
        <Pergunta key={a.id} titulo={a.nome}>
          <Opcoes opcoes={FUNCOES[a.id].map((f) => ({ valor: f.id, rotulo: f.nome }))} valor={null} onChange={escolher} />
        </Pergunta>
      ))}
    </>
  );
}

function SecaoCidade({ d, mudar }: Props) {
  const [texto, setTexto] = useState("");
  const [escolhida, setEscolhida] = useState<Cidade | null>(null);
  const [lista, setLista] = useState<Cidade[]>([]);
  const [buscando, setBuscando] = useState(false);

  useEffect(() => {
    if (escolhida || texto.trim().length < 2) return setLista([]);
    setBuscando(true);
    const t = setTimeout(async () => {
      const { data } = await supabaseBrowser().rpc("buscar_municipios", { p_q: texto });
      setLista((data ?? []) as Cidade[]);
      setBuscando(false);
    }, 250);
    return () => clearTimeout(t);
  }, [texto, escolhida]);

  return (
    <>
      <Pergunta titulo="Em qual cidade você mora?" dica="As empresas procuram gente perto. Comece a digitar e escolha na lista.">
        {escolhida && d.municipio_id ? (
          <div className="lp-cidade-ok">
            <Icon name="pin" />
            <b>{escolhida.nome} / {escolhida.uf}</b>
            <button type="button" className="linklike" onClick={() => { setEscolhida(null); setTexto(""); mudar("municipio_id", 0); }}>
              Trocar
            </button>
          </div>
        ) : (
          <div className="lp-cidade">
            <input
              className="input lp-input"
              placeholder="Ex.: Santo André"
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              autoComplete="address-level2"
              aria-label="Cidade"
            />
            {lista.length > 0 && (
              <ul className="lp-sugestoes" role="listbox">
                {lista.map((c) => (
                  <li key={c.id}>
                    <button type="button" onClick={() => { setEscolhida(c); mudar("municipio_id", c.id); }}>
                      {c.nome} <span>/ {c.uf}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
            {!buscando && texto.trim().length >= 2 && lista.length === 0 && (
              <div className="lp-dica">Nenhuma cidade com esse nome. Confira a escrita.</div>
            )}
          </div>
        )}
      </Pergunta>
      <Pergunta titulo="Bairro (opcional)">
        <input className="input lp-input" value={d.bairro} maxLength={80} onChange={(e) => mudar("bairro", e.target.value)} placeholder="Ex.: Centro" />
      </Pergunta>
    </>
  );
}

function PerguntaDaVaga({ p, r, responder }: { p: PerguntaVaga; r: Resposta | undefined; responder: (codigo: string, r: Resposta) => void }) {
  const opcoes = p.opcoes.map((o) => ({ valor: o, rotulo: o }));
  if (p.tipo === "uma") {
    return (
      <Pergunta titulo={p.texto} dica={p.dica}>
        <Opcoes opcoes={opcoes} valor={typeof r === "string" ? r : null} onChange={(v) => responder(p.codigo, v)} />
      </Pergunta>
    );
  }
  const marcadas = Array.isArray(r) ? r : [];
  const alternar = (v: string) => {
    if (v === p.opcao_nenhuma) return responder(p.codigo, marcadas.includes(v) ? [] : [v]);
    const sem = marcadas.filter((x) => x !== p.opcao_nenhuma);
    responder(p.codigo, sem.includes(v) ? sem.filter((x) => x !== v) : [...sem, v]);
  };
  return (
    <Pergunta titulo={p.texto} dica={p.dica ?? "Pode marcar mais de um."}>
      <Opcoes multi opcoes={opcoes} valor={marcadas} onChange={alternar} />
    </Pergunta>
  );
}

function SecaoExperiencia({ d, mudar, alternar, responder, perguntas, nomeFuncao }: Props & {
  alternar: (k: "segmentos", v: string) => void;
  responder: (codigo: string, r: Resposta) => void;
  perguntas: PerguntaVaga[];
  nomeFuncao?: string;
}) {
  return (
    <>
      <Pergunta titulo={nomeFuncao ? `Quanto tempo de experiência como ${nomeFuncao}?` : "Quanto tempo de experiência na função?"} dica="Contando com e sem carteira assinada.">
        <Opcoes opcoes={EXPERIENCIAS} valor={d.experiencia_faixa} onChange={(v) => mudar("experiencia_faixa", v)} />
      </Pergunta>
      {perguntas.map((p) => (
        <PerguntaDaVaga key={p.codigo} p={p} r={d.respostas[p.codigo]} responder={responder} />
      ))}
      <Pergunta titulo="Já trabalhou em indústria?">
        <Opcoes opcoes={JA_INDUSTRIA} valor={d.ja_industria} onChange={(v) => mudar("ja_industria", v)} />
      </Pergunta>
      <Pergunta titulo="Em que tipo de empresa já trabalhou?" dica="Opcional. Pode marcar mais de um.">
        <Opcoes multi opcoes={SEGMENTOS} valor={d.segmentos} onChange={(v) => alternar("segmentos", v)} />
      </Pergunta>
    </>
  );
}

function SecaoSobre({ d, mudar, motorista }: Props & { motorista: boolean }) {
  return (
    <>
      <SecaoCidade d={d} mudar={mudar} />
      <Pergunta titulo="Até onde você estudou?">
        <Opcoes opcoes={ESCOLARIDADES} valor={d.escolaridade_nivel} onChange={(v) => mudar("escolaridade_nivel", v)} />
      </Pergunta>
      {!motorista && (
        <Pergunta titulo="Tem CNH?">
          <Opcoes colunas={7} opcoes={CNHS} valor={d.cnh} onChange={(v) => mudar("cnh", v)} />
        </Pergunta>
      )}
    </>
  );
}

function SecaoDisponibilidade({ d, mudar, alternar }: Props & { alternar: (k: "turnos" | "contratos", v: string) => void }) {
  return (
    <>
      <Pergunta titulo="Quando você pode começar?">
        <Opcoes opcoes={DISPONIBILIDADES} valor={d.disponibilidade} onChange={(v) => mudar("disponibilidade", v)} />
      </Pergunta>
      <Pergunta titulo="Está trabalhando agora?">
        <Opcoes opcoes={SITUACOES} valor={d.situacao} onChange={(v) => mudar("situacao", v)} />
      </Pergunta>
      <Pergunta titulo="Quais turnos você aceita?" dica="Marque todos que dá pra você.">
        <Opcoes multi opcoes={TURNOS} valor={d.turnos} onChange={(v) => alternar("turnos", v)} />
      </Pergunta>
      <Pergunta titulo="Aceita trabalhar como?" dica="Pode marcar mais de um.">
        <Opcoes multi opcoes={CONTRATOS} valor={d.contratos} onChange={(v) => alternar("contratos", v)} />
      </Pergunta>
      <Pergunta titulo="Quanto você quer ganhar por mês?" dica="Salário bruto, sem benefícios.">
        <select className="select lp-input" value={d.pretensao_salarial} onChange={(e) => mudar("pretensao_salarial", Number(e.target.value))} aria-label="Pretensão salarial">
          {PRETENSOES.map((p) => (
            <option key={p.valor} value={p.valor}>{p.rotulo}</option>
          ))}
        </select>
      </Pergunta>
    </>
  );
}

function SecaoContato({ d, mudar }: Props) {
  return (
    <>
      <Pergunta titulo="Seu nome completo">
        <input className="input lp-input" value={d.nome} maxLength={120} autoComplete="name" onChange={(e) => mudar("nome", e.target.value)} placeholder="Ex.: João da Silva" />
      </Pergunta>
      <Pergunta titulo="Seu WhatsApp" dica="É por aqui que a empresa vai te chamar.">
        <input
          className="input lp-input"
          inputMode="numeric"
          autoComplete="tel-national"
          value={mascaraWhatsapp(d.whatsapp)}
          onChange={(e) => mudar("whatsapp", e.target.value.replace(/\D/g, "").slice(0, 11))}
          placeholder="(11) 90000-0000"
        />
      </Pergunta>
      <Pergunta titulo="E-mail (opcional)">
        <input className="input lp-input" type="email" inputMode="email" autoComplete="email" value={d.email} onChange={(e) => mudar("email", e.target.value)} placeholder="seuemail@exemplo.com" />
      </Pergunta>
      <Pergunta titulo="Você é PcD (pessoa com deficiência)?" dica="Opcional. Muitas fábricas têm vagas reservadas para PcD.">
        <Opcoes opcoes={PCD} valor={d.pcd} onChange={(v) => mudar("pcd", d.pcd === v ? "" : v)} />
      </Pergunta>
      <div className="lp-protecao">
        <Icon name="lock" />
        <span>Seu telefone fica guardado. A empresa vê só sua experiência e cidade, e o contato só é liberado para empresa cadastrada que quiser te chamar.</span>
      </div>
      <label className="check lp-consentimento">
        <input type="checkbox" checked={d.consentimento} onChange={(e) => mudar("consentimento", e.target.checked)} />
        <span>
          Concordo que a Fábrica de Candidatos guarde meus dados e mostre meu perfil para empresas que buscam profissionais, conforme a{" "}
          <Link className="linklike" href="/privacidade" target="_blank">política de privacidade</Link>. Posso pedir para sair a qualquer momento.
        </span>
      </label>
    </>
  );
}

function Pronto({ nome, funcao, ref }: { nome: string; funcao: string; ref: React.Ref<HTMLDivElement> }) {
  const compartilhar = `https://wa.me/?text=${encodeURIComponent(
    "Achei um site onde as indústrias procuram gente pra trabalhar. O cadastro é grátis: https://www.fabricadecandidatos.com.br/sou-profissional",
  )}`;
  return (
    <div ref={ref} className="lp-form lp-pronto">
      <div className="lp-pronto-icone"><Icon name="check" /></div>
      <h2 className="display">Pronto{nome ? `, ${nome}` : ""}! Seu perfil está na Fábrica.</h2>
      {funcao && <p className="muted">Você entrou como <b>{funcao}</b>.</p>}
      <ol className="lp-proximos">
        <li><b>As empresas da sua região já podem te encontrar.</b> Elas veem sua experiência, não seu telefone.</li>
        <li><b>Quando uma empresa se interessar, ela te chama no WhatsApp.</b> Fique de olho nas mensagens.</li>
        <li><b>De tempos em tempos a gente pergunta se você ainda está disponível.</b> Quem responde aparece primeiro.</li>
      </ol>
      <a className="btn btn-wa btn-lg btn-block" href={compartilhar} target="_blank" rel="noreferrer">
        <Icon name="wa" /> Mandar para um amigo
      </a>
    </div>
  );
}
