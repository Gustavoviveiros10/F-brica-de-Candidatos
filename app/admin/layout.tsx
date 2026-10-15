import Link from "next/link";
import { exigirAdmin } from "@/lib/conta";
import { iniciais } from "@/lib/formato";
import { Icon } from "@/lib/icons-component";
import { MenuAdmin } from "@/components/admin/menu-admin";
import "./admin.css";

export const metadata = { title: "Painel admin · Fábrica de Candidatos", robots: { index: false } };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const conta = await exigirAdmin();
  const nome = conta.empresa?.usuario_nome ?? "Admin";

  return (
    <div className="shell">
      <aside className="sidebar">
        <Link className="side-brand" href="/admin">
          <span className="tile">
            <img src="/img/logo_s.png" alt="" />
          </span>
          <span>
            <b>Fábrica</b>
            <small>de Candidatos</small>
            <br />
            <span className="adm-tag">Painel admin</span>
          </span>
        </Link>
        <MenuAdmin />
        <div className="side-foot">
          {conta.empresa && (
            <Link className="side-link" href="/app">
              Ir para o app das empresas
            </Link>
          )}
          <form action="/sair" method="post">
            <button className="side-link">Sair</button>
          </form>
        </div>
      </aside>
      <div className="main">
        <header className="topbar">
          <div className="muted small">Painel da Fábrica · só administradores</div>
          <div className="who">
            <span>{nome}</span>
            <div className="av">{iniciais(nome)}</div>
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
