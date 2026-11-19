// Tabela de preço dos créditos (opção A "Degraus", 2026-11-19).
// É a mesma da tabela public.faixas_preco no Supabase: o servidor de pagamento calcula pelo banco
// (função preco_creditos) e confere o valor pago. Esta cópia serve só pra mostrar o preço na tela.
export const MIN_CREDITOS = 5;
export const MAX_CREDITOS = 100;
export const VALIDADE_MESES = 12;

export const FAIXAS = [
  { de: 5, centavos: 1400 },
  { de: 10, centavos: 1100 },
  { de: 25, centavos: 900 },
  { de: 50, centavos: 790 },
  { de: 100, centavos: 690 },
] as const;

export function faixaDe(qtd: number) {
  let f: (typeof FAIXAS)[number] = FAIXAS[0];
  for (const x of FAIXAS) if (qtd >= x.de) f = x;
  return f;
}

export function precoCreditos(qtd: number) {
  const q = Math.min(MAX_CREDITOS, Math.max(MIN_CREDITOS, Math.round(qtd)));
  const unit = faixaDe(q).centavos;
  return { quantidade: q, unitario: unit, total: unit * q };
}

// Próxima faixa: quantos créditos faltam e quanto passa a custar cada um.
export function proximaFaixa(qtd: number) {
  const prox = FAIXAS.find((f) => f.de > qtd);
  return prox ? { faltam: prox.de - qtd, centavos: prox.centavos } : null;
}

export const reaisDeCentavos = (c: number, casas = true) =>
  (c / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: casas ? 2 : 0, maximumFractionDigits: casas ? 2 : 0 });
