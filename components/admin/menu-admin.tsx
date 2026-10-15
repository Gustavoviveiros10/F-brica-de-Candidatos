"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@/lib/icons-component";

const ITENS = [
  ["/admin", "Visão geral", "grid"],
  ["/admin/empresas", "Empresas", "building"],
  ["/admin/creditos", "Créditos", "card"],
  ["/admin/liberacoes", "Liberações", "unlock"],
  ["/admin/demanda", "Demanda", "search"],
] as const;

export function MenuAdmin() {
  const atual = usePathname();
  return (
    <nav className="side-nav" aria-label="Menu do admin">
      {ITENS.map(([href, rotulo, icone]) => (
        <Link key={href} href={href} aria-current={atual === href ? "page" : undefined}>
          <Icon name={icone} />
          {rotulo}
        </Link>
      ))}
    </nav>
  );
}
