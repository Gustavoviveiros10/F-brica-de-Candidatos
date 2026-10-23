import Link from "next/link";
import { Marca } from "@/components/marca";
import { PixelMeta } from "@/components/pixel-meta";
import { Icon } from "@/lib/icons-component";
import { acharFuncao } from "@/lib/cadastro-candidato";

const FOTOS = ["foto-line", "foto-truck", "foto-forklift", "foto-maint", "foto-tool", "foto-weld"];
import { FormCandidato } from "./form";
import "./landing.css";

export const metadata = {
  title: "Cadastro grátis para quem trabalha na indústria · Fábrica de Candidatos",
  description: "Cadastre seu perfil grátis em 2 minutos e seja chamado no WhatsApp pelas indústrias da sua região.",
};

// ?v=a|b escolhe o layout (opções em avaliação). ?funcao=9 já abre com a função marcada (útil num anúncio por cargo).
export default async function SouProfissional({ searchParams }: { searchParams: Promise<{ v?: string; funcao?: string }> }) {
  const q = await searchParams;
  const v = q.v === "b" ? "b" : "a";
  const id = Number(q.funcao);
  const funcao = id && acharFuncao(id) ? id : undefined;

  return (
    <div className={`lp lp-${v}`}>
      <PixelMeta />
      <header className="lp-header">
        <div className="wrap lp-header-row">
          <Marca />
          <Link className="btn btn-ghost btn-sm" href="/">Sou empresa</Link>
        </div>
      </header>

      {v === "a" && (
        <section className="lp-hero-a">
          <div className="wrap lp-grid-a">
            <div className="lp-copy">
              <span className="lp-eyebrow">Para quem trabalha na indústria e na logística</span>
              <h1 className="display">As indústrias da sua região estão contratando. Deixe elas acharem você.</h1>
              <p>Cadastre seu perfil grátis. Quando uma empresa se interessar, ela te chama direto no WhatsApp.</p>
              <Beneficios />
            </div>
            <FormCandidato modo="passos" variante="a" funcaoInicial={funcao} />
          </div>
        </section>
      )}

      {v === "b" && (
        <>
          <section className="lp-hero-b">
            <div className="wrap">
              <span className="lp-eyebrow">Cadastro grátis</span>
              <h1 className="display">Empresas da indústria estão procurando gente como você.</h1>
              <p>Preencha uma vez e apareça para as empresas da sua região. Leva 2 minutos.</p>
              <div className="lp-fotos">
                {FOTOS.map((f) => <img key={f} src={`/img/${f}.jpg`} alt="" />)}
              </div>
              <Beneficios />
            </div>
          </section>
          <section className="wrap lp-corpo-b">
            <FormCandidato modo="pagina" variante="b" funcaoInicial={funcao} />
          </section>
        </>
      )}

      <section className="wrap lp-como">
        <h2 className="display">Como funciona</h2>
        <ol>
          <li><span>1</span><b>Você monta seu perfil</b>Função, cidade, experiência e quando pode começar.</li>
          <li><span>2</span><b>As empresas encontram você</b>Indústrias da região buscam por função e distância.</li>
          <li><span>3</span><b>Elas chamam no WhatsApp</b>Sem intermediário e sem pagar nada.</li>
        </ol>
      </section>

      <section className="wrap lp-faq">
        <h2 className="display">Dúvidas</h2>
        <details>
          <summary>Tenho que pagar alguma coisa?</summary>
          <p>Não. Para quem procura emprego é grátis, sempre. Quem paga são as empresas.</p>
        </details>
        <details>
          <summary>Quem vê meu telefone?</summary>
          <p>Só a empresa cadastrada que escolher te chamar. Nas buscas aparecem apenas sua função, cidade e experiência.</p>
        </details>
        <details>
          <summary>Já me cadastrei. Posso atualizar?</summary>
          <p>Pode. Preencha de novo com o mesmo WhatsApp e seu perfil é atualizado, sem duplicar.</p>
        </details>
        <details>
          <summary>Como saio da Fábrica?</summary>
          <p>Mande uma mensagem pedindo para sair e a gente tira seu perfil das buscas.</p>
        </details>
      </section>

      <footer className="lp-rodape">
        <div className="wrap">
          <span>Fábrica de Candidatos · Talentos sob demanda</span>
          <span>
            <Link href="/privacidade">Privacidade</Link> · <Link href="/termos">Termos</Link> · <Link href="/">Sou empresa</Link>
          </span>
        </div>
      </footer>
    </div>
  );
}

function Beneficios() {
  return (
    <ul className="lp-beneficios">
      <li><Icon name="check" /> Grátis, sempre</li>
      <li><Icon name="clock" /> Leva 2 minutos</li>
      <li><Icon name="lock" /> Seu telefone protegido</li>
    </ul>
  );
}
