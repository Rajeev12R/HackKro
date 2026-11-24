import { type NextRequest, NextResponse } from "next/server"
import connectToDatabase from "@/lib/mongoose"
import { Organizer } from "@/models/organizer"
import { verifyPassword, signOrganizerToken, ORGANIZER_TOKEN_COOKIE } from "@/lib/organizer-auth"
import { cookies } from "next/headers"

export const dynamic = "force-dynamic"

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: "Please provide both email and password." },
        { status: 400 }
      )
    }

    await connectToDatabase()

    const cleanEmail = email.trim().toLowerCase()
    const organizer = await Organizer.findOne({ email: cleanEmail })

    if (!organizer) {
      return NextResponse.json(
        { success: false, message: "No organizer account found with this email." },
        { status: 404 }
      )
    }

    const isValid = verifyPassword(password, organizer.passwordHash)
    if (!isValid) {
      return NextResponse.json(
        { success: false, message: "Incorrect password. Please try again." },
        { status: 401 }
      )
    }

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
      maxAge: 60 * 60 * 24 * 7,
      sameSite: "lax",
    })

    return NextResponse.json({
      success: true,
      message: "Login successful.",
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
    console.error("Organizer login error:", error)
    return NextResponse.json(
      { success: false, message: error.message || "Failed to log in." },
      { status: 500 }
    )
  }
}

