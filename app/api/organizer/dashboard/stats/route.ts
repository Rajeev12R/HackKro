import { type NextRequest, NextResponse } from "next/server"
import connectToDatabase from "@/lib/mongoose"
import { getOrganizerFromRequest } from "@/lib/organizer-auth"
import { Opportunity } from "@/models/opportunity"
import { EventRegistration } from "@/models/event-registration"
import { Submission } from "@/models/submission"

export const dynamic = "force-dynamic"

export async function GET(req: NextRequest) {
  try {
    const { organizer } = await getOrganizerFromRequest(req)
    if (!organizer) {
      return NextResponse.json(
        { success: false, message: "Unauthorized. Please log in as an organizer." },
        { status: 401 }
      )
    }

    await connectToDatabase()

    // 1. Fetch opportunities strictly scoped to this organizer
    const opportunities = await Opportunity.find({ organizerId: organizer._id }).lean()

    const totalOpportunities = opportunities.length
    const publishedOpportunities = opportunities.filter((o) => o.isPublished && o.status === "published").length
    const draftOpportunities = opportunities.filter((o) => o.status === "draft").length
    const underReviewOpportunities = opportunities.filter((o) => o.status === "under_review").length

    const opportunitySlugs = opportunities.map((o) => o.slug)
    const opportunityIds = opportunities.map((o) => o._id)

    // 2. Fetch registrations strictly scoped to this organizer's opportunities
    // Participants register with eventId = opportunity.slug
    let totalRegistrations = 0
    let teamRegistrations = 0
    let soloRegistrations = 0

    if (opportunitySlugs.length > 0) {
      const regCounts = await EventRegistration.aggregate([
        { $match: { eventId: { $in: opportunitySlugs }, status: { $ne: "cancelled" } } },
        {
          $group: {
            _id: "$participationType",
            count: { $sum: 1 },
          },
        },
      ])

      regCounts.forEach((item) => {
        if (item._id === "team") teamRegistrations = item.count
        else if (item._id === "solo") soloRegistrations = item.count
      })
      totalRegistrations = teamRegistrations + soloRegistrations
    }

    // 3. Fetch submissions strictly scoped to this organizer's opportunities
    let totalSubmissions = 0
    let pendingReviews = 0
    let shortlistedCount = 0

    if (opportunityIds.length > 0) {
      const subCounts = await Submission.aggregate([
        { $match: { opportunityId: { $in: opportunityIds } } },
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
          },
        },
      ])

      subCounts.forEach((item) => {
        totalSubmissions += item.count
        if (item._id === "pending" || item._id === "needs_changes") pendingReviews += item.count
        if (item._id === "shortlisted") shortlistedCount += item.count
      })
    }

    // 4. Calculate upcoming deadlines
    const now = new Date()
    const upcomingDeadlines = opportunities
      .filter((o) => new Date(o.registrationDeadline) > now && o.status === "published")
      .sort((a, b) => new Date(a.registrationDeadline).getTime() - new Date(b.registrationDeadline).getTime())
      .slice(0, 5)
      .map((o) => ({
        id: o._id,
        title: o.title,
        slug: o.slug,
        deadline: o.registrationDeadline,
        category: o.category,
      }))

    return NextResponse.json({
      success: true,
      stats: {
        totalOpportunities,
        publishedOpportunities,
        draftOpportunities,
        underReviewOpportunities,
        totalRegistrations,
        teamRegistrations,
        soloRegistrations,
        totalSubmissions,
        pendingReviews,
        shortlistedCount,
      },
      upcomingDeadlines,
      verificationStatus: organizer.verificationStatus,
      organizationName: organizer.organization?.name || organizer.name,
    })
  } catch (error: any) {
    console.error("Dashboard stats error:", error)
    return NextResponse.json(
      { success: false, message: error.message || "Failed to load dashboard statistics." },
      { status: 500 }
    )
  }
}

