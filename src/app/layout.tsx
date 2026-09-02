import type { Metadata } from "next";
import { Gochi_Hand, Shantell_Sans } from "next/font/google";
import "./globals.css";

const gochiHand = Gochi_Hand({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-accent",
});

const shantellSans = Shantell_Sans({
  subsets: ["latin"],
  variable: "--font-body",
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
        className={`${gochiHand.variable} ${shantellSans.variable} font-body antialiased min-h-screen bg-(--background) text-(--foreground) selection:bg-rose-200 selection:text-rose-900 flex flex-col overflow-x-hidden`}
      >
        <main className="flex-grow flex flex-col">{children}</main>
      </body>
    </html>
  );
}
