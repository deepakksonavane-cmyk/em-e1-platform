// Unified API surface used by the whole app. Screens should only ever
// `import { api } from '../api'` — never import client.ts / mockBackend.ts
// directly — so the mock/real switch stays in one place.
//
// Behavior:
//  - USE_MOCK_DATA = true  → always serve from bundled seed data (default).
//  - USE_MOCK_DATA = false → call the real LMS backend; if the request
//    throws (no network / backend down / not implemented yet), we
//    transparently fall back to mock data so the app stays usable in a demo.

import { USE_MOCK_DATA } from './config';
import { realApi } from './client';
import { mockApi } from './mockBackend';
import { Api } from './types';

function withFallback(primary: Api, fallback: Api): Api {
  const wrapped = {} as Api;
  (Object.keys(primary) as (keyof Api)[]).forEach((key) => {
    // @ts-expect-error — generic proxy over heterogeneous method signatures
    wrapped[key] = async (...args: unknown[]) => {
      try {
        // @ts-expect-error
        return await primary[key](...args);
      } catch (err) {
        console.warn(`[api] "${String(key)}" failed against real backend, falling back to mock data:`, err);
        // @ts-expect-error
        return fallback[key](...args);
      }
    };
  });
  return wrapped;
}

export const api: Api = USE_MOCK_DATA ? mockApi : withFallback(realApi, mockApi);

export * from './types';
