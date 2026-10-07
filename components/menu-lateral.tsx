"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@/lib/icons-component";

const ITENS = [
  ["/app", "Visão geral", "grid"],
  ["/app/busca", "Buscar candidatos", "search"],
  ["/app/liberados", "Contatos liberados", "unlock"],
  ["/app/creditos", "Plano e créditos", "card"],
] as const;

export function MenuLateral() {
  const atual = usePathname();
  return (
    <nav className="side-nav" aria-label="Menu">
      {ITENS.map(([href, rotulo, icone]) => (
        <Link key={href} href={href} aria-current={atual === href ? "page" : undefined}>
          <Icon name={icone} />
          {rotulo}
        </Link>
      ))}
    </nav>
  );
}
