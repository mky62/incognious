import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "Incognious",
  description: "Anonymous inbox for honest feedback and questions.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}
