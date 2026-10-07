import type { Metadata } from "next";
import { SPRITE_SVG } from "@/lib/content/sprite";
import "./globals.css";
import "./extra.css";

export const metadata: Metadata = {
  title: "Fábrica de Candidatos",
  description:
    "Candidatos operacionais e industriais disponíveis perto da sua empresa. Busque grátis e pague só pelo contato que liberar.",
  icons: { icon: "/img/logo_s.png" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Big+Shoulders+Display:wght@600;700;800&family=Public+Sans:wght@400;500;600;700&display=swap"
        />
      </head>
      <body>
        <div hidden dangerouslySetInnerHTML={{ __html: SPRITE_SVG }} />
        {children}
      </body>
    </html>
  );
}
