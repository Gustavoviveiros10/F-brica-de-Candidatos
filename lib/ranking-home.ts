// Seção "Onde estão os profissionais agora" da home: só totais agregados, nunca dado pessoal.
export type ItemRanking = { nome: string; total: number };
export type RankingHome = { funcoes: ItemRanking[]; cidades: ItemRanking[] };

const ICONE_FUNCAO =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 21h18M5 21V10l5 3V10l5 3V6l4 2v13"/></svg>';
const ICONE_CIDADE =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/></svg>';

function escapar(texto: string) {
  return texto.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
}

function lista(itens: ItemRanking[], titulo: string, icone: string) {
  const maior = itens[0]?.total || 1;
  const linhas = itens
    .map(
      (item, i) =>
        `<li class="rk-row" data-reveal><span class="rk-pos${i === 0 ? " rk-top" : ""}">${i + 1}º</span>` +
        `<div class="rk-main"><div class="rk-line"><span class="rk-name">${escapar(item.nome)}</span>` +
        `<b class="rk-num" data-count="${item.total}">${item.total.toLocaleString("pt-BR")}</b></div>` +
        `<div class="rk-bar"><i style="--w:${((item.total / maior) * 100).toFixed(1)}%"></i></div></div></li>`,
    )
    .join("");
  return (
    `<div class="rk-card" data-reveal><div class="rk-card-head"><span class="rk-ico">${icone}</span><h3>${titulo}</h3></div>` +
    `<ol class="rk-list">${linhas}</ol></div>`
  );
}

export function secaoRanking(ranking: RankingHome | null): string {
  if (!ranking || (!ranking.funcoes.length && !ranking.cidades.length)) return "";
  const cards = [
    ranking.funcoes.length ? lista(ranking.funcoes, "Funções com mais candidatos", ICONE_FUNCAO) : "",
    ranking.cidades.length ? lista(ranking.cidades, "Cidades com mais candidatos", ICONE_CIDADE) : "",
  ].join("");
  return (
    `<section class="section" id="ranking"><div class="wrap">` +
    `<div class="section-head"><h2>Onde estão os profissionais agora</h2>` +
    `<p>Ranking de quem confirmou disponibilidade nos últimos meses. Os números mudam conforme novos candidatos chegam.</p></div>` +
    `<div class="rk-grid">${cards}</div></div></section>`
  );
}
