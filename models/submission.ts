import mongoose, { Schema, type Document, type Model } from "mongoose"

export type SubmissionStatus = "pending" | "reviewed" | "shortlisted" | "rejected" | "needs_changes"

export interface IAuditRecord {
  action: string
  changedBy: string
  previousStatus: string
  newStatus: string
  timestamp: Date
  notes?: string
}

export interface ISubmission extends Document {
  opportunityId: mongoose.Types.ObjectId
  opportunitySlug: string
  roundNumber: number
  roundName: string
  registrationId: string
  participantName: string
  participantEmail: string
  teamName?: string
  title: string
  description: string
  links: {
    githubUrl?: string
    demoUrl?: string
    driveUrl?: string
    fileUrl?: string
  }
  submittedAt: Date
  status: SubmissionStatus
  score?: number
  feedback?: string
  reviewedBy?: string
  reviewedAt?: Date
  auditHistory: IAuditRecord[]
  createdAt: Date
  updatedAt: Date
}

const AuditRecordSchema = new Schema<IAuditRecord>(
  {
    action: { type: String, required: true },
    changedBy: { type: String, required: true },
    previousStatus: { type: String, required: true },
    newStatus: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    notes: { type: String },
  },
  { _id: false }
)

const SubmissionSchema = new Schema<ISubmission>(
  {
    opportunityId: {
      type: Schema.Types.ObjectId,
      ref: "Opportunity",
      required: true,
      index: true,
    },
    opportunitySlug: {
      type: String,
      required: true,
      index: true,
      trim: true,
    },
    roundNumber: {
      type: Number,
      required: true,
      index: true,
    },
    roundName: {
      type: String,
      required: true,
      trim: true,
    },
    registrationId: {
      type: String,
      required: true,
      index: true,
      trim: true,
    },
    participantName: {
      type: String,
      required: true,
      trim: true,
    },
    participantEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    teamName: {
      type: String,
      trim: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    links: {
      githubUrl: { type: String, trim: true },
      demoUrl: { type: String, trim: true },
      driveUrl: { type: String, trim: true },
      fileUrl: { type: String, trim: true },
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ["pending", "reviewed", "shortlisted", "rejected", "needs_changes"],
      default: "pending",
      index: true,
    },
    score: {
      type: Number,
      min: 0,
      max: 100,
    },
    feedback: {
      type: String,
      trim: true,
    },
    reviewedBy: {
      type: String,
      trim: true,
    },
    reviewedAt: {
      type: Date,
    },
    auditHistory: {
      type: [AuditRecordSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
)

SubmissionSchema.index({ opportunityId: 1, roundNumber: 1, registrationId: 1 }, { unique: true })

export const Submission: Model<ISubmission> =
  mongoose.models.Submission || mongoose.model<ISubmission>("Submission", SubmissionSchema)

