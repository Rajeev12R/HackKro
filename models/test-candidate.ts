import mongoose, { Schema, type Document } from "mongoose"

export interface ICandidateAnswer {
  questionId: string
  selectedOptionId: string
  isCorrect?: boolean
}

export interface ITestCandidate extends Document {
  testId: string
  eventId: string
  registrationId?: string
  name: string
  email: string
  loginId: string
  password: string
  phone?: string
  college?: string
  isEligible: boolean
  status: "not-started" | "in-progress" | "submitted"
  startedAt?: Date
  submittedAt?: Date
  timeTakenSeconds?: number
  score?: number
  rank?: number
  tabSwitches?: number
  answers: ICandidateAnswer[]
  reminderEmailSent: boolean
  passwordEmailSent: boolean
  resultEmailSent: boolean
  createdAt: Date
  updatedAt: Date
}

const CandidateAnswerSchema = new Schema(
  {
    questionId: { type: String, required: true },
    selectedOptionId: { type: String, required: true },
    isCorrect: { type: Boolean, default: false },
  },
  { _id: false }
)

const TestCandidateSchema = new Schema<ITestCandidate>(
  {
    testId: {
      type: String,
      required: true,
      index: true,
      trim: true,
    },
    eventId: {
      type: String,
      required: true,
      index: true,
      trim: true,
    },
    registrationId: {
      type: String,
      trim: true,
      default: "",
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
    loginId: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    password: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      default: "",
      trim: true,
    },
    college: {
      type: String,
      default: "",
      trim: true,
    },
    isEligible: {
      type: Boolean,
      default: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["not-started", "in-progress", "submitted"],
      default: "not-started",
    },
    startedAt: {
      type: Date,
    },
    submittedAt: {
      type: Date,
    },
    timeTakenSeconds: {
      type: Number,
      default: 0,
    },
    score: {
      type: Number,
      default: 0,
    },
    rank: {
      type: Number,
      default: 0,
    },
    tabSwitches: {
      type: Number,
      default: 0,
    },
    answers: {
      type: [CandidateAnswerSchema],
      default: [],
    },
    reminderEmailSent: {
      type: Boolean,
      default: false,
    },
    passwordEmailSent: {
      type: Boolean,
      default: false,
    },
    resultEmailSent: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
)

// Compound index to ensure uniqueness per test and email
TestCandidateSchema.index({ testId: 1, email: 1 }, { unique: true })
TestCandidateSchema.index({ testId: 1, loginId: 1 })

export const TestCandidate =
  mongoose.models.TestCandidate || mongoose.model<ITestCandidate>("TestCandidate", TestCandidateSchema)
