"use client";

import { useEffect } from "react";

// Animações da home: blocos entram suaves ao rolar e números contam até o valor.
const ALVOS = "[data-reveal], .section-head, .cat-card, .step, .plan, .faq-item";

function contar(el: HTMLElement) {
  const fim = Number(el.dataset.count);
  if (!fim) return;
  let inicio = 0;
  const passo = (t: number) => {
    if (!inicio) inicio = t;
    const p = Math.min((t - inicio) / 1200, 1);
    el.textContent = Math.round(fim * (1 - Math.pow(1 - p, 3))).toLocaleString("pt-BR");
    if (p < 1) requestAnimationFrame(passo);
  };
  requestAnimationFrame(passo);
}

export function MovimentoHome() {
  useEffect(() => {
    const reduz = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduz || !("IntersectionObserver" in window)) return;

    const alvos = Array.from(document.querySelectorAll<HTMLElement>(ALVOS));
    const io = new IntersectionObserver(
      (entradas) => {
        for (const e of entradas) {
          if (!e.isIntersecting) continue;
          const el = e.target as HTMLElement;
          io.unobserve(el);
          const posicao = el.parentElement ? Array.from(el.parentElement.children).indexOf(el) : 0;
          el.style.transitionDelay = `${Math.min(posicao, 6) * 70}ms`;
          el.classList.add("is-in");
          el.querySelectorAll<HTMLElement>("[data-count]").forEach(contar);
        }
      },
      { threshold: 0.15 },
    );
    for (const a of alvos) {
      // O que já está na tela ao abrir a página não some e volta.
      if (a.getBoundingClientRect().top < window.innerHeight * 0.85) continue;
      a.classList.add("rv");
      io.observe(a);
    }
    return () => io.disconnect();
  }, []);

  return null;
}
