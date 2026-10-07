"use client";
import { useFormStatus } from "react-dom";

export function BotaoEnviar({ children, enviando, className = "btn btn-primary btn-block" }: { children: React.ReactNode; enviando: string; className?: string }) {
  const { pending } = useFormStatus();
  return (
    <button className={className} disabled={pending}>
      {pending ? enviando : children}
    </button>
  );
}
