import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "HackKro Online Assessment Portal",
  description: "Official HackKro proctored assessment and technical quiz platform.",
  robots: {
    index: false, // Hidden from search engine crawlers
    follow: false,
  },
}

export default function TestLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-background text-foreground selection:bg-blue-600 selection:text-white">{children}</div>
}
