interface Window {
  tf: any
  poseDetection: {
    createDetector: (model: string, config: any) => Promise<any>
    movenet: {
      modelType: {
        SINGLEPOSE_LIGHTNING: string
        SINGLEPOSE_THUNDER: string
        MULTIPOSE_LIGHTNING: string
      }
    }
    SupportedModels: {
      MoveNet: string
      BlazePose: string
      PoseNet: string
    }
  }
  Pose: any
  POSE_CONNECTIONS: any
  POSE_LANDMARKS: any
  drawConnectors: any
  drawLandmarks: any
  Camera: any
}
