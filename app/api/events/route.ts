import { NextResponse } from "next/server"
import connectToDatabase from "@/lib/mongoose"
import { EventRegistration } from "@/models/event-registration"
import { Opportunity } from "@/models/opportunity"
import { EVENTS_DATA } from "@/lib/events-data"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    await connectToDatabase()

    // 1. Aggregate registration counts per eventId
    const counts = await EventRegistration.aggregate([
      { $match: { status: { $ne: "cancelled" } } },
      { $group: { _id: "$eventId", count: { $sum: 1 } } },
    ])

    const countMap: Record<string, number> = {}
    counts.forEach((item) => {
      countMap[item._id] = item.count
    })

    // 2. Fetch live published organizer opportunities from MongoDB
    let dbOpportunities: any[] = []
    try {
      dbOpportunities = await Opportunity.find({
        isPublished: true,
        status: "published",
      }).sort({ startDate: 1 }).lean()
    } catch (e) {
      console.warn("Could not fetch DB opportunities:", e)
    }

    const formattedDbEvents = dbOpportunities.map((opp) => ({
      id: opp.slug,
      numericId: opp._id,
      title: opp.title,
      category: opp.category,
      tagline: opp.tagline || opp.title,
      description: opp.description,
      longDescription: opp.longDescription,
      date: new Date(opp.startDate).toISOString().split("T")[0],
      endDate: new Date(opp.endDate).toISOString().split("T")[0],
      mode: opp.mode,
      venue: opp.venue || opp.mode,
      location: opp.location || "Online",
      registrationOpens: opp.registrationOpens
        ? new Date(opp.registrationOpens).toISOString().split("T")[0]
        : undefined,
      registrationDeadline: new Date(opp.registrationDeadline).toISOString().split("T")[0],
      statusOverride: "live",
      featured: true,
      image: opp.image,
      relatedImages: [],
      prizePool: opp.prizePool,
      teamSize: opp.teamSize,
      registrationFee: opp.registrationFee,
      tracks: opp.tracks,
      perks: opp.perks,
      eligibility: opp.eligibility,
      rules: opp.rules,
      organizerName: opp.organizationName || opp.organizerEmail,
      registeredCount: countMap[opp.slug] || 0,
    }))

    // 3. Fallback static events
    const staticEventsWithCounts = EVENTS_DATA.map((event) => ({
      ...event,
      registeredCount: countMap[event.id] || 0,
    }))

    // Deduplicate in case static has same id
    const existingIds = new Set(formattedDbEvents.map((e) => e.id))
    const mergedEvents = [
      ...formattedDbEvents,
      ...staticEventsWithCounts.filter((e) => !existingIds.has(e.id)),
    ]

    return NextResponse.json({
      success: true,
      events: mergedEvents,
    })
  } catch (error) {
    console.error("Error fetching events:", error)
    // Fallback to static events if DB connection is in progress
    return NextResponse.json({
      success: true,
      events: EVENTS_DATA.map((e) => ({ ...e, registeredCount: 0 })),
    })
  }
}
