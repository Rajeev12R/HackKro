import mongoose, { Schema, type Document } from "mongoose"

export interface ITestQuestion {
  id: string
  question: string
  codeSnippet?: string
  options: { id: string; text: string }[]
  correctOptionId: string
  points: number
  explanation?: string
}

export interface ITest extends Document {
  testId: string
  title: string
  eventId: string
  eventTitle: string
  description: string
  instructions: string[]
  durationMinutes: number
  totalMarks: number
  passingMarks?: number
  scheduledDate: string
  startTime: string
  endTime: string
  isActive: boolean
  isResultDeclared: boolean
  questions: ITestQuestion[]
  createdAt: Date
  updatedAt: Date
}

const QuestionOptionSchema = new Schema(
  {
    id: { type: String, required: true },
    text: { type: String, required: true },
  },
  { _id: false }
)

const QuestionSchema = new Schema(
  {
    id: { type: String, required: true },
    question: { type: String, required: true },
    codeSnippet: { type: String, default: "" },
    options: { type: [QuestionOptionSchema], required: true },
    correctOptionId: { type: String, required: true },
    points: { type: Number, default: 1 },
    explanation: { type: String, default: "" },
  },
  { _id: false }
)

const TestSchema = new Schema<ITest>(
  {
    testId: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
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
    description: {
      type: String,
      default: "",
    },
    instructions: {
      type: [String],
      default: [],
    },
    durationMinutes: {
      type: Number,
      default: 30,
    },
    totalMarks: {
      type: Number,
      default: 20,
    },
    passingMarks: {
      type: Number,
      default: 8,
    },
    scheduledDate: {
      type: String,
      default: "",
    },
    startTime: {
      type: String,
      default: "",
    },
    endTime: {
      type: String,
      default: "",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isResultDeclared: {
      type: Boolean,
      default: false,
    },
    questions: {
      type: [QuestionSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
)

export const Test = mongoose.models.Test || mongoose.model<ITest>("Test", TestSchema)
