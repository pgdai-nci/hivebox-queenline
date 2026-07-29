---
name: chatbot-builder
description: Use when the user wants to build a new customer-care chatbot for any company or domain. Follows the QueenLine architecture: GitHub Pages frontend, Cloudflare Worker proxy, Gemini LLM, and Five Innovators agent personas. NOT for editing existing chatbots or general web development.
---

# Chatbot Builder

This skill codifies the process used to build the HiveBox Apiary Co. QueenLine chatbot. Use it to build a similar chatbot for any company or domain.

## Architecture

```
User's Browser (GitHub Pages)  -->  Cloudflare Worker  -->  Gemini API
       index.html                     worker.js              api key here
       (no API key)                   (secret env var)
```

## Process

### Phase 1: Understand the domain

Ask the user for:
- Company name and what they do
- Their customers and the #1 support issue (what 80% of tickets are about)
- Target outcome ("resolve X% of contacts without a human")

### Phase 2: Generate the Five Innovator agent personas

Use `agent-persona-template.md` and `five-innovators-spec.md` to generate 5 agent personas for the company, saved to `personas/`:

1. **Researcher & Analyst** — intelligence, data, patterns
2. **Designer** — chatbot flow, triage design, UX
3. **Maker** — frontend code, Cloudflare Worker, CI/CD
4. **Marketer** — copywriting, positioning, growth
5. **Manager** — triage orchestration, dispatch, quality gate

Each persona follows the scaffold: Identity, Bio, Role, Core beliefs, Boundaries, Skills, House style, Opening question.

### Phase 3: Build the Cloudflare Worker

Create `workers/<name>-api/index.js` with:
- CORS headers on ALL responses (OPTIONS preflight + error responses)
- Receives POST with `{ contents, system_instruction }`
- Forwards to Gemini API
- Returns `{ reply }` on success, `{ error }` on failure
- References API key via `GEMINI_API_KEY` (set as Cloudflare secret)

Create `workers/<name>-api/wrangler.toml`:
```toml
name = "<name>-api"
main = "index.js"
compatibility_date = "2025-04-01"
```

Create `workers/<name>-api/package.json` with `wrangler` dev dependency and `deploy`/`secret:set` scripts.

### Phase 4: Build the chatbot frontend

Create `index.html` with:
- **Header**: Agent name, title, live indicator
- **Chat message area**: scrollable, with bot/user styling
- **Quick-reply buttons**: contextual suggestions
- **Text input**: textarea with send button
- **Footer**: model credit
- **JavaScript**: calls the Cloudflare Worker (not Gemini directly)
- **System prompt**: defines the chatbot persona with triage rules
- **Conversation history**: maintained in memory, sent with each request

Key patterns:
- No API key gate (key lives in Worker secret)
- First message is always the triage opening question
- Quick-reply buttons update based on last bot response content
- Typing indicator shown during API calls
- Auto-resizing textarea

### Phase 5: Deploy

1. Deploy Worker: `cd workers/<name>-api && wrangler secret put GEMINI_API_KEY && npm run deploy`
2. Note the Worker URL, update `WORKER_URL` in `index.html`
3. Push to GitHub, enable Pages from `main` branch root
4. Test end-to-end

## Files to create

```
<project-root>/
  index.html                    Chatbot UI (deploy to GitHub Pages)
  personas/                     AI agent personas
    <Name>-ResearcherAnalyst.md
    <Name>-Designer.md
    <Name>-Maker.md
    <Name>-Marketer.md
    <Name>-Manager.md
  workers/<name>-api/           Cloudflare Worker
    index.js
    wrangler.toml
    package.json
  .github/workflows/deploy-worker.yml   CI/CD
  README.md                     Deployment instructions
```

## Guardrails

- Never hardcode the API key in source code. Use Cloudflare Worker secrets.
- Always include CORS headers on ALL HTTP responses from the Worker.
- The chatbot persona MUST state it is an AI colleague, not a human.
- The system prompt must include triage rules specific to the company's #1 support issue.
- Do not redesign the existing HiveBox chatbot unless explicitly asked.
