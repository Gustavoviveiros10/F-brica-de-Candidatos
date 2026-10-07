import Link from "next/link";
import { TelaAuth } from "@/components/marca";
import { FormEntrar } from "./form";

export const metadata = { title: "Entrar · Fábrica de Candidatos" };

export default async function Entrar({ searchParams }: { searchParams: Promise<{ voltar?: string; confirmado?: string; erro?: string }> }) {
  const { voltar, confirmado, erro } = await searchParams;
  return (
    <TelaAuth titulo="Busque primeiro. Pague só para liberar." texto="Pesquisar e comparar candidatos não gasta crédito.">
      <h1 className="display">Entrar</h1>
      <p className="muted">Acesse o painel da sua empresa.</p>
      {confirmado && <div className="form-ok" style={{ marginTop: 16 }}>E-mail confirmado. Agora é só entrar.</div>}
      {erro === "link" && <div className="form-erro" style={{ marginTop: 16 }}>Esse link expirou ou já foi usado. Entre com e-mail e senha ou peça um novo.</div>}
      <FormEntrar voltar={voltar ?? "/app"} />
      <p className="small muted" style={{ marginTop: 16 }}>
        Ainda não tem conta? <Link className="linklike" href="/cadastro">Criar conta grátis</Link>
      </p>
    </TelaAuth>
  );
}
