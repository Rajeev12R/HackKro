import mongoose, { Schema, type Document, type Model } from "mongoose"

export interface ITeamMember {
  name: string
  email: string
}

export interface IEventRegistration extends Document {
  eventId: string
  eventTitle: string
  registrationId: string
  name: string
  email: string
  phone: string
  college: string
  graduationYear?: string
  branch?: string
  participationType: "solo" | "team"
  teamName?: string
  teamMembers?: ITeamMember[]
  domain?: string
  githubUrl?: string
  linkedinUrl?: string
  additionalNotes?: string
  status: "confirmed" | "waitlist" | "cancelled"
  registeredAt: Date
}

const TeamMemberSchema = new Schema<ITeamMember>(
  {
    name: { type: String, trim: true },
    email: { type: String, trim: true, lowercase: true },
  },
  { _id: false }
)

const EventRegistrationSchema = new Schema<IEventRegistration>(
  {
    eventId: {
      type: String,
      required: true,
      index: true,
      trim: true,
    },
    eventTitle: {
      type: String,
      required: true,
      trim: true,
    },
    registrationId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    college: {
      type: String,
      required: true,
      trim: true,
    },
    graduationYear: {
      type: String,
      trim: true,
    },
    branch: {
      type: String,
      trim: true,
    },
    participationType: {
      type: String,
      enum: ["solo", "team"],
      default: "solo",
    },
    teamName: {
      type: String,
      trim: true,
    },
    teamMembers: {
      type: [TeamMemberSchema],
      default: [],
    },
    domain: {
      type: String,
      trim: true,
    },
    githubUrl: {
      type: String,
      trim: true,
    },
    linkedinUrl: {
      type: String,
      trim: true,
    },
    additionalNotes: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ["confirmed", "waitlist", "cancelled"],
      default: "confirmed",
    },
    registeredAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
)

// Prevent duplicate registrations for the same event by the same user
EventRegistrationSchema.index({ eventId: 1, email: 1 }, { unique: true })

export const EventRegistration: Model<IEventRegistration> =
  mongoose.models.EventRegistration ||
  mongoose.model<IEventRegistration>("EventRegistration", EventRegistrationSchema)
