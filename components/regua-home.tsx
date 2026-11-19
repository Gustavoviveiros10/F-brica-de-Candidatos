"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { ReguaCreditos } from "./regua-creditos";

// A home é HTML estático (content/home.html); a régua entra no espaço <div id="regua-home">.
export function ReguaHome() {
  const [alvo, setAlvo] = useState<HTMLElement | null>(null);
  useEffect(() => setAlvo(document.getElementById("regua-home")), []);
  return alvo ? createPortal(<ReguaCreditos inicial={25} />, alvo) : null;
}
