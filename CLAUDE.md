# CLAUDE.md — Lock In

Project memory for Claude Code. Read this before doing anything. Keep edits aligned with it; if you intentionally diverge, update this file in the same change.

## What Lock In is

A **frontend-only** study-focus app that gets university students to put the phone down and actually start studying. Voice: focused, a little **hype**, current student vernacular ("lock in," "phone down, let's go"). Tagline: **"Phone down. Lock in."**

It is **science-backed**, not just a timer. Core premise: **procrastination is an emotion-regulation problem, not time management** — studying feels threatening, so the brain reaches for relief (scrolling). So the app **lowers the threat of starting** and makes **leaving the phone the game**, and it **never shames** (self-forgiveness reduces future procrastination). No backend, no accounts; all state local; works offline.

> Keep it minimal: **one home screen + an immersive session overlay.** Resist social feeds, leaderboards, music, to-do lists, analytics dashboards. The power is the focused loop, not features.

## The five mechanisms (the whole point — preserve them)

1. **2-minute rule** — every session opens with a promise gate: "Just two minutes… you're free to stop after — but you won't." Starting is the battle; inertia takes over. After 2 min elapsed, an "End & bank" option appears (honor the promise).
2. **Commitment device + loss aversion** — a glowing **charge core** you build by staying; bailing to your phone **drains** it. People work harder to avoid loss than chase gain (Forest's insight).
3. **Implementation intention** — optional "What are you locking in on?" (and "Why?").
4. **Streak of days, not hours** — a 7-day chain; loss-averse, honest, never a vanity hour-count.
5. **No shame** — a broken session still banks and still counts to the streak; you just "lock back in."

## Product shape (home + session overlay — don't extend it)

**Home ("the console"):** brand + quiet theme toggle; a big **streak** number (flame) + **7-day chain** (today marked, "don't break it"); the **start console** = duration pills (15/25/45/60), optional "what" + "why" fields, glowing **Lock In** button; a **week-stats** row (minutes this week, sessions today); a **recent log** (subject · minutes · date · clean ⚡ vs broken 🔥); a short de-shaming footer.

**Session overlay — 3-phase state machine (`promise | run | done`):**

- **promise** — the 2-minute deal + "put your phone across the room" + "I'm in".
- **run** — full-screen **charge ring** (progress ring + glowing core that intensifies, softly pulses) + big **mono countdown** + subject + the "why" or a rotating hype line; pause/resume; "End & bank" after 2 min. **Leave-detection:** `visibilitychange` hidden beyond a grace window ⇒ mark **broken**, **drain charge**, show a red "charge draining — come back" state; returning recovers charge.
- **done** — "Clean lock" (unbroken) vs "Locked, with a wobble" (broken) — **both celebrated, neither shamed** — minutes done + "Bank it" (logs, updates streak, soft chime).

### Leave-detection caveat (important — keep in code + copy)

Designed for the realistic setup: **studying on a laptop with the phone as the temptation** (switching to a YouTube tab = caught). On a phone, locking the screen _also_ fires `visibilitychange`, so don't punish a screen-lock as harshly, lean on the physical "phone across the room" instruction, and use the **Screen Wake Lock API** (feature-detected) to keep the session screen awake. Strictness setting tunes the grace window (gentle 12s / normal 7s / strict 3s).

## Design system — dark "focus mode", hype but clean

Default **dark** (`#0f1117`); also **light**. **Electric green `#58e08c` is the signature** — energetic, "go." `--danger` (`#e0795a`) is _only_ the away/broken state. Accents: electric green, teal `#5ce0d0`, indigo `#7d8be0`, amber `#e0c34a`, coral `#e0795a`; tints via `color-mix`. The **charge ring + glowing core** is the hero visual: SVG progress ring + radial-gradient core that scales/intensifies with progress and pulses (`li-pulse`, ~4s); dims + bg shifts danger-red when away. Drop the pulse under `prefers-reduced-motion`. Buttons glow (soft accent box-shadow). Logo is a lock glyph on accent.

**Type:** **Space Grotesk** (400–700) for UI, headings, big numbers; **IBM Plex Mono** for the countdown numerals, durations' "min", and tracked uppercase labels (letter-spacing ~0.16em).

**Voice & tone:** hype but **never shaming**. "Phone down. Let's go." · "Just two minutes. You're free to stop after — but you won't." · "← get back here" / "Charge draining. Come back." · clean: "Clean lock. That's a real rep." · broken: "Done is done. Forgive it, run it back. The streak still counts." No "you failed," no guilt. Energy + forgiveness; the slip-recovery copy always offers a clean way back in.

## Tech & architecture

- **React 19 + TypeScript (strict)**, **Vite**, **Tailwind v4** (CSS-first `@theme`, no config; Node 20+).
- **Zustand** (sessions/streak/settings); single screen + overlay, **no router needed**. **Zod** validates the persisted shape.
- **Persistence behind a typed `repository`** (`getState`/`saveState`/`setSettings`/`completeSession`/`setWhy`) over localStorage; components never touch storage directly; Zod safe defaults.
- **Leave-detection** = a thin `use-visibility` hook over the Page Visibility API; all break/recover logic is the pure `lib/charge.ts` reducer. The timer is the pure `lib/timer.ts` state machine.
- **Chime** via WebAudio on the banking gesture, try/catch. **Screen Wake Lock API** during the run, feature-detected with fallback.
- **PWA**: installable, offline-first (vite-plugin-pwa + manifest, lock/green icon).
- Folders: `components/`, `features/{home,session}/`, `store/`, `hooks/`, `lib/` (repository, streak/timer/charge utils, hype-copy, chime, date, format), `types/`, `styles/`. Co-locate tests.

### Conventions

- Naming: `PascalCase` components/types · `camelCase` functions/vars · `kebab-case` files · `SCREAMING_SNAKE_CASE` constants. One component per file; keep small.
- No `any` (`unknown` + narrowing). **Discriminated union for session phase** (`promise|run|done`) and the away/charge state. Path aliases (`@/`).
- **Pure, unit-tested logic** for `computeStreak`, the timer state machine, and the leave/charge reducer — keep out of components.
- Accessibility: keyboard-operable, focus trap + Esc in the overlay, ARIA labels on icon buttons, visible focus rings, reduced-motion fallbacks. The away/broken state must not rely on color alone (keep the "come back" text + skull icon).

## Commands

```bash
pnpm install
pnpm dev          # vite dev server
pnpm build        # type-check + production build
pnpm preview      # preview the build
pnpm lint         # eslint, zero warnings
pnpm format       # prettier --write
pnpm test         # vitest (unit + component)
pnpm test:e2e     # playwright
```

Husky: pre-commit runs Prettier + ESLint on staged files; pre-push runs type-check + unit tests. Conventional Commits (commitlint). Deployed on Netlify (`netlify.toml`); the build command runs the full quality gate.

## Definition of done

Lint clean (zero warnings), `tsc` clean, unit/component/e2e green (streak, timer machine, and leave/charge especially), builds, **installs and runs offline**, keyboard-accessible, reduced-motion safe, and faithful to this design system — dark focus-mode, electric green, Space Grotesk + mono, hype-but-kind. The prototype (`Lock In.html` + `lockin-ui.jsx` + `lockin-session.jsx` + `lockin-app.jsx`) is the source of truth for the loop, the charge ring, leave-detection, and the copy; port it faithfully. Above all: **it must make starting easy, make leaving the phone cost something, and never shame a slip.**
