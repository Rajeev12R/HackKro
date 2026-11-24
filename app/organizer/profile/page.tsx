"use client"

import React, { useState, useEffect } from "react"
import { useOrganizerAuth } from "../auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import {
  Building2,
  CheckCircle2,
  AlertTriangle,
  Save,
  Loader2,
} from "lucide-react"

export default function OrganizationProfilePage() {
  const { organizer, refreshAuth } = useOrganizerAuth()
  const { toast } = useToast()

  const [saving, setSaving] = useState(false)
  const [name, setName] = useState("")
  const [orgName, setOrgName] = useState("")
  const [orgType, setOrgType] = useState<any>("college")
  const [orgWebsite, setOrgWebsite] = useState("")
  const [orgDesc, setOrgDesc] = useState("")
  const [orgPhone, setOrgPhone] = useState("")
  const [orgLocation, setOrgLocation] = useState("")

  useEffect(() => {
    if (organizer) {
      setName(organizer.name || "")
      setOrgName(organizer.organization?.name || "")
      setOrgType(organizer.organization?.type || "college")
      setOrgWebsite(organizer.organization?.website || "")
      setOrgDesc(organizer.organization?.description || "")
      setOrgPhone(organizer.organization?.contactPhone || "")
      setOrgLocation(organizer.organization?.location || "")
    }
  }, [organizer])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const res = await fetch("/api/organizer/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          organization: {
            name: orgName,
            type: orgType,
            website: orgWebsite,
            description: orgDesc,
            contactPhone: orgPhone,
            location: orgLocation,
          },
        }),
      })

      const data = await res.json()
      if (res.ok && data.success) {
        toast({
          title: "Profile Saved ✅",
          description: "Organization details updated successfully.",
        })
        await refreshAuth()
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to update profile.",
          variant: "destructive",
        })
      }
    } catch {
      toast({
        title: "Network Error",
        description: "Failed to connect to profile update service.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const isVerified = organizer?.verificationStatus === "verified"

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Organization Profile</h1>
        <p className="text-xs text-muted-foreground mt-1">
          Manage your organization details, contact information, and verification status.
        </p>
      </div>

      {/* Verification Status Card */}
      <Card className="border">
        <CardContent className="pt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3">
            <div
              className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${
                isVerified
                  ? "bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400"
                  : "bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400"
              }`}
            >
              {isVerified ? <CheckCircle2 className="h-5 w-5" /> : <AlertTriangle className="h-5 w-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-foreground text-sm">
                  {isVerified ? "Verified Organization" : "Pending Admin Verification"}
                </span>
                {isVerified ? (
                  <Badge className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 text-[10px]">
                    Active
                  </Badge>
                ) : (
                  <Badge className="bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30 text-[10px]">
                    In Review
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                {isVerified
                  ? "Your organization is verified. You can publish opportunities directly to the public HackKro catalog."
                  : "HackKro administrators manually review organizer profiles to protect student safety. Live publishing is restricted until approved."}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile Form */}
      <Card className="border">
        <form onSubmit={handleSave}>
          <CardHeader>
            <CardTitle className="text-base">Organization Details</CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              This information will be displayed on your opportunity pages.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs">Account Representative Name *</Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Account Email (Permanent)</Label>
                <Input
                  value={organizer?.email || ""}
                  disabled
                  className="bg-muted cursor-not-allowed"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2 space-y-1.5">
                <Label className="text-xs">Organization Name *</Label>
                <Input
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Organization Type</Label>
                <Select value={orgType} onValueChange={(val: any) => setOrgType(val)}>
                  <SelectTrigger>
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs">Official Website</Label>
                <Input
                  value={orgWebsite}
                  onChange={(e) => setOrgWebsite(e.target.value)}
                  placeholder="https://example.edu"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Contact Phone</Label>
                <Input
                  value={orgPhone}
                  onChange={(e) => setOrgPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Campus Location / Headquarter City</Label>
              <Input
                value={orgLocation}
                onChange={(e) => setOrgLocation(e.target.value)}
                placeholder="e.g. Meerut, Uttar Pradesh, India"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">About Organization / Bio</Label>
              <Textarea
                rows={3}
                value={orgDesc}
                onChange={(e) => setOrgDesc(e.target.value)}
                placeholder="Brief summary of your campus club, innovation hub, or hiring company..."
                className="text-xs"
              />
            </div>
          </CardContent>

          <CardFooter className="pt-2 border-t flex justify-end">
            <Button
              type="submit"
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs gap-1.5 shadow-sm"
            >
              {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              <Save className="h-3.5 w-3.5" />
              <span>Save Changes</span>
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
