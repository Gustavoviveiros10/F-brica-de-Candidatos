// Controles de tema sem JS próprio: o script em lib/tema.ts trata os cliques e o CSS mostra o estado.

function Sol({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </svg>
  );
}

function Lua({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z" />
    </svg>
  );
}

function Tela() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <rect x="3" y="4" width="18" height="12" rx="2" />
      <path d="M8 20h8M12 16v4" />
    </svg>
  );
}

/** Três opções (Auto segue o sistema). Usado no rodapé da barra lateral do painel. */
export function SeletorTema() {
  return (
    <div className="tema-seg" role="group" aria-label="Tema da tela">
      <button type="button" data-tema-set="auto" title="Segue o tema do aparelho">
        <Tela />
        Auto
      </button>
      <button type="button" data-tema-set="claro">
        <Sol />
        Claro
      </button>
      <button type="button" data-tema-set="escuro">
        <Lua />
        Escuro
      </button>
    </div>
  );
}

/** Botão sol/lua que alterna entre claro e escuro. Usado nos cabeçalhos. */
export function BotaoTema() {
  return (
    <button type="button" className="tema-btn" data-tema-trocar="" aria-label="Alternar tema claro ou escuro" title="Tema claro ou escuro">
      <Sol className="i-sol" />
      <Lua className="i-lua" />
    </button>
  );
}
