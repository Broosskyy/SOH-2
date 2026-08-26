import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Abyssal Dominion",
  description: "Ein taktisches Fantasy-Seeschlachtspiel mit Missionen, Monsterjagd und Schiffsausbau.",
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
    <html lang="de">
      <body className="antialiased">{children}</body>
    </html>
  );
}
