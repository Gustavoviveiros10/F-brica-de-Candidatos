"use client";
import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";

const UFS = ["AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"];

type Municipio = { id: number; nome: string };

export type ValoresEmpresa = { empresa?: string; cnpj?: string; whatsapp?: string; uf?: string; municipio_id?: number | string };

// Estado + cidade (envia municipio_id). Carrega as cidades do estado escolhido.
export function SeletorCidade({ uf: ufInicial, municipioId, desabilitado }: { uf?: string; municipioId?: number | string; desabilitado?: boolean }) {
  const [uf, setUf] = useState(ufInicial ?? "SP");
  const [cidades, setCidades] = useState<Municipio[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    let ativo = true;
    setCarregando(true);
    supabaseBrowser()
      .from("municipios")
      .select("id,nome")
      .eq("uf", uf)
      .order("nome")
      .then(({ data }) => {
        if (!ativo) return;
        setCidades(data ?? []);
        setCarregando(false);
      });
    return () => {
      ativo = false;
    };
  }, [uf]);

  return (
    <div className="grid2">
      <div className="field">
        <label htmlFor="su-uf">Estado</label>
        <select className="select" id="su-uf" name="uf" value={uf} onChange={(e) => setUf(e.target.value)} disabled={desabilitado} required>
          {UFS.map((u) => (
            <option key={u}>{u}</option>
          ))}
        </select>
      </div>
      <div className="field">
        <label htmlFor="su-cidade">Cidade</label>
        <select
          className="select"
          id="su-cidade"
          name="municipio_id"
          key={uf + cidades.length}
          defaultValue={String(municipioId ?? "")}
          disabled={carregando || desabilitado}
          required
        >
          <option value="">{carregando ? "Carregando..." : "Selecione"}</option>
          {cidades.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nome}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

// Campos da empresa, usados no cadastro e em "completar cadastro".
export function CamposEmpresa({ iniciais = {} }: { iniciais?: ValoresEmpresa }) {
  return (
    <>
      <div className="grid2">
        <div className="field">
          <label htmlFor="su-empresa">Empresa</label>
          <input className="input" id="su-empresa" name="empresa" autoComplete="organization" defaultValue={iniciais.empresa} required />
        </div>
        <div className="field">
          <label htmlFor="su-cnpj">CNPJ</label>
          <input
            className="input"
            id="su-cnpj"
            name="cnpj"
            inputMode="numeric"
            placeholder="00.000.000/0000-00"
            pattern="\d{2}\.?\d{3}\.?\d{3}/?\d{4}-?\d{2}"
            title="Digite o CNPJ com 14 números"
            defaultValue={iniciais.cnpj}
            required
          />
        </div>
      </div>
      <div className="field">
        <label htmlFor="su-whatsapp">WhatsApp da empresa</label>
        <input className="input" id="su-whatsapp" name="whatsapp" type="tel" inputMode="tel" placeholder="(11) 99999-0000" defaultValue={iniciais.whatsapp} required />
      </div>
      <SeletorCidade uf={iniciais.uf} municipioId={iniciais.municipio_id} />
    </>
  );
}
