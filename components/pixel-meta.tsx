"use client";
import Script from "next/script";

type Fbq = (acao: string, evento: string, params?: Record<string, unknown>) => void;

const ID = process.env.NEXT_PUBLIC_META_PIXEL_ID ?? "";
const PIXEL = /^\d{5,20}$/.test(ID) ? ID : null;

// Pixel da Meta (anúncios). Só carrega se NEXT_PUBLIC_META_PIXEL_ID estiver configurado na Vercel.
export function PixelMeta() {
  if (!PIXEL) return null;
  return (
    <Script id="pixel-meta" strategy="afterInteractive">
      {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${PIXEL}');fbq('track','PageView');`}
    </Script>
  );
}

export function eventoMeta(evento: string, params?: Record<string, unknown>) {
  const fbq = (window as unknown as { fbq?: Fbq }).fbq;
  if (fbq) fbq("track", evento, params);
}
