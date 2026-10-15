import { Logo } from "./logo";

export function Marca() {
  return <Logo />;
}

export function ArteAuth({ titulo, texto }: { titulo: string; texto: string }) {
  return (
    <aside className="auth-art">
      <div className="art-bg">
        <svg viewBox="0 0 600 640" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
          <use href="#scene-hero" />
        </svg>
      </div>
      <div className="copy">
        <h2>{titulo}</h2>
        <p>{texto}</p>
      </div>
    </aside>
  );
}

export function TelaAuth({ children, titulo, texto }: { children: React.ReactNode; titulo: string; texto: string }) {
  return (
    <div className="auth">
      <div className="auth-main">
        <div>
          <Marca />
        </div>
        <div className="auth-form">{children}</div>
      </div>
      <ArteAuth titulo={titulo} texto={texto} />
    </div>
  );
}
