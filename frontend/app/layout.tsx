import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-dm-sans",
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
        className={`${dmSans.variable} font-sans antialiased overflow-x-hidden`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
