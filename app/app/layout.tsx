import Link from "next/link";
import { exigirEmpresa } from "@/lib/conta";
import { iniciais } from "@/lib/formato";
import { Icon } from "@/lib/icons-component";
import { MenuLateral } from "@/components/menu-lateral";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const { empresa, admin } = await exigirEmpresa();
  // Barra do saldo: cheia a partir de 25 créditos (faixa do meio da régua).
  const pct = Math.min(100, Math.round((empresa.saldo_creditos / 25) * 100));

  return (
    <div className="shell">
      <aside className="sidebar">
        <Link className="side-brand" href="/app">
          <span className="tile">
            <img src="/img/logo_s.png" alt="" />
          </span>
          <span>
            <b>Fábrica de Candidatos</b>
          </span>
        </Link>
        <MenuLateral />
        <div className="side-foot">
          <div className="credit-box">
            <div className="big">
              <span className="num">{empresa.saldo_creditos}</span>
              <small>créditos</small>
            </div>
            <div className="bar">
              <i style={{ width: `${pct}%` }} />
            </div>
          </div>
          {admin && (
            <Link className="side-link" href="/admin">
              Painel admin da Fábrica
            </Link>
          )}
          <form action="/sair" method="post">
            <button className="side-link">Sair</button>
          </form>
        </div>
      </aside>
      <div className="main">
        <header className="topbar">
          <div className="muted small">{empresa.nome}</div>
          <div className="who">
            <span className="chip chip-brand" style={{ display: "inline-flex" }}>
              {empresa.saldo_creditos} créditos
            </span>
            <span>{empresa.usuario_nome}</span>
            <div className="av">{iniciais(empresa.usuario_nome)}</div>
            <form action="/sair" method="post">
              <button className="icon-btn" aria-label="Sair">
                <Icon name="logout" />
              </button>
            </form>
          </div>
        </header>
        <main className="page">{children}</main>
      </div>
    </div>
  );
}
