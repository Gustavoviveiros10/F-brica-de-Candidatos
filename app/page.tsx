import { HOME_HTML } from "@/lib/content/home";
import { MovimentoHome } from "@/components/movimento-home";
import { ReguaHome } from "@/components/regua-home";

export default function Home() {
  return (
    <>
      <div dangerouslySetInnerHTML={{ __html: HOME_HTML }} />
      <MovimentoHome />
      <ReguaHome />
    </>
  );
}
