import { NextResponse } from "next/server"
import connectToDatabase from "@/lib/mongoose"
import { Test } from "@/models/test"
import { TestCandidate } from "@/models/test-candidate"
import { seedDefaultTestIfNeeded } from "@/lib/test-library"
import { sign } from "jsonwebtoken"
import { cookies } from "next/headers"

export const dynamic = "force-dynamic"

const JWT_SECRET = process.env.JWT_SECRET || "dev-jwt-secret-key"

export async function POST(request: Request) {
  try {
    const { loginId, password, testId } = await request.json()

    if (!loginId || !password) {
      return NextResponse.json(
        { success: false, message: "Please provide both Login ID / Email and Password" },
        { status: 400 }
      )
    }

    await connectToDatabase()
    await seedDefaultTestIfNeeded()

    const cleanLoginId = loginId.trim().toLowerCase()
    const cleanPassword = password.trim()

    // Query candidate: support specific testId or match by password to find correct test
    let candidate = null
    if (testId) {
      candidate = await TestCandidate.findOne({
        testId,
        $or: [{ email: cleanLoginId }, { loginId: cleanLoginId }],
      })
    } else {
      // Try matching by password + loginId first (identifies test if candidate has tests on different dates)
      candidate = await TestCandidate.findOne({
        password: cleanPassword,
        $or: [{ email: cleanLoginId }, { loginId: cleanLoginId }],
      })
      if (!candidate) {
        candidate = await TestCandidate.findOne({
          $or: [{ email: cleanLoginId }, { loginId: cleanLoginId }],
        })
      }
    }

    if (!candidate) {
      return NextResponse.json(
        {
          success: false,
          message:
            "No candidate record found with this Login ID / Email. Please check your credentials or contact HackKro support.",
        },
        { status: 404 }
      )
    }

    // Check whitelist / eligibility
    if (!candidate.isEligible) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Your access to this test is currently disabled or pending admin approval. Only whitelisted candidates may participate.",
        },
        { status: 403 }
      )
    }

    // Check password
    if (candidate.password !== cleanPassword) {
      return NextResponse.json(
        {
          success: false,
          message: "Incorrect password. Please enter the exact password sent to your email.",
        },
        { status: 401 }
      )
    }

    // Fetch test details
    const test = await Test.findOne({ testId: candidate.testId })
    if (!test || !test.isActive) {
      return NextResponse.json(
        {
          success: false,
          message: "This test is currently inactive or not available.",
        },
        { status: 400 }
      )
    }

    // Create session token
    const tokenPayload = {
      candidateId: candidate._id.toString(),
      testId: candidate.testId,
      email: candidate.email,
      name: candidate.name,
    }

    const token = sign(tokenPayload, JWT_SECRET, { expiresIn: "12h" })

    // Set cookie
    const cookieStore = await cookies()
    cookieStore.set("test-candidate-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 12,
      sameSite: "lax",
    })

    const isDeclared = Boolean(test.isResultDeclared)

    return NextResponse.json({
      success: true,
      message: "Login successful",
      token,
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
    console.error("Test login error:", error)
    return NextResponse.json(
      { success: false, message: error?.message || "An error occurred during login" },
      { status: 500 }
    )
  }
}
