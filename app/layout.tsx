import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  manifest: "/manifest.webmanifest",
  title: "Conecta Santa Maria | Serviços perto de você",
  description: "Encontre e contrate prestadores de serviços em Santa Maria–RS.",
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className="antialiased">{children}</body>
    </html>
  );
}
