import type { Metadata } from "next";
import "./globals.css";
import { displayFont, monoFont } from "./fonts/fonts";

export const metadata: Metadata = {
  title: "doom.lat",
  description: "Portfolio of doom",
};

export const dynamic = 'force-dynamic';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${displayFont.variable} ${monoFont.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
