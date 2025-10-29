import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "AI Interview Platform - Smart Hiring Made Simple",
  description: "Revolutionary AI-powered interview platform that helps HR teams screen thousands of candidates efficiently while giving applicants fair opportunities to showcase their skills",
  keywords: ["AI interviews", "hiring platform", "recruitment", "HR technology", "async interviews"],
  authors: [{ name: "AI Interview Platform Team" }],
  openGraph: {
    title: "AI Interview Platform",
    description: "Smart hiring made simple with AI-powered async interviews",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} font-sans antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
