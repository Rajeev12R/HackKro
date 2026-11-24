"use client"

import React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { OrganizerAuthProvider, useOrganizerAuth } from "./auth-context"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  LayoutDashboard,
  CalendarPlus,
  Compass,
  Building2,
  LogOut,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Building,
} from "lucide-react"

function OrganizerShell({ children }: { children: React.ReactNode }) {
  const { organizer, isLoading, logout } = useOrganizerAuth()
  const pathname = usePathname()

  // On login page, show clean centered view
  if (pathname === "/organizer/login") {
    return <>{children}</>
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 dark:text-blue-400" />
          <p className="text-sm text-muted-foreground font-medium">Loading Organizer Portal...</p>
        </div>
      </div>
    )
  }

  if (!organizer) {
    return <>{children}</>
  }

  const isVerified = organizer.verificationStatus === "verified"
  const isPending = organizer.verificationStatus === "pending"

  const navLinks = [
    {
      name: "Dashboard",
      href: "/organizer/dashboard",
      icon: LayoutDashboard,
      active: pathname === "/organizer/dashboard",
    },
    {
      name: "Opportunities",
      href: "/organizer/opportunities",
      icon: Compass,
      active:
        pathname.startsWith("/organizer/opportunities") &&
        pathname !== "/organizer/opportunities/create",
    },
    {
      name: "Create Opportunity",
      href: "/organizer/opportunities/create",
      icon: CalendarPlus,
      active: pathname === "/organizer/opportunities/create",
    },
    {
      name: "Organization Profile",
      href: "/organizer/profile",
      icon: Building2,
      active: pathname === "/organizer/profile",
    },
  ]

  return (
    <div className="min-h-[85vh] flex flex-col font-sans bg-background text-foreground">
      {/* Organizer Portal Sub-Navigation Bar */}
      <div className="border-b bg-muted/40 backdrop-blur-sm sticky top-16 z-30">
        <div className="container mx-auto px-4 py-2.5 flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Organization & Verification Status */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm tracking-tight text-foreground">
                {organizer.organization?.name || organizer.name}
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-semibold border border-blue-200 dark:border-blue-800">
                Organizer
              </span>
            </div>

            {isVerified ? (
              <Badge className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 gap-1 text-[11px]">
                <CheckCircle2 className="h-3 w-3" />
                Verified
              </Badge>
            ) : isPending ? (
              <Badge className="bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30 gap-1 text-[11px]">
                <AlertTriangle className="h-3 w-3" />
                Pending Verification
              </Badge>
            ) : (
              <Badge className="bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/30 text-[11px]">
                Rejected
              </Badge>
            )}
          </div>

          {/* Nav Pills & User Controls */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
            <nav className="flex items-center gap-1">
              {navLinks.map((link) => {
                const Icon = link.icon
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                      link.active
                        ? "bg-blue-600 text-white shadow-sm"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span>{link.name}</span>
                  </Link>
                )
              })}
            </nav>

            <div className="h-4 w-px bg-border mx-1 shrink-0" />

            <Button
              variant="ghost"
              size="sm"
              onClick={logout}
              className="h-8 px-2.5 text-xs text-muted-foreground hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-500/10 shrink-0"
              title="Sign Out"
            >
              <LogOut className="h-3.5 w-3.5 mr-1" />
              <span>Logout</span>
            </Button>
          </div>
        </div>

        {/* Verification Alert Banner */}
        {!isVerified && (
          <div className="bg-amber-50 dark:bg-amber-950/30 border-t border-amber-200 dark:border-amber-900/50 px-4 py-2 text-xs text-amber-800 dark:text-amber-300">
            <div className="container mx-auto flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
                <span>
                  <strong>Verification In Progress:</strong> You can create drafts, configure rounds, and
                  test candidate flows. Live publishing to the public HackKro catalog requires admin verification.
                </span>
              </div>
              <Link
                href="/organizer/profile"
                className="underline font-semibold text-amber-700 dark:text-amber-400 hover:text-amber-900 dark:hover:text-amber-200 shrink-0"
              >
                Complete Profile
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <main className="flex-1">{children}</main>
    </div>
  )
}

export default function OrganizerLayout({ children }: { children: React.ReactNode }) {
  return (
    <OrganizerAuthProvider>
      <OrganizerShell>{children}</OrganizerShell>
    </OrganizerAuthProvider>
  )
}
