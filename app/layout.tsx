import type { Metadata } from "next";
import { Carlito, DM_Mono } from "next/font/google";
import BackgroundTexture from "@/components/BackgroundTexture";
import "./globals.css";

const dmMono = DM_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

const carlito = Carlito({
  variable: "--font-carlito",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "idea-to-prototype",
  description: "Turn a one-line product idea into a spec and a clickable prototype.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${dmMono.variable} ${carlito.variable}`}>
      <body>
        <BackgroundTexture />
        {children}
      </body>
    </html>
  );
}
