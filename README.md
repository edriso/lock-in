# Lock In

**Phone down. Lock in.** A **frontend-only** study-focus app that gets students
to actually start — and to keep their phone out of it. It's built on behavioral
science, not just a timer: procrastination is mostly an _emotion-regulation_
problem, not a time-management one (studying feels threatening, so the brain
reaches for the relief of scrolling). So Lock In **lowers the threat of
starting**, makes **leaving the phone cost something**, and **never shames you**
when you slip — self-forgiveness is what actually reduces future procrastination.

There is no backend, no account, and no network. Everything lives on your device
and the app works fully offline.

---

## The five mechanisms

1. **The 2-minute rule.** Every session opens with a promise gate: _just_ two
   minutes. Starting is the whole battle; inertia takes it from there. "End &
   bank" only appears after two minutes have elapsed — the promise is honored.
2. **A commitment device (loss aversion).** A glowing **charge** you build by
   staying present. Bail to your phone and it **drains** — people work harder to
   avoid a loss than to chase a gain.
3. **Implementation intentions.** Optionally name _what_ you're locking in on
   and _why_ it matters (the "why" resurfaces mid-session).
4. **A streak of days, not hours.** A 7-day chain of "studied today" — honest
   and loss-averse, never a vanity hour-count.
5. **No shame on a slip.** A broken session still banks and still counts toward
   the streak. You just lock back in.

---

## How it works

**Home (the console):** your streak (with a flame and a 7-day chain), the start
console (duration pills 15/25/45/60, optional "what"/"why" fields, the glowing
**Lock In** button), a week-stats row, and a recent log (clean ⚡ vs. broken 🔥).

**Session overlay — a 3-phase state machine:**

- **promise** → the two-minute deal and "put your phone across the room."
- **run** → a full-screen charge ring with a glowing core that intensifies as
  you stay, a big mono countdown, your subject, and your "why" (or a rotating
  hype line). Pause/resume; "End & bank" after two minutes.
- **done** → "Clean lock" or "Locked, with a wobble" — both celebrated — then
  "Bank it" logs the session, updates the streak, and plays a soft chime.

### Leave-detection (and the laptop-vs-mobile caveat)

The commitment device watches the **Page Visibility API**. If you switch away
(another tab/app) for longer than a short **grace window**, the session is marked
**broken** and the charge drops; a red "charge draining — come back" state shows
until you return, and the charge then recovers slowly. The grace window is tuned
by the **strictness** setting (strict ≈ 3s, normal ≈ 7s, gentle ≈ 12s).

**This is designed for the realistic setup: studying on a laptop with the phone
as the temptation** — switching to a YouTube tab is what gets caught. On a phone,
locking the screen _also_ fires `visibilitychange`, so the break penalty is kept
modest deliberately, the app leans on the physical "phone across the room"
instruction, and it uses the **Screen Wake Lock API** (feature-detected) to keep
the session screen awake rather than punishing a screen-lock harshly. All of the
break/recover logic lives in the pure, well-tested reducer in `src/lib/charge.ts`.

---

## Tech stack

- **React 19 + TypeScript** (strict), built with **Vite**
- **Tailwind CSS v4** (configured in CSS with `@theme`, no `tailwind.config.js`)
- **Zustand** for state (no router — it's one screen plus an overlay)
- **Zod** validates the persisted shape
- **vite-plugin-pwa** so the app is installable and works offline; the **Screen
  Wake Lock API** keeps a session's screen awake where supported
- **Vitest** + **Testing Library** for unit and component tests, **Playwright**
  for browser tests (it uses the clock API to fast-forward sessions)

---

## Getting started

You need **Node 20+** and **pnpm** (`npm install -g pnpm`).

```bash
pnpm install
pnpm dev
```

Open <http://localhost:5173>. There is nothing else to configure — no backend.

---

## Commands

| Command          | What it does                              |
| ---------------- | ----------------------------------------- |
| `pnpm dev`       | Start the Vite dev server                 |
| `pnpm build`     | Type-check and build for production       |
| `pnpm preview`   | Preview the production build locally      |
| `pnpm lint`      | Run ESLint (must pass with zero warnings) |
| `pnpm format`    | Format every file with Prettier           |
| `pnpm typecheck` | Type-check without building               |
| `pnpm test`      | Run the unit and component tests (Vitest) |
| `pnpm test:e2e`  | Run the browser tests (Playwright)        |

Run `pnpm test:e2e:install` once to download the browser before `pnpm test:e2e`.

---

## How it is built

```
src/
├── components/        icon, button, label, overlay (presentational pieces)
├── features/
│   ├── home/          the console + the settings panel
│   └── session/       the 3-phase session overlay + the charge ring
├── store/             the Zustand store (settings + sessions/streak)
├── hooks/             interval, visibility, wake-lock, apply-theme
├── lib/               pure logic & data: streak, timer, charge, repository, date, format, hype, chime
├── types/             Zod schemas and the types they produce
└── styles/            the theme and layout CSS
```

A few ideas worth knowing:

- **All saving goes through one seam.** `lib/repository.ts` is a small typed
  interface (`getState`, `saveState`, `setSettings`, `completeSession`, `setWhy`)
  backed by localStorage. Components and the store never touch storage directly.
  Saved data is parsed with Zod, so an old, partial, or corrupt shape safely
  falls back to defaults.
- **The hard logic is pure and tested.** `computeStreak` (consecutive days
  ending today or yesterday), the timer **state machine** (`lib/timer.ts`:
  promise → run → done, pause/resume, the 2-minute unlock, natural finish), and
  the leave/charge **reducer** (`lib/charge.ts`) are plain functions with no
  React, so the day-boundary, unlock, and break/no-break edges are all testable
  without a browser.
- **The streak is days, not hours.** Multiple sessions in one day count once; a
  missed day breaks the chain.

---

## Accessibility & motion

- Every control is keyboard-operable with a visible focus ring; the session
  overlay and settings trap focus and close on Escape; icon buttons carry labels.
- The away/broken state never relies on color alone — it always pairs the red
  with a "charge draining — come back" message and a skull icon.
- The app honors `prefers-reduced-motion` (the core's pulse is dropped) and
  `prefers-color-scheme`. Theme, accent, default length, strictness, and the
  "why" prompt are all in the small settings panel.

---

## A note on slipping

A broken session still banks and still counts. There's no "you failed" here —
just energy and a clean way back in. Done is done; forgive it, run it back.

---

## License

MIT.
