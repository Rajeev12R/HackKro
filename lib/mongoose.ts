import mongoose from "mongoose"
import dns from "dns"

// Fix for Node.js on Windows SRV DNS resolution failures (ECONNREFUSED)
try {
  dns.setDefaultResultOrder?.("ipv4first")
  dns.setServers(["8.8.8.8", "8.8.4.4", "1.1.1.1"])
} catch (dnsErr) {
  // Ignore in environments where setting DNS servers is restricted
}

const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) {
  console.warn("⚠️ Warning: MONGODB_URI is not set. Please configure it in .env.local")
}

interface MongooseCache {
  conn: typeof mongoose | null
  promise: Promise<typeof mongoose> | null
}

declare global {
  namespace NodeJS {
    interface Global {
      mongoose?: MongooseCache
    }
  }
}

let cached: MongooseCache = (global as unknown as NodeJS.Global).mongoose || { conn: null, promise: null }

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null }
}

async function connectToDatabase() {
  if (!MONGODB_URI) {
    throw new Error("MONGODB_URI is not defined. Please define it in your .env.local file.")
  }

  if (cached.conn) {
    return cached.conn
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    }

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      return mongoose
    })
  }

  cached.conn = await cached.promise
  return cached.conn
}

export default connectToDatabase
