import { NextResponse } from "next/server"
import connectToDatabase from "@/lib/mongoose"
import { Subscriber } from "@/models/subscriber"
import { Feedback } from "@/models/feedback"

export async function POST(request: Request) {
  try {
    const { email, reason, additionalFeedback } = await request.json()

    if (!email) {
      return NextResponse.json({ success: false, message: "Email is required" }, { status: 400 })
    }

    if (!reason) {
      return NextResponse.json({ success: false, message: "Reason is required" }, { status: 400 })
    }

    // Connect to the database
    await connectToDatabase()

    // Find the subscriber
    const subscriber = await Subscriber.findOne({ email })

    if (!subscriber) {
      return NextResponse.json({ success: false, message: "Email not found in our subscribers list" }, { status: 404 })
    }

    // Save the feedback
    const feedback = new Feedback({
      email,
      reason,
      additionalFeedback: additionalFeedback || "",
    })
    await feedback.save()

    // Delete the subscriber completely
    await Subscriber.deleteOne({ email })

    return NextResponse.json({
      success: true,
      message: "You have been successfully unsubscribed. Thank you for your feedback.",
    })
  } catch (error) {
    console.error("Error in unsubscribe API:", error)
    return NextResponse.json(
      { success: false, message: "An error occurred while processing your request" },
      { status: 500 },
    )
  }
}

// Keep the GET method for backward compatibility
export async function GET(request: Request) {
  const url = new URL(request.url)
  const email = url.searchParams.get("email")

  // Redirect to the unsubscribe page with the email parameter
  return NextResponse.redirect(`${url.origin}/unsubscribe?email=${email}`)
}
