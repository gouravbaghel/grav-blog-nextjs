// Root layout with providers, metadata, header, and footer
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { AuthProvider } from "@/components/providers/auth-provider";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: {
    default: "GravBlog — Modern Blog Platform",
    template: "%s | GravBlog",
  },
  description:
    "A modern, developer-friendly blog platform built with Next.js. Discover articles on technology, design, development, and more.",
  keywords: ["blog", "technology", "development", "design", "tutorials", "programming"],
  authors: [{ name: "GravBlog" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: process.env.NEXT_PUBLIC_APP_URL,
    siteName: "GravBlog",
    title: "GravBlog — Modern Blog Platform",
    description: "A modern, developer-friendly blog platform built with Next.js.",
  },
  twitter: {
    card: "summary_large_image",
    title: "GravBlog — Modern Blog Platform",
    description: "A modern, developer-friendly blog platform built with Next.js.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <AuthProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <div className="relative flex min-h-screen flex-col">
              <Header />
              <main className="flex-1">{children}</main>
              <Footer />
            </div>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
