"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { useOrganizerAuth } from "../auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Loader2, ShieldCheck, Sparkles, Building2, ArrowLeft } from "lucide-react"

export default function OrganizerLoginPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { refreshAuth } = useOrganizerAuth()

  // Sign In State
  const [loginEmail, setLoginEmail] = useState("")
  const [loginPassword, setLoginPassword] = useState("")
  const [isLoggingIn, setIsLoggingIn] = useState(false)

  // Registration State
  const [regName, setRegName] = useState("")
  const [regEmail, setRegEmail] = useState("")
  const [regPassword, setRegPassword] = useState("")
  const [orgName, setOrgName] = useState("")
  const [orgType, setOrgType] = useState<"college" | "company" | "club" | "community">("college")
  const [orgWebsite, setOrgWebsite] = useState("")
  const [orgPhone, setOrgPhone] = useState("")
  const [isRegistering, setIsRegistering] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!loginEmail || !loginPassword) {
      toast({
        title: "Required Fields Missing",
        description: "Please enter your email and password.",
        variant: "destructive",
      })
      return
    }

    setIsLoggingIn(true)
    try {
      const res = await fetch("/api/organizer/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      })
      const data = await res.json()

      if (res.ok && data.success) {
        toast({
          title: "Welcome back!",
          description: `Logged in as ${data.organizer.name} (${data.organizer.organization?.name || "Organizer"}).`,
        })
        await refreshAuth()
        router.push("/organizer/dashboard")
      } else {
        toast({
          title: "Login Failed",
          description: data.message || "Invalid credentials. Please try again.",
          variant: "destructive",
        })
      }
    } catch {
      toast({
        title: "Network Error",
        description: "Could not connect to authentication service.",
        variant: "destructive",
      })
    } finally {
      setIsLoggingIn(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!regName || !regEmail || !regPassword || !orgName) {
      toast({
        title: "Required Fields Missing",
        description: "Please fill in all required fields to register your organization.",
        variant: "destructive",
      })
      return
    }

    setIsRegistering(true)
    try {
      const res = await fetch("/api/organizer/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: regName,
          email: regEmail,
          password: regPassword,
          organization: {
            name: orgName,
            type: orgType,
            website: orgWebsite,
            contactPhone: orgPhone,
          },
        }),
      })
      const data = await res.json()

      if (res.ok && data.success) {
        toast({
          title: "Registration Successful! 🎉",
          description: "Your organizer account has been created. Status: Pending Verification.",
        })
        await refreshAuth()
        router.push("/organizer/dashboard")
      } else {
        toast({
          title: "Registration Failed",
          description: data.message || "Failed to register organization.",
          variant: "destructive",
        })
      }
    } catch {
      toast({
        title: "Network Error",
        description: "Could not connect to registration service.",
        variant: "destructive",
      })
    } finally {
      setIsRegistering(false)
    }
  }

  const fillDemoAccount = (type: "verified" | "pending") => {
    if (type === "verified") {
      setLoginEmail("organizer@hackkro.com")
      setLoginPassword("organizer123")
      toast({
        title: "Demo Credentials Loaded",
        description: "Loaded verified test account: organizer@hackkro.com",
      })
    } else {
      setLoginEmail("pending@campus.edu")
      setLoginPassword("campus123")
      toast({
        title: "Demo Credentials Loaded",
        description: "Loaded pending test account: pending@campus.edu",
      })
    }
  }

  return (
    <div className="min-h-[85vh] bg-background text-foreground flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md my-8">
        {/* Header Branding */}
        <div className="text-center mb-6">
          <div className="flex justify-center mb-3">
            <Image
              src="https://res.cloudinary.com/payb7fsq/image/upload/v1791981789/Hack_Kro_Logo.png"
              alt="HackKro Logo"
              width={70}
              height={70}
              className="object-contain"
            />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            HackKro Organizer Portal
          </h1>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
            Host hackathons, configure multi-round workflows, review participant submissions, and track registrations.
          </p>
        </div>

        {/* Auth Tabs */}
        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid grid-cols-2 bg-muted p-1 mb-4 rounded-xl border">
            <TabsTrigger
              value="login"
              className="data-[state=active]:bg-background data-[state=active]:text-foreground font-semibold text-xs py-2 rounded-lg shadow-sm"
            >
              Sign In
            </TabsTrigger>
            <TabsTrigger
              value="register"
              className="data-[state=active]:bg-background data-[state=active]:text-foreground font-semibold text-xs py-2 rounded-lg shadow-sm"
            >
              Register Organization
            </TabsTrigger>
          </TabsList>

          {/* SIGN IN TAB */}
          <TabsContent value="login">
            <Card className="shadow-lg border">
              <CardHeader className="space-y-1 pb-4">
                <CardTitle className="text-lg">Sign In to Dashboard</CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  Access your organization's opportunities and candidate rosters.
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleLogin}>
                <CardContent className="space-y-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Organizer Email</Label>
                    <Input
                      type="email"
                      placeholder="e.g. organizer@hackkro.com"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs">Password</Label>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      required
                    />
                  </div>

                  {/* Fast Testing Preset Buttons */}
                  <div className="rounded-lg bg-muted/60 border p-3 space-y-2">
                    <div className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                      <span>One-Click Demo Test Accounts:</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => fillDemoAccount("verified")}
                        className="text-[11px] h-7 bg-background text-blue-600 dark:text-blue-400 border hover:bg-blue-50 dark:hover:bg-blue-950/40"
                      >
                        Verified Account
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => fillDemoAccount("pending")}
                        className="text-[11px] h-7 bg-background text-amber-600 dark:text-amber-400 border hover:bg-amber-50 dark:hover:bg-amber-950/40"
                      >
                        Pending Account
                      </Button>
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="pt-2">
                  <Button
                    type="submit"
                    disabled={isLoggingIn}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-sm"
                  >
                    {isLoggingIn && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isLoggingIn ? "Signing In..." : "Sign In to Organizer Portal"}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>

          {/* REGISTER TAB */}
          <TabsContent value="register">
            <Card className="shadow-lg border">
              <CardHeader className="space-y-1 pb-4">
                <CardTitle className="text-lg">Create Organization Account</CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  Register your college, company, or club on HackKro to host challenges.
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleRegister}>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Your Full Name *</Label>
                      <Input
                        placeholder="John Doe"
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Work / College Email *</Label>
                      <Input
                        type="email"
                        placeholder="john@college.edu"
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs">Password (min 6 chars) *</Label>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      required
                      minLength={6}
                    />
                  </div>

                  <div className="pt-2 border-t">
                    <div className="text-xs font-semibold text-blue-600 dark:text-blue-400 mb-2 flex items-center gap-1.5">
                      <Building2 className="h-3.5 w-3.5" />
                      <span>Organization Information</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <div className="sm:col-span-2 space-y-1">
                        <Label className="text-xs">Organization Name *</Label>
                        <Input
                          placeholder="e.g. MIT Developers Club"
                          value={orgName}
                          onChange={(e) => setOrgName(e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Type</Label>
                        <Select
                          value={orgType}
                          onValueChange={(val: any) => setOrgType(val)}
                        >
                          <SelectTrigger className="h-9">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="college">College / University</SelectItem>
                            <SelectItem value="company">Tech Company</SelectItem>
                            <SelectItem value="club">Student Club</SelectItem>
                            <SelectItem value="community">Developer Community</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                      <div className="space-y-1">
                        <Label className="text-xs">Official Website</Label>
                        <Input
                          placeholder="https://yourclub.edu"
                          value={orgWebsite}
                          onChange={(e) => setOrgWebsite(e.target.value)}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Contact Phone</Label>
                        <Input
                          placeholder="+91 98765 43210"
                          value={orgPhone}
                          onChange={(e) => setOrgPhone(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="pt-2">
                  <Button
                    type="submit"
                    disabled={isRegistering}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-sm"
                  >
                    {isRegistering && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isRegistering ? "Creating Account..." : "Create Organization Account"}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Security Note */}
        <div className="mt-4 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
          <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          <span>Strict Role-Based Authorization & Private Data Protection</span>
        </div>
      </div>
    </div>
  )
}
