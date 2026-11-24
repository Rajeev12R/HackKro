import { type NextRequest, NextResponse } from "next/server"
import connectToDatabase from "@/lib/mongoose"
import { getOrganizerFromRequest } from "@/lib/organizer-auth"
import { Opportunity } from "@/models/opportunity"
import { EventRegistration } from "@/models/event-registration"
import { Submission } from "@/models/submission"

export const dynamic = "force-dynamic"

function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-")
}

// GET: List all opportunities for the logged-in organizer
export async function GET(req: NextRequest) {
  try {
    const { organizer } = await getOrganizerFromRequest(req)
    if (!organizer) {
      return NextResponse.json(
        { success: false, message: "Unauthorized. Please log in." },
        { status: 401 }
      )
    }

    await connectToDatabase()

    const opportunities = await Opportunity.find({ organizerId: organizer._id })
      .sort({ createdAt: -1 })
      .lean()

    // Aggregate registration counts and submission counts per opportunity
    const slugs = opportunities.map((o) => o.slug)
    const oppIds = opportunities.map((o) => o._id)

    const regCounts = await EventRegistration.aggregate([
      { $match: { eventId: { $in: slugs }, status: { $ne: "cancelled" } } },
      { $group: { _id: "$eventId", count: { $sum: 1 } } },
    ])

    const subCounts = await Submission.aggregate([
      { $match: { opportunityId: { $in: oppIds } } },
      { $group: { _id: "$opportunityId", count: { $sum: 1 } } },
    ])

    const regCountMap: Record<string, number> = {}
    regCounts.forEach((r) => {
      regCountMap[r._id] = r.count
    })

    const subCountMap: Record<string, number> = {}
    subCounts.forEach((s) => {
      subCountMap[s._id.toString()] = s.count
    })

    const opportunitiesWithStats = opportunities.map((opp) => ({
      ...opp,
      registeredCount: regCountMap[opp.slug] || 0,
      submissionCount: subCountMap[opp._id.toString()] || 0,
      roundsCount: opp.rounds?.length || 0,
    }))

    return NextResponse.json({
      success: true,
      opportunities: opportunitiesWithStats,
    })
  } catch (error: any) {
    console.error("List opportunities error:", error)
    return NextResponse.json(
      { success: false, message: error.message || "Failed to load opportunities." },
      { status: 500 }
    )
  }
}

// POST: Create a new opportunity (Draft or Submit for Approval)
export async function POST(req: NextRequest) {
  try {
    const { organizer } = await getOrganizerFromRequest(req)
    if (!organizer) {
      return NextResponse.json(
        { success: false, message: "Unauthorized. Please log in." },
        { status: 401 }
      )
    }

    const body = await req.json()
    const {
      title,
      category = "Hackathon",
      tagline,
      description,
      longDescription,
      mode = "Online",
      venue,
      location,
      startDate,
      endDate,
      registrationDeadline,
      prizePool,
      teamSize = { min: 1, max: 4 },
      registrationFee = "Free",
      eligibility,
      rules = [],
      perks = [],
      tracks = [],
      image,
      isDraft = true,
      rounds = [],
    } = body

    // Validation
    if (!title || !description || !startDate || !endDate || !registrationDeadline) {
      return NextResponse.json(
        {
          success: false,
          message: "Please fill in all required fields (Title, Description, Dates, Registration Deadline).",
        },
        { status: 400 }
      )
    }

    const start = new Date(startDate)
    const end = new Date(endDate)
    const deadline = new Date(registrationDeadline)

    if (end < start) {
      return NextResponse.json(
        { success: false, message: "End Date cannot be earlier than Start Date." },
        { status: 400 }
      )
    }

    if (deadline > end) {
      return NextResponse.json(
        { success: false, message: "Registration deadline cannot be after the event end date." },
        { status: 400 }
      )
    }

    if (teamSize.min > teamSize.max) {
      return NextResponse.json(
        { success: false, message: "Minimum team size cannot be greater than Maximum team size." },
        { status: 400 }
      )
    }

    await connectToDatabase()

    // Generate unique slug
    let baseSlug = slugify(title)
    if (!baseSlug) baseSlug = "opportunity"
    let slug = baseSlug
    let counter = 1
    while (await Opportunity.findOne({ slug })) {
      slug = `${baseSlug}-${counter}`
      counter++
    }

    // Determine publish status and approval state
    // Rule: Unverified organizers cannot directly publish live; requires admin verification
    let status: "draft" | "under_review" | "published" = "draft"
    let adminApproval: "pending" | "approved" | "rejected" = "pending"
    let isPublished = false

    if (!isDraft) {
      if (organizer.verificationStatus === "verified") {
        status = "published"
        adminApproval = "approved"
        isPublished = true
      } else {
        // Submitted for review by unverified organizer
        status = "under_review"
        adminApproval = "pending"
        isPublished = false
      }
    }

    // Format initial rounds if provided
    const formattedRounds = (rounds || []).map((r: any, idx: number) => ({
      roundNumber: idx + 1,
      name: r.name || `Round ${idx + 1}`,
      type: r.type || "idea_submission",
      description: r.description || "Details for this round",
      instructions: r.instructions || "",
      startDate: r.startDate ? new Date(r.startDate) : start,
      endDate: r.endDate ? new Date(r.endDate) : end,
      submissionRequirements: r.submissionRequirements || "",
      status: "upcoming",
    }))

    const newOpportunity = new Opportunity({
      slug,
      title: title.trim(),
      organizerId: organizer._id,
      organizerEmail: organizer.email,
      organizationName: organizer.organization?.name || organizer.name,
      category,
      tagline: tagline?.trim() || title.trim(),
      description: description.trim(),
      longDescription: longDescription?.trim() || description.trim(),
      mode,
      venue: venue?.trim(),
      location: location?.trim(),
      startDate: start,
      endDate: end,
      registrationOpens: new Date(),
      registrationDeadline: deadline,
      prizePool: prizePool?.trim(),
      teamSize: {
        min: Number(teamSize.min) || 1,
        max: Number(teamSize.max) || 4,
      },
      registrationFee: registrationFee?.trim() || "Free",
      eligibility: eligibility?.trim(),
      rules: Array.isArray(rules) ? rules.filter((r) => r.trim()) : [],
      perks: Array.isArray(perks) ? perks.filter((p) => p.trim()) : [],
      tracks: Array.isArray(tracks) ? tracks.filter((t) => t.trim()) : [],
      image:
        image || "https://res.cloudinary.com/payb7fsq/image/upload/v1793190149/1_1.png",
      status,
      isPublished,
      adminApproval,
      rounds: formattedRounds,
    })

    await newOpportunity.save()

    return NextResponse.json({
      success: true,
      message: isPublished
        ? "Opportunity published successfully! 🎉"
        : status === "under_review"
        ? "Opportunity submitted for review. Publishing is gated until organizer verification."
        : "Opportunity saved as draft.",
      opportunity: newOpportunity,
    })
  } catch (error: any) {
    console.error("Create opportunity error:", error)
    return NextResponse.json(
      { success: false, message: error.message || "Failed to create opportunity." },
      { status: 500 }
    )
  }
}

