// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom'

// Mock MediaPipe
jest.mock('@mediapipe/pose', () => ({
  Pose: jest.fn().mockImplementation(() => ({
    setOptions: jest.fn(),
    onResults: jest.fn(),
    send: jest.fn(),
  })),
}))

// Mock OpenAI
jest.mock('openai', () => ({
  default: jest.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: jest.fn().mockResolvedValue({
          choices: [
            {
              message: {
                content: 'Mock analysis',
              },
            },
          ],
        }),
      },
    },
  })),
}))

// Mock navigator.mediaDevices
Object.defineProperty(global.navigator, 'mediaDevices', {
  value: {
    getUserMedia: jest.fn().mockResolvedValue({
      getTracks: () => [
        {
          stop: jest.fn(),
        },
      ],
    }),
    enumerateDevices: jest.fn().mockResolvedValue([
      {
        kind: 'videoinput',
        deviceId: 'mock-device-id',
        label: 'Mock Camera',
      },
    ]),
  },
  writable: true,
}) 