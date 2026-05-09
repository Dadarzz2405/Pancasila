import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pancasila Hub",
  description: "Ruang refleksi, diskusi, dan etika digital berbasis Pancasila.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="h-full antialiased">
      <body className="min-h-full">{children}</body>
    </html>
  );
}
