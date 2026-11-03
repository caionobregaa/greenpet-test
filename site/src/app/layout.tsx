import type { Metadata, Viewport } from "next";
import { Sora, Fraunces } from "next/font/google";
import { ENDERECO_COMPLETO, LOJA } from "@/lib/loja";
import "./globals.css";

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

// Títulos: serifada suave e retrô, conversa com a palavra "beezpet" (specs/identidade-visual).
const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  style: ["normal", "italic"],
  axes: ["SOFT", "WONK", "opsz"],
});

const descricao = `Ração, petiscos, medicamentos, acessórios e higiene para cães e gatos em Manaus. Escolha no catálogo e envie o pedido pelo WhatsApp. ${ENDERECO_COMPLETO}.`;

export const metadata: Metadata = {
  metadataBase: new URL(LOJA.url),
  title: { default: "beezpet – Tudo pro seu pet em Manaus", template: "%s | beezpet" },
  description: descricao,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: "beezpet",
    title: "beezpet – Tudo pro seu pet em Manaus",
    description: descricao,
    url: "/",
    images: [{ url: "/brand/logo-beezpet.png", alt: "Logo da beezpet" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#641d3f",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" className={`${sora.variable} ${fraunces.variable} antialiased`}>
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
