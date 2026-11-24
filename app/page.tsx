"use client"

import Mission from "@/components/page/Mission"
import Supporters from "@/components/page/Supporters"
import Social from "@/components/page/Social"
import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ChevronLeft, ChevronRight } from "lucide-react"
import "@/lib/fontawesome"

// Carousel data
const carouselItems = [
  {
    id: 2,
    title: "India’s Premier Opportunity & Innovation Platform",
    description: "Connecting ambitious students, developers, and creators with top hackathons, hiring challenges, and industry opportunities across the nation.",
    image: "https://res.cloudinary.com/payb7fsq/image/upload/v1791982756/WhatsApp_Image_2026-10-14_at_6.28.02_PM.jpg",
    image_mobile: "https://res.cloudinary.com/payb7fsq/image/upload/v1791982756/WhatsApp_Image_2026-10-14_at_6.28.02_PM.jpg",
    primaryButton: { text: "Explore Opportunities", href: "/gallery" },
    secondaryButton: { text: "Host an Event", href: "/blog" },
  },
  {
    id: 3,
    title: "Unleash Your Potential on a National Stage",
    description: "Participate in high-impact hackathons, showcase your projects, and accelerate your tech career with HackKro.",
    image: "https://res.cloudinary.com/payb7fsq/image/upload/v1791982756/WhatsApp_Image_2026-10-14_at_6.28.03_P.jpg",
    image_mobile: "https://res.cloudinary.com/payb7fsq/image/upload/v1791982756/WhatsApp_Image_2026-10-14_at_6.28.02_PM.jpg",
    primaryButton: { text: "Browse Oppoertunity", href: "/gallery" },
    secondaryButton: { text: "Join Now", href: "https://forms.gle/7XjA616BMMAzRiBh9" },
  },
  {
    id: 4,
    title: "Build. Compete. Get Discovered.",
    description: "The ultimate ecosystem for students, colleges, and companies to innovate and collaborate at scale.",
    image: "https://res.cloudinary.com/payb7fsq/image/upload/v1791982756/WhatsApp_Image_2026-10-14_at_6.28.02.jpg",
    image_mobile: "https://res.cloudinary.com/payb7fsq/image/upload/v1791982756/WhatsApp_Image_2026-10-14_at_6.28.02_PM.jpg",
    primaryButton: { text: "Learn More", href: "/about" },
    secondaryButton: { text: "Campus Ambassadors", href: "/team" },
  },
]

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkScreenSize()
    window.addEventListener("resize", checkScreenSize)
    return () => window.removeEventListener("resize", checkScreenSize)
  }, [])

  // Auto-advance slides
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselItems.length)
    }, 10000)

    return () => clearInterval(interval)
  }, [])

  const goToSlide = (index: number) => {
    setCurrentSlide(index)
  }

  const goToPrev = () => {
    setCurrentSlide((prev) => (prev - 1 + carouselItems.length) % carouselItems.length)
  }

  const goToNext = () => {
    setCurrentSlide((prev) => (prev + 1) % carouselItems.length)
  }

  return (
    <div className="space-y-20 pb-20">
      {/* Hero Carousel */}
      <div className="relative w-full">
        <div className="relative h-[100vh] w-full overflow-hidden">
          {carouselItems.map((item, index) => {
            const imageSrc = isMobile && item.image_mobile ? item.image_mobile : item.image || "/placeholder.svg"

            return (
              <div
                key={item.id}
                className={`absolute inset-0 transition-opacity duration-1000 ${
                  index === currentSlide ? "opacity-100" : "opacity-0 pointer-events-none"
                }`}
              >
                <Image
                  src={imageSrc}
                  alt={`Slide ${index + 1}`}
                  fill
                  style={{ objectFit: "cover" }}
                  quality={100}
                  className="brightness-50"
                  priority={index === 0}
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center text-white">
                  <h1 className="max-w-4xl text-4xl font-bold leading-tight md:text-5xl lg:text-6xl drop-shadow-md">
                    {item.title}
                  </h1>
                  <p className="mx-auto mt-4 max-w-2xl text-lg md:text-xl drop-shadow-sm">
                    {item.description}
                  </p>
                  <div className="mt-8 flex flex-wrap justify-center gap-4">
                    <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-6 rounded-full shadow-lg">
                      <Link href={item.primaryButton.href}>{item.primaryButton.text}</Link>
                    </Button>
                    <Button
                      asChild
                      variant="outline"
                      className="border-white text-white hover:bg-white/20 font-semibold px-6 py-6 rounded-full backdrop-blur-sm"
                    >
                      <Link href={item.secondaryButton.href} target={item.secondaryButton.href.startsWith("http") ? "_blank" : undefined} rel={item.secondaryButton.href.startsWith("http") ? "noopener noreferrer" : undefined}>
                        {item.secondaryButton.text}
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Navigation buttons */}
        <Button
          variant="outline"
          size="icon"
          className="absolute left-4 top-1/2 z-10 h-10 w-10 -translate-y-1/2 rounded-full border-white bg-white/20 text-white backdrop-blur-sm hover:bg-white/40"
          onClick={goToPrev}
          aria-label="Previous slide"
        >
          <ChevronLeft className="h-6 w-6" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="absolute right-4 top-1/2 z-10 h-10 w-10 -translate-y-1/2 rounded-full border-white bg-white/20 text-white backdrop-blur-sm hover:bg-white/40"
          onClick={goToNext}
          aria-label="Next slide"
        >
          <ChevronRight className="h-6 w-6" />
        </Button>

        {/* Dots indicator */}
        <div className="absolute bottom-6 left-0 right-0 flex justify-center space-x-2">
          {carouselItems.map((_, index) => (
            <button
              key={index}
              className={`h-2.5 rounded-full transition-all ${
                index === currentSlide ? "bg-white w-6" : "bg-white/50 w-2.5"
              }`}
              onClick={() => goToSlide(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Mission and Innovation */}
      <Mission />

      {/* Social Impact */}
      <Social />

      {/* Our Supporters */}
      <Supporters />

      {/* Goals and Core Pillars of HackKro */}
      <section className="bg-gradient-to-r from-blue-50 to-white dark:from-blue-950/20 dark:to-background py-16">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-800">
              Goals and Core Pillars of HackKro
            </h2>
            <div className="w-24 h-1 bg-blue-600 mx-auto mt-4 rounded-full"></div>
            <p className="mx-auto mt-4 max-w-3xl text-muted-foreground">
              Driving innovation, empowering student developers, and building a robust tech ecosystem across India.
            </p>
          </div>
          <div className="mt-12 grid gap-8 md:grid-cols-2">
            <Card className="overflow-hidden transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
              <CardContent className="p-8">
                <h3 className="mb-6 text-2xl font-semibold text-blue-600 flex items-center">
                  <div className="mr-3 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/20">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-5 w-5"
                    >
                      <path d="M12 2v4M3 6l3 3M2 12h4M3 18l3-3M12 22v-4M21 6l-3 3M22 12h-4M21 18l-3-3"></path>
                    </svg>
                  </div>
                  Core Goals of HackKro
                </h3>
                <ul className="space-y-6">
                  <li className="flex items-start">
                    <div className="mr-4 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/20 shadow-sm">
                      <span className="font-bold">1</span>
                    </div>
                    <div>
                      <p className="font-medium text-lg">Democratize Opportunities</p>
                      <p className="text-muted-foreground text-sm">
                        Give students from any tier college equal access to national hackathons, grants, and top hiring drives.
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <div className="mr-4 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/20 shadow-sm">
                      <span className="font-bold">2</span>
                    </div>
                    <div>
                      <p className="font-medium text-lg">Fuel the Hacker Culture</p>
                      <p className="text-muted-foreground text-sm">
                        Encourage hands-on building, rapid prototyping, and open-source collaboration among student developers.
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <div className="mr-4 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/20 shadow-sm">
                      <span className="font-bold">3</span>
                    </div>
                    <div>
                      <p className="font-medium text-lg">Bridge Industry-Academia Gap</p>
                      <p className="text-muted-foreground text-sm">
                        Provide recruiters with real talent metrics based on actual project output rather than static resumes.
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <div className="mr-4 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/20 shadow-sm">
                      <span className="font-bold">4</span>
                    </div>
                    <div>
                      <p className="font-medium text-lg">Scale Student Innovation</p>
                      <p className="text-muted-foreground text-sm">
                        Enable college clubs and organizers to launch, manage, and scale tech competitions with zero friction.
                      </p>
                    </div>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="overflow-hidden transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
              <CardContent className="p-8">
                <h3 className="mb-6 text-2xl font-semibold text-blue-600 flex items-center">
                  <div className="mr-3 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/20">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-5 w-5"
                    >
                      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
                    </svg>
                  </div>
                  Key Offerings & Objectives
                </h3>
                <ul className="space-y-6">
                  <li className="flex items-start">
                    <div className="mr-4 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/20 shadow-sm">
                      <span className="font-bold">1</span>
                    </div>
                    <div>
                      <p className="font-medium text-lg">Host Seamless Competitions</p>
                      <p className="text-muted-foreground text-sm">
                        End-to-end hosting suites for hackathons, coding contests, quiz series, and case studies.
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <div className="mr-4 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/20 shadow-sm">
                      <span className="font-bold">2</span>
                    </div>
                    <div>
                      <p className="font-medium text-lg">Empower Student Organizers</p>
                      <p className="text-muted-foreground text-sm">
                        Provide colleges and clubs with powerful dashboard tools, submission tracking, and registration management.
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <div className="mr-4 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/20 shadow-sm">
                      <span className="font-bold">3</span>
                    </div>
                    <div>
                      <p className="font-medium text-lg">Connect Talent with Recruiters</p>
                      <p className="text-muted-foreground text-sm">
                        Enable companies to conduct hiring challenges, bug bounties, and skill-based technical assessments.
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <div className="mr-4 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/20 shadow-sm">
                      <span className="font-bold">4</span>
                    </div>
                    <div>
                      <p className="font-medium text-lg">Offer Growth Resources</p>
                      <p className="text-muted-foreground text-sm">
                        Provide cloud credits, API access, developer tools, and expert-led mentorship tracks.
                      </p>
                    </div>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
      
      {/* Impact of HackKro on Students & Innovators */}
      <section className="container py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-800">
            Impact of HackKro on Students & Innovators
          </h2>
          <div className="w-24 h-1 bg-blue-600 mx-auto mt-4 rounded-full"></div>
          <p className="mx-auto mt-4 max-w-3xl text-muted-foreground">
            Empowering the next generation of builders with practical skills, leadership, and real-world exposure.
          </p>
        </div>
        <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <Card className="overflow-hidden transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-t-4 border-t-blue-600">
            <CardContent className="p-6">
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/20 mx-auto shadow-md">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-8 w-8"
                >
                  <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                  <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
                </svg>
              </div>
              <h3 className="mb-4 text-xl font-semibold text-center">Skill & Capability</h3>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex flex-col">
                  <span className="font-semibold text-blue-600">Production-Ready Coding</span>
                  <span>Shift from theoretical learning to shipping real MVPs.</span>
                </li>
                <li className="flex flex-col">
                  <span className="font-semibold text-blue-600">Leadership & Teamwork</span>
                  <span>Coordinate, delegate, and manage team projects effectively.</span>
                </li>
                <li className="flex flex-col">
                  <span className="font-semibold text-blue-600">Communication Skills</span>
                  <span>Pitch ideas, present plans, and network with confidence.</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="overflow-hidden transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-t-4 border-t-blue-600">
            <CardContent className="p-6">
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/20 mx-auto shadow-md">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-8 w-8"
                >
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="2" y1="12" x2="22" y2="12"></line>
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                </svg>
              </div>
              <h3 className="mb-4 text-xl font-semibold text-center">Real-World Exposure</h3>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex flex-col">
                  <span className="font-semibold text-blue-600">Startup Insights</span>
                  <span>Gain exposure to how startups work from ideation to scale.</span>
                </li>
                <li className="flex flex-col">
                  <span className="font-semibold text-blue-600">Expert Interaction</span>
                  <span>Learn directly from founders, investors, and mentors.</span>
                </li>
                <li className="flex flex-col">
                  <span className="font-semibold text-blue-600">Resilience Building</span>
                  <span>Overcome technical roadblocks and learn from setbacks.</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="overflow-hidden transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-t-4 border-t-blue-600">
            <CardContent className="p-6">
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/20 mx-auto shadow-md">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-8 w-8"
                >
                  <line x1="12" y1="20" x2="12" y2="10"></line>
                  <line x1="18" y1="20" x2="18" y2="4"></line>
                  <line x1="6" y1="20" x2="6" y2="16"></line>
                </svg>
              </div>
              <h3 className="mb-4 text-xl font-semibold text-center">Career Enhancement</h3>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex flex-col">
                  <span className="font-semibold text-blue-600">Venture Launch</span>
                  <span>Motivates student innovators to launch their own startups.</span>
                </li>
                <li className="flex flex-col">
                  <span className="font-semibold text-blue-600">Stronger Employability</span>
                  <span>Hackathon achievements stand out on resumes and interviews.</span>
                </li>
                <li className="flex flex-col">
                  <span className="font-semibold text-blue-600">Direct Internships</span>
                  <span>Unlock opportunities to work with high-growth tech firms.</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="overflow-hidden transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-t-4 border-t-blue-600">
            <CardContent className="p-6">
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/20 mx-auto shadow-md">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-8 w-8"
                >
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              </div>
              <h3 className="mb-4 text-xl font-semibold text-center">Personal Growth</h3>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex flex-col">
                  <span className="font-semibold text-blue-600">Self-Motivation</span>
                  <span>Encourages independent thinking and initiative-taking.</span>
                </li>
                <li className="flex flex-col">
                  <span className="font-semibold text-blue-600">Peer Network</span>
                  <span>Build strong professional relationships with fellow builders.</span>
                </li>
                <li className="flex flex-col">
                  <span className="font-semibold text-blue-600">Ownership Mindset</span>
                  <span>Develop accountability and swift decision-making skills.</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}
