import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: 'swap',
});

export const metadata: Metadata = {
  title: "CS2 Console Commands - Complete Command Reference",
  description: "Browse and search all Counter-Strike 2 console commands with descriptions, default values, and flags.",
  keywords: "CS2, Counter-Strike 2, console commands, game settings, configuration",
  authors: [{ name: "CS2 Commands" }],
  openGraph: {
    title: "CS2 Console Commands Reference",
    description: "Complete list of Counter-Strike 2 console commands",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className} style={{ margin: 0, padding: 0 }}>
        {children}
      </body>
    </html>
  );
}
