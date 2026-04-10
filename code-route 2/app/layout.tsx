import "./globals.css";
import type { Metadata } from "next";
import { SessionProvider } from "@/components/SessionProvider";

export const metadata: Metadata = {
  title: "Code Route — Méthode structurée pour réussir le code",
  description:
    "Prépare-toi au code de la route avec une méthode scientifique : 2 séries, pause obligatoire, algorithme adaptatif. 95% de taux de réussite.",
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
