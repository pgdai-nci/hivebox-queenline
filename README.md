# QueenLine Support Bot — HiveBox Apiary Co.

A chatbot for HiveBox Apiary Co. that routes 80% of customer contacts about queen mortality (dead, cold-stunned, or balled in transit) straight to resolution. Powered by Gemini 2.5 Flash with the API key secured behind a Cloudflare Worker — so the key never touches the browser.

## Architecture

```
Browser (GitHub Pages)  -->  Cloudflare Worker  -->  Gemini API
       index.html              hivebox-api           api key here
       (no API key)            (secret env var)
```

The frontend is a single static HTML file deployed on GitHub Pages. The API proxy is a Cloudflare Worker that holds the `GEMINI_API_KEY` as a secret environment variable. The browser never sees the key.

## Project Structure

```
hivebox/
  index.html              Chatbot UI (deploy to GitHub Pages)
  personas/               AI agent personas (five-innovator team)
    SaoirseODowd-ResearcherAnalyst.md    Intelligence analyst
    CathalNolan-Designer.md              Customer-care experience designer
    FinnMoriarty-Maker.md                Code, infrastructure, deployment
    MaeveCostello-Marketer.md            Copywriting, growth, positioning
    NiamhBuckley-Manager.md              Orchestrator, triage, quality gate
  workers/hivebox-api/    Cloudflare Worker (API proxy)
    index.js              Worker code
    wrangler.toml         Worker config
    package.json          Dependencies & scripts
```

## Deploy the Cloudflare Worker

1. Install Wrangler globally:
   ```
   npm install -g wrangler
   ```

2. Log in to your Cloudflare account:
   ```
   wrangler login
   ```

3. Navigate to the worker directory:
   ```
   cd workers/hivebox-api
   ```

4. Install dependencies:
   ```
   npm install
   ```

5. Set your Gemini API key as a secret:
   ```
   npx wrangler secret put GEMINI_API_KEY
   ```
   Paste your key when prompted.

6. Deploy the worker:
   ```
   npm run deploy
   ```

7. Note the worker URL (e.g. `https://hivebox-api.your-subdomain.workers.dev`).

8. Open `index.html` and set `WORKER_URL` at the top of the script to your worker URL.

## Deploy to GitHub Pages

1. Create a new GitHub repository (e.g. `hivebox-chatbot`).

2. Add the files to the repo root and push:
   ```
   git init
   git add .
   git commit -m "Initial commit: QueenLine chatbot with Cloudflare Worker proxy"
   git remote add origin https://github.com/<your-username>/hivebox-chatbot.git
   git push -u origin main
   ```

3. Go to **Settings > Pages**.

4. Under "Build and deployment," set **Source: Deploy from a branch**, branch `main`, folder `/ (root)`.

5. Save. Your bot will be live at `https://<your-username>.github.io/<repo-name>/` within a minute or two.

## How It Works

- **Niamh Buckley** (the chatbot persona) greets customers and asks one question: "When you opened the package, what did you find?"
- The system prompt encodes the Live Arrival Guarantee, triage rules for dead/cold/balled queens, ThermoCage packaging info, and the candy-release cage introduction method.
- Quick-reply buttons keep most interactions fast and structured. Free-text input is also supported.
- The Cloudflare Worker proxies all requests to Gemini 2.5 Flash. The API key is stored as a Cloudflare secret, never in the source code.
- 80% of contacts resolve within the bot. The remaining 20% (edge cases, escalations) are offered a handoff to a human Care Specialist.

## Five-Innovator Team

The chatbot and its infrastructure were designed by a team of five AI agents, each with a distinct role:

| Agent | Role | Domain |
|-------|------|--------|
| Saoirse O'Dowd | Researcher & Analyst | Customer intelligence, support analytics, mortality pattern detection |
| Cathal Nolan | Designer | Chatbot flow architecture, triage design, customer experience flows |
| Finn Moriarty | Maker | Frontend code, Cloudflare Workers, CI/CD, deployment |
| Maeve Costello | Marketer | Chatbot copy, landing pages, email sequences, positioning |
| Niamh Buckley | Manager | Triage orchestration, dispatch, synthesis, quality gate |

Each persona is defined in `personas/` and follows the template from `agent-persona-template.md` and `five-innovators-spec.md`.

## Security

- The Gemini API key is stored as a Cloudflare Worker secret, never in source code or browser-accessible files.
- The Worker enforces CORS with a strict origin policy.
- No customer data is stored server-side. Conversation history lives only in the browser tab.

## Local Development

Run the Worker locally:
```
cd workers/hivebox-api
echo "GEMINI_API_KEY=your-key-here" > .dev.vars
npm run dev
```

Open `index.html` in a browser, update `WORKER_URL` to `http://localhost:8787`, and test.
