"use client"

import React, { createContext, useContext, useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"

export interface OrganizerProfile {
  id: string
  name: string
  email: string
  role: "organizer" | "admin"
  organization: {
    name: string
    type: "college" | "company" | "club" | "community"
    website?: string
    logo?: string
    description?: string
    contactPhone?: string
    location?: string
  }
  verificationStatus: "pending" | "verified" | "rejected"
  verifiedAt?: string
  rejectionReason?: string
  createdAt: string
}

interface OrganizerAuthContextType {
  organizer: OrganizerProfile | null
  isLoading: boolean
  isAuthenticated: boolean
  logout: () => Promise<void>
  refreshAuth: () => Promise<void>
}

const OrganizerAuthContext = createContext<OrganizerAuthContextType>({
  organizer: null,
  isLoading: true,
  isAuthenticated: false,
  logout: async () => {},
  refreshAuth: async () => {},
})

export function OrganizerAuthProvider({ children }: { children: React.ReactNode }) {
  const [organizer, setOrganizer] = useState<OrganizerProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  const checkAuth = async () => {
    try {
      const res = await fetch("/api/organizer/auth/me")
      const data = await res.json()
      if (res.ok && data.authenticated && data.organizer) {
        setOrganizer(data.organizer)
      } else {
        setOrganizer(null)
      }
    } catch {
      setOrganizer(null)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    checkAuth()
  }, [pathname])

  // Route protection
  useEffect(() => {
    if (!isLoading) {
      const isAuthRoute = pathname === "/organizer/login"
      if (!organizer && !isAuthRoute && pathname.startsWith("/organizer")) {
        router.replace("/organizer/login")
      } else if (organizer && isAuthRoute) {
        router.replace("/organizer/dashboard")
      }
    }
  }, [isLoading, organizer, pathname, router])

  const logout = async () => {
    try {
      await fetch("/api/organizer/auth/logout", { method: "POST" })
      setOrganizer(null)
      router.push("/organizer/login")
    } catch (e) {
      console.error("Logout failed:", e)
    }
  }

  const refreshAuth = async () => {
    await checkAuth()
  }

  return (
    <OrganizerAuthContext.Provider
      value={{
        organizer,
        isLoading,
        isAuthenticated: !!organizer,
        logout,
        refreshAuth,
      }}
    >
      {children}
    </OrganizerAuthContext.Provider>
  )
}

export const useOrganizerAuth = () => useContext(OrganizerAuthContext)

