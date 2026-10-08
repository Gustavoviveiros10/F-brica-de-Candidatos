"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@/lib/icons-component";

const ITENS = [
  ["/app", "Visão geral", "grid"],
  ["/app/busca", "Buscar candidatos", "search"],
  ["/app/salvos", "Candidatos salvos", "star"],
  ["/app/liberados", "Contatos liberados", "unlock"],
  ["/app/creditos", "Plano e créditos", "card"],
  ["/app/faturas", "Faturas", "receipt"],
  ["/app/usuarios", "Usuários", "users"],
  ["/app/configuracoes", "Configurações", "settings"],
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
