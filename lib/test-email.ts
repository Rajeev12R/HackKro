import nodemailer from "nodemailer"

function getTransporter() {
  const user = process.env.EMAIL_USER
  const pass = process.env.EMAIL_PASS
  const host = process.env.EMAIL_HOST || "smtp.gmail.com"

  if (!user || !pass) {
    return null
  }

  return nodemailer.createTransport({
    host,
    port: 587,
    secure: false,
    auth: {
      user,
      pass,
    },
  })
}

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://hackkro.com"

// --------------------------------------------------------------------------
// 1. 24-HOUR REMINDER EMAIL (Sent 1 day before test)
// --------------------------------------------------------------------------
export async function send24hReminderEmail(params: {
  toEmail: string
  candidateName: string
  testTitle: string
  eventTitle: string
  scheduledDate: string
  startTime: string
  durationMinutes: number
  totalMarks: number
}): Promise<{ success: boolean; message: string }> {
  const transporter = getTransporter()
  if (!transporter) {
    console.warn("EMAIL_USER or EMAIL_PASS not set. Skipping email send.")
    return { success: false, message: "Email credentials not configured in environment variables." }
  }

  const testPortalUrl = `${BASE_URL}/test`

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0b0f19; color: #f3f4f6; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: #111827; border: 1px solid #1f2937; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }
        .header { background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 50%, #3b82f6 100%); padding: 32px 24px; text-align: center; }
        .header h1 { color: #ffffff; margin: 0; font-size: 26px; font-weight: 800; letter-spacing: -0.5px; }
        .header p { color: #dbeafe; margin: 8px 0 0; font-size: 15px; }
        .content { padding: 32px 24px; color: #e5e7eb; line-height: 1.6; }
        .badge { display: inline-block; background-color: #f59e0b; color: #000; font-weight: 700; font-size: 12px; padding: 4px 10px; border-radius: 9999px; text-transform: uppercase; margin-bottom: 12px; }
        .details-box { background: #1f2937; border-left: 4px solid #3b82f6; padding: 18px; border-radius: 8px; margin: 24px 0; }
        .details-item { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #374151; font-size: 14px; }
        .details-item:last-child { border-bottom: none; }
        .details-label { color: #9ca3af; font-weight: 500; }
        .details-value { color: #ffffff; font-weight: 600; }
        .btn-container { text-align: center; margin: 30px 0; }
        .btn { background: #2563eb; color: #ffffff !important; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; font-size: 15px; display: inline-block; box-shadow: 0 4px 14px rgba(37, 99, 235, 0.4); }
        .notice { background: rgba(59, 130, 246, 0.1); border: 1px dashed #3b82f6; padding: 14px; border-radius: 8px; font-size: 13px; color: #93c5fd; margin-top: 20px; }
        .footer { background: #0b0f19; padding: 20px; text-align: center; font-size: 12px; color: #6b7280; border-top: 1px solid #1f2937; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>HackKro Assessment Alert</h1>
          <p>Your technical evaluation is scheduled in 24 hours</p>
        </div>
        <div class="content">
          <span class="badge">Official Notice</span>
          <p>Hello <strong>${params.candidateName}</strong>,</p>
          <p>This is a reminder that your registered assessment for <strong>${params.eventTitle}</strong> is scheduled for tomorrow.</p>
          
          <div class="details-box">
            <div class="details-item"><span class="details-label">Test Name:</span><span class="details-value">${params.testTitle}</span></div>
            <div class="details-item"><span class="details-label">Date:</span><span class="details-value">${params.scheduledDate}</span></div>
            <div class="details-item"><span class="details-label">Time:</span><span class="details-value">${params.startTime}</span></div>
            <div class="details-item"><span class="details-label">Duration:</span><span class="details-value">${params.durationMinutes} Minutes</span></div>
            <div class="details-item"><span class="details-label">Total Marks:</span><span class="details-value">${params.totalMarks} Marks</span></div>
          </div>

          <div class="notice">
            🔒 <strong>Important Security Note:</strong><br/>
            Your one-time confidential test password will be emailed to this email address <strong>1 hour before the test begins</strong>.
          </div>

          <div class="btn-container">
            <a href="${testPortalUrl}" class="btn">View Test Portal</a>
          </div>

          <p style="font-size: 13px; color: #9ca3af;">Please ensure you have a laptop/desktop with a stable internet connection. Tab switching and external browsing are strictly monitored.</p>
        </div>
        <div class="footer">
          &copy; ${new Date().getFullYear()} HackKro. All rights reserved. Do not share this email.
        </div>
      </div>
    </body>
    </html>
  `

  try {
    await transporter.sendMail({
      from: `"HackKro Assessments" <${process.env.EMAIL_USER}>`,
      to: params.toEmail,
      subject: `[Reminder: 24h Left] ${params.testTitle} – Timing & Details`,
      html,
    })
    return { success: true, message: "24-hour reminder email sent." }
  } catch (err: any) {
    console.error("Error sending reminder email:", err)
    return { success: false, message: err?.message || "Failed to send reminder email." }
  }
}

// --------------------------------------------------------------------------
// 2. 1-HOUR CREDENTIALS EMAIL (Sent 1 hour before test)
// --------------------------------------------------------------------------
export async function send1hCredentialsEmail(params: {
  toEmail: string
  candidateName: string
  testTitle: string
  eventTitle: string
  loginId: string
  password: string
  durationMinutes: number
}): Promise<{ success: boolean; message: string }> {
  const transporter = getTransporter()
  if (!transporter) {
    console.warn("EMAIL_USER or EMAIL_PASS not set. Skipping credentials email.")
    return { success: false, message: "Email credentials not configured in environment variables." }
  }

  const testPortalUrl = `${BASE_URL}/test`

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0b0f19; color: #f3f4f6; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: #111827; border: 1px solid #1f2937; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }
        .header { background: linear-gradient(135deg, #059669 0%, #10b981 100%); padding: 32px 24px; text-align: center; }
        .header h1 { color: #ffffff; margin: 0; font-size: 26px; font-weight: 800; }
        .header p { color: #d1fae5; margin: 8px 0 0; font-size: 15px; }
        .content { padding: 32px 24px; color: #e5e7eb; line-height: 1.6; }
        .credential-box { background: #1f2937; border: 2px dashed #10b981; border-radius: 12px; padding: 20px; margin: 24px 0; text-align: center; }
        .cred-title { font-size: 13px; text-transform: uppercase; color: #9ca3af; letter-spacing: 1px; margin-bottom: 8px; }
        .cred-value { font-family: 'Courier New', monospace; font-size: 24px; font-weight: 800; color: #34d399; letter-spacing: 3px; background: #111827; padding: 10px 16px; border-radius: 6px; display: inline-block; margin-top: 4px; }
        .info-row { display: flex; justify-content: space-between; margin-top: 12px; font-size: 14px; }
        .btn-container { text-align: center; margin: 30px 0; }
        .btn { background: #10b981; color: #ffffff !important; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 700; font-size: 16px; display: inline-block; box-shadow: 0 4px 14px rgba(16, 185, 129, 0.4); }
        .rules-box { background: #1e1b4b; border-left: 4px solid #6366f1; padding: 16px; border-radius: 8px; margin: 20px 0; font-size: 13px; color: #c7d2fe; }
        .footer { background: #0b0f19; padding: 20px; text-align: center; font-size: 12px; color: #6b7280; border-top: 1px solid #1f2937; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Your Test Credentials</h1>
          <p>HackKro Online Assessment – Starts in 1 Hour</p>
        </div>
        <div class="content">
          <p>Hello <strong>${params.candidateName}</strong>,</p>
          <p>Your assessment for <strong>${params.testTitle}</strong> (${params.eventTitle}) is starting in 1 hour. Below are your private login credentials:</p>
          
          <div class="credential-box">
            <div class="cred-title">Candidate Login ID (Email / Reg ID)</div>
            <div style="font-weight: 600; color: #ffffff; font-size: 16px; margin-bottom: 14px;">${params.loginId}</div>
            <div class="cred-title">Your Test Access Password</div>
            <div class="cred-value">${params.password}</div>
          </div>

          <div class="btn-container">
            <a href="${testPortalUrl}" class="btn">Launch Test Portal</a>
          </div>

          <div class="rules-box">
            ⏱️ <strong>Duration:</strong> ${params.durationMinutes} Minutes<br/>
            ⚠️ <strong>Important:</strong> Do not share these credentials. Each login allows only one active session. Speed and accuracy both determine your final rank!
          </div>
        </div>
        <div class="footer">
          &copy; ${new Date().getFullYear()} HackKro. All rights reserved. Good luck!
        </div>
      </div>
    </body>
    </html>
  `

  try {
    await transporter.sendMail({
      from: `"HackKro Assessments" <${process.env.EMAIL_USER}>`,
      to: params.toEmail,
      subject: `[ACTION REQUIRED: 1 Hour Left] Your Password for ${params.testTitle}`,
      html,
    })
    return { success: true, message: "1-hour credentials email sent." }
  } catch (err: any) {
    console.error("Error sending credentials email:", err)
    return { success: false, message: err?.message || "Failed to send credentials email." }
  }
}

// --------------------------------------------------------------------------
// 3. POST-TEST RESULT & RANK EMAIL (Sent after test submission)
// --------------------------------------------------------------------------
export async function sendTestResultEmail(params: {
  toEmail: string
  candidateName: string
  testTitle: string
  eventTitle: string
  score: number
  totalMarks: number
  timeTakenFormatted: string
  rank: number
  totalCandidates?: number
}): Promise<{ success: boolean; message: string }> {
  const transporter = getTransporter()
  if (!transporter) {
    console.warn("EMAIL_USER or EMAIL_PASS not set. Skipping result email.")
    return { success: false, message: "Email credentials not configured in environment variables." }
  }

  const percentage = Math.round((params.score / (params.totalMarks || 1)) * 100)

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0b0f19; color: #f3f4f6; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: #111827; border: 1px solid #1f2937; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }
        .header { background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%); padding: 32px 24px; text-align: center; }
        .header h1 { color: #ffffff; margin: 0; font-size: 26px; font-weight: 800; }
        .header p { color: #f3e8ff; margin: 8px 0 0; font-size: 15px; }
        .content { padding: 32px 24px; color: #e5e7eb; line-height: 1.6; }
        .result-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin: 24px 0; }
        .result-card { background: #1f2937; border: 1px solid #374151; border-radius: 10px; padding: 16px; text-align: center; }
        .result-card.highlight { border-color: #a855f7; background: #2e1065; }
        .card-num { font-size: 26px; font-weight: 800; color: #ffffff; }
        .card-label { font-size: 12px; color: #9ca3af; text-transform: uppercase; margin-top: 4px; }
        .rank-badge { font-size: 32px; font-weight: 900; color: #fbbf24; }
        .footer { background: #0b0f19; padding: 20px; text-align: center; font-size: 12px; color: #6b7280; border-top: 1px solid #1f2937; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Official Assessment Result</h1>
          <p>${params.testTitle} – ${params.eventTitle}</p>
        </div>
        <div class="content">
          <p>Congratulations <strong>${params.candidateName}</strong> on completing your test!</p>
          <p>Your test responses have been evaluated and your official rank has been declared based on total marks and time taken:</p>
          
          <div class="result-grid">
            <div class="result-card highlight">
              <div class="rank-badge">#${params.rank}</div>
              <div class="card-label">Your Final Rank</div>
            </div>
            <div class="result-card">
              <div class="card-num">${params.score} / ${params.totalMarks}</div>
              <div class="card-label">Total Score (${percentage}%)</div>
            </div>
            <div class="result-card">
              <div class="card-num" style="font-size: 20px;">${params.timeTakenFormatted}</div>
              <div class="card-label">Time Taken</div>
            </div>
            <div class="result-card">
              <div class="card-num" style="color: #34d399; font-size: 20px;">Evaluated</div>
              <div class="card-label">Assessment Status</div>
            </div>
          </div>

          <p style="font-size: 14px; color: #9ca3af;">Thank you for participating with HackKro. Stay tuned for further announcements and certificates for top rankers.</p>
        </div>
        <div class="footer">
          &copy; ${new Date().getFullYear()} HackKro. All rights reserved.
        </div>
      </div>
    </body>
    </html>
  `

  try {
    await transporter.sendMail({
      from: `"HackKro Assessments" <${process.env.EMAIL_USER}>`,
      to: params.toEmail,
      subject: `🏆 Your Result & Rank #${params.rank} – ${params.testTitle}`,
      html,
    })
    return { success: true, message: "Result email sent successfully." }
  } catch (err: any) {
    console.error("Error sending result email:", err)
    return { success: false, message: err?.message || "Failed to send result email." }
  }
}
