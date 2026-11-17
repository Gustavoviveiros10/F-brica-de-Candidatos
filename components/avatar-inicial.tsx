// Bolinha com a inicial do candidato, na cor da temperatura (substitui as fotos dos cards).
// Estilo escolhido em ESTILO_AVATAR: "a" bolinha cheia, "b" bolinha suave, "c" anel de temperatura.
const ESTILO_AVATAR = "a";

const CORES: Record<string, string> = { quente: "hot", morno: "warm", frio: "cold" };

export function inicialDe(texto: string | null | undefined) {
  const letra = (texto ?? "").trim().charAt(0);
  return letra ? letra.toLocaleUpperCase("pt-BR") : "?";
}

type Props = { nome: string | null | undefined; temperatura: string; tamanho?: "md" | "lg"; className?: string };

export function AvatarInicial({ nome, temperatura, tamanho = "md", className }: Props) {
  const cor = CORES[temperatura] ?? "cold";
  return (
    <span className={`av-ini av-${ESTILO_AVATAR} av-${cor}${tamanho === "lg" ? " av-lg" : ""}${className ? ` ${className}` : ""}`} aria-hidden="true">
      {inicialDe(nome)}
    </span>
  );
}
