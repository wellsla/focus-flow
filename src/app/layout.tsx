import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Inter, Space_Grotesk } from "next/font/google";
import Providers from "./providers";
import { Toaster } from "@/components/ui/toaster";
import Script from "next/script";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-headline",
});

export const metadata: Metadata = {
  title: {
    default: "FocusFlow - Your Personal Job Search Command Center",
    template: "%s | FocusFlow",
  },
  description:
    "Track job applications, organize tasks, manage finances, and stay motivated. Your private dashboard for job hunting success—all data stored locally in your browser.",
  keywords: [
    "job search",
    "application tracker",
    "task management",
    "financial planning",
    "productivity dashboard",
    "career development",
  ],
  authors: [{ name: "FocusFlow Team" }],
  creator: "FocusFlow",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://focus-flow-theta-flax.vercel.app",
    title: "FocusFlow - Your Personal Job Search Command Center",
    description:
      "Track job applications, organize tasks, manage finances, and stay motivated. Your private dashboard for job hunting success.",
    siteName: "FocusFlow",
  },
  twitter: {
    card: "summary_large_image",
    title: "FocusFlow - Your Personal Job Search Command Center",
    description:
      "Track job applications, organize tasks, and manage finances in one place.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#D8E2DC" },
    { media: "(prefers-color-scheme: dark)", color: "#293462" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <Script id="theme-init" strategy="beforeInteractive">
        {`
          (function() {
            try {
              var storageKey = 'theme';
              var stored = localStorage.getItem(storageKey);
              var mql = window.matchMedia('(prefers-color-scheme: dark)');
              var system = mql.matches ? 'dark' : 'light';
              var resolved = (stored === 'dark' || stored === 'light') ? stored : system;
              var root = document.documentElement;
              if (resolved === 'dark') root.classList.add('dark');
              else root.classList.remove('dark');
            } catch (e) {}
          })();
        `}
      </Script>
      <body
        className={`${inter.variable} ${spaceGrotesk.variable} font-sans antialiased`}
      >
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
