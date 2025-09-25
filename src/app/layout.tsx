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
  title: "Wicca App",
  description: "A magical app for all your needs",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.className} ${cinzel.variable}`}>
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
        />
      </head>
      <body style={{ background: "black", minHeight: "100vh" }}>
        <LanguageProvider>
          <Navigation />
          {children}
          <ChatWidget />
        </LanguageProvider>
      </body>
    </html>
  );
}
