const mongoose = require("mongoose");
const crypto = require("crypto");
require("dotenv").config({ path: ".env.local" });

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/hackkro_dev";

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
  return `${salt}:${hash}`;
}

async function runSeed() {
  console.log("Connecting to MongoDB:", MONGODB_URI);
  await mongoose.connect(MONGODB_URI);
  console.log("Connected successfully!");

  const db = mongoose.connection.db;

  // 1. Create or Update Organizers
  console.log("Seeding Organizers...");
  const organizersColl = db.collection("organizers");

  const verifiedPasswordHash = hashPassword("organizer123");
  const pendingPasswordHash = hashPassword("campus123");

  const verifiedOrganizer = {
    name: "Alex Developer",
    email: "organizer@hackkro.com",
    passwordHash: verifiedPasswordHash,
    role: "organizer",
    organization: {
      name: "HackKro Developer Community",
      type: "community",
      website: "https://hackkro.com",
      description: "Official developer and builder chapter of HackKro India.",
      contactPhone: "+91 98765 43210",
      location: "Bengaluru / Remote",
    },
    verificationStatus: "verified",
    verifiedAt: new Date(),
    verifiedBy: "Admin",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const pendingOrganizer = {
    name: "Prof. Rajesh Sharma",
    email: "pending@campus.edu",
    passwordHash: pendingPasswordHash,
    role: "organizer",
    organization: {
      name: "MIT Innovation Club",
      type: "college",
      website: "https://mitmeerut.ac.in",
      description: "Student coding and entrepreneurship cell of MIT.",
      contactPhone: "+91 91234 56789",
      location: "Meerut, Uttar Pradesh",
    },
    verificationStatus: "pending",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  await organizersColl.updateOne(
    { email: verifiedOrganizer.email },
    { $set: verifiedOrganizer },
    { upsert: true }
  );

  await organizersColl.updateOne(
    { email: pendingOrganizer.email },
    { $set: pendingOrganizer },
    { upsert: true }
  );

  const savedVerified = await organizersColl.findOne({ email: "organizer@hackkro.com" });
  const savedPending = await organizersColl.findOne({ email: "pending@campus.edu" });

  console.log(`Verified Organizer ID: ${savedVerified._id}`);
  console.log(`Pending Organizer ID: ${savedPending._id}`);

  // 2. Create Opportunities
  console.log("Seeding Opportunities...");
  const oppsColl = db.collection("opportunities");

  const opp1 = {
    slug: "ai-innovation-sprint-2026",
    title: "AI INNOVATION SPRINT 2026",
    organizerId: savedVerified._id,
    organizerEmail: savedVerified.email,
    organizationName: savedVerified.organization.name,
    category: "Hackathon",
    tagline: "Build production AI agents, multimodal LLMs, and real-world tools.",
    description: "A 48-hour national AI hackathon challenging builders to deploy autonomous agents, vision-language pipelines, and enterprise automation.",
    longDescription: "Join 1,000+ student developers in India's biggest AI builder sprint. Win cash prizes, GPU credits, and direct interview fast-tracks.",
    mode: "Online",
    venue: "HackKro Discord & Virtual Stage",
    location: "Online / Pan-India",
    startDate: new Date("2026-11-25T09:00:00Z"),
    endDate: new Date("2026-11-28T18:00:00Z"),
    registrationOpens: new Date("2026-11-01T00:00:00Z"),
    registrationDeadline: new Date("2026-11-24T23:59:59Z"),
    prizePool: "₹1,00,000 + ₹25,000 GPU Credits",
    teamSize: { min: 1, max: 4 },
    registrationFee: "Free",
    eligibility: "Open to all university students, BCA/MCA, and tech professionals across India.",
    rules: [
      "All submissions must be built during the sprint window.",
      "Plagiarism or pre-built proprietary software is strictly prohibited.",
      "Open-source libraries and APIs (Gemini, Claude, OpenAI) are encouraged."
    ],
    perks: [
      "Verified Certificate of Participation",
      "Exclusive HackKro Hacker Swag Kit",
      "Direct fast-track interview referrals"
    ],
    tracks: ["Autonomous Agents", "Multimodal AI", "Healthcare & FinTech", "Open Innovation"],
    image: "https://res.cloudinary.com/payb7fsq/image/upload/v1793190149/1_1.png",
    status: "published",
    isPublished: true,
    adminApproval: "approved",
    rounds: [
      {
        roundNumber: 1,
        name: "Round 1: Idea & Architecture Synopsis",
        type: "idea_submission",
        description: "Submit problem statement, proposed solution architecture, and system design diagram.",
        instructions: "Upload a 5-slide PDF or Notion document explaining technical feasibility and impact.",
        startDate: new Date("2026-11-20T00:00:00Z"),
        endDate: new Date("2026-11-24T23:59:59Z"),
        submissionRequirements: "Slide Deck (PDF) / Notion link",
        status: "active",
      },
      {
        roundNumber: 2,
        name: "Round 2: Working Prototype & Code Demo",
        type: "project_submission",
        description: "Deploy your working agent prototype and submit GitHub repository + 3-minute video walk-through.",
        instructions: "Ensure repository has a clear README with local setup instructions and deployed URL.",
        startDate: new Date("2026-11-25T09:00:00Z"),
        endDate: new Date("2026-11-28T18:00:00Z"),
        submissionRequirements: "GitHub Repo URL, Live Demo URL, Video Link",
        status: "upcoming",
      }
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const opp2 = {
    slug: "web3-summit-hackathon",
    title: "Web3 & Decentralized Systems Sprint",
    organizerId: savedVerified._id,
    organizerEmail: savedVerified.email,
    organizationName: savedVerified.organization.name,
    category: "Hackathon",
    tagline: "Architect smart contracts and decentralized protocols.",
    description: "Build on EVM, Solana, and cross-chain messaging primitives.",
    mode: "Hybrid",
    location: "Bengaluru, Karnataka",
    venue: "HackKro MakerSpace",
    startDate: new Date("2026-12-05T09:00:00Z"),
    endDate: new Date("2026-12-07T18:00:00Z"),
    registrationDeadline: new Date("2026-12-04T23:59:59Z"),
    teamSize: { min: 2, max: 4 },
    registrationFee: "Free",
    prizePool: "₹50,000",
    status: "draft",
    isPublished: false,
    adminApproval: "pending",
    rounds: [
      {
        roundNumber: 1,
        name: "Round 1: Smart Contract Spec",
        type: "idea_submission",
        description: "Define tokenomics and security architecture.",
        startDate: new Date("2026-12-01T00:00:00Z"),
        endDate: new Date("2026-12-04T23:59:59Z"),
        status: "upcoming",
      }
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const opp3 = {
    slug: "campus-coding-challenge-2026",
    title: "MIT Campus Coding Challenge 2026",
    organizerId: savedPending._id,
    organizerEmail: savedPending.email,
    organizationName: savedPending.organization.name,
    category: "Technical Quiz",
    tagline: "Algorithmic and problem-solving contest for campus students.",
    description: "Annual intra-college contest evaluating DSA and C/C++ fundamentals.",
    mode: "Offline",
    location: "Meerut, Uttar Pradesh",
    venue: "Computer Labs 1 & 2, MIT",
    startDate: new Date("2026-11-30T10:00:00Z"),
    endDate: new Date("2026-11-30T16:00:00Z"),
    registrationDeadline: new Date("2026-11-29T23:59:59Z"),
    teamSize: { min: 1, max: 1 },
    registrationFee: "Free",
    prizePool: "Certificates & Medals",
    status: "under_review",
    isPublished: false,
    adminApproval: "pending",
    rounds: [
      {
        roundNumber: 1,
        name: "Round 1: DSA Speed Run",
        type: "online_quiz",
        description: "30 questions on Arrays, Trees, and Graph algorithms.",
        startDate: new Date("2026-11-30T10:00:00Z"),
        endDate: new Date("2026-11-30T12:00:00Z"),
        status: "upcoming",
      }
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  await oppsColl.updateOne({ slug: opp1.slug }, { $set: opp1 }, { upsert: true });
  await oppsColl.updateOne({ slug: opp2.slug }, { $set: opp2 }, { upsert: true });
  await oppsColl.updateOne({ slug: opp3.slug }, { $set: opp3 }, { upsert: true });

  const savedOpp1 = await oppsColl.findOne({ slug: opp1.slug });
  const savedOpp3 = await oppsColl.findOne({ slug: opp3.slug });

  // 3. Seed Event Registrations (matches EventRegistration model)
  console.log("Seeding Event Registrations...");
  const regColl = db.collection("eventregistrations");

  const registrations = [
    {
      eventId: "ai-innovation-sprint-2026",
      eventTitle: "AI INNOVATION SPRINT 2026",
      registrationId: "HK-AI26-102931",
      name: "Rohan Verma",
      email: "rohan.verma@example.com",
      phone: "+91 98765 11111",
      college: "Indian Institute of Information Technology",
      graduationYear: "2026",
      branch: "Computer Science",
      participationType: "solo",
      domain: "AI / Machine Learning",
      githubUrl: "https://github.com/rohan-v-dev",
      linkedinUrl: "https://linkedin.com/in/rohan-verma",
      status: "confirmed",
      registeredAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      eventId: "ai-innovation-sprint-2026",
      eventTitle: "AI INNOVATION SPRINT 2026",
      registrationId: "HK-AI26-449102",
      name: "Priya Nair",
      email: "priya.nair@example.com",
      phone: "+91 98765 22222",
      college: "Vellore Institute of Technology",
      graduationYear: "2025",
      branch: "Data Science",
      participationType: "team",
      teamName: "Team NeuralSync",
      teamMembers: [
        { name: "Aman Gupta", email: "aman.g@example.com" },
        { name: "Sneha Kapoor", email: "sneha.k@example.com" },
      ],
      domain: "Multimodal LLMs",
      githubUrl: "https://github.com/neuralsync-team",
      linkedinUrl: "https://linkedin.com/in/priya-nair-ai",
      status: "confirmed",
      registeredAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      eventId: "ai-innovation-sprint-2026",
      eventTitle: "AI INNOVATION SPRINT 2026",
      registrationId: "HK-AI26-781943",
      name: "Aarav Gupta",
      email: "aarav.gupta@example.com",
      phone: "+91 98765 33333",
      college: "Delhi Technological University",
      graduationYear: "2027",
      branch: "Software Engineering",
      participationType: "solo",
      domain: "Agents & Workflows",
      status: "confirmed",
      registeredAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    // Registration for the OTHER organizer's event (used to test role isolation)
    {
      eventId: "campus-coding-challenge-2026",
      eventTitle: "MIT Campus Coding Challenge 2026",
      registrationId: "HK-MITC-991201",
      name: "Ananya Mishra",
      email: "ananya.mishra@campus.edu",
      phone: "+91 98765 44444",
      college: "Meerut Institute of Technology",
      graduationYear: "2026",
      branch: "BCA",
      participationType: "solo",
      status: "confirmed",
      registeredAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  for (const reg of registrations) {
    await regColl.updateOne(
      { registrationId: reg.registrationId },
      { $set: reg },
      { upsert: true }
    );
  }

  // 4. Seed Submissions
  console.log("Seeding Submissions...");
  const subColl = db.collection("submissions");

  const sub1 = {
    opportunityId: savedOpp1._id,
    opportunitySlug: savedOpp1.slug,
    roundNumber: 1,
    roundName: "Round 1: Idea & Architecture Synopsis",
    registrationId: "HK-AI26-449102",
    participantName: "Priya Nair",
    participantEmail: "priya.nair@example.com",
    teamName: "Team NeuralSync",
    title: "MedSync Agent - Autonomous Clinical Notes & Diagnostic Copilot",
    description: "An agentic medical transcription copilot using vision LLMs and local vector memory to synthesize physician-patient dialogues into structured EHR records and ICD-10 codes.",
    links: {
      githubUrl: "https://github.com/neuralsync-team/medsync-agent",
      demoUrl: "https://medsync-agent.vercel.app",
      driveUrl: "https://drive.google.com/file/d/sample-pitch-deck/view",
    },
    submittedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    status: "shortlisted",
    score: 92,
    feedback: "Outstanding architecture diagram, clear clinical utility, and impressive safety guardrails.",
    reviewedBy: "Alex Developer (organizer@hackkro.com)",
    reviewedAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
    auditHistory: [
      {
        action: "CREATED",
        changedBy: "Priya Nair (priya.nair@example.com)",
        previousStatus: "none",
        newStatus: "pending",
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
        notes: "Initial project submission",
      },
      {
        action: "REVIEW_UPDATE",
        changedBy: "Alex Developer (organizer@hackkro.com)",
        previousStatus: "pending",
        newStatus: "shortlisted",
        timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000),
        notes: "Score: 92. Feedback: Outstanding architecture diagram, clear clinical utility.",
      },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const sub2 = {
    opportunityId: savedOpp1._id,
    opportunitySlug: savedOpp1.slug,
    roundNumber: 1,
    roundName: "Round 1: Idea & Architecture Synopsis",
    registrationId: "HK-AI26-102931",
    participantName: "Rohan Verma",
    participantEmail: "rohan.verma@example.com",
    title: "Autonomous Repo Reviewer - Multi-Agent GitHub Action",
    description: "A GitHub Action that performs AST code inspections, security checks, and generates PR refactoring suggestions with automated regression testing.",
    links: {
      githubUrl: "https://github.com/rohan-v-dev/auto-repo-reviewer",
      demoUrl: "https://auto-reviewer-demo.dev",
    },
    submittedAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
    status: "pending",
    auditHistory: [
      {
        action: "CREATED",
        changedBy: "Rohan Verma (rohan.verma@example.com)",
        previousStatus: "none",
        newStatus: "pending",
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
        notes: "Initial project submission",
      },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  await subColl.updateOne(
    { registrationId: sub1.registrationId, roundNumber: sub1.roundNumber },
    { $set: sub1 },
    { upsert: true }
  );

  await subColl.updateOne(
    { registrationId: sub2.registrationId, roundNumber: sub2.roundNumber },
    { $set: sub2 },
    { upsert: true }
  );

  console.log("✅ Seed completed successfully!");
  console.log("=================================================");
  console.log("Verified Test Organizer Account:");
  console.log("  Email:    organizer@hackkro.com");
  console.log("  Password: organizer123");
  console.log("  Status:   VERIFIED (Can publish live events)");
  console.log("-------------------------------------------------");
  console.log("Pending Test Organizer Account:");
  console.log("  Email:    pending@campus.edu");
  console.log("  Password: campus123");
  console.log("  Status:   PENDING (Gated draft & review controls)");
  console.log("=================================================");

  await mongoose.disconnect();
}

runSeed().catch((err) => {
  console.error("Seed error:", err);
  process.exit(1);
});

