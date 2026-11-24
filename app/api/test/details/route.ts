import { NextResponse } from "next/server"
import connectToDatabase from "@/lib/mongoose"
import { Test } from "@/models/test"
import { TestCandidate } from "@/models/test-candidate"
import { seedDefaultTestIfNeeded } from "@/lib/test-library"
import { verify } from "jsonwebtoken"
import { cookies } from "next/headers"

export const dynamic = "force-dynamic"

const JWT_SECRET = process.env.JWT_SECRET || "dev-jwt-secret-key"

export async function GET(request: Request) {
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
      return NextResponse.json({ authenticated: false, message: "Authentication required" }, { status: 401 })
    }

    let decoded: any
    try {
      decoded = verify(token, JWT_SECRET)
    } catch {
      return NextResponse.json({ authenticated: false, message: "Session expired" }, { status: 401 })
    }

    await connectToDatabase()
    await seedDefaultTestIfNeeded()

    const candidate = await TestCandidate.findById(decoded.candidateId)
    if (!candidate) {
      return NextResponse.json({ authenticated: false, message: "Candidate record not found" }, { status: 404 })
    }

    if (!candidate.isEligible) {
      return NextResponse.json(
        { authenticated: false, message: "Your access to this test is not approved" },
        { status: 403 }
      )
    }

    const test = await Test.findOne({ testId: candidate.testId })
    if (!test) {
      return NextResponse.json({ success: false, message: "Test not found" }, { status: 404 })
    }

    const isDeclared = Boolean(test.isResultDeclared)

    return NextResponse.json({
      authenticated: true,
      candidate: {
        id: candidate._id,
        name: candidate.name,
        email: candidate.email,
        loginId: candidate.loginId,
        college: candidate.college,
        registrationId: candidate.registrationId,
        status: candidate.status,
        score: isDeclared ? candidate.score : null,
        rank: isDeclared ? candidate.rank : null,
        timeTakenSeconds: candidate.timeTakenSeconds,
        startedAt: candidate.startedAt,
        submittedAt: candidate.submittedAt,
        tabSwitches: candidate.tabSwitches,
      },
      test: {
        testId: test.testId,
        title: test.title,
        eventId: test.eventId,
        eventTitle: test.eventTitle,
        description: test.description,
        instructions: test.instructions,
        durationMinutes: test.durationMinutes,
        totalMarks: test.totalMarks,
        totalQuestions: test.questions.length,
        scheduledDate: test.scheduledDate,
        startTime: test.startTime,
        endTime: test.endTime,
        isResultDeclared: isDeclared,
      },
    })
  } catch (error: any) {
    console.error("Test details error:", error)
    return NextResponse.json(
      { authenticated: false, message: error?.message || "Failed to fetch test details" },
      { status: 500 }
    )
  }
}
