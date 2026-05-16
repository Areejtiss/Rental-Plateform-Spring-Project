import "./globals.css";
import Nav from "@/components/Nav";

export const metadata = {
  title: "RentaTN · Location entre particuliers en Tunisie",
  description: "Plateforme de location de matériel et outils entre particuliers",
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body className="min-h-screen flex flex-col">
        <Nav />
        <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8">
          {children}
        </main>
        <footer className="bg-slate-900 text-slate-400 text-center text-sm py-4">
          RentaTN · Projet Spring Boot + Next.js · {new Date().getFullYear()}
        </footer>
      </body>
    </html>
  );
}
