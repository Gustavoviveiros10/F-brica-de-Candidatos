import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { HOME_TESTE_A_HTML } from "@/lib/content/home-teste-a";
import { HOME_TESTE_B_HTML } from "@/lib/content/home-teste-b";
import { HOME_TESTE_C_HTML } from "@/lib/content/home-teste-c";
import { montarHome } from "@/lib/montar-home";
import { MovimentoHome } from "@/components/movimento-home";

// Versões de teste da home (empresa × candidato). Sai do código quando uma for escolhida.
export const revalidate = 3600;
export const metadata: Metadata = { robots: { index: false, follow: false } };

const OPCOES: Record<string, string> = { a: HOME_TESTE_A_HTML, b: HOME_TESTE_B_HTML, c: HOME_TESTE_C_HTML };

export function generateStaticParams() {
  return Object.keys(OPCOES).map((opcao) => ({ opcao }));
}

export default async function HomeTeste({ params }: { params: Promise<{ opcao: string }> }) {
  const { opcao } = await params;
  const base = OPCOES[opcao];
  if (!base) notFound();
  const html = await montarHome(base);
  return (
    <>
      <div dangerouslySetInnerHTML={{ __html: html }} />
      <MovimentoHome />
    </>
  );
}
