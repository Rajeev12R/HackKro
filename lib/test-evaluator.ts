import connectToDatabase from "./mongoose"
import { Test, type ITestQuestion } from "@/models/test"
import { TestCandidate } from "@/models/test-candidate"

export function formatTimeTaken(seconds: number): string {
  if (!seconds || seconds <= 0) return "0s"
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  if (mins === 0) return `${secs}s`
  return `${mins}m ${secs}s`
}

export async function evaluateAndRankCandidate(params: {
  testId: string
  candidateId: string
  answers: { questionId: string; selectedOptionId: string }[]
  tabSwitches?: number
}) {
  await connectToDatabase()

  const test = await Test.findOne({ testId: params.testId })
  if (!test) {
    throw new Error("Test not found")
  }

  const candidate = await TestCandidate.findById(params.candidateId)
  if (!candidate) {
    throw new Error("Candidate not found")
  }

  if (candidate.status === "submitted") {
    return {
      candidate,
      alreadySubmitted: true,
    }
  }

  const questionMap = new Map<string, ITestQuestion>()
  test.questions.forEach((q: ITestQuestion) => questionMap.set(q.id, q))

  let totalScore = 0
  const evaluatedAnswers = params.answers.map((ans) => {
    const question = questionMap.get(ans.questionId)
    const isCorrect = Boolean(question && question.correctOptionId === ans.selectedOptionId)
    if (isCorrect && question) {
      totalScore += question.points || 1
    }
    return {
      questionId: ans.questionId,
      selectedOptionId: ans.selectedOptionId,
      isCorrect,
    }
  })

  const submittedAt = new Date()
  const startedAt = candidate.startedAt || new Date()
  const timeTakenSeconds = Math.max(1, Math.round((submittedAt.getTime() - startedAt.getTime()) / 1000))

  candidate.status = "submitted"
  candidate.submittedAt = submittedAt
  candidate.timeTakenSeconds = timeTakenSeconds
  candidate.score = totalScore
  candidate.answers = evaluatedAnswers
  if (typeof params.tabSwitches === "number") {
    candidate.tabSwitches = params.tabSwitches
  }

  await candidate.save()

  // Recalculate ranks for all submitted candidates for this testId
  await recalculateTestRanks(params.testId)

  // Re-fetch candidate with new rank
  const updatedCandidate = await TestCandidate.findById(params.candidateId)

  return {
    candidate: updatedCandidate,
    alreadySubmitted: false,
    test,
  }
}

export async function recalculateTestRanks(testId: string) {
  await connectToDatabase()

  // Find all submitted candidates for this test
  const submittedCandidates = await TestCandidate.find({
    testId,
    status: "submitted",
  }).sort({
    score: -1, // Highest score first
    timeTakenSeconds: 1, // Lowest time taken first (speed wins tie-breakers)
    submittedAt: 1, // Earlier submission timestamp
  })

  // Assign ranks
  const bulkOps = submittedCandidates.map((cand, index) => {
    const assignedRank = index + 1
    return {
      updateOne: {
        filter: { _id: cand._id },
        update: { $set: { rank: assignedRank } },
      },
    }
  })

  if (bulkOps.length > 0) {
    await TestCandidate.bulkWrite(bulkOps)
  }

  return submittedCandidates.length
}
