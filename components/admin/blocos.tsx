import Link from "next/link";
import { reais } from "@/lib/formato";
import { STATUS, n, quando, type EmpresaLinha, type ResumoAdmin } from "@/lib/admin";

export function KpisAdmin({ r }: { r: ResumoAdmin }) {
  const antes = r.liberacoes_30d_antes;
  const variacao = antes > 0 ? Math.round(((r.liberacoes_30d - antes) / antes) * 100) : null;
  return (
    <div className="kpis adm-kpis">
      <Link className="kpi vg-kpi adm-kpi" href="/admin/empresas">
        <div className="l">Empresas ativas</div>
        <div className="v num">
          {n(r.empresas.ativas)}
          <small>de {n(r.empresas.total)}</small>
        </div>
        <div className="s">
          {n(r.empresas.teste)} em teste grátis · {n(r.empresas.novas_mes)} {r.empresas.novas_mes === 1 ? "nova" : "novas"} no mês
        </div>
      </Link>
      <Link className="kpi vg-kpi adm-kpi" href="/admin/liberacoes">
        <div className="l">Liberações em 30 dias</div>
        <div className="v num">{n(r.liberacoes_30d)}</div>
        <div className="s">
          {variacao === null ? (
            "Primeiro mês com liberações"
          ) : (
            <>
              <span className={`adm-delta${variacao < 0 ? " neg" : ""}`}>
                {variacao < 0 ? "▼" : "▲"} {Math.abs(variacao)}%
              </span>{" "}
              vs. 30 dias antes
            </>
          )}
        </div>
      </Link>
      <Link className="kpi vg-kpi adm-kpi" href="/admin/creditos">
        <div className="l">Créditos vendidos no mês</div>
        <div className="v num">{n(r.creditos_vendidos_mes)}</div>
        <div className="s">{n(r.saldo_total)} no saldo das empresas</div>
      </Link>
      <Link className="kpi vg-kpi adm-kpi" href="/admin/financeiro">
        <div className="l">Receita do mês</div>
        <div className="v num">{reais(r.receita_mes)}</div>
        <div className="s">
          {r.pagamentos_mes ? `${n(r.pagamentos_mes)} ${r.pagamentos_mes === 1 ? "pagamento" : "pagamentos"}` : "Nenhum pagamento registrado"} · ver Financeiro
        </div>
      </Link>
    </div>
  );
}

export function GraficoDias({ dias }: { dias: ResumoAdmin["dias"] }) {
  const max = Math.max(1, ...dias.map((d) => d.total));
  const total = dias.reduce((t, d) => t + d.total, 0);
  const rot = (iso: string) => iso.slice(8, 10) + "/" + iso.slice(5, 7);
  return (
    <div className="panel">
      <div className="panel-h">
        <h2>Liberações por dia</h2>
        <span className="small muted">{n(total)} nos últimos 30 dias</span>
      </div>
      <div className="panel-b">
        <div className="adm-dias" role="img" aria-label={`Liberações por dia, ${total} em 30 dias`}>
          {dias.map((d, i) => (
            <i
              key={d.dia}
              title={`${rot(d.dia)}: ${d.total} ${d.total === 1 ? "liberação" : "liberações"}`}
              style={{ height: `${(d.total / max) * 100}%`, animationDelay: `${i * 18}ms` }}
            />
          ))}
        </div>
        <div className="adm-dias-eixo">
          <span>{dias[0] && rot(dias[0].dia)}</span>
          <span>hoje</span>
        </div>
      </div>
    </div>
  );
}

export function ChipStatus({ status }: { status: string }) {
  const s = STATUS[status] ?? { nome: status, classe: "" };
  return <span className={`chip ${s.classe}`}>{s.nome}</span>;
}

export function Saldo({ saldo, ciclo }: { saldo: number; ciclo: number | null }) {
  const base = Math.max(ciclo ?? 2, saldo, 1);
  return (
    <span className="adm-saldo">
      <span className="usage">
        <i style={{ width: `${Math.min(100, (saldo / base) * 100)}%` }} />
      </span>
      <span className={saldo === 0 ? "adm-zero" : ""}>{n(saldo)}</span>
    </span>
  );
}

// Tabela de empresas. Cada linha leva à ficha da empresa.
export function TabelaEmpresas({ empresas, curta, href, selecionada }: { empresas: EmpresaLinha[]; curta?: boolean; href: (id: string) => string; selecionada?: string }) {
  return (
    <div className={`table-wrap${curta ? " adm-curta" : ""}`}>
      <table className="t">
        <thead>
          <tr>
            <th>Empresa</th>
            <th>Status</th>
            {!curta && <th>Plano</th>}
            <th className="n">Saldo</th>
            {!curta && <th className="n">Liberações</th>}
            {!curta && <th>Última atividade</th>}
          </tr>
        </thead>
        <tbody>
          {empresas.map((e) => (
            <tr key={e.id} className="adm-linha" aria-selected={e.id === selecionada}>
              <td>
                <Link className="adm-link-linha" href={href(e.id)} scroll={false}>
                  <b>{e.nome}</b>
                </Link>
                <span className="sub">
                  {e.cidade ?? "Cidade não informada"}
                  {!curta && ` · desde ${new Date(e.criado_em).toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" })}`}
                </span>
              </td>
              <td>
                <ChipStatus status={e.status} />
              </td>
              {!curta && <td>{e.plano ?? (e.status === "teste" ? "Teste grátis" : "Sem plano")}</td>}
              <td className="n">
                <Saldo saldo={e.saldo} ciclo={e.plano_creditos} />
              </td>
              {!curta && (
                <td className="n">
                  {n(e.lib_total)}
                  <span className="sub">{n(e.lib_30d)} em 30 dias</span>
                </td>
              )}
              {!curta && <td>{quando(e.ultima_atividade)}</td>}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function Paginacao({ pagina, total, porPagina, href }: { pagina: number; total: number; porPagina: number; href: (p: number) => string }) {
  const paginas = Math.ceil(total / porPagina);
  if (paginas <= 1) return null;
  return (
    <div className="adm-paginas">
      {pagina > 1 ? (
        <Link className="btn btn-sm btn-secondary" href={href(pagina - 1)}>
          Anterior
        </Link>
      ) : (
        <span />
      )}
      <span className="small muted">
        Página {pagina} de {paginas} · {n(total)} no total
      </span>
      {pagina < paginas ? (
        <Link className="btn btn-sm btn-secondary" href={href(pagina + 1)}>
          Próxima
        </Link>
      ) : (
        <span />
      )}
    </div>
  );
}

export function Vazio({ titulo, texto }: { titulo: string; texto?: string }) {
  return (
    <div className="empty">
      <b>{titulo}</b>
      {texto}
    </div>
  );
}
