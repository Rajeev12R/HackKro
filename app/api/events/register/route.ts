import { type NextRequest, NextResponse } from "next/server"
import connectToDatabase from "@/lib/mongoose"
import { EventRegistration } from "@/models/event-registration"
import nodemailer from "nodemailer"

export const dynamic = "force-dynamic"
 
// Configure nodemailer transporter using existing environment variables
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "smtp.gmail.com",
  port: Number(process.env.EMAIL_PORT) || 587,
  secure: process.env.EMAIL_PORT === "465",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
})

// Send rich confirmation email to the participant
async function sendRegistrationEmail(
  toEmail: string,
  name: string,
  eventTitle: string,
  registrationId: string,
  participationType: string,
  teamName?: string
) {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    return
  }

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #1e293b; }
        .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
        .header { background: linear-gradient(135deg, #004aad 0%, #1e40af 100%); padding: 32px 24px; text-align: center; color: white; }
        .header h1 { margin: 0 0 8px 0; font-size: 24px; font-weight: 700; letter-spacing: -0.5px; }
        .header p { margin: 0; font-size: 15px; opacity: 0.9; }
        .body { padding: 32px 24px; }
        .ticket-box { background: #eff6ff; border: 2px dashed #3b82f6; border-radius: 10px; padding: 20px; text-align: center; margin: 24px 0; }
        .ticket-label { font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; color: #1e40af; }
        .ticket-id { font-size: 26px; font-weight: 800; color: #1e3a8a; letter-spacing: 2px; margin: 8px 0; font-family: monospace; }
        .info-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #f1f5f9; font-size: 14px; }
        .info-label { color: #64748b; font-weight: 500; }
        .info-val { font-weight: 600; color: #0f172a; text-align: right; }
        .footer { background: #f8fafc; padding: 20px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; }
        .button { display: inline-block; background-color: #2563eb; color: #ffffff !important; padding: 12px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>HackKro Event Registration Confirmed! 🎉</h1>
          <p>You're all set to innovate and build with HackKro</p>
        </div>
        <div class="body">
          <p>Hi <strong>${name}</strong>,</p>
          <p>Congratulations! Your registration for <strong>${eventTitle}</strong> has been successfully received and verified.</p>
          
          <div class="ticket-box">
            <div class="ticket-label">Official Registration Pass ID</div>
            <div class="ticket-id">${registrationId}</div>
            <p style="margin: 0; font-size: 12px; color: #3b82f6;">Keep this ID handy for check-in and problem statement submissions.</p>
          </div>

          <div style="margin: 20px 0;">
            <div class="info-row">
              <span class="info-label">Event:</span>
              <span class="info-val">${eventTitle}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Participant:</span>
              <span class="info-val">${name}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Participation Type:</span>
              <span class="info-val" style="text-transform: capitalize;">${participationType}</span>
            </div>
            ${
              teamName
                ? `<div class="info-row"><span class="info-label">Team Name:</span><span class="info-val">${teamName}</span></div>`
                : ""
            }
            <div class="info-row">
              <span class="info-label">Status:</span>
              <span class="info-val" style="color: #16a34a;">Confirmed ✅</span>
            </div>
          </div>

          <p style="font-size: 14px; color: #475569;">
            Stay tuned for event schedules, mentor details, and Discord channel invites in upcoming emails.
          </p>

          <div style="text-align: center;">
            <a href="https://hackkro.com" class="button">Visit HackKro Platform</a>
          </div>
        </div>
        <div class="footer">
          <p>© 2026 HackKro Platform. India's Premier Hackathon & Opportunity Ecosystem.</p>
          <p>If you did not register for this event, please contact team@hackkro.com</p>
        </div>
      </div>
    </body>
    </html>
  `

  await transporter.sendMail({
    from: `"HackKro Events" <${process.env.EMAIL_USER || "events@hackkro.com"}>`,
    to: toEmail,
    subject: `Registration Confirmed: ${eventTitle} [Pass #${registrationId}]`,
    html: htmlContent,
  })
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      eventId,
      eventTitle,
      name,
      email,
      phone,
      college,
      graduationYear,
      branch,
      participationType = "solo",
      teamName,
      teamMembers,
      domain,
      githubUrl,
      linkedinUrl,
      additionalNotes,
    } = body

    // 1. Validation
    if (!eventId || !eventTitle || !name || !email || !phone || !college) {
      return NextResponse.json(
        {
          success: false,
          message: "Please fill in all required fields (Name, Email, Phone, College).",
        },
        { status: 400 }
      )
    }

    if (!email.includes("@") || !email.includes(".")) {
      return NextResponse.json(
        { success: false, message: "Please provide a valid email address." },
        { status: 400 }
      )
    }

    if (participationType === "team" && !teamName) {
      return NextResponse.json(
        { success: false, message: "Team name is required for team participation." },
        { status: 400 }
      )
    }

    // 2. Connect to Database
    await connectToDatabase()

    const cleanEmail = email.trim().toLowerCase()

    // 3. Check for Duplicate Registration
    const existingRegistration = await EventRegistration.findOne({
      eventId: String(eventId).trim(),
      email: cleanEmail,
      status: { $ne: "cancelled" },
    })

    if (existingRegistration) {
      return NextResponse.json(
        {
          success: false,
          message: `You are already registered for this event with Pass ID: ${existingRegistration.registrationId}`,
          registrationId: existingRegistration.registrationId,
        },
        { status: 409 }
      )
    }

    // 4. Generate unique Registration ID
    const prefix = String(eventId)
      .replace(/[^a-zA-Z0-9]/g, "")
      .substring(0, 4)
      .toUpperCase()
    const randomDigits = Math.floor(100000 + Math.random() * 900000)
    const registrationId = `HK-${prefix || "EVT"}-${randomDigits}`

    // 5. Create new Registration
    const newRegistration = new EventRegistration({
      eventId: String(eventId).trim(),
      eventTitle: String(eventTitle).trim(),
      registrationId,
      name: name.trim(),
      email: cleanEmail,
      phone: phone.trim(),
      college: college.trim(),
      graduationYear: graduationYear?.trim(),
      branch: branch?.trim(),
      participationType,
      teamName: participationType === "team" ? teamName?.trim() : undefined,
      teamMembers:
        participationType === "team" && Array.isArray(teamMembers)
          ? teamMembers.filter((m: any) => m && m.name && m.email)
          : [],
      domain: domain?.trim(),
      githubUrl: githubUrl?.trim(),
      linkedinUrl: linkedinUrl?.trim(),
      additionalNotes: additionalNotes?.trim(),
      status: "confirmed",
      registeredAt: new Date(),
    })

    await newRegistration.save()
    console.log(`✅ Event registration saved: ${cleanEmail} for ${eventTitle} [${registrationId}]`)

    // 6. Send Confirmation Email (Async, gracefully handled)
    try {
      await sendRegistrationEmail(cleanEmail, name.trim(), eventTitle, registrationId, participationType, teamName)
      console.log(`✅ Confirmation email sent to ${cleanEmail}`)
    } catch (mailErr) {
      console.error("⚠️ Nodemailer registration email failed (DB record created successfully):", mailErr)
    }

    return NextResponse.json({
      success: true,
      message: "Registration successful! Your digital pass has been generated.",
      registrationId,
      registration: {
        registrationId,
        eventId,
        eventTitle,
        name: newRegistration.name,
        email: newRegistration.email,
        participationType: newRegistration.participationType,
        teamName: newRegistration.teamName,
        registeredAt: newRegistration.registeredAt,
      },
    })
  } catch (error: any) {
    console.error("❌ Registration API Error:", error)
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to process registration. Please try again.",
      },
      { status: 500 }
    )
  }
}
