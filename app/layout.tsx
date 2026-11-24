import type { ReactNode } from "react";
import type { Metadata } from "next";
import Script from "next/script";
import ClientRootLayout from "./client";
import { GA_TRACKING_ID } from "../lib/gtag";

// Metadata for SEO and Social Sharing
export const metadata: Metadata = {
  title: "HackKro – India's Premier Hackathon & Opportunity Platform",
  description:
    "Discover national hackathons, coding challenges, hiring drives, and case competitions. Connect developers, innovators, and universities with top recruiters on HackKro.",
  generator: "HackKro",
  icons: {
    icon: "https://res.cloudinary.com/payb7fsq/image/upload/v1791981789/Hack_Kro_Logo.png",
  },
  openGraph: {
    title: "HackKro – The Engine for Next-Gen Hackers & Recruiters",
    description:
      "Compete in national hackathons, build production-ready projects, and get discovered by top tech companies on HackKro.",
    url: "https://hackkro.com",
    siteName: "HackKro",
    images: [
      {
        url: "https://res.cloudinary.com/payb7fsq/image/upload/v1791981789/Hack_Kro_Logo.png",
        width: 800,
        height: 600,
        alt: "HackKro Logo",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "HackKro – National Hackathon & Career Platform",
    description: "Build MVPs, compete in national tech challenges, and unlock top tech jobs with HackKro.",
    images: ["https://res.cloudinary.com/payb7fsq/image/upload/v1791981789/Hack_Kro_Logo.png"],
  },
  keywords: [
    "HackKro",
    "hackathons in India",
    "national hackathons 2026",
    "coding challenges",
    "hiring hackathons",
    "Unstop alternative",
    "campus competitions",
    "case study competitions",
    "student developer community",
    "tech hiring drives",
    "build MVPs",
    "open source grants",
    "tech internships",
    "developer portfolio",
    "pitch competitions",
    "cloud credits for startups",
    "campus ambassador program",
    "host hackathon online",
    "web3 hackathons",
    "AI hackathons India",
    "competitive coding",
    "CTF competitions",
    "college tech fests",
    "recruiter portal",
    "proof of work profile",
    "startup incubator",
    "tech grants India",
    "innovation platform",
    "hackathon leaderboards",
    "skill based hiring",
  ],
};

// Root Layout Component
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Google Analytics Scripts */}
        {GA_TRACKING_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_TRACKING_ID}', {
                  page_path: window.location.pathname,
                });
              `}
            </Script>
          </>
        )}
      </head>
      <body>
        <ClientRootLayout>
          {children}
        </ClientRootLayout>
      </body>
    </html>
  );
}
