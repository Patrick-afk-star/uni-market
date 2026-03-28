import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "UniMarket",
  description: "University marketplace for buying and selling items",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
