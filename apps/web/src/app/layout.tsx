import type { Metadata } from "next";
import { Inter } from "next/font/google";

import { siteUrl } from "@/lib/site-url";

import "./globals.css";

const inter = Inter({
  display: "swap",
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  description:
    "Encontre vagas, projetos, campanhas de campo e profissionais especializados em Biologia no Brasil.",
  alternates: {
    canonical: "/",
  },
  metadataBase: new URL(siteUrl),
  openGraph: {
    description:
      "A plataforma nacional para conectar biologos, estudantes e empresas as oportunidades certas.",
    images: ["/images/hero-bioconecta.png"],
    siteName: "BioConecta",
    title: "BioConecta",
    type: "website",
  },
  title: {
    default: "BioConecta | Oportunidades para biologos",
    template: "%s | BioConecta",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={inter.variable}>{children}</body>
    </html>
  );
}
