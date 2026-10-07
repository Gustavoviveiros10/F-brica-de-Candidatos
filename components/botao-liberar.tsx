"use client";
import Link from "next/link";
import { useState, useTransition } from "react";
import { liberarContato, type ResultadoLiberar } from "@/app/app/busca/actions";
import { linkWhatsApp } from "@/lib/formato";
import { Icon } from "@/lib/icons-component";

type Props = { candidatoId: string; jaLiberado: boolean; cargo: string; empresa: string; modelo: string };

export function BotaoLiberar({ candidatoId, jaLiberado, cargo, empresa, modelo }: Props) {
  const [res, setRes] = useState<ResultadoLiberar>(null);
  const [pendente, iniciar] = useTransition();

  const abrir = () => {
    if (!jaLiberado && !confirm("Liberar o contato deste candidato? Usa 1 crédito. Liberar de novo depois não cobra.")) return;
    iniciar(async () => setRes(await liberarContato(candidatoId)));
  };

  if (res?.contato) {
    const c = res.contato;
    return (
      <div className="contato">
        <b>{c.nome}</b>
        {c.email && <span className="small muted">{c.email}</span>}
        <a className="btn btn-wa btn-sm" href={linkWhatsApp(c.whatsapp, modelo, { nome: c.nome, cargo, empresa })} target="_blank" rel="noopener">
          <Icon name="wa" /> WhatsApp
        </a>
      </div>
    );
  }
  return (
    <div className="contato">
      <button className={`btn btn-sm ${jaLiberado ? "btn-secondary" : "btn-primary"}`} onClick={abrir} disabled={pendente}>
        <Icon name="unlock" /> {pendente ? "Liberando..." : jaLiberado ? "Ver contato" : "Liberar"}
      </button>
      {res?.erro && (
        <span className="small" style={{ color: "var(--warn)" }}>
          {res.erro} {res.semCreditos && <Link className="linklike" href="/app/creditos">Ver planos</Link>}
        </span>
      )}
    </div>
  );
}
