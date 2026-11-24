import type { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { EventList } from "@/components/events/EventList"
import { Trophy, Users, Award, Rocket, ArrowRight } from "lucide-react"

export const metadata: Metadata = {
  title: "Hackathons, Sprints & Events | HackKro",
  description:
    "Discover and register for national-level hackathons, coding sprints, AI challenges, and pitching contests on HackKro. Compete for cash prizes, cloud credits, and startup incubation.",
  keywords: [
    "Hackathons 2026",
    "coding hackathons India",
    "HackKro events",
    "student developer hackathon",
    "college tech competitions",
    "pitching contests",
    "hackathon registration",
  ],
}

export default function EventsPage() {
  return (
    <div className="space-y-16 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-900 via-blue-950 to-background pt-20 pb-16 text-white">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e40af15_1px,transparent_1px),linear-gradient(to_bottom,#1e40af15_1px,transparent_1px)] bg-[size:32px_32px]" />

        <div className="container relative z-10 mx-auto px-4 text-center">
          <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-blue-400/30 bg-blue-500/10 px-4 py-1.5 text-xs font-semibold text-blue-300 backdrop-blur-sm">
            <Rocket className="h-3.5 w-3.5 text-blue-400" />
            <span>Opportunities Hub • HackKro Season 2026</span>
          </div>

          <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl md:text-6xl">
            National Hackathons, Challenges & Sprints
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-base text-blue-100 sm:text-lg">
            Build production-ready code, collaborate in inter-college teams, demo to venture capitalists,
            and fast-track your tech career.
          </p>

          {/* Stats Bar */}
          <div className="mt-12 grid grid-cols-2 gap-4 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md sm:grid-cols-4">
            <div className="border-r border-white/10 last:border-none p-2">
              <div className="flex items-center justify-center gap-2 text-blue-400 mb-1">
                <Trophy className="h-5 w-5" />
              </div>
              <div className="text-2xl font-black text-white sm:text-3xl">₹10,000+</div>
              <div className="text-xs text-blue-200">Active Prize Pool</div>
            </div>

            <div className="border-r border-white/10 last:border-none p-2">
              <div className="flex items-center justify-center gap-2 text-blue-400 mb-1">
                <Users className="h-5 w-5" />
              </div>
              <div className="text-2xl font-black text-white sm:text-3xl">1,000+</div>
              <div className="text-xs text-blue-200">Student Builders</div>
            </div>

            <div className="border-r border-white/10 last:border-none p-2">
              <div className="flex items-center justify-center gap-2 text-blue-400 mb-1">
                <Award className="h-5 w-5" />
              </div>
              <div className="text-2xl font-black text-white sm:text-3xl">10+</div>
              <div className="text-xs text-blue-200">Partner Campuses</div>
            </div>

            <div className="p-2">
              <div className="flex items-center justify-center gap-2 text-blue-400 mb-1">
                <Rocket className="h-5 w-5" />
              </div>
              <div className="text-2xl font-black text-white sm:text-3xl">100% Free</div>
              <div className="text-xs text-blue-200">Open Access Entry</div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Events Section */}
      <section className="container mx-auto px-4">
        <EventList
          title="All Hackathons & Competitions"
          subtitle="Filter by status, participation mode, or search for your favorite domain."
          showFilters={true}
        />
      </section>

      {/* Host with Us Callout */}
      <section className="container mx-auto px-4">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 p-8 text-white md:p-12 shadow-xl">
          <div className="relative z-10 flex flex-col items-center justify-between gap-6 text-center md:flex-row md:text-left">
            <div className="max-w-xl space-y-2">
              <h3 className="text-2xl font-bold sm:text-3xl">Are you a College, Club or Company?</h3>
              <p className="text-sm text-blue-100 sm:text-base">
                Host your hackathon, hiring sprint, or case competition on HackKro with custom registration forms,
                automated judging, and instant reach to 1,000+ developers.
              </p>
            </div>
            <Button
              asChild
              size="lg"
              className="bg-white text-blue-700 hover:bg-blue-50 font-bold px-8 shadow-md"
            >
              <Link href="/blog">
                Host an Event <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
