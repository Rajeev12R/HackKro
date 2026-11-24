// lib/otp.ts

import nodemailer from "nodemailer";

// This is the shared, in-memory store for OTPs.
export const otpStore: { [key: string]: { otp: string; expiry: number } } = {};

function getTransporter() {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    return null;
  }

  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
}

// Generate a 6-digit OTP
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Send OTP via email
export async function sendOTP(email: string, otp: string): Promise<boolean> {
  try {
    const transporter = getTransporter();
    if (!transporter) {
      console.warn("Missing email credentials. EMAIL_USER and EMAIL_PASS not defined.");
      return false;
    }

    const mailOptions = {
      from: `"HackKro" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your HackKro Login Verification Code",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
          <h2 style="color: #2563eb;">HackKro Login Verification</h2>
          <p>Your One-Time Password (OTP) is:</p>
          <div style="background-color: #f3f4f6; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
            ${otp}
          </div>
          <p>This OTP is valid for 10 minutes. If you did not request this, please ignore this email.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log("✅ OTP sent successfully to", email);
    return true;
  } catch (error) {
    console.error("❌ Error sending OTP:", error);
    return false;
  }
}

// Save OTP
export function saveOTP(email: string, otp: string) {
  otpStore[email] = {
    otp,
    expiry: Date.now() + 10 * 60 * 1000, // 10 minutes
  };
}

// Verify OTP
export function verifyOTP(email: string, otp: string): boolean {
  const stored = otpStore[email];
  if (stored && stored.otp === otp && Date.now() < stored.expiry) {
    delete otpStore[email]; // Use OTP only once
    return true;
  }
  return false;
}
