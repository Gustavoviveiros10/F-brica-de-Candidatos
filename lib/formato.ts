export const CATEGORIAS: Record<string, { nome: string; foto: string }> = {
  empilhadeira: { nome: "Empilhadeira", foto: "/img/foto-forklift.jpg" },
  ferramentaria: { nome: "Ferramentaria", foto: "/img/foto-tool.jpg" },
  solda: { nome: "Solda", foto: "/img/foto-weld.jpg" },
  manutencao: { nome: "Manutenção", foto: "/img/foto-maint.jpg" },
  logistica: { nome: "Logística", foto: "/img/foto-truck.jpg" },
  producao: { nome: "Produção e qualidade", foto: "/img/foto-line.jpg" },
  outros: { nome: "Outras funções", foto: "/img/foto-line.jpg" },
};

export const TEMPERATURAS: Record<string, { rotulo: string; classe: string; dica: string }> = {
  quente: { rotulo: "Quente", classe: "t-hot", dica: "Disponível agora e perfil atualizado há poucos dias" },
  morno: { rotulo: "Morno", classe: "t-warm", dica: "Disponível em breve ou atualizado há algumas semanas" },
  frio: { rotulo: "Frio", classe: "t-cold", dica: "Disponibilidade mais distante ou perfil menos recente" },
};

export const DISPONIBILIDADES: Record<string, string> = {
  imediata: "Imediata",
  "15_dias": "15 dias",
  "30_dias": "30 dias",
};

export const MENSAGEM_PADRAO =
  "Olá, {nome}. Tudo bem? Encontramos seu perfil pela Fábrica de Candidatos e gostaríamos de conversar sobre uma oportunidade para {cargo}. Podemos falar?";

export const iniciais = (n?: string | null) =>
  String(n || "?")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();

export const reais = (centavos: number) =>
  (centavos / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

export const data = (iso: string) => new Date(iso).toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" });

export const experiencia = (anos: number | null) =>
  anos && anos > 0 ? `${anos} ${anos === 1 ? "ano" : "anos"}` : "Exp. não informada";

export function linkWhatsApp(whatsapp: string, modelo: string, vars: { nome: string; cargo: string; empresa: string }) {
  const primeiro = vars.nome.split(" ")[0] ?? "";
  const msg = modelo
    .replaceAll("{nome}", primeiro)
    .replaceAll("{cargo}", vars.cargo)
    .replaceAll("{empresa}", vars.empresa);
  const numero = whatsapp.replace(/\D/g, "");
  return `https://wa.me/${numero.startsWith("55") ? numero : "55" + numero}?text=${encodeURIComponent(msg)}`;
}
