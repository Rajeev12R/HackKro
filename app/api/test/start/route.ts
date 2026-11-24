import { NextResponse } from "next/server"
import connectToDatabase from "@/lib/mongoose"
import { Test, type ITestQuestion } from "@/models/test"
import { TestCandidate } from "@/models/test-candidate"
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

    await connectToDatabase()

    const candidate = await TestCandidate.findById(decoded.candidateId)
    if (!candidate) {
      return NextResponse.json({ success: false, message: "Candidate not found" }, { status: 404 })
    }

    if (!candidate.isEligible) {
      return NextResponse.json({ success: false, message: "Candidate is not eligible" }, { status: 403 })
    }

    if (candidate.status === "submitted") {
      return NextResponse.json(
        { success: false, message: "Test has already been submitted", alreadySubmitted: true },
        { status: 400 }
      )
    }

    const test = await Test.findOne({ testId: candidate.testId })
    if (!test || !test.isActive) {
      return NextResponse.json({ success: false, message: "Test is not active" }, { status: 400 })
    }

    const now = new Date()
    if (!candidate.startedAt || candidate.status === "not-started") {
      candidate.startedAt = now
      candidate.status = "in-progress"
      await candidate.save()
    }

    const elapsedSeconds = Math.round((now.getTime() - new Date(candidate.startedAt).getTime()) / 1000)
    const totalDurationSeconds = (test.durationMinutes || 30) * 60
    const remainingSeconds = Math.max(0, totalDurationSeconds - elapsedSeconds)

    // Security: Sanitize questions by stripping correctOptionId & explanation
    const sanitizedQuestions = test.questions.map((q: ITestQuestion, idx: number) => ({
      id: q.id || `q_${idx}`,
      number: idx + 1,
      question: q.question,
      codeSnippet: q.codeSnippet || "",
      options: q.options.map((opt) => ({
        id: opt.id,
        text: opt.text,
      })),
      points: q.points || 1,
    }))

    return NextResponse.json({
      success: true,
      message: "Test session started",
      startedAt: candidate.startedAt,
      remainingSeconds,
      totalDurationSeconds,
      questions: sanitizedQuestions,
      savedAnswers: candidate.answers || [],
    })
  } catch (error: any) {
    console.error("Test start error:", error)
    return NextResponse.json(
      { success: false, message: error?.message || "Failed to start test" },
      { status: 500 }
    )
  }
}
