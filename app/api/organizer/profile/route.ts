import { type NextRequest, NextResponse } from "next/server"
import { getOrganizerFromRequest } from "@/lib/organizer-auth"

export const dynamic = "force-dynamic"

export async function PUT(req: NextRequest) {
  try {
    const { organizer } = await getOrganizerFromRequest(req)
    if (!organizer) {
      return NextResponse.json(
        { success: false, message: "Unauthorized. Please log in." },
        { status: 401 }
      )
    }

    const body = await req.json()
    const { name, organization } = body

    if (name) organizer.name = name.trim()

    if (organization) {
      if (organization.name) organizer.organization.name = organization.name.trim()
      if (organization.type) organizer.organization.type = organization.type
      if (organization.website !== undefined) organizer.organization.website = organization.website.trim()
      if (organization.description !== undefined) organizer.organization.description = organization.description.trim()
      if (organization.contactPhone !== undefined) organizer.organization.contactPhone = organization.contactPhone.trim()
      if (organization.location !== undefined) organizer.organization.location = organization.location.trim()
    }

    await organizer.save()

    return NextResponse.json({
      success: true,
      message: "Organization profile updated successfully.",
      organizer: {
        id: organizer._id,
        name: organizer.name,
        email: organizer.email,
        role: organizer.role,
        organization: organizer.organization,
        verificationStatus: organizer.verificationStatus,
      },
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to update profile." },
      { status: 500 }
    )
  }
}

