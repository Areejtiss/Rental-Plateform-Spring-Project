import { Inter } from "next/font/google";
import "./globals.css";
import Nav from "@/components/Nav";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata = {
  title: "RentaTN — Peer-to-peer rentals in Tunisia",
  description: "Rent tools and equipment from people near you.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr" className={inter.variable}>
      <body className="min-h-screen flex flex-col bg-neutral-50">
        <Nav />
        <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-10">
          {children}
        </main>
        <footer className="border-t border-neutral-200 bg-white">
          <div className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between text-sm text-neutral-500">
            <span>© {new Date().getFullYear()} RentaTN</span>
            <span className="font-mono text-xs">Spring Boot + Next.js</span>
          </div>
        </footer>
      </body>
    </html>
  );
}
