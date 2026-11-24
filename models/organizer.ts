import mongoose, { Schema, type Document, type Model } from "mongoose"

export interface IOrganization {
  name: string
  type: "college" | "company" | "club" | "community"
  website?: string
  logo?: string
  description?: string
  contactPhone?: string
  location?: string
}

export interface IOrganizer extends Document {
  name: string
  email: string
  passwordHash: string
  role: "organizer" | "admin"
  organization: IOrganization
  verificationStatus: "pending" | "verified" | "rejected"
  verifiedAt?: Date
  verifiedBy?: string
  rejectionReason?: string
  createdAt: Date
  updatedAt: Date
}

const OrganizationSchema = new Schema<IOrganization>(
  {
    name: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ["college", "company", "club", "community"],
      default: "college",
    },
    website: { type: String, trim: true },
    logo: { type: String, trim: true },
    description: { type: String, trim: true },
    contactPhone: { type: String, trim: true },
    location: { type: String, trim: true },
  },
  { _id: false }
)

const OrganizerSchema = new Schema<IOrganizer>(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      enum: ["organizer", "admin"],
      default: "organizer",
    },
    organization: {
      type: OrganizationSchema,
      required: true,
    },
    verificationStatus: {
      type: String,
      enum: ["pending", "verified", "rejected"],
      default: "pending",
      index: true,
    },
    verifiedAt: { type: Date },
    verifiedBy: { type: String },
    rejectionReason: { type: String },
  },
  {
    timestamps: true,
  }
)

export const Organizer: Model<IOrganizer> =
  mongoose.models.Organizer || mongoose.model<IOrganizer>("Organizer", OrganizerSchema)

