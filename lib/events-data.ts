export type EventStatus = "live" | "coming-soon" | "past" | "Closed" | "closed"
export type EventMode = "Online" | "Offline" | "Hybrid"
export type EventCategory =
  | "Hackathon"
  | "Workshop & Masterclass"
  | "Pitching Challenge"
  | "Tech Conclave"
  | "Innovation Expo"
  | "Technical Quiz"
  | "Business Quiz"

export interface EventItem {
  id: string // slug id, e.g. "codefest-2026"
  numericId: number
  title: string
  category: EventCategory
  tagline: string
  description: string
  longDescription?: string
  date: string // YYYY-MM-DD (start date)
  endDate?: string // YYYY-MM-DD
  mode: EventMode
  venue?: string
  location?: string
  registrationOpens?: string
  registrationDeadline?: string
  statusOverride?: EventStatus
  featured?: boolean
  image: string
  relatedImages: string[]
  prizePool?: string
  teamSize?: {
    min: number
    max: number
  }
  registrationFee?: string // e.g., "Free"
  tracks?: string[]
  perks?: string[]
  eligibility?: string
  rules?: string[]
  winners?: string[]
  resultsUrl?: string
}

export const EVENTS_DATA: EventItem[] = [
  {
    id: "codefest-2026",
    numericId: 11,
    title: "CODESPRINT 2026",
    category: "Technical Quiz",
    tagline: "India's premier an-hour technical quiz for student builders and developers.",
    description:
      "A high-octane an-hour technical quiz bringing together coders, designers, and innovators.",
    longDescription:
      "CODESPRINT 2026 invites coders from Meerut Institute of Technology to participate and compete.",
    date: "2026-10-30",
    endDate: "2026-10-30",
    mode: "Offline",
    venue: "MIT",
    location: "Meerut, Uttar Pradesh",
    registrationOpens: "2026-10-26",
    registrationDeadline: "2026-10-30",
    statusOverride: "Closed",
    featured: true,
    image: "https://res.cloudinary.com/payb7fsq/image/upload/v1793190149/1_1.png",
    relatedImages: [
      "https://res.cloudinary.com/dp2olwtzp/image/upload/v1772864450/techfest_5_page-0001_vl4ykn.jpg",
      "https://res.cloudinary.com/dp2olwtzp/image/upload/v1772864449/techfest_4_page-0001_bktdjp.jpg",
    ],
    prizePool: "Recognition Award for winners",
    teamSize: { min: 1, max: 1 },
    registrationFee: "Free",
    tracks: [
      "C Programming Quiz",
    ],
    perks: [
      "Verified Certificate of Participation for all attendees",
      "Exclusive HackKro Hacker Swag Kit & Goodies",
    ],
    eligibility: "Open to B.Tech and BCA Students from Meerut Institute of Technology.",
    rules: [
      "Plagiarism or cheating leads to immediate disqualification.",
    ],
  },
  {
    id: "businesssprint-2026",
    numericId: 12,
    title: "BUSINESSSPRINT 2026",
    category: "Business Quiz",
    tagline: "India's premier business quiz for students.",
    description:
      "A high-octane business quiz bringing together students, business enthusiasts, and innovators.",
    longDescription:
      "BUSINESSSPRINT 2026 invites students from Meerut Institute of Technology to compete and learn new business topics.",
    date: "2026-11-05",
    endDate: "2026-11-05",
    mode: "Offline",
    venue: "Meerut Institute of Technology",
    location: "Meerut, Uttar Pradesh",
    registrationOpens: "2026-10-28",
    registrationDeadline: "2026-11-05",
    statusOverride: "live",
    featured: true,
    image: "https://res.cloudinary.com/payb7fsq/image/upload/v1793190184/2_1.png",
    relatedImages: [
      "https://res.cloudinary.com/dp2olwtzp/image/upload/v1772864450/techfest_5_page-0001_vl4ykn.jpg",
      "https://res.cloudinary.com/dp2olwtzp/image/upload/v1772864449/techfest_4_page-0001_bktdjp.jpg",
    ],
    prizePool: "Recognition Award for winners",
    teamSize: { min: 1, max: 1 },
    registrationFee: "Free",
    tracks: [
      "Business Quiz",
    ],
    perks: [
      "Verified Certificate of Participation for all attendees",
      "Exclusive HackKro Swag Kit & Goodies",
    ],
    eligibility: "Open to BBA Students from Meerut Institute of Technology.",
    rules: [
      "Plagiarism or cheating leads to immediate disqualification.",
    ],
  },
]

export function getEventById(id: string): EventItem | undefined {
  return EVENTS_DATA.find(
    (e) =>
      e.id === id ||
      String(e.numericId) === id ||
      (id === "codesprint-2026" && e.id === "codefest-2026")
  )
}

export function getLiveAndUpcomingEvents(): EventItem[] {
  return EVENTS_DATA.filter((e) => e.statusOverride === "live" || e.statusOverride === "coming-soon")
}
