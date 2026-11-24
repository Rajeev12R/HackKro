import type { Metadata, Viewport } from "next"
import { HostContent } from "./HostContent"

export const viewport: Viewport = {
  themeColor: "#004aad",
}

export const metadata: Metadata = {
  title: "Host Hackathons, Hiring Sprints & Coding Contests | HackKro For Organizations",
  description:
    "Launch national level hackathons, hiring challenges, and tech contests with HackKro. Custom microsites, automated evaluation tools, and access to 100,000+ developers.",
  keywords:
    "host hackathon, corporate hiring challenge, college tech fest, HackKro host, coding contest platform, automated judging, campus ambassadors",
  openGraph: {
    title: "Host Hackathons & Tech Challenges | HackKro Host Portal",
    description:
      "Launch high-impact hackathons and talent evaluation sprints with HackKro's complete hosting ecosystem.",
    url: "https://hackkro.com/blog",
    siteName: "HackKro Platform",
    images: [
      {
        url: "https://res.cloudinary.com/payb7fsq/image/upload/v1792430791/WhatsApp_Image_2026-10-19_at_22.55.24.jpg",
        width: 1200,
        height: 630,
        alt: "HackKro For Organizations Banner",
        type: "image/jpeg",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Host Hackathons & Hiring Challenges | HackKro",
    description:
      "Scale your campus or corporate hackathon with automated judging and 100K+ developer reach.",
    images: ["https://res.cloudinary.com/payb7fsq/image/upload/v1792430791/WhatsApp_Image_2026-10-19_at_22.55.24.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  category: "Technology & Events",
  authors: [{ name: "HackKro Team", url: "https://hackkro.com" }],
  publisher: "HackKro Platform",
  alternates: {
    canonical: "https://hackkro.com/blog",
  },
}

export default function HostPage() {
  return <HostContent />
}
