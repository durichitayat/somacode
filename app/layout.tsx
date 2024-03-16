import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import AdminSidebar from "./components/AdminSidebar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Clue-less Game",
  description: "SomaCode's Clue-less Game",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        
        <AdminSidebar />

        <main className="sm:ml-48">
          {children}
        </main>
        
        </body>
    </html>
  );
}
