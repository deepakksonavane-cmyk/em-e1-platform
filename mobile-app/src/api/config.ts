// Central configuration for talking to the Student LMS backend.
//
// Set these via Expo public env vars (app.json "extra" or a .env file loaded
// by babel-preset-expo / expo-constants at build time):
//   EXPO_PUBLIC_API_BASE_URL   e.g. https://lms.emleadershipacademy.com/api
//   EXPO_PUBLIC_USE_MOCK_DATA  "true" | "false"
//
// Defaults to the LMS backend's local dev URL, and mock mode ON so the app
// is demoable standalone without a live server.

export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL?.trim() || 'http://localhost:3000/api';

// USE_MOCK_DATA toggle: when true, api/index.ts serves everything from the
// bundled seed-data.json instead of hitting the network. Even when false,
// api/index.ts will gracefully fall back to mock data if a real request
// fails (e.g. no backend reachable), so the app never dead-ends in a demo.
export const USE_MOCK_DATA =
  (process.env.EXPO_PUBLIC_USE_MOCK_DATA ?? 'true').trim().toLowerCase() !== 'false';

export const REQUEST_TIMEOUT_MS = 8000;
