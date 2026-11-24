import { NextResponse } from "next/server"
import connectToDatabase from "@/lib/mongoose"
import { evaluateAndRankCandidate, formatTimeTaken } from "@/lib/test-evaluator"
import { verify } from "jsonwebtoken"
import { cookies } from "next/headers"

export const dynamic = "force-dynamic"

const JWT_SECRET = process.env.JWT_SECRET || "dev-jwt-secret-key"

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies()
    let token = cookieStore.get("test-candidate-token")?.value

    if (!token) {
      const authHeader = request.headers.get("authorization")
      if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.substring(7)
      }
    }

    if (!token) {
      return NextResponse.json({ success: false, message: "Authentication required" }, { status: 401 })
    }

    let decoded: any
    try {
      decoded = verify(token, JWT_SECRET)
    } catch {
      return NextResponse.json({ success: false, message: "Session expired" }, { status: 401 })
    }

    const { answers, tabSwitches } = await request.json()

    await connectToDatabase()

    const { candidate, test } = await evaluateAndRankCandidate({
      testId: decoded.testId,
      candidateId: decoded.candidateId,
      answers: Array.isArray(answers) ? answers : [],
      tabSwitches: typeof tabSwitches === "number" ? tabSwitches : 0,
    })

    const timeTakenFormatted = formatTimeTaken(candidate.timeTakenSeconds || 0)

    // IMPORTANT:
    // 1. Result email is NEVER sent upon student test submission.
    // 2. Score and Rank are NEVER shown immediately upon submission.
    // 3. Results will only be revealed when declared from the Admin Dashboard after the event finishes.

    return NextResponse.json({
      success: true,
      message: "Test submitted successfully! Your responses have been recorded.",
      isResultDeclared: false,
      result: {
        score: null,
        totalMarks: test?.totalMarks || 10,
        rank: null,
        timeTakenSeconds: candidate.timeTakenSeconds,
        timeTakenFormatted,
        submittedAt: candidate.submittedAt,
        status: candidate.status,
      },
    })
  } catch (error: any) {
    console.error("Test submit error:", error)
    return NextResponse.json(
      { success: false, message: error?.message || "Failed to submit test" },
      { status: 500 }
    )
  }
}
