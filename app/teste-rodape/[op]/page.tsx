import { notFound } from "next/navigation";
import { HOME_HTML } from "@/lib/content/home";
import { montarHome } from "@/lib/montar-home";
import { RODAPES } from "@/lib/rodape-teste";
import { MovimentoHome } from "@/components/movimento-home";

export const metadata = { robots: { index: false, follow: false } };

export default async function TesteRodape({ params }: { params: Promise<{ op: string }> }) {
  const { op } = await params;
  const rodape = RODAPES[op];
  if (!rodape) notFound();
  const html = (await montarHome(HOME_HTML)).replace(/<footer class="site-footer">[\s\S]*<\/footer>/, rodape);
  return (
    <>
      <div dangerouslySetInnerHTML={{ __html: html }} />
      <MovimentoHome />
    </>
  );
}
