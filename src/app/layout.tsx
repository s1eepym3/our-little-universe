import type { Metadata } from "next";
import { Inter, Outfit, Caveat } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-display",
  subsets: ["latin"],
});

const caveat = Caveat({
  variable: "--font-handwriting",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Our Little Universe",
  description: "A private place for our little moments.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={`${inter.variable} ${outfit.variable} ${caveat.variable} antialiased min-h-screen bg-(--background) text-(--foreground) selection:bg-rose-200 selection:text-rose-900 flex flex-col font-sans overflow-x-hidden`}
      >
        <main className="flex-grow flex flex-col">{children}</main>
      </body>
    </html>
  );
}
