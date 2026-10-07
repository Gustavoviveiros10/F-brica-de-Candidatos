import { Marca } from "./marca";

export function PaginaSimples({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <>
      <header className="site-header">
        <div className="wrap header-row">
          <Marca />
        </div>
      </header>
      <main className="legal">
        <h1>{titulo}</h1>
        {children}
      </main>
    </>
  );
}
