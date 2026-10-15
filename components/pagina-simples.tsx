import { Marca } from "./marca";
import { BotaoTema } from "./tema";

export function PaginaSimples({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <>
      <header className="site-header">
        <div className="wrap header-row">
          <Marca />
          <div className="header-cta">
            <BotaoTema />
          </div>
        </div>
      </header>
      <main className="legal">
        <h1>{titulo}</h1>
        {children}
      </main>
    </>
  );
}
