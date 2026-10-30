import type { Metadata, Viewport } from "next";
import { Inter, Space_Grotesk, JetBrains_Mono, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space",
  subsets: ["latin"],
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  variable: "--font-jet",
  subsets: ["latin"],
  display: "swap",
});

// Premium editorial serif — italic accents on headings & eyebrows.
const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  style: ["italic", "normal"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const FAVICON =
  "data:image/svg+xml," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#8b5cf6"/><stop offset="1" stop-color="#d946ef"/></linearGradient></defs><rect width="64" height="64" rx="16" fill="#0d0b14"/><rect x="2" y="2" width="60" height="60" rx="14" fill="none" stroke="url(#g)" stroke-width="3"/><text x="32" y="41" font-family="Arial, sans-serif" font-size="26" font-weight="700" fill="url(#g)" text-anchor="middle">MS</text></svg>`
  );

const SITE_URL = "https://mdsalahuddin.pages.dev";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "MD Salahuddin — Creative Full-Stack Developer",
    template: "%s — MD Salahuddin",
  },
  description:
    "Official portfolio of MD Salahuddin — a creative full-stack developer crafting immersive, high-performance 3D web experiences with Next.js, TypeScript and real-time motion design.",
  keywords: [
    "MD Salahuddin",
    "full-stack developer",
    "creative developer",
    "3D portfolio",
    "Next.js developer",
    "React developer",
    "TypeScript",
    "web design",
    "Dhaka Bangladesh",
  ],
  authors: [{ name: "MD Salahuddin", url: SITE_URL }],
  creator: "MD Salahuddin",
  publisher: "MD Salahuddin",
  applicationName: "MD Salahuddin Portfolio",
  alternates: { canonical: SITE_URL },
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "MD Salahuddin — Official Portfolio",
    title: "MD Salahuddin — Creative Full-Stack Developer",
    description:
      "An immersive 3D portfolio journey through eight floating worlds — projects, skills, experience and services of a creative full-stack developer.",
    locale: "en_US",
    images: [{ url: "/images/avatar.svg", width: 512, height: 512, alt: "MD Salahuddin" }],
  },
  twitter: {
    card: "summary",
    title: "MD Salahuddin — Creative Full-Stack Developer",
    description:
      "Immersive 3D portfolio of a creative full-stack developer — Next.js, TypeScript, WebGL.",
    creator: "@mdsalahuddin",
    images: ["/images/avatar.svg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  icons: { icon: FAVICON },
};

export const viewport: Viewport = {
  themeColor: "#0d0b14",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrains.variable} ${playfair.variable} font-sans antialiased bg-background text-foreground overflow-x-hidden`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
