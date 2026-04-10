import "./globals.css";
import type { Metadata } from "next";
import { SessionProvider } from "@/components/SessionProvider";

export const metadata: Metadata = {
  title: "Code Route — Methode structuree pour reussir le code",
  description: "Prepare-toi au code de la route avec une methode scientifique : 2 series, pause obligatoire, algorithme adaptatif.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
