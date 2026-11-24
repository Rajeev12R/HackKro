"use client"

import { useState, useMemo, useEffect } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Calendar,
  MapPin,
  Search,
  Filter,
  Trophy,
  Users,
  Sparkles,
  Clock,
  ArrowRight,
  CheckCircle,
} from "lucide-react"
import { EVENTS_DATA, type EventItem, type EventStatus, type EventMode } from "@/lib/events-data"
import { EventRegistrationModal } from "./EventRegistrationModal"
import { EventDetailsModal } from "./EventDetailsModal"

interface EventListProps {
  title?: string
  subtitle?: string
  limit?: number
  featuredOnly?: boolean
  showFilters?: boolean
}

function CountdownTimer({ deadline }: { deadline: string }) {
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number } | null>(null)

  useEffect(() => {
    const target = new Date(deadline).getTime()
    const update = () => {
      const now = Date.now()
      const diff = Math.max(0, target - now)
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
      })
    }
    update()
    const timer = setInterval(update, 60000)
    return () => clearInterval(timer)
  }, [deadline])

  if (!timeLeft) return null

  return (
    <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
      <Clock className="h-3.5 w-3.5" />
      <span>
        Closes in {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m
      </span>
    </div>
  )
}

export function EventList({
  title = "Explore Hackathons & Events",
  subtitle = "Discover national-level hackathons, coding sprints, and innovation conclaves hosted on HackKro.",
  limit,
  featuredOnly = false,
  showFilters = true,
}: EventListProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusTab, setStatusTab] = useState<"all" | "live" | "upcoming" | "past">("all")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [modeFilter, setModeFilter] = useState<string>("all")

  // Modal states
  const [selectedEventForDetails, setSelectedEventForDetails] = useState<EventItem | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [selectedEventForRegister, setSelectedEventForRegister] = useState<EventItem | null>(null)
  const [isRegisterOpen, setIsRegisterOpen] = useState(false)

  // Dynamic registration counts state
  const [events, setEvents] = useState<EventItem[]>(EVENTS_DATA)

  useEffect(() => {
    // Fetch live registered counts from backend
    fetch("/api/events")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.events)) {
          setEvents(data.events)
        }
      })
      .catch(() => {
        // Fallback to static events
      })
  }, [])

  // Categories list
  const categories = useMemo(() => {
    const set = new Set(events.map((e) => e.category))
    return Array.from(set)
  }, [events])

  // Filtered events
  const filteredEvents = useMemo(() => {
    return events
      .filter((event) => {
        if (featuredOnly && !event.featured) return false

        // Status tab
        if (statusTab === "live" && event.statusOverride !== "live") return false
        if (statusTab === "upcoming" && event.statusOverride !== "coming-soon") return false
        if (statusTab === "past" && event.statusOverride !== "past") return false

        // Category filter
        if (categoryFilter !== "all" && event.category !== categoryFilter) return false

        // Mode filter
        if (modeFilter !== "all" && event.mode !== modeFilter) return false

        // Search query
        if (searchTerm.trim()) {
          const q = searchTerm.toLowerCase()
          const matchTitle = event.title.toLowerCase().includes(q)
          const matchDesc = event.description.toLowerCase().includes(q)
          const matchVenue = (event.venue || event.location || "").toLowerCase().includes(q)
          const matchCat = event.category.toLowerCase().includes(q)
          const matchTracks = event.tracks?.some((t) => t.toLowerCase().includes(q))
          if (!matchTitle && !matchDesc && !matchVenue && !matchCat && !matchTracks) {
            return false
          }
        }

        return true
      })
      .slice(0, limit || events.length)
  }, [events, statusTab, categoryFilter, modeFilter, searchTerm, featuredOnly, limit])

  const handleOpenRegister = (event: EventItem) => {
    setSelectedEventForRegister(event)
    setIsRegisterOpen(true)
  }

  const handleOpenDetails = (event: EventItem) => {
    setSelectedEventForDetails(event)
    setIsDetailsOpen(true)
  }

  return (
    <div className="w-full space-y-8">
      {/* Title Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-4 py-1.5 text-xs font-semibold text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Verified Competitions & Hackathons</span>
        </div>
        <h2 className="text-3xl font-extrabold tracking-tight md:text-4xl bg-clip-text text-transparent bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-900 dark:from-blue-400 dark:to-indigo-300">
          {title}
        </h2>
        <p className="mx-auto max-w-2xl text-muted-foreground text-sm md:text-base">
          {subtitle}
        </p>
      </div>

      {/* Filter and Search Controls */}
      {showFilters && (
        <div className="rounded-2xl border bg-card/60 p-4 shadow-sm backdrop-blur-sm space-y-4">
          {/* Top row: Status Tabs + Search */}
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <Tabs
              value={statusTab}
              onValueChange={(val: any) => setStatusTab(val)}
              className="w-full md:w-auto"
            >
              <TabsList className="grid grid-cols-4 w-full md:w-auto">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="live" className="gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  Live
                </TabsTrigger>
                <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                <TabsTrigger value="past">Past</TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search events, tracks, tags..."
                className="pl-9 text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Bottom row: Category and Mode dropdowns */}
          <div className="flex flex-wrap items-center gap-3 pt-2 border-t text-sm">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Filter className="h-3.5 w-3.5" />
              <span className="text-xs font-semibold uppercase tracking-wider">Filters:</span>
            </div>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[180px] h-9 text-xs">
                <SelectValue placeholder="Category: All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={modeFilter} onValueChange={setModeFilter}>
              <SelectTrigger className="w-[140px] h-9 text-xs">
                <SelectValue placeholder="Mode: All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Modes</SelectItem>
                <SelectItem value="Online">Online</SelectItem>
                <SelectItem value="Offline">Offline</SelectItem>
                <SelectItem value="Hybrid">Hybrid</SelectItem>
              </SelectContent>
            </Select>

            {(searchTerm || categoryFilter !== "all" || modeFilter !== "all" || statusTab !== "all") && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-xs text-blue-600 hover:text-blue-700"
                onClick={() => {
                  setSearchTerm("")
                  setCategoryFilter("all")
                  setModeFilter("all")
                  setStatusTab("all")
                }}
              >
                Reset Filters
              </Button>
            )}

            <span className="ml-auto text-xs text-muted-foreground">
              Showing <strong>{filteredEvents.length}</strong> {filteredEvents.length === 1 ? "event" : "events"}
            </span>
          </div>
        </div>
      )}

      {/* Events Grid */}
      {filteredEvents.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed py-16 text-center">
          <Calendar className="mb-4 h-12 w-12 text-muted-foreground/60" />
          <h3 className="text-lg font-semibold text-foreground">No events found</h3>
          <p className="mt-1 text-sm text-muted-foreground max-w-sm">
            No events match your current filter settings. Try adjusting your search keywords or resetting filters.
          </p>
          <Button
            variant="outline"
            size="sm"
            className="mt-4"
            onClick={() => {
              setSearchTerm("")
              setCategoryFilter("all")
              setModeFilter("all")
              setStatusTab("all")
            }}
          >
            Clear all filters
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredEvents.map((event) => {
            const isLive = event.statusOverride === "live"
            const isUpcoming = event.statusOverride === "coming-soon"
            const isPast = event.statusOverride === "past"

            return (
              <Card
                key={event.id}
                className="group flex flex-col overflow-hidden rounded-2xl border transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:hover:border-blue-500/50"
              >
                {/* Banner Image */}
                <div
                  className="relative h-48 w-full cursor-pointer overflow-hidden bg-slate-900"
                  onClick={() => handleOpenDetails(event)}
                >
                  <Image
                    src={event.image || "/placeholder.svg"}
                    alt={event.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105 brightness-90 group-hover:brightness-100"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                  {/* Top Badges */}
                  <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                    {isLive && (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/90 px-2.5 py-0.5 text-xs font-semibold text-white backdrop-blur-sm">
                        <span className="h-1.5 w-1.5 rounded-full bg-white animate-ping" />
                        Live & Open
                      </span>
                    )}
                    {isUpcoming && (
                      <span className="rounded-full bg-amber-500/90 px-2.5 py-0.5 text-xs font-semibold text-white backdrop-blur-sm">
                        Coming Soon
                      </span>
                    )}
                    {isPast && (
                      <span className="rounded-full bg-slate-800/90 px-2.5 py-0.5 text-xs font-semibold text-slate-300 backdrop-blur-sm">
                        Completed
                      </span>
                    )}
                    <span className="rounded-full bg-black/60 px-2.5 py-0.5 text-xs font-medium text-white backdrop-blur-sm">
                      {event.mode}
                    </span>
                  </div>

                  {event.featured && (
                    <span className="absolute top-3 right-3 rounded-full bg-blue-600 px-2.5 py-0.5 text-xs font-bold text-white shadow-sm">
                      Featured
                    </span>
                  )}

                  {/* Bottom Image Overlay Strip */}
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-white">
                    <span className="rounded bg-blue-600/90 px-2 py-0.5 font-medium">
                      {event.category}
                    </span>
                    {event.prizePool && (
                      <span className="flex items-center gap-1 font-bold text-amber-300 bg-black/50 px-2 py-0.5 rounded backdrop-blur-sm">
                        <Trophy className="h-3.5 w-3.5" />
                        {event.prizePool}
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Content */}
                <CardContent className="flex flex-1 flex-col p-5">
                  <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                      {event.date}
                    </span>
                    <span className="flex items-center gap-1 truncate max-w-[150px]">
                      <MapPin className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                      {event.location || event.venue || "Virtual"}
                    </span>
                  </div>

                  <h3
                    className="mb-2 text-lg font-bold leading-snug tracking-tight text-foreground transition-colors group-hover:text-blue-600 cursor-pointer line-clamp-2"
                    onClick={() => handleOpenDetails(event)}
                  >
                    {event.title}
                  </h3>

                  <p className="line-clamp-2 text-xs text-muted-foreground leading-relaxed mb-4">
                    {event.description}
                  </p>

                  {/* Tracks pills */}
                  {event.tracks && event.tracks.length > 0 && (
                    <div className="mb-4 flex flex-wrap gap-1.5">
                      {event.tracks.slice(0, 2).map((track) => (
                        <span
                          key={track}
                          className="rounded-md bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground"
                        >
                          {track}
                        </span>
                      ))}
                      {event.tracks.length > 2 && (
                        <span className="rounded-md bg-muted px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground">
                          +{event.tracks.length - 2} more
                        </span>
                      )}
                    </div>
                  )}

                  {/* Urgency indicator or Registration count */}
                  <div className="mt-auto pt-3 border-t flex items-center justify-between text-xs">
                    {isLive && event.registrationDeadline ? (
                      <CountdownTimer deadline={event.registrationDeadline} />
                    ) : isPast ? (
                      <span className="text-muted-foreground">Concluded</span>
                    ) : (
                      <span className="text-amber-600 dark:text-amber-400 font-medium">Opening Soon</span>
                    )}

                    <span className="text-muted-foreground flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {event.teamSize ? `${event.teamSize.min}-${event.teamSize.max} per team` : "1-4"}
                    </span>
                  </div>

                  {/* Buttons */}
                  <div className="mt-4 flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1 text-xs"
                      onClick={() => handleOpenDetails(event)}
                    >
                      Details
                    </Button>

                    {isLive ? (
                      <Button
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-xs font-semibold shadow-md shadow-blue-500/20"
                        onClick={() => handleOpenRegister(event)}
                      >
                        Register Now
                      </Button>
                    ) : isUpcoming ? (
                      <Button
                        variant="secondary"
                        className="flex-1 text-xs"
                        onClick={() => handleOpenRegister(event)}
                      >
                        Pre-Register
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        className="flex-1 text-xs text-muted-foreground"
                        onClick={() => handleOpenDetails(event)}
                      >
                        View Recap
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Modals */}
      <EventRegistrationModal
        event={selectedEventForRegister}
        open={isRegisterOpen}
        onOpenChange={setIsRegisterOpen}
      />

      <EventDetailsModal
        event={selectedEventForDetails}
        open={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
        onRegisterClick={(event) => {
          setSelectedEventForRegister(event)
          setIsRegisterOpen(true)
        }}
      />
    </div>
  )
}
