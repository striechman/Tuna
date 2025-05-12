declare module "@mediapipe/camera_utils" {
  export class Camera {
    constructor(
      video: HTMLVideoElement,
      options?: {
        onFrame?: () => Promise<void>
        facingMode?: string
        width?: number
        height?: number
      },
    )
    start(): Promise<void>
    stop(): void
  }
}

declare module "@mediapipe/drawing_utils" {
  export function drawConnectors(
    canvasCtx: CanvasRenderingContext2D,
    landmarks: any[],
    connections: any[],
    options?: {
      color?: string
      lineWidth?: number
    },
  ): void

  export function drawLandmarks(
    canvasCtx: CanvasRenderingContext2D,
    landmarks: any[],
    options?: {
      color?: string
      lineWidth?: number
      radius?: number
    },
  ): void
}

declare module "@mediapipe/pose" {
  export default class Pose {
    constructor(options?: {
      locateFile?: (file: string) => string
    })

    setOptions(options: {
      modelComplexity?: number
      smoothLandmarks?: boolean
      enableSegmentation?: boolean
      smoothSegmentation?: boolean
      minDetectionConfidence?: number
      minTrackingConfidence?: number
    }): void

    onResults(
      callback: (results: {
        poseLandmarks?: any[]
        poseWorldLandmarks?: any[]
        segmentationMask?: any
        image: HTMLVideoElement
      }) => void,
    ): void

    send(options: {
      image: HTMLVideoElement
    }): Promise<void>

    close(): Promise<void>
  }

  export const POSE_CONNECTIONS: any[]
  export const POSE_LANDMARKS: {
    NOSE: number
    LEFT_EYE_INNER: number
    LEFT_EYE: number
    LEFT_EYE_OUTER: number
    RIGHT_EYE_INNER: number
    RIGHT_EYE: number
    RIGHT_EYE_OUTER: number
    LEFT_EAR: number
    RIGHT_EAR: number
    MOUTH_LEFT: number
    MOUTH_RIGHT: number
    LEFT_SHOULDER: number
    RIGHT_SHOULDER: number
    LEFT_ELBOW: number
    RIGHT_ELBOW: number
    LEFT_WRIST: number
    RIGHT_WRIST: number
    LEFT_PINKY: number
    RIGHT_PINKY: number
    LEFT_INDEX: number
    RIGHT_INDEX: number
    LEFT_THUMB: number
    RIGHT_THUMB: number
    LEFT_HIP: number
    RIGHT_HIP: number
    LEFT_KNEE: number
    RIGHT_KNEE: number
    LEFT_ANKLE: number
    RIGHT_ANKLE: number
    LEFT_HEEL: number
    RIGHT_HEEL: number
    LEFT_FOOT_INDEX: number
    RIGHT_FOOT_INDEX: number
  }
}
