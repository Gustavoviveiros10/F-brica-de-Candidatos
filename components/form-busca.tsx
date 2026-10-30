"use client";
import { useRef, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

// Formulário da busca: aplica o filtro assim que a empresa muda um campo, sem recarregar a página
// (trocar a função já mostra as perguntas dela). A URL continua guardando os filtros.
export function FormBusca({ className, children }: { className?: string; children: React.ReactNode }) {
  const ref = useRef<HTMLFormElement>(null);
  const router = useRouter();
  const caminho = usePathname();
  const atuais = useSearchParams().toString();
  const [carregando, iniciar] = useTransition();

  // trocouFuncao: as perguntas marcadas eram da vaga anterior, então saem do filtro.
  const aplicar = (trocouFuncao = false) => {
    if (!ref.current) return;
    const q = new URLSearchParams();
    for (const [k, v] of new FormData(ref.current)) {
      if (trocouFuncao && k.startsWith("r_")) continue;
      // "cidade=" vazio quer dizer Brasil todo; os outros vazios são "Qualquer".
      if (typeof v === "string" && (v || k === "cidade")) q.append(k, v);
    }
    iniciar(() => router.replace(`${caminho}?${q}`, { scroll: false }));
  };

  return (
    <form
      // Remonta quando a URL muda (ex.: "Limpar filtros"), para os campos mostrarem o filtro atual.
      key={atuais}
      ref={ref}
      className={className}
      method="get"
      aria-busy={carregando}
      style={carregando ? { opacity: 0.7, transition: "opacity .15s" } : undefined}
      onSubmit={(e) => {
        e.preventDefault();
        aplicar();
      }}
      onChange={(e) => {
        const alvo = e.target as HTMLElement;
        if (alvo.tagName === "SELECT" || (alvo as HTMLInputElement).type === "checkbox") aplicar((alvo as HTMLSelectElement).name === "funcao");
      }}
    >
      {children}
    </form>
  );
}
