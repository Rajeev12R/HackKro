"use client"

import Image from "next/image"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, MapPin, Trophy, Users, ShieldAlert, Gift, Layers, CheckCircle } from "lucide-react"
import type { EventItem } from "@/lib/events-data"

interface EventDetailsModalProps {
  event: EventItem | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onRegisterClick: (event: EventItem) => void
}

export function EventDetailsModal({
  event,
  open,
  onOpenChange,
  onRegisterClick,
}: EventDetailsModalProps) {
  if (!event) return null

  const isLiveOrUpcoming = event.statusOverride === "live" || event.statusOverride === "coming-soon"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto p-0 sm:rounded-2xl">
        {/* Cover Image */}
        <div className="relative h-60 w-full sm:h-72">
          <Image
            src={event.image || "/placeholder.svg"}
            alt={event.title}
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

          {/* Badges */}
          <div className="absolute top-4 left-4 flex flex-wrap gap-2">
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                event.statusOverride === "live"
                  ? "bg-green-500 text-white"
                  : event.statusOverride === "coming-soon"
                  ? "bg-amber-500 text-white"
                  : "bg-slate-700 text-white"
              }`}
            >
              {event.statusOverride === "live"
                ? "Live & Open"
                : event.statusOverride === "coming-soon"
                ? "Coming Soon"
                : "Completed"}
            </span>
            <span className="rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold text-white">
              {event.category}
            </span>
            <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
              {event.mode}
            </span>
          </div>

          <div className="absolute bottom-4 left-4 right-4 text-white">
            <DialogTitle className="text-2xl font-bold tracking-tight sm:text-3xl">
              {event.title}
            </DialogTitle>
            <p className="mt-1 text-sm text-gray-200 line-clamp-1">{event.tagline}</p>
          </div>
        </div>

        {/* Content Details */}
        <div className="space-y-6 p-6 sm:p-8">
          {/* Key Facts Strip */}
          <div className="grid grid-cols-2 gap-4 rounded-xl bg-blue-50/60 p-4 dark:bg-blue-950/20 sm:grid-cols-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <div>
                <p className="text-xs text-muted-foreground">Date</p>
                <p className="text-xs font-semibold">{event.date}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <div>
                <p className="text-xs text-muted-foreground">Location</p>
                <p className="text-xs font-semibold truncate">{event.venue || event.location}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-amber-500" />
              <div>
                <p className="text-xs text-muted-foreground">Prize Pool</p>
                <p className="text-xs font-semibold">{event.prizePool || "Certificates & Swags"}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <div>
                <p className="text-xs text-muted-foreground">Team Size</p>
                <p className="text-xs font-semibold">
                  {event.teamSize ? `${event.teamSize.min}-${event.teamSize.max} Members` : "1-4 Members"}
                </p>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <h4 className="text-lg font-semibold text-foreground">About the Event</h4>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {event.longDescription || event.description}
            </p>
          </div>

          {/* Tracks / Themes */}
          {event.tracks && event.tracks.length > 0 && (
            <div>
              <div className="flex items-center gap-2 font-semibold text-foreground">
                <Layers className="h-4 w-4 text-blue-600" />
                <h4>Themes & Challenge Tracks</h4>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {event.tracks.map((track) => (
                  <Badge key={track} variant="secondary" className="px-3 py-1 text-xs">
                    {track}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Perks */}
          {event.perks && event.perks.length > 0 && (
            <div>
              <div className="flex items-center gap-2 font-semibold text-foreground">
                <Gift className="h-4 w-4 text-emerald-600" />
                <h4>Prizes & Benefits</h4>
              </div>
              <ul className="mt-2 space-y-1.5 text-sm text-muted-foreground">
                {event.perks.map((perk, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <span>{perk}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Eligibility */}
          {event.eligibility && (
            <div>
              <h4 className="font-semibold text-foreground">Who Can Participate?</h4>
              <p className="mt-1 text-sm text-muted-foreground">{event.eligibility}</p>
            </div>
          )}

          {/* Rules */}
          {event.rules && event.rules.length > 0 && (
            <div>
              <div className="flex items-center gap-2 font-semibold text-foreground">
                <ShieldAlert className="h-4 w-4 text-amber-500" />
                <h4>Guidelines & Rules</h4>
              </div>
              <ul className="mt-2 list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                {event.rules.map((rule, i) => (
                  <li key={i}>{rule}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Winners (for past events) */}
          {event.winners && event.winners.length > 0 && (
            <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4 dark:border-amber-900/30 dark:bg-amber-950/20">
              <h4 className="font-semibold text-amber-900 dark:text-amber-300">Winners Hall of Fame 🏆</h4>
              <ul className="mt-2 list-disc pl-5 space-y-1 text-sm text-amber-800 dark:text-amber-200">
                {event.winners.map((winner, i) => (
                  <li key={i}>{winner}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Action Footer */}
          <div className="flex items-center justify-between border-t pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
            {isLiveOrUpcoming && (
              <Button
                className="bg-blue-600 hover:bg-blue-700 px-6"
                onClick={() => {
                  onOpenChange(false)
                  onRegisterClick(event)
                }}
              >
                Register for this Event
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
