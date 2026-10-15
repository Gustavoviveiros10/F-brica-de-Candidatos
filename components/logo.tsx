import Link from "next/link";

/**
 * Logo da Fábrica: o símbolo original (sem fundo) + o nome numa linha só.
 * Há duas versões do símbolo: colorida para fundo claro e clara para fundo escuro (o CSS escolhe).
 * Motion: entrada suave, um brilho que passa pelo símbolo de tempos em tempos e leve elevação no hover.
 */
export function Logo({ href = "/", className = "" }: { href?: string; className?: string }) {
  return (
    <Link className={`fc-logo ${className}`.trim()} href={href} aria-label="Fábrica de Candidatos, ir para o início">
      <span className="fc-mark" aria-hidden="true">
        <img className="fc-cor" src="/img/logo-simbolo.webp" alt="" width={122} height={150} />
        <img className="fc-clara" src="/img/logo-simbolo-claro.webp" alt="" width={122} height={150} />
      </span>
      <span className="fc-word">
        <b>
          Fábrica <span>de</span> Candidatos
        </b>
        <small>Talentos sob demanda</small>
      </span>
    </Link>
  );
}
