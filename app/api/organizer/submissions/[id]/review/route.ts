import { type NextRequest, NextResponse } from "next/server"
import connectToDatabase from "@/lib/mongoose"
import { getOrganizerFromRequest } from "@/lib/organizer-auth"
import { Submission } from "@/models/submission"
import { Opportunity } from "@/models/opportunity"

export const dynamic = "force-dynamic"

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { organizer } = await getOrganizerFromRequest(req)
    if (!organizer) {
      return NextResponse.json(
        { success: false, message: "Unauthorized. Please log in as an organizer." },
        { status: 401 }
      )
    }

    await connectToDatabase()

    const submission = await Submission.findById(params.id)
    if (!submission) {
      return NextResponse.json(
        { success: false, message: "Submission not found." },
        { status: 404 }
      )
    }

    // Verify ownership: Opportunity must belong to this organizer
    const opportunity = await Opportunity.findOne({
      _id: submission.opportunityId,
      organizerId: organizer._id,
    })

    if (!opportunity) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Access denied: You are not authorized to review submissions for this opportunity.",
        },
        { status: 403 }
      )
    }

    const body = await req.json()
    const { status, score, feedback } = body

    const previousStatus = submission.status
    const reviewerName = organizer.name || organizer.email

    if (status) {
      const allowedStatuses = ["pending", "reviewed", "shortlisted", "rejected", "needs_changes"]
      if (!allowedStatuses.includes(status)) {
        return NextResponse.json(
          {
            success: false,
            message: `Invalid status. Allowed values: ${allowedStatuses.join(", ")}`,
          },
          { status: 400 }
        )
      }
      submission.status = status
    }

    if (score !== undefined) {
      const numScore = Number(score)
      if (isNaN(numScore) || numScore < 0 || numScore > 100) {
        return NextResponse.json(
          { success: false, message: "Score must be a number between 0 and 100." },
          { status: 400 }
        )
      }
      submission.score = numScore
    }

    if (feedback !== undefined) {
      submission.feedback = feedback.trim()
    }

    submission.reviewedBy = reviewerName
    submission.reviewedAt = new Date()

    // Append to audit history
    submission.auditHistory.push({
      action: "REVIEW_UPDATE",
      changedBy: `${reviewerName} (${organizer.email})`,
      previousStatus,
      newStatus: submission.status,
      timestamp: new Date(),
      notes: feedback ? `Score: ${submission.score ?? "N/A"}. Feedback: ${feedback.substring(0, 80)}` : undefined,
    })

    await submission.save()

    return NextResponse.json({
      success: true,
      message: `Submission marked as "${submission.status}". Audit log updated.`,
      submission,
    })
  } catch (error: any) {
    console.error("Submission review error:", error)
    return NextResponse.json(
      { success: false, message: error.message || "Failed to update review status." },
      { status: 500 }
    )
  }
}

