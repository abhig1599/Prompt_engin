import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PromptBoard",
  description: "A curated discovery platform for AI creators",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
