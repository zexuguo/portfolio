import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://portfolio-eta-flame-qgz8fcktoj.vercel.app"),
  title: "Zexu Guo — Portfolio",
  description:
    "Zexu Guo, desarrollador junior en Barcelona (DAM y 42). Aplicaciones web, bases de datos y herramientas para pequeños negocios. Busco prácticas o primer puesto junior en remoto.",
  openGraph: {
    title: "Zexu Guo — Portfolio",
    description:
      "Desarrollador junior: aplicaciones web, bases de datos y herramientas para pequeños negocios. Busco prácticas o primer puesto junior en remoto.",
    siteName: "Portfolio de Zexu Guo",
    locale: "es_ES",
    type: "website",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Portfolio de Zexu Guo, desarrollador junior" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Zexu Guo — Portfolio",
    description:
      "Desarrollador junior: aplicaciones web, bases de datos y herramientas para pequeños negocios.",
    images: ["/og.png"],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <noscript>
          <style>{".build-content{opacity:1!important}.build-skel{display:none!important}"}</style>
        </noscript>
        {children}
      </body>
    </html>
  );
}
