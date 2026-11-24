import { type NextRequest, NextResponse } from "next/server"
import connectToDatabase from "@/lib/mongoose"
import { getOrganizerFromRequest } from "@/lib/organizer-auth"
import { Opportunity } from "@/models/opportunity"
import mongoose from "mongoose"

export const dynamic = "force-dynamic"

async function findScopedOpportunity(idOrSlug: string, organizerId: any) {
  let query: any = { organizerId }
  if (mongoose.Types.ObjectId.isValid(idOrSlug)) {
    query.$or = [{ _id: idOrSlug }, { slug: idOrSlug }]
  } else {
    query.slug = idOrSlug
  }
  return await Opportunity.findOne(query)
}

// GET: Get single opportunity with ownership enforcement
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { organizer } = await getOrganizerFromRequest(req)
    if (!organizer) {
      return NextResponse.json(
        { success: false, message: "Unauthorized. Please log in." },
        { status: 401 }
      )
    }

    await connectToDatabase()
    const opportunity = await findScopedOpportunity(params.id, organizer._id)

    if (!opportunity) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Opportunity not found or you do not have permission to access it.",
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      opportunity,
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to fetch opportunity." },
      { status: 500 }
    )
  }
}

// PUT: Update opportunity with ownership enforcement
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { organizer } = await getOrganizerFromRequest(req)
    if (!organizer) {
      return NextResponse.json(
        { success: false, message: "Unauthorized. Please log in." },
        { status: 401 }
      )
    }

    await connectToDatabase()
    const opportunity = await findScopedOpportunity(params.id, organizer._id)

    if (!opportunity) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Opportunity not found or you do not have permission to edit it.",
        },
        { status: 404 }
      )
    }

    const body = await req.json()
    const {
      title,
      category,
      tagline,
      description,
      longDescription,
      mode,
      venue,
      location,
      startDate,
      endDate,
      registrationDeadline,
      prizePool,
      teamSize,
      registrationFee,
      eligibility,
      rules,
      perks,
      tracks,
      image,
      status,
    } = body

    if (title) opportunity.title = title.trim()
    if (category) opportunity.category = category
    if (tagline !== undefined) opportunity.tagline = tagline.trim()
    if (description) opportunity.description = description.trim()
    if (longDescription !== undefined) opportunity.longDescription = longDescription.trim()
    if (mode) opportunity.mode = mode
    if (venue !== undefined) opportunity.venue = venue.trim()
    if (location !== undefined) opportunity.location = location.trim()

    if (startDate) opportunity.startDate = new Date(startDate)
    if (endDate) opportunity.endDate = new Date(endDate)
    if (registrationDeadline) opportunity.registrationDeadline = new Date(registrationDeadline)

    if (opportunity.endDate < opportunity.startDate) {
      return NextResponse.json(
        { success: false, message: "End Date cannot be earlier than Start Date." },
        { status: 400 }
      )
    }

    if (prizePool !== undefined) opportunity.prizePool = prizePool.trim()
    if (teamSize) {
      opportunity.teamSize = {
        min: Number(teamSize.min) || 1,
        max: Number(teamSize.max) || 4,
      }
    }
    if (registrationFee !== undefined) opportunity.registrationFee = registrationFee.trim()
    if (eligibility !== undefined) opportunity.eligibility = eligibility.trim()
    if (Array.isArray(rules)) opportunity.rules = rules.filter((r) => r.trim())
    if (Array.isArray(perks)) opportunity.perks = perks.filter((p) => p.trim())
    if (Array.isArray(tracks)) opportunity.tracks = tracks.filter((t) => t.trim())
    if (image) opportunity.image = image

    // Handle status / publishing transitions
    if (status) {
      if (status === "published") {
        if (organizer.verificationStatus === "verified") {
          opportunity.status = "published"
          opportunity.isPublished = true
          opportunity.adminApproval = "approved"
        } else {
          // Unverified organizers are gated
          opportunity.status = "under_review"
          opportunity.isPublished = false
          opportunity.adminApproval = "pending"
        }
      } else if (status === "draft") {
        opportunity.status = "draft"
        opportunity.isPublished = false
      } else if (status === "archived") {
        opportunity.status = "archived"
        opportunity.isPublished = false
      }
    }

    await opportunity.save()

    return NextResponse.json({
      success: true,
      message: "Opportunity updated successfully.",
      opportunity,
    })
  } catch (error: any) {
    console.error("Update opportunity error:", error)
    return NextResponse.json(
      { success: false, message: error.message || "Failed to update opportunity." },
      { status: 500 }
    )
  }
}

// DELETE: Delete or archive opportunity
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { organizer } = await getOrganizerFromRequest(req)
    if (!organizer) {
      return NextResponse.json(
        { success: false, message: "Unauthorized. Please log in." },
        { status: 401 }
      )
    }

    await connectToDatabase()
    const opportunity = await findScopedOpportunity(params.id, organizer._id)

    if (!opportunity) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Opportunity not found or you do not have permission to delete it.",
        },
        { status: 404 }
      )
    }

    await Opportunity.deleteOne({ _id: opportunity._id })

    return NextResponse.json({
      success: true,
      message: "Opportunity deleted successfully.",
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to delete opportunity." },
      { status: 500 }
    )
  }
}

