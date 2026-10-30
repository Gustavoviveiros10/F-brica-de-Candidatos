"use client";
import { useRef } from "react";

// Formulário GET da busca: aplica o filtro assim que a empresa muda um campo (trocar a função já mostra as perguntas dela).
export function FormBusca({ className, children }: { className?: string; children: React.ReactNode }) {
  const ref = useRef<HTMLFormElement>(null);
  return (
    <form
      ref={ref}
      className={className}
      method="get"
      onChange={(e) => {
        const alvo = e.target as HTMLElement;
        if (alvo.tagName === "SELECT" || (alvo as HTMLInputElement).type === "checkbox") ref.current?.requestSubmit();
      }}
    >
      {children}
    </form>
  );
}
