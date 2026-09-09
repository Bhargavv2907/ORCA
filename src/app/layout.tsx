import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/layout/Sidebar";
import { BottomNav } from "@/components/layout/BottomNav";
import { AuthProvider } from "@/context/AuthContext";
import { OfflineIndicator } from "@/components/cards";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "ORCA — The Ocean Helper | AI-Powered Marine Intelligence & RAG Engine",
  description:
    "ORCA is an AI-powered PWA marine intelligence platform helping fishermen understand the sea, find promising fishing zones, plan safer routes, and make better decisions. Real-time ISRO MOSDAC satellite integration with Firebase persistence.",
  keywords: [
    "marine intelligence",
    "fishing",
    "ocean conditions",
    "sea weather",
    "safe routes",
    "AI fishing assistant",
    "RAG marine AI",
    "ISRO MOSDAC",
  ],
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#030712",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${jetbrainsMono.variable} antialiased bg-navy-950 text-foreground min-h-screen`}>
        <AuthProvider>
          <OfflineIndicator />
          <Sidebar />
          <main className="lg:pl-[240px] pt-14 lg:pt-0 pb-16 lg:pb-0 min-h-screen">
            {children}
          </main>
          <BottomNav />
        </AuthProvider>
      </body>
    </html>
  );
}
