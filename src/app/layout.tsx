import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Auth0Provider } from "@auth0/nextjs-auth0/client";
import { Inter, Space_Grotesk } from "next/font/google";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-headline",
});

export const metadata: Metadata = {
  title: "FocusFlow",
  description:
    "Organize your life, finances, and job search to achieve your goals.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${spaceGrotesk.variable} font-sans antialiased`}
      >
        <Auth0Provider>{children}</Auth0Provider>
        <Toaster />
      </body>
    </html>
  );
}
