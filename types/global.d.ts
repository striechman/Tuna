// This file contains global type declarations for third-party libraries

// TensorFlow.js global namespace
declare namespace tf {
  // Add any specific TensorFlow.js types you need here
}

// Pose Detection global namespace
declare namespace poseDetection {
  export interface Keypoint {
    x: number
    y: number
    z?: number
    score: number
    name: string
  }

  export interface Pose {
    keypoints: Keypoint[]
    score: number
  }

  export const SupportedModels: {
    MoveNet: string
    BlazePose: string
    PoseNet: string
  }

  export const movenet: {
    modelType: {
      SINGLEPOSE_LIGHTNING: string
      SINGLEPOSE_THUNDER: string
      MULTIPOSE_LIGHTNING: string
    }
  }

  export function createDetector(model: string, config: any): Promise<any>
}

// Extend Window interface to include our globals
interface Window {
  tf?: typeof tf
  poseDetection?: typeof poseDetection
}
