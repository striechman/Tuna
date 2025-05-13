import OpenAI from "openai"
import type { PoseData } from "./pose-detection-service"
import type { ExerciseState } from "./exercise-detection-service"
import type { EmergencyState } from "./emergency-detection-service"

// Define LLM service state
export interface LLMState {
  lastAnalysis: string | null
  lastFeedback: string | null
  isAnalyzing: boolean
  error: string | null
}

// Define LLM service events
export type LLMEvents = {
  onAnalysis: (analysis: string) => void
  onFeedback: (feedback: string) => void
  onError: (error: string) => void
}

class LLMService {
  private state: LLMState = {
    lastAnalysis: null,
    lastFeedback: null,
    isAnalyzing: false,
    error: null,
  }

  private eventListeners: LLMEvents = {
    onAnalysis: () => {},
    onFeedback: () => {},
    onError: () => {},
  }

  private openai: OpenAI
  private readonly ANALYSIS_INTERVAL = 5000 // Analyze every 5 seconds
  private lastAnalysisTime = 0

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
      dangerouslyAllowBrowser: true,
    })
  }

  // Analyze current state
  async analyzeState(
    pose: PoseData,
    exerciseState: ExerciseState | null,
    emergencyState: EmergencyState | null,
  ): Promise<void> {
    if (this.state.isAnalyzing) return
    if (Date.now() - this.lastAnalysisTime < this.ANALYSIS_INTERVAL) return

    this.state.isAnalyzing = true
    this.lastAnalysisTime = Date.now()

    try {
      // Prepare context for analysis
      const context = {
        pose: {
          score: pose.score,
          keypoints: pose.keypoints.map((kp) => ({
            name: kp.name,
            x: kp.x,
            y: kp.y,
            score: kp.score,
          })),
        },
        exercise: exerciseState
          ? {
              type: exerciseState.type,
              confidence: exerciseState.confidence,
              repCount: exerciseState.repCount,
              formScore: exerciseState.formScore,
            }
          : null,
        emergency: emergencyState
          ? {
              type: emergencyState.type,
              confidence: emergencyState.confidence,
              isActive: emergencyState.isActive,
            }
          : null,
      }

      // Get analysis from OpenAI
      const analysisResponse = await this.openai.chat.completions.create({
        model: "gpt-4-turbo-preview",
        messages: [
          {
            role: "system",
            content: `You are an AI fitness coach analyzing a user's workout session in real-time.
            Analyze the following data and provide:
            1. A brief analysis of the current state
            2. Specific feedback on form and technique
            3. Safety concerns if any
            4. Recommendations for improvement
            
            Keep responses concise and actionable.`,
          },
          {
            role: "user",
            content: JSON.stringify(context),
          },
        ],
        temperature: 0.7,
        max_tokens: 150,
      })

      const analysis = analysisResponse.choices[0]?.message?.content || "No analysis available"
      this.state.lastAnalysis = analysis
      this.eventListeners.onAnalysis(analysis)

      // Get specific feedback
      const feedbackResponse = await this.openai.chat.completions.create({
        model: "gpt-4-turbo-preview",
        messages: [
          {
            role: "system",
            content: `Based on the previous analysis, provide specific, actionable feedback for the user.
            Focus on:
            1. Immediate form corrections
            2. Safety tips
            3. One specific improvement to focus on
            
            Keep it very brief and clear.`,
          },
          {
            role: "user",
            content: analysis,
          },
        ],
        temperature: 0.7,
        max_tokens: 100,
      })

      const feedback = feedbackResponse.choices[0]?.message?.content || "No feedback available"
      this.state.lastFeedback = feedback
      this.eventListeners.onFeedback(feedback)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Error analyzing state"
      this.state.error = errorMessage
      this.eventListeners.onError(errorMessage)
    } finally {
      this.state.isAnalyzing = false
    }
  }

  // Subscribe to events
  subscribe(events: Partial<LLMEvents>): void {
    this.eventListeners = { ...this.eventListeners, ...events }
  }

  // Get current state
  getState(): LLMState {
    return { ...this.state }
  }

  // Reset state
  reset(): void {
    this.state = {
      lastAnalysis: null,
      lastFeedback: null,
      isAnalyzing: false,
      error: null,
    }
  }
}

// Export singleton instance
const llmService = new LLMService()
export default llmService 