import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "FP // Operating System for Human Ambition",
  description: "Strategist and executioner. Compress your ambition into raw, immutable units of work.",
  authors: [{ name: "FP-OS" }],
  openGraph: {
    title: "FP-OS // Operating System for Human Ambition",
    description: "An AI strategist & executioner. Lock your trajectory.",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "FP-OS // Operating System for Human Ambition",
    description: "An AI strategist & executioner. Lock your trajectory.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className={`${inter.variable} font-sans antialiased bg-background text-foreground min-h-screen`}
      >
        {children}
      </body>
    </html>
  );
}
