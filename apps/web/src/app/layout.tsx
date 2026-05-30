import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AppLayout } from "@/components/layout/AppLayout";
import { getSession } from "@/lib/auth";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "EduOS VPS Zalo AI",
  description: "All-in-One Operations & AI Assistant",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getSession();

  return (
    <html lang="vi">
      <body className={inter.className}>
        <AppLayout session={session}>{children}</AppLayout>
      </body>
    </html>
  );
}
