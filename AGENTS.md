## Cursor Cloud specific instructions

WhatsApp appointment booking bot — Node.js/Express backend with in-memory state, chrono-node datetime parsing, 8x8 ChatApps WhatsApp integration, and mock Zoom.

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

- **8x8 WhatsApp integration:** Set `EIGHTX8_API_KEY` and `EIGHTX8_SUBACCOUNT_ID` env vars to enable real WhatsApp messaging via 8x8 ChatApps API. Without them, messages are logged to console (mock mode).
- **Webhook accepts two formats:** 8x8 ChatApps inbound webhook (`eventType: "inbound_message_received"`) and simple/Twilio-style (`{ From, Body }`). The simple format is handy for curl testing.
- **WhatsApp 24-hour window:** Free-text replies only work within WhatsApp's 24-hour customer service window (opened when user messages first). Our bot flow always starts with user saying "Hi", so this is satisfied.
- **Datetime parsing:** Uses `chrono-node` (local, free, no API key). Handles "tomorrow 5pm", "next Monday 3pm", "day after tomorrow 10:30am", etc.
- **Zoom:** Mock function returning dummy links. No real Zoom credentials needed.
- **State is in-memory** — restarting the server clears all sessions.
- **Public URL for 8x8:** To receive real WhatsApp messages, expose port 3000 via ngrok (`ngrok http 3000`) and configure the HTTPS URL in [8x8 Connect → Webhooks](https://connect.8x8.com/webhooks).
- **Tests always use mock mode:** Tests call `setMockMode(true)` so they never send real WhatsApp messages, even when `EIGHTX8_API_KEY`/`EIGHTX8_SUBACCOUNT_ID` are in the environment. Just run `npm test` — no need to unset env vars.
- **Dev server in mock mode:** To log WhatsApp replies to console instead of sending via the real API, start the server without 8x8 credentials: `env -u EIGHTX8_API_KEY -u EIGHTX8_SUBACCOUNT_ID npm run dev`. With credentials set, the server sends real messages via 8x8.
- **Hello world test via curl:** Send a simple-format POST to test the full flow: `curl -X POST http://localhost:3000/webhook/whatsapp -H 'Content-Type: application/json' -d '{"From":"+1234567890","Body":"Hi"}'`.
