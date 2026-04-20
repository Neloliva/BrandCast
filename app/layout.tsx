import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BrandCast",
  description:
    "Transform articles, URLs, and files into on-brand social posts.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
