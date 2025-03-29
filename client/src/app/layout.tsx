import { Header } from "@/components/Header";
import type { Metadata } from "next";
import { SessionProvider } from "next-auth/react";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Recime",
  description: "Save and organize your favorite recipes from Instagram",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased h-full`}>
        <SessionProvider>
          <div className="flex min-h-full flex-col">
            <Header />
            <main className="flex flex-1 flex-col">
              <div className="flex flex-1 flex-col container max-w-4xl mx-auto px-4">
                {children}
              </div>
            </main>
          </div>
        </SessionProvider>
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}