import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "dipSchedule",
  description: "Konverter cerdas untuk Dips: Ubah PDF jadwal UTS dan UAS menjadi tabel rapi dan terurut dalam hitungan detik.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn("h-full", "antialiased", geistSans.variable, geistMono.variable)}
    >
      <body className="min-h-full flex flex-col font-sans">
        {children}
        <Toaster position="bottom-right" richColors theme="light" />
      </body>
    </html>
  );
}