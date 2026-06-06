import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { NotificationProvider } from "@/components/Notification";

export const metadata: Metadata = {
  title: "SaaS Skafold",
  description:
    "Open-source SaaS starter with a Next.js frontend, NestJS API, and shared UI packages.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className="bg-primary-50 text-primary-900 dark:bg-primary-900 dark:text-primary-50"
        style={
          {
            "--font-heading":
              'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
            "--font-sans":
              'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
            "--font-mono":
              'ui-monospace, "SFMono-Regular", Menlo, Monaco, Consolas, monospace',
          } as React.CSSProperties
        }
      >
        <NotificationProvider>
          <AuthProvider>{children}</AuthProvider>
        </NotificationProvider>
      </body>
    </html>
  );
}
