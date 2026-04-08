import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Code Route MVP",
  description: "Préparation intelligente au code de la route",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
