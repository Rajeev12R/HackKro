import { type NextRequest, NextResponse } from "next/server"
import connectToDatabase from "@/lib/mongoose"
import { getOrganizerFromRequest } from "@/lib/organizer-auth"
import { Opportunity } from "@/models/opportunity"
import { Submission } from "@/models/submission"
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

// GET: Get submissions for an opportunity with optional round & status filter
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
            "Opportunity not found or you do not have permission to view its submissions.",
        },
        { status: 404 }
      )
    }

    const { searchParams } = new URL(req.url)
    const roundNumber = searchParams.get("round")
    const status = searchParams.get("status")
    const search = searchParams.get("search")?.trim()

    const query: any = {
      opportunityId: opportunity._id,
    }

    if (roundNumber && roundNumber !== "all") {
      query.roundNumber = parseInt(roundNumber, 10)
    }

    if (status && status !== "all") {
      query.status = status
    }

    if (search) {
      const searchRegex = new RegExp(search, "i")
      query.$or = [
        { participantName: searchRegex },
        { participantEmail: searchRegex },
        { teamName: searchRegex },
        { title: searchRegex },
        { registrationId: searchRegex },
      ]
    }

    const submissions = await Submission.find(query).sort({ submittedAt: -1 }).lean()

    // Aggregate round-wise stats
    const roundStats = await Submission.aggregate([
      { $match: { opportunityId: opportunity._id } },
      {
        $group: {
          _id: {
            roundNumber: "$roundNumber",
            status: "$status",
          },
          count: { $sum: 1 },
        },
      },
    ])

    return NextResponse.json({
      success: true,
      opportunity: {
        id: opportunity._id,
        title: opportunity.title,
        slug: opportunity.slug,
        rounds: opportunity.rounds || [],
      },
      submissions,
      roundStats,
    })
  } catch (error: any) {
    console.error("Fetch submissions error:", error)
    return NextResponse.json(
      { success: false, message: error.message || "Failed to load submissions." },
      { status: 500 }
    )
  }
}

// POST: Add submission (Used by participant flow or for testing)
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase()

    let opportunity = null
    if (mongoose.Types.ObjectId.isValid(params.id)) {
      opportunity = await Opportunity.findById(params.id)
    }
    if (!opportunity) {
      opportunity = await Opportunity.findOne({ slug: params.id })
    }

    if (!opportunity) {
      return NextResponse.json(
        { success: false, message: "Opportunity not found." },
        { status: 404 }
      )
    }

    const body = await req.json()
    const {
      roundNumber = 1,
      roundName,
      registrationId,
      participantName,
      participantEmail,
      teamName,
      title,
      description,
      links,
    } = body

    if (!registrationId || !participantName || !participantEmail || !title || !description) {
      return NextResponse.json(
        { success: false, message: "Missing required submission fields." },
        { status: 400 }
      )
    }

    const resolvedRound =
      opportunity.rounds?.find((r) => r.roundNumber === Number(roundNumber)) || {
        name: roundName || `Round ${roundNumber}`,
      }

    // Check if already submitted for this round
    const existing = await Submission.findOne({
      opportunityId: opportunity._id,
      roundNumber: Number(roundNumber),
      registrationId,
    })

    if (existing) {
      return NextResponse.json(
        {
          success: false,
          message: "You have already submitted for this round.",
          submissionId: existing._id,
        },
        { status: 409 }
      )
    }

    const submission = new Submission({
      opportunityId: opportunity._id,
      opportunitySlug: opportunity.slug,
      roundNumber: Number(roundNumber),
      roundName: resolvedRound.name,
      registrationId,
      participantName: participantName.trim(),
      participantEmail: participantEmail.trim().toLowerCase(),
      teamName: teamName?.trim(),
      title: title.trim(),
      description: description.trim(),
      links: {
        githubUrl: links?.githubUrl?.trim(),
        demoUrl: links?.demoUrl?.trim(),
        driveUrl: links?.driveUrl?.trim(),
        fileUrl: links?.fileUrl?.trim(),
      },
      submittedAt: new Date(),
      status: "pending",
      auditHistory: [
        {
          action: "CREATED",
          changedBy: participantName.trim(),
          previousStatus: "none",
          newStatus: "pending",
          timestamp: new Date(),
          notes: "Initial project submission",
        },
      ],
    })

    await submission.save()

    return NextResponse.json({
      success: true,
      message: "Submission received successfully! 🎉",
      submission,
    })
  } catch (error: any) {
    console.error("Submission creation error:", error)
    return NextResponse.json(
      { success: false, message: error.message || "Failed to process submission." },
      { status: 500 }
    )
  }
}

