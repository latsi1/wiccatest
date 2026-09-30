import "./globals.css";
import type { Metadata } from "next";
import { Inter, Cinzel } from "next/font/google";
import Navigation from "./components/Navigation";
import { LanguageProvider } from "./context/LanguageContext";
import ChatWidget from "./components/ChatWidget";

const inter = Inter({ subsets: ["latin"] });
const cinzel = Cinzel({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-cinzel",
});

export const metadata: Metadata = {
  title: { default: "Wiccoset — oma pieni maailma", template: "%s | Wiccoset" },
  description: "Wiccoset: loitsuja, tarinoita, ääniä ja yhteisön unohtumattomia hetkiä.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fi" className={`${inter.className} ${cinzel.variable}`}>
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
        />
      </head>
      <body>
        <a className="skipLink" href="#page-content">Siirry sisältöön / Skip to content</a>
        <LanguageProvider>
          <Navigation />
          <div id="page-content" tabIndex={-1}>{children}</div>
          <ChatWidget />
        </LanguageProvider>
      </body>
    </html>
  );
}
