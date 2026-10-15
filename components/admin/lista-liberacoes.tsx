import Link from "next/link";
import { NOME_ETAPA } from "@/lib/etapas";
import { quando } from "@/lib/admin";
import { Vazio } from "./blocos";

export type LiberacaoAdmin = {
  id: string;
  criado_em: string;
  empresa_id: string;
  empresa: string;
  candidato: string | null;
  funcao: string | null;
  cidade: string | null;
  etapa: string;
  total: number;
};

// "Empresa X liberou Rafael · Operador de empilhadeira", com a etapa em que a empresa está com ele.
export function ListaLiberacoes({ itens }: { itens: LiberacaoAdmin[] }) {
  if (!itens.length) return <Vazio titulo="Nenhuma liberação ainda" texto="Quando uma empresa liberar um contato, aparece aqui." />;
  return (
    <div className="panel-b">
      <div className="list adm-lista-anim">
        {itens.map((l) => (
          <Link key={l.id} href={`/admin/empresas?id=${l.empresa_id}`}>
            <span>
              <b>{l.empresa}</b> liberou {[l.candidato, l.funcao].filter(Boolean).join(" · ") || "um candidato"}
              <br />
              <span className="small muted">{[l.cidade, quando(l.criado_em)].filter(Boolean).join(" · ")}</span>
            </span>
            <span className={`etapa-chip etapa-${l.etapa}`}>{NOME_ETAPA[l.etapa] ?? l.etapa}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
