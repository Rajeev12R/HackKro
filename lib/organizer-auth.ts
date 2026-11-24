import crypto from "crypto"
import { sign, verify } from "jsonwebtoken"
import { cookies } from "next/headers"
import type { NextRequest } from "next/server"
import connectToDatabase from "@/lib/mongoose"
import { Organizer, type IOrganizer } from "@/models/organizer"

const JWT_SECRET = process.env.JWT_SECRET || "dev-jwt-secret-key-hackkro-2026"
export const ORGANIZER_TOKEN_COOKIE = "organizer-token"

export interface OrganizerTokenPayload {
  organizerId: string
  email: string
  name: string
  role: "organizer" | "admin"
  organizationName: string
  verificationStatus: "pending" | "verified" | "rejected"
}

// Password hashing using PBKDF2 (Native Node crypto)
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex")
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex")
  return `${salt}:${hash}`
}

export function verifyPassword(password: string, storedHash: string): boolean {
  if (!storedHash || !storedHash.includes(":")) return false
  const [salt, originalHash] = storedHash.split(":")
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex")
  return hash === originalHash
}

// Generate JWT token
export function signOrganizerToken(payload: OrganizerTokenPayload): string {
  return sign(payload, JWT_SECRET, { expiresIn: "7d" })
}

// Verify JWT token
export function verifyOrganizerToken(token: string): OrganizerTokenPayload | null {
  try {
    return verify(token, JWT_SECRET) as OrganizerTokenPayload
  } catch {
    return null
  }
}

// Retrieve organizer session from NextRequest (Cookies or Bearer Authorization)
export async function getOrganizerFromRequest(
  req?: NextRequest
): Promise<{ organizer: IOrganizer | null; tokenPayload: OrganizerTokenPayload | null }> {
  try {
    let token: string | undefined

    if (req) {
      token = req.cookies.get(ORGANIZER_TOKEN_COOKIE)?.value
      if (!token) {
        const authHeader = req.headers.get("authorization")
        if (authHeader && authHeader.startsWith("Bearer ")) {
          token = authHeader.substring(7)
        }
      }
    } else {
      const cookieStore = await cookies()
      token = cookieStore.get(ORGANIZER_TOKEN_COOKIE)?.value
    }

    if (!token) {
      return { organizer: null, tokenPayload: null }
    }

    const payload = verifyOrganizerToken(token)
    if (!payload || !payload.organizerId) {
      return { organizer: null, tokenPayload: null }
    }

    await connectToDatabase()
    const organizer = await Organizer.findById(payload.organizerId)
    if (!organizer) {
      return { organizer: null, tokenPayload: null }
    }

    return { organizer, tokenPayload: payload }
  } catch (error) {
    console.error("Error authenticating organizer:", error)
    return { organizer: null, tokenPayload: null }
  }
}

