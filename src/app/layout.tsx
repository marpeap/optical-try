import type { Metadata } from "next";
import { Geist, Geist_Mono, Bricolage_Grotesque } from "next/font/google";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import "./globals.css";

/*
  Deux familles, deux rôles. Bricolage Grotesque porte les titres : c'est une
  grotesque variable avec un axe de chasse, des terminaisons franches et un
  caractère marqué, qui évite le rendu neutre d'une grotesque système.
  Geist reste sur le texte courant et l'interface, où sa lisibilité en petit
  corps prime sur la personnalité.
*/
const bricolage = Bricolage_Grotesque({
  variable: "--font-display",
  subsets: ["latin"],
  axes: ["opsz", "wdth"],
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Alves — Opticien en ligne",
  description:
    "Choisissez votre monture, essayez-la en conditions réelles, transmettez votre ordonnance et connaissez votre reste à charge avant de commander.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="fr"
      className={`${geistSans.variable} ${geistMono.variable} ${bricolage.variable}`}
    >
      <body className="min-h-[100dvh] flex flex-col">
        <SiteHeader />
        <div className="flex-1">{children}</div>
        <SiteFooter />
      </body>
    </html>
  );
}
