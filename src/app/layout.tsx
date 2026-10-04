import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GadgetBdg - Platform Website & Storefront Toko HP Bekas Bandung",
  description: "Bikin katalog online HP second instan, kelola tukar tambah (trade-in), dan closing cepat lewat WhatsApp.",
  icons: {
    icon: "/icon.png",
    shortcut: "/favicon.ico",
    apple: "/apple-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className="min-h-screen antialiased flex flex-col">{children}</body>
    </html>
  );
}
