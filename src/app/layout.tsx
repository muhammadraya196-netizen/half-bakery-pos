import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/components/providers/query-provider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
});

export const metadata: Metadata = {
  title: "HALF Bakery Makassar | Fresh Bread & Premium Cake",
  description:
    "HALF Bakery Makassar menyediakan roti artisan, birthday cake, pastry, dessert, dan kopi premium dengan kualitas terbaik.",
  keywords: [
    "bakery makassar",
    "half bakery",
    "birthday cake makassar",
    "roti artisan",
    "pastry makassar",
    "kopi bakery",
  ],
  openGraph: {
    title: "HALF Bakery Makassar | Fresh Bread & Premium Cake",
    description:
      "HALF Bakery Makassar menyediakan roti artisan, birthday cake, pastry, dessert, dan kopi premium dengan kualitas terbaik.",
    type: "website",
    locale: "id_ID",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className={`${inter.variable} ${playfair.variable} font-sans`}>
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
