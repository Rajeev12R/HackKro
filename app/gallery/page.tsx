"use client"

import { useState, useEffect, useMemo } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { ChevronLeft, ChevronRight, Search, Filter, CalendarDays, MapPin, Clock, X } from "lucide-react"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"

type EventStatus = "coming-soon" | "live" | "past"

interface GalleryItem {
  id: number
  title: string
  date: string // start date (YYYY-MM-DD)
  event: string // category
  image: string
  description: string
  relatedImages: string[]
  // ---- optional fields for the events system ----
  endDate?: string // defaults to `date`
  mode?: "Online" | "Offline" | "Hybrid"
  venue?: string
  registrationOpens?: string // before this date the event shows as "Coming Soon"
  registrationDeadline?: string
  registrationUrl?: string
  featured?: boolean
  statusOverride?: EventStatus // force a status manually
  resultsUrl?: string
  winners?: string[]
}

// ===================== ADD NEW EVENTS HERE =====================
const galleryItems: GalleryItem[] = [
  // ================= COMING SOON EVENT =================
  {
    id: 301,
    title: "HackKro Fest 2026",
    date: "2026-11-03",
    endDate: "2026-11-03",
    event: "Technical Quiz",
    mode: "Offline",
    venue: "Meerut, Uttar Pradesh",
    registrationOpens: "2026-10-30",
    registrationDeadline: "2026-11-03",
    registrationUrl: "https://example.com/register/techfest-2026",
    featured: true,
    image: "https://res.cloudinary.com/payb7fsq/image/upload/v1791975769/samples/cloudinary-group.jpg",
    description: "60 minute national Technical Quiz for coders, designers and problem-solvers at MIT, Meerut.",
    relatedImages: [],
  },

  // ================= PAST EVENT =================
  {
    id: 101,
    title: "ByteRush 2k26 - MIT",
    date: "2026-10-09",
    endDate: "2026-10-09",
    event: "Hackathon & Coding Sprint",
    mode: "Offline",
    venue: "Meerut Institute of Technology",
    image: "https://res.cloudinary.com/payb7fsq/image/upload/v1792430791/WhatsApp_Image_2026-10-19_at_22.55.23.jpg",
    description: "ByteRush 2k26 brought together top student developers and coding enthusiasts at MIT Meerut for an intense coding competition.",
    relatedImages: [
      "https://res.cloudinary.com/payb7fsq/image/upload/v1792430791/WhatsApp_Image_2026-10-19_at_22.55.24.jpg",
      "https://res.cloudinary.com/payb7fsq/image/upload/v1791982756/WhatsApp_Image_2026-10-14_at_6.28.03_P.jpg",
    ],
    winners: [
      "1st Place: Nisha Kumari",
      "2nd Place: Ayushi Gupta",
    ],
  },
]

// ===================== STATUS HELPERS =====================
const toDate = (s: string, endOfDay = false) =>
  new Date(s.length === 10 ? `${s}T${endOfDay ? "23:59:59" : "00:00:00"}` : s)

const getStatus = (item: GalleryItem, now: Date): EventStatus => {
  if (item.statusOverride) return item.statusOverride
  if (now > toDate(item.endDate ?? item.date, true)) return "past"
  if (now < toDate(item.registrationOpens ?? item.date)) return "coming-soon"
  return "live"
}

const formatDate = (s: string) =>
  toDate(s).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })

