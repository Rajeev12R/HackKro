import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About HackKro – Empowering Tech Innovators",
  description:
    "HackKro is India’s premier opportunity and innovation platform built to empower the next generation of hackers, developers, and problem-solvers across the nation.",
  generator: "HackKro",
  icons: {
    icon: "https://res.cloudinary.com/payb7fsq/image/upload/v1791981789/Hack_Kro_Logo.png",
  },
  openGraph: {
    title: "About HackKro",
    description:
      "HackKro is India’s premier opportunity and innovation platform built to empower the next generation of hackers, developers, and problem-solvers across the nation.",
    url: "https://hackkro.com/about",
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
    title: "About HackKro",
    description:
      "HackKro is India’s premier opportunity and innovation platform built to empower the next generation of hackers, developers, and problem-solvers across the nation.",
    images: [
      "https://res.cloudinary.com/payb7fsq/image/upload/v1791981789/Hack_Kro_Logo.png",
    ],
  },
  keywords: [
    "HackKro",
    "HackKro hackathons",
    "coding contests India",
    "student developers platform",
    "hackathon platform India",
    "tech innovation platform",
    "student entrepreneurs",
    "startup incubator India",
    "hackathon organizing platform",
    "coding bootcamps India",
  ],
};

export default function AboutPage() {
  return (
    <div className="space-y-16 py-16">
      {/* Hero Section */}
      <section className="container">
        <div className="grid gap-8 md:grid-cols-2 md:items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">About HackKro</h1>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              HackKro is India’s premier opportunity and innovation platform built to empower the next generation of hackers, developers, and problem-solvers across the nation.
            </p>
            <div className="mt-8">
              <Button asChild className="bg-blue-600 hover:bg-blue-700">
                <Link href="/contact">Get in Touch</Link>
              </Button>
            </div>
          </div>
          <div className="relative h-72 md:h-96 w-full rounded-xl overflow-hidden shadow-lg">
            <Image
              src="https://res.cloudinary.com/payb7fsq/image/upload/v1792430791/WhatsApp_Image_2026-10-19_at_22.55.23.jpg"
              alt="HackKro Community and Hackathons"
              fill
              className="object-cover"
              priority
            />
          </div>
        </div>
      </section>
      
      {/* What is HackKro Section */}
      <section className="bg-blue-50/50 dark:bg-blue-950/20 py-16 border-y border-blue-100 dark:border-blue-900/40">
        <div className="container">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">What is HackKro?</h2>
            <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
              Understanding the Platform, Vision and Our Mission
            </p>
          </div>
          <div className="grid gap-10 md:grid-cols-2 md:items-center">
            <div className="order-2 md:order-1 space-y-4 text-muted-foreground leading-relaxed">
              <p>
                HackKro is a nationwide innovation and engagement platform dedicated to democratizing opportunities for students, developers, and creators. We believe that talent is evenly distributed across campuses, but access to top-tier competitions, mentorship, and career pathways is not.
              </p>
              <p>
                Our mission is to build a borderless ecosystem where innovators—regardless of their college tier or location—can build real-world projects, compete in high-impact hackathons, and get discovered by top tech companies, startups, and investors.
              </p>
              <p>
                Through national hackathons, coding sprints, open-source initiatives, and hiring challenges, we equip builders with the tools, cloud resources, and industry networks needed to turn ideas into scalable technology and viable startups.
              </p>
            </div>
            <div className="order-1 md:order-2 relative h-80 md:h-[350px] w-full rounded-xl overflow-hidden shadow-lg">
              <Image
                src="https://res.cloudinary.com/payb7fsq/image/upload/v1792483697/WhatsApp_Image_2026-10-20_at_13.31.53.jpg"
                alt="HackKro Developers & Event Participants"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose HackKro Section */}
      <section className="container">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">Why Choose HackKro?</h2>
          <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
            Benefits and Opportunities for Innovators and Student Builders
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <Card className="border border-blue-100 dark:border-blue-950 shadow-sm hover:shadow-md transition-all">
            <CardContent className="p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/20">
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
                  className="h-6 w-6"
                >
                  <path d="M5 5.5A3.5 3.5 0 0 1 8.5 2H12v7H8.5A3.5 3.5 0 0 1 5 5.5z"></path>
                  <path d="M12 2h3.5a3.5 3.5 0 1 1 0 7H12V2z"></path>
                  <path d="M12 12.5a3.5 3.5 0 1 1 7 0 3.5 3.5 0 1 1-7 0z"></path>
                  <path d="M5 19.5A3.5 3.5 0 0 1 8.5 16H12v3.5a3.5 3.5 0 1 1-7 0z"></path>
                  <path d="M5 12.5A3.5 3.5 0 0 1 8.5 9H12v7H8.5A3.5 3.5 0 0 1 5 12.5z"></path>
                </svg>
              </div>
              <h3 className="mb-2 text-xl font-semibold">Nationwide Networking</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Connect with brilliant co-founders, developers, UI/UX designers, and industry experts from leading institutes across the country.
              </p>
            </CardContent>
          </Card>

          <Card className="border border-blue-100 dark:border-blue-950 shadow-sm hover:shadow-md transition-all">
            <CardContent className="p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/20">
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
                  className="h-6 w-6"
                >
                  <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                  <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
                </svg>
              </div>
              <h3 className="mb-2 text-xl font-semibold">Hands-On Skill Mastery</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Participate in national hackathons, tech bootcamps, and coding sprints to master production-grade tech stacks and modern DevOps workflows.
              </p>
            </CardContent>
          </Card>

          <Card className="border border-blue-100 dark:border-blue-950 shadow-sm hover:shadow-md transition-all">
            <CardContent className="p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/20">
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
                  className="h-6 w-6"
                >
                  <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
                  <path d="M14 2v6h6"></path>
                  <path d="M9 16a2 2 0 0 1 2-2h2a2 2 0 1 1 0 4h-2a2 2 0 0 1-2-2z"></path>
                  <path d="M12 20v-8"></path>
                </svg>
              </div>
              <h3 className="mb-2 text-xl font-semibold">Grants & Cloud Credits</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Gain access to developer APIs, cloud hosting credits, prize pools, seed grants, and incubation support for top-performing projects.
              </p>
            </CardContent>
          </Card>

          <Card className="border border-blue-100 dark:border-blue-950 shadow-sm hover:shadow-md transition-all">
            <CardContent className="p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/20">
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
                  className="h-6 w-6"
                >
                  <path d="M2 4v16"></path>
                  <path d="M2 8h18a2 2 0 0 1 2 2v10"></path>
                  <path d="M2 17h12"></path>
                  <path d="M8 22 2 17l6-5"></path>
                </svg>
              </div>
              <h3 className="mb-2 text-xl font-semibold">Direct Recruiter Access</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Fast-track your tech career through skill-based hiring drives and corporate challenge Leaderboards that value your code over static resumes.
              </p>
            </CardContent>
          </Card>

          <Card className="border border-blue-100 dark:border-blue-950 shadow-sm hover:shadow-md transition-all">
            <CardContent className="p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/20">
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
                  className="h-6 w-6"
                >
                  <path d="M16 16v1a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2"></path>
                  <path d="M8 15H7a2 2 0 0 1-2-2v-2a2 2 0 0 1 2-2h1"></path>
                  <path d="M15 11h5a2 2 0 1 1 0 4h-5"></path>
                  <path d="M16 5h5a2 2 0 1 1 0 4h-5"></path>
                  <path d="M15 5v16"></path>
                </svg>
              </div>
              <h3 className="mb-2 text-xl font-semibold">Developer Ecosystem</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Utilize HackKro’s platform infrastructure to build, collaborate, deploy MVPs, and receive automated peer and jury evaluations.
              </p>
            </CardContent>
          </Card>

          <Card className="border border-blue-100 dark:border-blue-950 shadow-sm hover:shadow-md transition-all">
            <CardContent className="p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/20">
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
                  className="h-6 w-6"
                >
                  <path d="m8 3 4 8 5-5 5 15H2L8 3z"></path>
                </svg>
              </div>
              <h3 className="mb-2 text-xl font-semibold">National Recognition</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Build a verified public developer profile, climb the HackKro Leaderboard, and gain showcase visibility across the developer community.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Common Problems and Solutions */}
      <section className="bg-blue-50/50 dark:bg-blue-950/20 py-16 border-y border-blue-100 dark:border-blue-900/40">
        <div className="container">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">Common Problems & Solutions</h2>
            <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
              Addressing the Challenges Faced by Student Developers & Organizers
            </p>
          </div>
          <Tabs defaultValue="problem1" className="mx-auto max-w-4xl">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 h-auto p-1 bg-blue-100/60 dark:bg-blue-950/40">
              <TabsTrigger value="problem1" className="py-2.5">Project Validation</TabsTrigger>
              <TabsTrigger value="problem2" className="py-2.5">Tech & Mentorship</TabsTrigger>
              <TabsTrigger value="problem3" className="py-2.5">Time & Resources</TabsTrigger>
              <TabsTrigger value="problem4" className="py-2.5">Recruiter Access</TabsTrigger>
            </TabsList>
            <TabsContent value="problem1" className="mt-6 space-y-4">
              <div className="rounded-xl bg-background p-6 shadow-sm border border-border">
                <h3 className="text-xl font-semibold">Project Validation</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  Students often build projects without knowing if the architecture, business logic, or real-world application holds value.
                </p>
                <div className="mt-4 rounded-lg bg-blue-50 dark:bg-blue-950/20 p-4 border border-blue-100 dark:border-blue-900/40">
                  <h4 className="font-semibold text-blue-600 dark:text-blue-400 text-sm">HackKro's Solution:</h4>
                  <ul className="mt-2 list-disc pl-5 text-sm text-muted-foreground space-y-1">
                    <li>Live prototype feedback and jury reviews from senior software engineers</li>
                    <li>Community pitch nights and product teardown sessions</li>
                    <li>User testing frameworks and market deployment guidance</li>
                    <li>Hackathon mentor office hours during competitions</li>
                  </ul>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="problem2" className="mt-6 space-y-4">
              <div className="rounded-xl bg-background p-6 shadow-sm border border-border">
                <h3 className="text-xl font-semibold">Tech Stack & Mentorship</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  Beginners struggle to implement advanced APIs, Web3, AI models, or cloud deployments due to a lack of guidance.
                </p>
                <div className="mt-4 rounded-lg bg-blue-50 dark:bg-blue-950/20 p-4 border border-blue-100 dark:border-blue-900/40">
                  <h4 className="font-semibold text-blue-600 dark:text-blue-400 text-sm">HackKro's Solution:</h4>
                  <ul className="mt-2 list-disc pl-5 text-sm text-muted-foreground space-y-1">
                    <li>Expert-led workshops and hands-on developer starter kits</li>
                    <li>On-demand 1:1 mentor support during live hackathons</li>
                    <li>Free access to partner API keys, cloud credits, and dev tools</li>
                  </ul>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="problem3" className="mt-6 space-y-4">
              <div className="rounded-xl bg-background p-6 shadow-sm border border-border">
                <h3 className="text-xl font-semibold">Time & Resource Limits</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  Student teams find it difficult to rapidly prototype and ship functional MVPs under strict deadlines.
                </p>
                <div className="mt-4 rounded-lg bg-blue-50 dark:bg-blue-950/20 p-4 border border-blue-100 dark:border-blue-900/40">
                  <h4 className="font-semibold text-blue-600 dark:text-blue-400 text-sm">HackKro's Solution:</h4>
                  <ul className="mt-2 list-disc pl-5 text-sm text-muted-foreground space-y-1">
                    <li>Structured national hackathon sprint frameworks</li>
                    <li>Access to pre-built starter templates and boilerplates</li>
                    <li>Automated build, deployment, and submission pipelines</li>
                  </ul>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="problem4" className="mt-6 space-y-4">
              <div className="rounded-xl bg-background p-6 shadow-sm border border-border">
                <h3 className="text-xl font-semibold">Industry & Recruiter Access</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  Talented developers in tier-2 and tier-3 colleges are often overlooked by traditional campus placement drives.
                </p>
                <div className="mt-4 rounded-lg bg-blue-50 dark:bg-blue-950/20 p-4 border border-blue-100 dark:border-blue-900/40">
                  <h4 className="font-semibold text-blue-600 dark:text-blue-400 text-sm">HackKro's Solution:</h4>
                  <ul className="mt-2 list-disc pl-5 text-sm text-muted-foreground space-y-1">
                    <li>Resume-free hiring directly tied to hackathon leaderboards and GitHub repositories</li>
                    <li>Direct interview fast-tracks with partner startups and MNCs</li>
                    <li>Paid internship, freelance, and open-source grant matching</li>
                  </ul>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </div>
  )
}
