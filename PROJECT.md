# AI Game Show

**Stack:** React 18, TypeScript, Vite, Gemini API  
**Live:** https://projects.slash301.com/AIGameShow/  
**Local:** `npm run dev` → http://localhost:3000  
**Env:** `GEMINI_API_KEY` in `.env.local`

## What it is
Game-show app where multiple AI models compete simultaneously across rounds of questions. You watch them answer, score them, and track results across contestants. v2.0.0.

## Structure
- `App.tsx` — main game orchestrator
- `components/` — 18 tsx files: ContestantGrid, ContestantPodium, GameConsole, scoring modals, elimination flow, API key management
- `services/` — 11 ts files: Gemini API calls, scoring logic, game state
- `constants.ts` / `types.ts` — shared config and types

## State
Fully functional vibe-coded app. React + Gemini. No backend — all client-side. Multiple model support (Gemini variants). Has contestant setup, round management, elimination modal, answer history.

## What needs work / next directions
- No persistent game history (session only)
- Could add more AI providers beyond Gemini
- Scoring is manual/subjective — could add AI auto-scoring
- Mobile layout not tested
