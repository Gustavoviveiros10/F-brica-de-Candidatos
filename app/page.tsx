import { HOME_HTML } from "@/lib/content/home";
import { montarHome } from "@/lib/montar-home";
import { MovimentoHome } from "@/components/movimento-home";

// A home é estática e revalida a cada hora (contagem por categoria e ranking).
export const revalidate = 3600;

export default async function Home() {
  const html = await montarHome(HOME_HTML);
  return (
    <>
      <div dangerouslySetInnerHTML={{ __html: html }} />
      <MovimentoHome />
    </>
  );
}
