import { type NextRequest, NextResponse } from "next/server"
import { getOrganizerFromRequest } from "@/lib/organizer-auth"

export const dynamic = "force-dynamic"

export async function GET(req: NextRequest) {
  try {
    const { organizer, tokenPayload } = await getOrganizerFromRequest(req)

    if (!organizer || !tokenPayload) {
      return NextResponse.json(
        { success: false, authenticated: false, message: "Not authenticated" },
        { status: 401 }
      )
    }

    return NextResponse.json({
      success: true,
      authenticated: true,
      organizer: {
        id: organizer._id,
        name: organizer.name,
        email: organizer.email,
        role: organizer.role,
        organization: organizer.organization,
        verificationStatus: organizer.verificationStatus,
        verifiedAt: organizer.verifiedAt,
        rejectionReason: organizer.rejectionReason,
        createdAt: organizer.createdAt,
      },
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Session check failed" },
      { status: 500 }
    )
  }
}

