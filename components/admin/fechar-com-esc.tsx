"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Fecha a ficha da empresa com a tecla Esc.
export function FecharComEsc({ href }: { href: string }) {
  const router = useRouter();
  useEffect(() => {
    const f = (e: KeyboardEvent) => e.key === "Escape" && router.push(href, { scroll: false });
    window.addEventListener("keydown", f);
    return () => window.removeEventListener("keydown", f);
  }, [href, router]);
  return null;
}
