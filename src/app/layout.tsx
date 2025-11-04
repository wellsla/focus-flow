import type { Metadata } from "next";
import "./globals.css";
import { Inter, Space_Grotesk } from "next/font/google";
import Providers from "./providers";

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
        <Providers>
          {children}
          {/* Temporarily disable global Toaster to rule out update loops */}
          {/* <Toaster /> */}
        </Providers>
      </body>
    </html>
  );
}
