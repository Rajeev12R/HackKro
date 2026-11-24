import { type NextRequest, NextResponse } from "next/server"
import connectToDatabase from "@/lib/mongoose"
import { getOrganizerFromRequest } from "@/lib/organizer-auth"
import { Opportunity } from "@/models/opportunity"
import { EventRegistration } from "@/models/event-registration"
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

    // 1. Strict ownership enforcement: Must belong to THIS organizer
    const opportunity = await findScopedOpportunity(params.id, organizer._id)
    if (!opportunity) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Opportunity not found or you do not have permission to view its registrations.",
        },
        { status: 404 }
      )
    }

    const { searchParams } = new URL(req.url)
    const search = searchParams.get("search")?.trim() || ""
    const participationType = searchParams.get("type") || "all" // "solo" | "team" | "all"
    const status = searchParams.get("status") || "all" // "confirmed" | "waitlist" | "cancelled" | "all"
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "15", 10)))
    const format = searchParams.get("format") // "csv" | "json"

    // 2. Query filter matching eventId = opportunity.slug
    const query: any = {
      eventId: opportunity.slug,
    }

    if (participationType !== "all") {
      query.participationType = participationType
    }

    if (status !== "all") {
      query.status = status
    }

    if (search) {
      const searchRegex = new RegExp(search, "i")
      query.$or = [
        { name: searchRegex },
        { email: searchRegex },
        { registrationId: searchRegex },
        { college: searchRegex },
        { teamName: searchRegex },
      ]
    }

    // Handle CSV export request
    if (format === "csv") {
      const allRegistrations = await EventRegistration.find(query).sort({ registeredAt: -1 }).lean()

      const headers = [
        "Registration ID",
        "Participant Name",
        "Email",
        "Phone",
        "College / Institution",
        "Graduation Year",
        "Branch",
        "Participation Type",
        "Team Name",
        "Team Members",
        "Domain",
        "Status",
        "Registered At",
      ]

      const csvRows = [headers.join(",")]

      allRegistrations.forEach((reg) => {
        const teamMembersStr = (reg.teamMembers || [])
          .map((m: any) => `${m.name} (${m.email})`)
          .join("; ")

        const row = [
          `"${reg.registrationId}"`,
          `"${(reg.name || "").replace(/"/g, '""')}"`,
          `"${reg.email}"`,
          `"${reg.phone}"`,
          `"${(reg.college || "").replace(/"/g, '""')}"`,
          `"${reg.graduationYear || ""}"`,
          `"${reg.branch || ""}"`,
          `"${reg.participationType}"`,
          `"${(reg.teamName || "").replace(/"/g, '""')}"`,
          `"${teamMembersStr.replace(/"/g, '""')}"`,
          `"${(reg.domain || "").replace(/"/g, '""')}"`,
          `"${reg.status}"`,
          `"${new Date(reg.registeredAt).toISOString()}"`,
        ]
        csvRows.push(row.join(","))
      })

      const csvContent = csvRows.join("\n")

      return new NextResponse(csvContent, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="${opportunity.slug}-registrations.csv"`,
        },
      })
    }

    // 3. Paginated query
    const total = await EventRegistration.countDocuments(query)
    const registrations = await EventRegistration.find(query)
      .sort({ registeredAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean()

    // 4. Registration statistics for this event
    const statsResult = await EventRegistration.aggregate([
      { $match: { eventId: opportunity.slug } },
      {
        $group: {
          _id: {
            participationType: "$participationType",
            status: "$status",
          },
          count: { $sum: 1 },
        },
      },
    ])

    let soloCount = 0
    let teamCount = 0
    let confirmedCount = 0
    let waitlistCount = 0

    statsResult.forEach((item) => {
      if (item._id.participationType === "solo") soloCount += item.count
      if (item._id.participationType === "team") teamCount += item.count
      if (item._id.status === "confirmed") confirmedCount += item.count
      if (item._id.status === "waitlist") waitlistCount += item.count
    })

    return NextResponse.json({
      success: true,
      opportunity: {
        id: opportunity._id,
        title: opportunity.title,
        slug: opportunity.slug,
        category: opportunity.category,
      },
      registrations,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
      stats: {
        total,
        soloCount,
        teamCount,
        confirmedCount,
        waitlistCount,
      },
    })
  } catch (error: any) {
    console.error("Registrations roster error:", error)
    return NextResponse.json(
      { success: false, message: error.message || "Failed to load registrations roster." },
      { status: 500 }
    )
  }
}

