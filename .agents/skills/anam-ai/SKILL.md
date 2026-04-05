---
name: anam-ai
description: Integrates Anam AI digital avatars—session tokens, JavaScript/Python SDKs, persona config, tools (client/webhook/knowledge), ElevenLabs and LiveKit patterns, widget embed. Use when building with Anam, AI avatars, persona streaming, WebRTC sessions, api.anam.ai, or @anam-ai/js-sdk.
---

# Anam AI (Digital Avatars)

Official docs index: [Anam developer documentation](https://anam.ai/docs/overview). Full LLM-oriented export: [llms-full.txt](https://anam.ai/docs/llms-full.txt).

## Security (non-negotiable)

- **API keys** belong only on the **server**. Never put `ANAM_API_KEY` in browser or client bundles.
- **Session tokens** are short-lived (~**1 hour**). Mint per user/session; do not long-cache.
- Exchange key for token: `POST https://api.anam.ai/v1/auth/session-token` with `Authorization: Bearer <ANAM_API_KEY>`.

## Session token request

```http
POST /v1/auth/session-token
Content-Type: application/json
Authorization: Bearer <ANAM_API_KEY>
```

**Stateful persona** (configured in [Anam Lab](https://lab.anam.ai)):

```json
{
  "personaConfig": {
    "personaId": "<uuid>"
  }
}
```

**Ephemeral persona** (full config at runtime):

```json
{
  "personaConfig": {
    "name": "Cara",
    "avatarId": "<uuid>",
    "voiceId": "<uuid>",
    "llmId": "<uuid>",
    "systemPrompt": "..."
  }
}
```

Optional fields commonly used: `languageCode` (ISO 639-1 for STT), `toolIds`, `skipGreeting`, `maxSessionLengthSeconds`, `voiceDetectionOptions`, `voiceGenerationOptions`, `zeroDataRetention`.

Response: `{ "sessionToken": "..." }` — pass **only** this to the client SDK.

## JavaScript SDK (browser)

- Package: `@anam-ai/js-sdk`
- Minimal flow: `createClient(sessionToken)` → `await streamToVideoElement("<video-element-id>")`
- Video element: `autoplay` + `playsinline` (mobile)
- Stop: `stopStreaming()`
- Register **listeners before** streaming if you need tools/events (see Events below)

### Custom LLM (client brain)

- Session: `llmId: "CUSTOMER_CLIENT_V1"` in `personaConfig`
- On `MESSAGE_HISTORY_UPDATED`, if last message is from user, call your LLM, then stream reply via `createTalkMessageStream()` + `streamMessageChunk()` or `talk()`

### Audio passthrough (BYO TTS)

- Session: `enableAudioPassthrough: true` in persona config; often `disableInputAudio: true` on client if another stack owns the mic
- After `streamToVideoElement`, `createAgentAudioInputStream({ encoding: "pcm_s16le", sampleRate: 16000, channels: 1 })`, `sendAudioChunk(base64)`, `endSequence()`; on barge-in: `interruptPersona()` + `endSequence()`

## Python SDK

- Install: `uv add anam` or `pip install anam` (user preference: **uv**)
- Server-side; do not expose API keys client-side
- Async patterns, frames, optional `[display]` extras — see [Python SDK](https://anam.ai/docs/sdk-reference/python-sdk)

## Tools (beta)

Three families: **client** (UI), **server/knowledge** (RAG), **server/webhook** (HTTP).

- Create tools via API or Lab; attach with `toolIds` on persona or ephemeral config
- JS: `registerToolCallHandler("tool_name", { onStart, onComplete, onFail })` **before** `streamToVideoElement`
- Lifecycle events: `TOOL_CALL_STARTED`, `TOOL_CALL_COMPLETED`, `TOOL_CALL_FAILED`

## Widget embed

- Custom element + script: `<anam-agent agent-id="<persona-id>"></anam-agent>` + `https://unpkg.com/@anam-ai/agent-widget`
- **Domain allowlist** required in Lab Widget tab or "Allow everywhere"
- Unpublished Lab changes do not apply on site until **Publish**

## ElevenLabs Agents (server-side)

- Server gets ElevenLabs signed URL, then Anam session with `environment.elevenLabsAgentSettings: { signedUrl, agentId, ... }`
- Signed URLs expire (~**15 min**); create token immediately before client connects
- Details: [ElevenLabs integration](https://anam.ai/docs/third-party-integrations/elevenlabs)

## LiveKit

- Python: `livekit-plugins-anam`, `anam.AvatarSession` + `PersonaConfig` — see [LiveKit](https://anam.ai/docs/third-party-integrations/livekit)

## API surface (reference)

- Base: `https://api.anam.ai`
- OpenAPI: `https://api.anam.ai/swagger.json`
- Common: `POST /v1/auth/session-token`, CRUD under `/v1/personas`, `/v1/avatars`, `/v1/voices`, `/v1/tools`, `/v1/knowledge/groups`, etc.

## Troubleshooting quick hits

| Symptom | Check |
|--------|--------|
| 401/403 on token | API key, Lab permissions |
| Widget "Origin not allowed" | Allowlist domain / HTTPS |
| No mic | HTTPS, permissions, CSP `connect-src` for api + wss |
| Choppy custom TTS | TTS must keep up with realtime; PCM16 16 kHz mono for passthrough |
| Stale ElevenLabs session | Refresh signed URL + new Anam token |

## MCP

Optional: [Anam MCP](https://anam.ai/docs/third-party-integrations/mcp) for managing personas/assets from Cursor/Claude with `ANAM_API_KEY`.

## Additional resources

- [Authentication & session tokens](https://anam.ai/docs/concepts/authentication)
- [Personas](https://anam.ai/docs/concepts/personas)
- [Events & tool handlers](https://anam.ai/docs/sdk-reference/events)
- [Production](https://anam.ai/docs/production)
