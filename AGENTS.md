## Cursor Cloud specific instructions

WhatsApp appointment booking bot — Node.js/Express backend with in-memory state, OpenAI GPT-4o datetime parsing, and mock Zoom/WhatsApp integrations.

### Services

| Service | How to run | Port | Notes |
|---------|-----------|------|-------|
| Express API | `npm run dev` | 3000 | Uses `node --watch` for auto-reload |

### Commands

- **Dev server:** `npm run dev` (port 3000, auto-reloads on file changes)
- **Lint:** `npm run lint` (ESLint, flat config)
- **Test:** `npm test` (Node.js built-in test runner)
- **Start (production):** `npm start`

### Key caveats

- The app works without `OPENAI_API_KEY` — datetime parsing falls back to a simple regex parser. Set the env var to use GPT-4o.
- Zoom meeting creation is a mock function returning dummy links.
- WhatsApp message sending is a mock function that logs to console.
- State is in-memory (JS object keyed by phone number) — restarting the server clears all sessions.
