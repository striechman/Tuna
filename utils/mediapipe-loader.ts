// This utility helps with dynamically loading MediaPipe libraries
// which can sometimes cause issues when imported directly

// Check if we're in a browser environment
const isBrowser = typeof window !== "undefined"

// Create a more reliable way to load scripts
export async function loadScript(url: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const script = document.createElement("script")
    script.src = url
    script.onload = () => resolve()
    script.onerror = (e) => reject(new Error(`Failed to load script: ${url}`))
    document.head.appendChild(script)
  })
}

// Load MediaPipe modules directly from CDN
export async function loadMediaPipeModules() {
  // Only run in browser
  if (!isBrowser) {
    throw new Error("MediaPipe modules can only be loaded in browser environment")
  }

  try {
    console.log("Loading TensorFlow.js and MediaPipe modules from CDN...")

    // First, load TensorFlow.js - this is required by MediaPipe
    await loadScript("https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@3.11.0/dist/tf.min.js")

    // Wait a bit to ensure TensorFlow is fully initialized
    await new Promise((resolve) => setTimeout(resolve, 500))

    // Define the MediaPipe version
    const poseVersion = "0.5.1675469404"
    const drawingUtilsVersion = "0.3.1675466124"
    const cameraUtilsVersion = "0.3.1675466862"

    // Load required scripts
    await loadScript(`https://cdn.jsdelivr.net/npm/@mediapipe/pose@${poseVersion}/pose.js`)
    await loadScript(`https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils@${drawingUtilsVersion}/drawing_utils.js`)
    await loadScript(`https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils@${cameraUtilsVersion}/camera_utils.js`)

    console.log("TensorFlow.js and MediaPipe modules loaded successfully")

    // Return the global objects
    return {
      tf: window.tf,
      Pose: window.Pose,
      POSE_CONNECTIONS: window.POSE_CONNECTIONS,
      drawConnectors: window.drawConnectors,
      drawLandmarks: window.drawLandmarks,
      Camera: window.Camera,
    }
  } catch (error) {
    console.error("Error loading modules:", error)
    throw error
  }
}
