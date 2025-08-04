import type { Metadata } from "next";
import { Poppins, Noto_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-heading",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const notoSans = Noto_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "SaaS Skaffold Admin Dashboard",
  description: "Modern admin dashboard for SaaS applications",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${poppins.variable} ${notoSans.variable} ${jetbrainsMono.variable} bg-primary-50 dark:bg-primary-900 text-primary-900 dark:text-primary-50`}>
        {children}
      </body>
    </html>
  );
}
