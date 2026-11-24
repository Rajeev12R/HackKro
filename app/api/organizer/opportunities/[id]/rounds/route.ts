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

// GET: Get all rounds for an opportunity
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
        { success: false, message: "Opportunity not found or access denied." },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      opportunityTitle: opportunity.title,
      rounds: opportunity.rounds || [],
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to load rounds." },
      { status: 500 }
    )
  }
}

// POST: Add or update rounds with date consistency and order validation
export async function POST(
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
        { success: false, message: "Opportunity not found or access denied." },
        { status: 404 }
      )
    }

    const body = await req.json()
    const { rounds } = body

    if (!Array.isArray(rounds) || rounds.length === 0) {
      return NextResponse.json(
        { success: false, message: "At least one round is required." },
        { status: 400 }
      )
    }

    // Validate rounds order and dates
    const formattedRounds = []
    let previousEndDate: Date | null = null

    for (let i = 0; i < rounds.length; i++) {
      const r = rounds[i]
      if (!r.name || !r.description || !r.startDate || !r.endDate) {
        return NextResponse.json(
          {
            success: false,
            message: `Round ${i + 1} is missing required fields (Name, Description, Start Date, End Date).`,
          },
          { status: 400 }
        )
      }

      const start = new Date(r.startDate)
      const end = new Date(r.endDate)

      if (end < start) {
        return NextResponse.json(
          {
            success: false,
            message: `Round ${i + 1} (${r.name}): End Date cannot be earlier than Start Date.`,
          },
          { status: 400 }
        )
      }

      // Validate sequential dates: Round N should not start significantly before Round N-1 ends
      if (previousEndDate && start < previousEndDate) {
        return NextResponse.json(
          {
            success: false,
            message: `Round ${i + 1} (${r.name}) Start Date cannot be earlier than Round ${i} End Date.`,
          },
          { status: 400 }
        )
      }

      previousEndDate = end

      formattedRounds.push({
        roundNumber: i + 1,
        name: r.name.trim(),
        type: r.type || "idea_submission",
        description: r.description.trim(),
        instructions: r.instructions?.trim() || "",
        startDate: start,
        endDate: end,
        submissionRequirements: r.submissionRequirements?.trim() || "",
        status: r.status || "upcoming",
      })
    }

    opportunity.rounds = formattedRounds as any
    await opportunity.save()

    return NextResponse.json({
      success: true,
      message: "Rounds updated successfully.",
      rounds: opportunity.rounds,
    })
  } catch (error: any) {
    console.error("Save rounds error:", error)
    return NextResponse.json(
      { success: false, message: error.message || "Failed to update rounds." },
      { status: 500 }
    )
  }
}

