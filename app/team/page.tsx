"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Award, CheckCircle2, Users, Rocket, Sparkles, ExternalLink } from "lucide-react"

export default function CampusAmbassadorPage() {
  // Yahan apna Google Form ka link daal dein
  const googleFormUrl = "https://forms.gle/9ykQ4WSjrnWtD1UF8"

  return (
    <div className="space-y-16 py-12">
      {/* Hero Banner Section */}
      <section className="relative h-[380px] w-full rounded-2xl overflow-hidden shadow-xl mx-auto container">
        <div className="hidden lg:block h-full w-full">
          <Image
            src="https://res.cloudinary.com/payb7fsq/image/upload/v1792430791/WhatsApp_Image_2026-10-19_at_22.55.24.jpg"
            alt="Campus Ambassadors Banner"
            fill
            className="object-cover brightness-75"
            priority
          />
        </div>
        <div className="block lg:hidden h-full w-full">
          <Image
            src="https://res.cloudinary.com/payb7fsq/image/upload/v1792430791/WhatsApp_Image_2026-10-19_at_22.55.24.jpg"
            alt="Campus Ambassadors Banner Mobile"
            fill
            className="object-cover brightness-75"
            priority
          />
        </div>

        {/* Hero Overlay Text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 py-8 bg-gradient-to-b from-black/80 via-black/60 to-black/80 text-white">
          <span className="px-3.5 py-1.5 bg-blue-600/90 text-xs font-semibold rounded-full mb-3 tracking-wider uppercase backdrop-blur-sm shadow-md">
            HackKro Campus Program
          </span>
          <h1 className="text-4xl font-extrabold tracking-tight md:text-5xl lg:text-6xl drop-shadow-lg mb-4">
            Become a Campus Ambassador
          </h1>
          <p className="text-base md:text-lg text-gray-200 max-w-2xl leading-relaxed drop-shadow-md mb-6">
            Lead the hacker movement at your university. Connect student developers with national hackathons, exclusive bootcamps, and top-tier industry opportunities.
          </p>
          <Button 
            size="lg" 
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-6 rounded-full shadow-lg transition-all transform hover:scale-105"
            asChild
          >
            <a href={googleFormUrl} target="_blank" rel="noopener noreferrer">
              Apply Now <ExternalLink className="ml-2 h-4 w-4" />
            </a>
          </Button>
        </div>
      </section>

      {/* Program Benefits / Perks Section */}
      <section className="container">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl font-bold tracking-tight mb-3">Why Join the Program?</h2>
          <p className="text-muted-foreground">
            As a HackKro Campus Ambassador, you get exclusive access to leadership training, mentorship, and high-value rewards.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card className="border border-blue-100 dark:border-blue-900/40 bg-blue-50/40 dark:bg-blue-950/20 shadow-sm hover:shadow-md transition-all">
            <CardContent className="p-6 text-center flex flex-col items-center">
              <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-4">
                <Rocket className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-xl mb-2">Lead Your Campus</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Be the official face of HackKro at your college. Host workshops, coding sprints, and national-level hackathons right on your campus.
              </p>
            </CardContent>
          </Card>

          <Card className="border border-blue-100 dark:border-blue-900/40 bg-blue-50/40 dark:bg-blue-950/20 shadow-sm hover:shadow-md transition-all">
            <CardContent className="p-6 text-center flex flex-col items-center">
              <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-4">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-xl mb-2">Exclusive Network</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Connect with top student leaders across universities, industry founders, and software engineers for 1:1 mentorship and career guidance.
              </p>
            </CardContent>
          </Card>

          <Card className="border border-blue-100 dark:border-blue-900/40 bg-blue-50/40 dark:bg-blue-950/20 shadow-sm hover:shadow-md transition-all">
            <CardContent className="p-6 text-center flex flex-col items-center">
              <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-4">
                <Award className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-xl mb-2">Perks & Rewards</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Earn official certificates, exclusive HackKro swags, cloud credits, recommendation letters, and fast-track hiring referrals.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Responsibilities Section */}
      <section className="container bg-slate-50 dark:bg-slate-900/40 py-12 px-6 rounded-2xl border border-slate-200 dark:border-slate-800">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold tracking-tight mb-2">What You Will Do</h2>
            <p className="text-muted-foreground">Key responsibilities as a HackKro Campus Ambassador</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {[
              "Promote HackKro hackathons, bootcamps, and coding events within your university.",
              "Build and nurture a vibrant community of student developers and tech enthusiasts.",
              "Coordinate with college tech clubs and faculty to drive student participation.",
              "Share feedback, creative ideas, and growth strategies directly with the HackKro core team."
            ].map((task, index) => (
              <div key={index} className="flex items-start gap-3 bg-white dark:bg-slate-800/60 p-4 rounded-xl border border-slate-100 dark:border-slate-700/50 shadow-sm">
                <CheckCircle2 className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                <span className="text-sm font-medium leading-relaxed">{task}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Google Form Application Call to Action Section */}
      <section className="container text-center max-w-3xl">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl p-8 md:p-12 shadow-xl relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 opacity-10 pointer-events-none">
            <Sparkles className="h-64 w-64" />
          </div>
          
          <h2 className="text-3xl md:text-4xl font-extrabold mb-4">Ready to Lead the Change?</h2>
          <p className="text-blue-100 text-base md:text-lg mb-8 max-w-xl mx-auto leading-relaxed">
            Applications for the batch are now open. Fill out the Google Form below to apply and join our exclusive ambassador community.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button 
              size="lg" 
              className="bg-white text-blue-700 hover:bg-blue-50 font-bold px-8 py-6 rounded-full shadow-lg transition-all transform hover:scale-105 w-full sm:w-auto"
              asChild
            >
              <a href={googleFormUrl} target="_blank" rel="noopener noreferrer">
                Fill Google Form <ExternalLink className="ml-2 h-4 w-4" />
              </a>
            </Button>
          </div>
          
          <p className="text-xs text-blue-200 mt-6">
            Have questions? Reach out to us at <a href="mailto:support@hackkro.com" className="underline font-medium text-white">support@hackkro.com</a>
          </p>
        </div>
      </section>
    </div>
  )
}
