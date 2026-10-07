"use client";
import { useTransition } from "react";
import { mudarEtapa } from "@/app/app/liberados/actions";

export const ETAPAS: Record<string, string> = {
  novo: "Novo",
  contatado: "Contatado",
  conversando: "Conversando",
  entrevista: "Entrevista",
  aprovado: "Aprovado",
  contratado: "Contratado",
  descartado: "Descartado",
};

export function SeletorEtapa({ liberacaoId, etapa }: { liberacaoId: string; etapa: string }) {
  const [pendente, iniciar] = useTransition();
  return (
    <select
      className="select select-sm"
      aria-label="Etapa"
      defaultValue={etapa}
      disabled={pendente}
      onChange={(e) => {
        const nova = e.target.value;
        iniciar(() => mudarEtapa(liberacaoId, nova));
      }}
    >
      {Object.entries(ETAPAS).map(([k, v]) => (
        <option key={k} value={k}>{v}</option>
      ))}
    </select>
  );
}
