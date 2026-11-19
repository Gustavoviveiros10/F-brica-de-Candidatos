"use client";

import { useId, useState } from "react";
import { FAIXAS, MAX_CREDITOS, MIN_CREDITOS, VALIDADE_MESES, precoCreditos, proximaFaixa, reaisDeCentavos } from "@/lib/precos";

// Régua para escolher quantos créditos comprar. 1 crédito = 1 contato liberado.
// Na home o botão leva ao cadastro; no app ele envia o formulário de compra (acao).
export function ReguaCreditos({
  inicial = 25,
  acao,
  textoBotao,
  hrefBotao,
}: {
  inicial?: number;
  acao?: (form: FormData) => void | Promise<void>;
  textoBotao?: string;
  hrefBotao?: string;
}) {
  const [qtd, setQtd] = useState(inicial);
  const id = useId();
  const { quantidade, unitario, total } = precoCreditos(qtd);
  const base = FAIXAS[0].centavos;
  const economia = Math.round((1 - unitario / base) * 100);
  const prox = proximaFaixa(quantidade);
  const pct = ((quantidade - MIN_CREDITOS) / (MAX_CREDITOS - MIN_CREDITOS)) * 100;

  const botao = acao ? (
    <form action={acao} className="regua-acao">
      <input type="hidden" name="quantidade" value={quantidade} />
      <button className="btn btn-primary btn-lg btn-block" type="submit">
        {textoBotao ?? `Comprar ${quantidade} créditos`}
      </button>
      <p className="small muted">Pix, boleto ou cartão. Pagamento único, sem mensalidade.</p>
    </form>
  ) : (
    <div className="regua-acao">
      <a className="btn btn-primary btn-lg btn-block" href={hrefBotao ?? "/cadastro"}>
        {textoBotao ?? "Começar com 2 contatos grátis"}
      </a>
      <p className="small muted">Pague só quando precisar de mais. Sem mensalidade.</p>
    </div>
  );

  return (
    <div className="regua">
      <div className="regua-topo">
        <label htmlFor={id} className="regua-qtd">
          <b className="num">{quantidade}</b>
          <span>contatos</span>
        </label>
        <div className="regua-preco">
          <b className="num">{reaisDeCentavos(total)}</b>
          <span>
            {reaisDeCentavos(unitario)} por contato
            {economia > 0 && <em className="regua-eco"> · {economia}% mais barato</em>}
          </span>
        </div>
      </div>

      <input
        id={id}
        className="regua-range"
        type="range"
        min={MIN_CREDITOS}
        max={MAX_CREDITOS}
        step={1}
        value={quantidade}
        onChange={(e) => setQtd(Number(e.target.value))}
        style={{ ["--p" as string]: `${pct}%` }}
        aria-valuetext={`${quantidade} contatos, ${reaisDeCentavos(total)}`}
      />
      <div className="regua-faixas" role="group" aria-label="Faixas de preço">
        {FAIXAS.map((f, k) => {
          const ate = FAIXAS[k + 1]?.de;
          const on = quantidade >= f.de && (ate === undefined || quantidade < ate);
          return (
            <button key={f.de} type="button" className={on ? "on" : ""} aria-pressed={on} onClick={() => setQtd(f.de)}>
              <b>{ate ? `${f.de} a ${ate - 1}` : `${f.de}`}</b>
              <span>{reaisDeCentavos(f.centavos)} cada</span>
            </button>
          );
        })}
      </div>

      <p className="regua-dica">
        {prox
          ? `Com mais ${prox.faltam} ${prox.faltam === 1 ? "contato" : "contatos"}, cada um sai ${reaisDeCentavos(prox.centavos)}.`
          : "Você chegou no menor preço por contato."}{" "}
        Os créditos valem {VALIDADE_MESES} meses e cada compra renova o prazo.
      </p>
      {botao}
    </div>
  );
}
