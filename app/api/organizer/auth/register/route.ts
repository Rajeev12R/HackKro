import { type NextRequest, NextResponse } from "next/server"
import connectToDatabase from "@/lib/mongoose"
import { Organizer } from "@/models/organizer"
import { hashPassword, signOrganizerToken, ORGANIZER_TOKEN_COOKIE } from "@/lib/organizer-auth"
import { cookies } from "next/headers"

export const dynamic = "force-dynamic"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, email, password, organization } = body

    if (!name || !email || !password || !organization || !organization.name) {
      return NextResponse.json(
        {
          success: false,
          message: "Please fill in all required fields (Name, Email, Password, Organization Name).",
        },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, message: "Password must be at least 6 characters long." },
        { status: 400 }
      )
    }

    await connectToDatabase()

    const cleanEmail = email.trim().toLowerCase()
    const existing = await Organizer.findOne({ email: cleanEmail })
    if (existing) {
      return NextResponse.json(
        { success: false, message: "An account with this email already exists." },
        { status: 409 }
      )
    }

    const passwordHash = hashPassword(password)
    const organizer = new Organizer({
      name: name.trim(),
      email: cleanEmail,
      passwordHash,
      role: "organizer",
      organization: {
        name: organization.name.trim(),
        type: organization.type || "college",
        website: organization.website?.trim(),
        description: organization.description?.trim(),
        contactPhone: organization.contactPhone?.trim(),
        location: organization.location?.trim(),
      },
      // New organizers start as pending until verified by HackKro admin
      verificationStatus: "pending",
    })

    await organizer.save()

    const tokenPayload = {
      organizerId: organizer._id.toString(),
      email: organizer.email,
      name: organizer.name,
      role: organizer.role,
      organizationName: organizer.organization.name,
      verificationStatus: organizer.verificationStatus,
    }

    const token = signOrganizerToken(tokenPayload)

    const cookieStore = await cookies()
    cookieStore.set(ORGANIZER_TOKEN_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      sameSite: "lax",
    })

    return NextResponse.json({
      success: true,
      message: "Organizer account created successfully.",
      organizer: {
        id: organizer._id,
        name: organizer.name,
        email: organizer.email,
        role: organizer.role,
        organization: organizer.organization,
        verificationStatus: organizer.verificationStatus,
      },
      token,
    })
  } catch (error: any) {
    console.error("Organizer registration error:", error)
    return NextResponse.json(
      { success: false, message: error.message || "Failed to create account." },
      { status: 500 }
    )
  }
}

