import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Syed Maaz Ahmed | AI Engineer",
  description:
    "AI Engineer & Python Developer specializing in Machine Learning, Computer Vision, and Backend Systems.",
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">
        <div className="crt-overlay" />
        {children}
      </body>
    </html>
  );
}
