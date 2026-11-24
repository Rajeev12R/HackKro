import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { ORGANIZER_TOKEN_COOKIE } from "@/lib/organizer-auth"

export const dynamic = "force-dynamic"

export async function POST() {
  const cookieStore = await cookies()
  cookieStore.delete(ORGANIZER_TOKEN_COOKIE)
  return NextResponse.json({ success: true, message: "Logged out successfully." })
}

