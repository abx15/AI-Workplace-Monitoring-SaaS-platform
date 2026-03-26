import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";
import HydrationFix from "@/components/HydrationFix";

const inter = Inter({ 
  subsets: ["latin"],
  display: 'swap',
});

export const metadata: Metadata = {
  title: "AI Workplace Monitor",
  description: "Advanced Workplace Monitoring & AI Analytics",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-background text-text-primary antialiased`}>
        <HydrationFix>
          <Providers>
            {children}
          </Providers>
        </HydrationFix>
      </body>
    </html>
  );
}
