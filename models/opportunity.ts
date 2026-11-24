import mongoose, { Schema, type Document, type Model } from "mongoose"

export type OpportunityCategory =
  | "Hackathon"
  | "Workshop & Masterclass"
  | "Pitching Challenge"
  | "Tech Conclave"
  | "Innovation Expo"
  | "Technical Quiz"
  | "Business Quiz"

export type OpportunityMode = "Online" | "Offline" | "Hybrid"
export type OpportunityStatus = "draft" | "under_review" | "published" | "completed" | "archived"
export type AdminApprovalStatus = "pending" | "approved" | "rejected"
export type RoundType =
  | "online_quiz"
  | "idea_submission"
  | "project_submission"
  | "offline_presentation"
  | "interview"

export interface IRound {
  _id?: mongoose.Types.ObjectId
  roundNumber: number
  name: string
  type: RoundType
  description: string
  instructions?: string
  startDate: Date
  endDate: Date
  submissionRequirements?: string
  status: "upcoming" | "active" | "completed"
}

export interface IOpportunity extends Document {
  slug: string
  title: string
  organizerId: mongoose.Types.ObjectId
  organizerEmail: string
  organizationName: string
  category: OpportunityCategory
  tagline: string
  description: string
  longDescription?: string
  mode: OpportunityMode
  venue?: string
  location?: string
  startDate: Date
  endDate: Date
  registrationOpens?: Date
  registrationDeadline: Date
  prizePool?: string
  teamSize: {
    min: number
    max: number
  }
  registrationFee: string
  eligibility?: string
  rules: string[]
  perks: string[]
  tracks: string[]
  image: string
  bannerImage?: string
  status: OpportunityStatus
  isPublished: boolean
  adminApproval: AdminApprovalStatus
  approvalNotes?: string
  rounds: IRound[]
  createdAt: Date
  updatedAt: Date
}

const RoundSchema = new Schema<IRound>(
  {
    roundNumber: { type: Number, required: true },
    name: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: [
        "online_quiz",
        "idea_submission",
        "project_submission",
        "offline_presentation",
        "interview",
      ],
      default: "idea_submission",
    },
    description: { type: String, required: true, trim: true },
    instructions: { type: String, trim: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    submissionRequirements: { type: String, trim: true },
    status: {
      type: String,
      enum: ["upcoming", "active", "completed"],
      default: "upcoming",
    },
  },
  { timestamps: true }
)

const OpportunitySchema = new Schema<IOpportunity>(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    title: { type: String, required: true, trim: true },
    organizerId: {
      type: Schema.Types.ObjectId,
      ref: "Organizer",
      required: true,
      index: true,
    },
    organizerEmail: { type: String, required: true, lowercase: true, trim: true },
    organizationName: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: [
        "Hackathon",
        "Workshop & Masterclass",
        "Pitching Challenge",
        "Tech Conclave",
        "Innovation Expo",
        "Technical Quiz",
        "Business Quiz",
      ],
      default: "Hackathon",
      index: true,
    },
    tagline: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    longDescription: { type: String, trim: true },
    mode: {
      type: String,
      enum: ["Online", "Offline", "Hybrid"],
      default: "Online",
    },
    venue: { type: String, trim: true },
    location: { type: String, trim: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    registrationOpens: { type: Date },
    registrationDeadline: { type: Date, required: true },
    prizePool: { type: String, trim: true },
    teamSize: {
      min: { type: Number, default: 1, min: 1 },
      max: { type: Number, default: 4, min: 1 },
    },
    registrationFee: { type: String, default: "Free" },
    eligibility: { type: String, trim: true },
    rules: { type: [String], default: [] },
    perks: { type: [String], default: [] },
    tracks: { type: [String], default: [] },
    image: {
      type: String,
      default: "https://res.cloudinary.com/payb7fsq/image/upload/v1793190149/1_1.png",
    },
    bannerImage: { type: String },
    status: {
      type: String,
      enum: ["draft", "under_review", "published", "completed", "archived"],
      default: "draft",
      index: true,
    },
    isPublished: { type: Boolean, default: false, index: true },
    adminApproval: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
      index: true,
    },
    approvalNotes: { type: String },
    rounds: { type: [RoundSchema], default: [] },
  },
  {
    timestamps: true,
  }
)

export const Opportunity: Model<IOpportunity> =
  mongoose.models.Opportunity || mongoose.model<IOpportunity>("Opportunity", OpportunitySchema)