const BADGES: Record<EventStatus, { label: string; className: string }> = {
  "coming-soon": { label: "Coming Soon", className: "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300" },
  live: { label: "Live", className: "bg-green-100 text-green-700 dark:bg-green-950/60 dark:text-green-300" },
  past: { label: "Completed", className: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300" },
}

const SECTIONS: { key: EventStatus; title: string; empty: string }[] = [
  { key: "coming-soon", title: "Coming Soon", empty: "No upcoming events announced yet. Check back soon." },
  // { key: "live", title: "Live Events", empty: "No events are open for registration right now." }, // Commented out as requested
  { key: "past", title: "Past Events", empty: "No past events match your filters." },
]

function Countdown({ target }: { target: number }) {
  const [left, setLeft] = useState<number | null>(null)

  useEffect(() => {
    const tick = () => setLeft(Math.max(0, target - Date.now()))
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [target])

  if (left === null) return null
  const d = Math.floor(left / 86400000)
  const h = Math.floor((left % 86400000) / 3600000)
  const m = Math.floor((left % 3600000) / 60000)
  const s = Math.floor((left % 60000) / 1000)

  return (
    <div className="flex items-center gap-1.5 text-sm font-medium text-amber-700 dark:text-amber-300">
      <Clock className="h-4 w-4" />
      Registration opens in {d}d {h}h {m}m {s}s
    </div>
  )
}

const PAST_PAGE_SIZE = 6

export default function GalleryPage() {
  const [now, setNow] = useState(() => new Date())
  const [searchTerm, setSearchTerm] = useState("")
  const [eventFilter, setEventFilter] = useState("")
  const [dateFilter, setDateFilter] = useState("")
  const [pastVisible, setPastVisible] = useState(PAST_PAGE_SIZE)

  // State for image popup
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000)
    return () => clearInterval(id)
  }, [])

  const eventTypes = Array.from(new Set(galleryItems.map((item) => item.event)))

  const grouped = useMemo(() => {
    const result: Record<EventStatus, GalleryItem[]> = { "coming-soon": [], live: [], past: [] }
    const q = searchTerm.toLowerCase()

    galleryItems
      .filter((item) => !q || item.title.toLowerCase().includes(q))
      .filter((item) => !eventFilter || eventFilter === "all" || item.event === eventFilter)
      .filter((item) => !dateFilter || item.date.slice(0, 7) === dateFilter)
      .forEach((item) => {
        let status = getStatus(item, now)
        // If live section is disabled, treat live items as coming-soon or past if needed, but here we just route them safely
        if (status === "live") status = "coming-soon" 
        result[status].push(item)
      })

    result["coming-soon"].sort((a, b) => +toDate(a.date) - +toDate(b.date))
    result.past.sort((a, b) => +toDate(b.date) - +toDate(a.date))
    return result
  }, [searchTerm, eventFilter, dateFilter, now])

  useEffect(() => {
    setPastVisible(PAST_PAGE_SIZE)
  }, [searchTerm, eventFilter, dateFilter])

  const totalResults = grouped["coming-soon"].length + grouped.past.length

  const clearFilters = () => {
    setSearchTerm("")
    setEventFilter("")
    setDateFilter("")
  }

  const handleImageClick = (item: GalleryItem) => {
    setSelectedItem(item)
    setCurrentImageIndex(0)
    setIsDialogOpen(true)
  }

  const goToNextImage = () => {
    if (selectedItem) {
      setCurrentImageIndex((prev) => (prev === selectedItem.relatedImages.length ? 0 : prev + 1))
    }
  }

  const goToPrevImage = () => {
    if (selectedItem) {
      setCurrentImageIndex((prev) => (prev === 0 ? selectedItem.relatedImages.length : prev - 1))
    }
  }

  const getCurrentImageSrc = () => {
    if (!selectedItem) return ""
    return currentImageIndex === 0 ? selectedItem.image : selectedItem.relatedImages[currentImageIndex - 1]
  }

  const selectedStatus = selectedItem ? getStatus(selectedItem, now) : null
  const hasGallery = !!selectedItem && selectedItem.relatedImages.length > 0

  return (
    <div className="space-y-8 py-12">
      {/* Hero Section */}
      <section className="relative h-[300px] w-full">
        <div className="hidden md:block h-full w-full relative">
          <Image
            src="https://res.cloudinary.com/payb7fsq/image/upload/v1792430791/WhatsApp_Image_2026-10-19_at_22.55.24.jpg"
            alt="HackKro Gallery Banner"
            fill
            className="object-cover brightness-50 dark:brightness-100"
          />
        </div>

        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 py-8 bg-gradient-to-b from-black/80 to-black/40 text-white md:hidden">
          <h1 className="text-4xl font-extrabold tracking-wide drop-shadow-md mb-3">HackKro Events</h1>
          <p className="text-lg text-gray-200 max-w-md leading-relaxed drop-shadow-sm">
            Explore highlights and moments from our national hackathons, coding sprints, and tech summits
          </p>
        </div>
      </section>

      {/* Filters */}
      <section className="container">
        <div className="flex flex-col space-y-4 rounded-lg bg-blue-50 dark:bg-blue-950/20 p-4 md:flex-row md:items-end md:space-x-4 md:space-y-0">
          <div className="w-full md:w-1/3">
            <Label htmlFor="search" className="mb-2 block">
              Search by Title
            </Label>
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="search"
                placeholder="Search events..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="w-full md:w-1/4">
            <Label htmlFor="event-filter" className="mb-2 block">
              Filter by Event
            </Label>
            <Select value={eventFilter} onValueChange={setEventFilter}>
              <SelectTrigger id="event-filter">
                <SelectValue placeholder="All Events" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Events</SelectItem>
                {eventTypes.map((event) => (
                  <SelectItem key={event} value={event}>
                    {event}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="w-full md:w-1/4">
            <Label htmlFor="date-filter" className="mb-2 block">
              Filter by Date
            </Label>
            <Input id="date-filter" type="month" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} />
          </div>
          <div className="flex w-full justify-end md:w-auto">
            <Button variant="outline" onClick={clearFilters}>
              Clear Filters
            </Button>
          </div>
        </div>
      </section>

      {/* Sections: Coming Soon -> Past */}
      {totalResults === 0 ? (
        <section className="container">
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Filter className="mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="text-xl font-medium">No Results Found</h3>
            <p className="mt-2 text-muted-foreground">
              Try adjusting your search or filter criteria to find what you're looking for.
            </p>
            <Button className="mt-4" onClick={clearFilters}>
              Clear All Filters
            </Button>
          </div>
        </section>
      ) : (
        SECTIONS.map(({ key, title, empty }) => {
          const all = grouped[key]
          const shown = key === "past" ? all.slice(0, pastVisible) : all
          const badge = BADGES[key]

          return (
            <section key={key} className="container" aria-labelledby={`section-${key}`}>
              <div className="mb-4 flex items-baseline justify-between border-b pb-2">
                <h2 id={`section-${key}`} className="text-2xl font-bold">
                  {title}
                </h2>
                <span className="text-sm text-muted-foreground">
                  {all.length} {all.length === 1 ? "event" : "events"}
                </span>
              </div>

              {shown.length > 0 ? (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {shown.map((item) => (
                    <Card key={item.id} className="group flex flex-col overflow-hidden transition-shadow hover:shadow-lg">
                      <div className="relative h-48 w-full cursor-pointer" onClick={() => handleImageClick(item)}>
                        <Image
                          src={item.image || "/placeholder.svg"}
                          alt={item.title}
                          fill
                          className="object-cover transition-transform hover:scale-105"
                        />
                        <span className={`absolute left-3 top-3 rounded-full px-3 py-1 text-xs font-semibold ${badge.className}`}>
                          {badge.label}
                        </span>
                        {item.featured && (
                          <span className="absolute right-3 top-3 rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold text-white">
                            Featured
                          </span>
                        )}
                      </div>
                      <CardContent className="flex flex-1 flex-col p-4">
                        <div className="mb-2 flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">{formatDate(item.date)}</span>
                          <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-600 dark:bg-blue-950/50">
                            {item.event}
                          </span>
                        </div>
                        <h3 className="mb-2 text-lg font-semibold">{item.title}</h3>
                        <p className="line-clamp-3 text-sm text-muted-foreground">{item.description}</p>

                        {(item.mode || item.venue) && (
                          <div className="mt-3 flex items-center gap-1.5 text-sm text-muted-foreground">
                            <MapPin className="h-4 w-4" />
                            {[item.mode, item.venue].filter(Boolean).join(", ")}
                          </div>
                        )}
                        {key === "coming-soon" && (
                          <div className="mt-2">
                            <Countdown target={+toDate(item.registrationOpens ?? item.date)} />
                          </div>
                        )}

                        <div className="mt-auto pt-4">
                          <Button
                            variant={key === "past" ? "outline" : "default"}
                            className="w-full"
                            onClick={() => handleImageClick(item)}
                          >
                            {key === "past" ? "View Details" : "Explore Event"}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center rounded-lg border border-dashed py-10 text-center">
                  <CalendarDays className="mb-3 h-10 w-10 text-muted-foreground" />
                  <p className="text-muted-foreground">{empty}</p>
                </div>
              )}

              {key === "past" && all.length > pastVisible && (
                <div className="mt-8 text-center">
                  <Button variant="outline" onClick={() => setPastVisible((n) => n + PAST_PAGE_SIZE)}>
                    Load More ({all.length - pastVisible} remaining)
                  </Button>
                </div>
              )}
            </section>
          )
        })
      )}

      {/* Image + Details Popup Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent
          className="max-h-[92vh] max-w-4xl overflow-y-auto p-0 bg-transparent border-0"
          onInteractOutside={(e) => e.preventDefault()}
        >
          <DialogTitle className="sr-only">{selectedItem?.title ?? "Event details"}</DialogTitle>
          <div className="relative bg-black rounded-lg overflow-hidden">
            <div className="relative h-[60vh] w-full">
              {selectedItem && (
                <Image
                  src={getCurrentImageSrc() || "/placeholder.svg"}
                  alt={selectedItem.title}
                  fill
                  className="object-contain"
                />
              )}

              {hasGallery && (
                <>
                  <Button
                    variant="outline"
                    size="icon"
                    className="absolute left-4 top-1/2 z-10 h-10 w-10 -translate-y-1/2 rounded-full bg-black/50 text-white hover:bg-black/70"
                    onClick={goToPrevImage}
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </Button>

                  <Button
                    variant="outline"
                    size="icon"
                    className="absolute right-4 top-1/2 z-10 h-10 w-10 -translate-y-1/2 rounded-full bg-black/50 text-white hover:bg-black/70"
                    onClick={goToNextImage}
                  >
                    <ChevronRight className="h-6 w-6" />
                  </Button>
                </>
              )}

              <Button
                variant="outline"
                size="icon"
                className="absolute right-4 top-4 z-10 h-8 w-8 rounded-full bg-black/50 text-white hover:bg-black/70"
                onClick={() => setIsDialogOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {selectedItem && hasGallery && (
              <div className="bg-black/90 p-4">
                <div className="flex space-x-2 overflow-x-auto pb-2">
                  {[selectedItem.image, ...selectedItem.relatedImages].map((src, index) => (
                    <div
                      key={`${src}-${index}`}
                      className={`relative h-20 w-20 flex-shrink-0 cursor-pointer rounded border-2 ${
                        currentImageIndex === index ? "border-blue-500" : "border-transparent"
                      }`}
                      onClick={() => setCurrentImageIndex(index)}
                    >
                      <Image src={src || "/placeholder.svg"} alt={`${selectedItem.title} ${index + 1}`} fill className="rounded object-cover" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedItem && (
              <div className="space-y-3 bg-black/90 p-4 text-white">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-xl font-semibold">{selectedItem.title}</h3>
                  {selectedStatus && (
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${BADGES[selectedStatus].className}`}>
                      {BADGES[selectedStatus].label}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-300">
                  {formatDate(selectedItem.date)}
                  {selectedItem.endDate && selectedItem.endDate !== selectedItem.date && ` – ${formatDate(selectedItem.endDate)}`}
                  {(selectedItem.mode || selectedItem.venue) && ` • ${[selectedItem.mode, selectedItem.venue].filter(Boolean).join(", ")}`}
                </p>
                <p className="text-sm text-gray-200">{selectedItem.description}</p>

                {selectedItem.winners && selectedItem.winners.length > 0 && (
                  <div>
                    <h4 className="mb-1 font-semibold">Winners</h4>
                    <ul className="list-disc pl-5 text-sm text-gray-300">
                      {selectedItem.winners.map((w) => (
                        <li key={w}>{w}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
