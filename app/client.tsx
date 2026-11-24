"use client"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXTwitter } from "@fortawesome/free-brands-svg-icons"; // this is the new X icon

import type React from "react"
import { SubscribeForm } from "@/components/subscribe-form"
// import { SubscribePopup } from "@/components/subscribe-popup"

import { Inter } from "next/font/google"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ThemeProvider } from "@/components/theme-provider"
import { ModeToggle } from "@/components/mode-toggle"
import { Button } from "@/components/ui/button"
import "./globals.css"
import { Instagram, Linkedin, Twitter, Menu, X, Youtube } from "lucide-react"
import { useState } from "react"

const inter = Inter({ subsets: ["latin"] })

export default function ClientRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isTestRoute = pathname?.startsWith("/test");

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      {isTestRoute ? (
        <div className="flex min-h-screen flex-col font-sans bg-background">
          <main className="flex-1">{children}</main>
        </div>
      ) : (
        <div className="flex min-h-screen flex-col font-sans">
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
      )}
      {/* <SubscribePopup /> */}
    </ThemeProvider>
  );
}

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">   
        <Link href="/" className="flex items-center space-x-2">
        <span className="inline-block">
        <div>
  {/* Light Mode Logo */}
  <img
    src="https://res.cloudinary.com/payb7fsq/image/upload/v1791981789/Hack_Kro_Logo.png"
    alt="HackKro Logo"
    className="block dark:hidden h-10"
  />

  {/* Dark Mode Logo */}
  <img
    src="https://res.cloudinary.com/payb7fsq/image/upload/v1791981789/Hack_Kro_Logo.png"
    alt="HackKro Dark Logo"
    className="hidden dark:block h-10"
  />
</div>

        </span>

          
        </Link>
        <nav className="hidden md:flex md:items-center md:space-x-6">
          <Link href="/" className="text-sm font-medium transition-colors hover:text-blue-600">
            Home
          </Link>
          <Link href="/events" className="text-sm font-medium transition-colors hover:text-blue-600 text-blue-600 dark:text-blue-400 font-semibold">
            Events
          </Link>
          <Link href="/about" className="text-sm font-medium transition-colors hover:text-blue-600">
            About
          </Link>
          <Link href="/gallery" className="text-sm font-medium transition-colors hover:text-blue-600">
            Competitions
          </Link>
          <Link href="/blog" className="text-sm font-medium transition-colors hover:text-blue-600">
          For Organizations / Hosts
          </Link>
          <Link href="/organizer/dashboard" className="text-sm font-medium transition-colors hover:text-blue-600 text-blue-600 dark:text-blue-400 font-semibold">
            Organizer Portal
          </Link>
          <Link href="/team" className="text-sm font-medium transition-colors hover:text-blue-600">
            Campus Ambassadors
          </Link>
          <Link href="/contact" className="text-sm font-medium transition-colors hover:text-blue-600">
            Contact
          </Link>
        </nav>
        <div className="flex items-center space-x-4">
          <ModeToggle />
          <Button variant="outline" size="icon" className="md:hidden" onClick={toggleMenu}>
            {isMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
        </div>
      </div>
      {isMenuOpen && (
        <div className="container pb-4 md:hidden">
          <nav className="flex flex-col space-y-3">
            <Link href="/" className="text-sm font-medium transition-colors hover:text-blue-600" onClick={toggleMenu}>
              Home
            </Link>
            <Link
              href="/events"
              className="text-sm font-medium transition-colors hover:text-blue-600 text-blue-600 font-semibold"
              onClick={toggleMenu}
            >
              Events
            </Link>
            <Link
              href="/about"
              className="text-sm font-medium transition-colors hover:text-blue-600"
              onClick={toggleMenu}
            >
              About
            </Link>
            <Link
              href="/gallery"
              className="text-sm font-medium transition-colors hover:text-blue-600"
              onClick={toggleMenu}
            >
              Competitions
            </Link>
            <Link
              href="/blog"
              className="text-sm font-medium transition-colors hover:text-blue-600"
              onClick={toggleMenu}
            >
              For Organizations / Hosts
            </Link>
            <Link
              href="/organizer/dashboard"
              className="text-sm font-medium transition-colors hover:text-blue-600 text-blue-600 dark:text-blue-400 font-semibold"
              onClick={toggleMenu}
            >
              Organizer Portal
            </Link>
            <Link
              href="/team"
              className="text-sm font-medium transition-colors hover:text-blue-600"
              onClick={toggleMenu}
            >
              Campus Ambassadors
            </Link>
            <Link
              href="/contact"
              className="text-sm font-medium transition-colors hover:text-blue-600"
              onClick={toggleMenu}
            >
              Contact
            </Link>
          </nav>
        </div>
      )}
    </header>
  )
}

function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container py-8 md:py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div className="space-y-3">
            <h3 className="text-lg font-medium">HackKro</h3>
            <p className="text-sm text-muted-foreground">
              The Engine for Next-Gen Hackers, Innovators and Recruiters.
            </p>
          </div>
          <div className="space-y-3">
            <h3 className="text-lg font-medium">Quick Links</h3>
            <div className="grid grid-cols-2 gap-2">
              <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
                Home
              </Link>
              <Link href="/about" className="text-sm text-muted-foreground hover:text-foreground">
                About
              </Link>
              <Link href="/gallery" className="text-sm text-muted-foreground hover:text-foreground">
               Competitions
              </Link>
              <Link href="/blog" className="text-sm text-muted-foreground hover:text-foreground">
              For Organizations / Hosts
              </Link>
              <Link href="/team" className="text-sm text-muted-foreground hover:text-foreground">
                Campus Ambassadors
              </Link>
              <Link href="/contact" className="text-sm text-muted-foreground hover:text-foreground">
                Contact
              </Link>
            </div>
          </div>
          <div className="space-y-3">
            <h3 className="text-lg font-medium">Connect With Us</h3>
            <div className="flex space-x-4">
      <a
        href="https://www.instagram.com/hackkro.in"
        target="_blank"
        rel="noreferrer"
        className="text-muted-foreground hover:text-foreground"
      >
        <Instagram className="h-5 w-5" />
        <span className="sr-only">Instagram</span>
      </a>
      <a
        href="https://www.linkedin.com/company/hackkro/"
        target="_blank"
        rel="noreferrer"
        className="text-muted-foreground hover:text-foreground"
      >
        <Linkedin className="h-5 w-5" />
        <span className="sr-only">LinkedIn</span>
      </a>
      <a
  href="https://x.com/hackkro_india"
  target="_blank"
  rel="noreferrer"
  className="text-muted-foreground hover:text-foreground"
>
  <FontAwesomeIcon icon={faXTwitter} className="h-5 w-5" />
  <span className="sr-only">X (Twitter)</span>
</a>
      <a
        href="https://www.youtube.com/@hackkro_india"
        target="_blank"
        rel="noreferrer"
        className="text-muted-foreground hover:text-foreground"
      >
        <Youtube className="h-5 w-5" />
        <span className="sr-only">YouTube</span>
      </a>
    </div>
            <p className="text-sm text-muted-foreground">
              Email:{" "}
              <a href="mailto:team@hackkro.com" className="hover:underline">
              team@hackkro.com
              </a>
            </p>
            <div className="pt-4">
              <h4 className="text-sm font-medium mb-2">Subscribe to our Newsletter</h4>
              <SubscribeForm />
            </div>
          </div>
        </div>
        <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} HackKro. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
