import Link from "next/link";
import { TelaAuth } from "@/components/marca";
import { FormCadastro } from "./form";

export const metadata = { title: "Criar conta · Fábrica de Candidatos" };

export default function Cadastro() {
  return (
    <TelaAuth titulo="2 contatos grátis para testar." texto="Sem cartão. Você só escolhe um plano se gostar.">
      <h1 className="display">Crie sua conta</h1>
      <p className="muted">Leva 1 minuto. Você começa com 2 contatos grátis, sem cartão.</p>
      <FormCadastro />
      <p className="small muted" style={{ marginTop: 16 }}>
        Já tem conta? <Link className="linklike" href="/entrar">Entrar</Link>
      </p>
    </TelaAuth>
  );
}
