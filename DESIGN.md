# Vibecoding Project Tracker — Design

**Status:** Hackathon starter design doc · fill in the **`<TODO>`** sections before you tag `design-done`.

**Why this file exists.** This tracker is your tool. It should look like *your* tool — not a generic Kanban with default Tailwind blue. Twenty minutes of design decisions here will be visible on every screen for the next six weeks of Module 5.

**Who owns this.** Person B, during the same window the rest of the team is reviewing the PRD. By the time the team converges to start M4 (`data-model`), this file should be filled in and the colors should already be in `tailwind.config.js`.

---

## 1. Mood / vibe

One sentence that captures the feeling the tracker should leave you with.

**I want it to push a design language that moves away from the recent "AI" styles by utilising bold colours, thick borders, and an uncompromising focus on the content and tasks. The application is meant to maintain a sense of human control and creativity throughout agentic development.**

Two or three references that capture the vibe (links to dribbble shots, screenshots of apps you admire, Pinterest boards — anything visual):

- `https://www.onething.design/post/what-is-neo-brutalism-ui-design`
- `https://neubrutalism.com/`
- `https://dribbble.com/tags/neo-brutalism`

Anti-references — what we are explicitly **not** trying to look like:

- `Generic “AI assistant” dashboards`
- `Glassmorphism, gradients, soft shadows, and excessive rounded pills`
- `Interfaces that make automated activity feel more important than human decisions`
- `https://scanaislop.com/blog/ai-slop-website-examples/`

## 2. Color palette

These are the colors the build milestones will reference. Once chosen, paste the hex values into `tailwind.config.js` so the rest of the team can use Tailwind utility classes (e.g. `bg-brand-primary`, `border-due-warning`).

### Brand

| Token | Hex | Where it shows up |
|---|---|---|
| `brand-primary` | #FF5C7A | Header, "+" button, focus rings |
| `brand-accent` | #36D6D0 | Highlights, hover states, links |
| `surface-page` | #FFF8E8 | Page background |
| `surface-card` | #FFFFFF | Card background |
| `text-primary` | #171717 | Body text |
| `text-muted` | #625D66 | Captions, dates, counts |

### Task type (M6 `tag-style`)

| Token | Hex | When used |
|---|---|---|
| `type-feature` | #5B8CFF | Cards tagged `feature` (accent stripe + icon) |
| `type-bug` | #FF5C5C | Cards tagged `bug` (accent stripe + icon) |

### Due-date states (M8 `due-tint`)

| Token | Hex | When used |
|---|---|---|
| `due-safe` | #B9F5C5 | More than 2 days out |
| `due-warning` | #FFD166 | Less than 24 hours |
| `due-overdue` | #FF8A8A | Past due |
| `due-neutral` | #D9D9D9 | Done (overrides date) |

Use near-black (#171717) text and borders with all light status colours. Do not rely on the tint alone: always pair it with a label or icon.

## 3. Typography

| Role | Font | Why |
|---|---|---|
| Heading | `Archivo Black` | `Dense, expressive, and forceful without looking corporate` |
| Body | `Space Grotesk` | `Bold, "code aesthetic", and a staple of Neubrutalism.` |
| Monospace (tags, badges, code) | `IBM Plex Mono` | `Legible for task tags, AI-tool labels, dates, and copied-context metadata` |

Suggested sizes (override only if the design demands it):

- Page title: 28 px / bold
- Section header: 16 px / uppercase / bold
- Card title: 15 px / semibold
- Body: 14 px / regular
- Caption: 12 px / medium

## 4. Component principles

One short sentence per element. These set the tone for the build phase — Person A's modal and Person B's anchor board should both feel like they came from this doc.

- **Cards:** White surfaces with a 3 px near-black border, a sharp or lightly rounded corner, and a hard offset shadow. A card should feel like a physical note placed on the board.
- **Buttons:** Solid-fill buttons with a 3 px near-black border and hard shadow. On press, move the button slightly down and right while reducing the shadow.
- **Modal:** A white, high-contrast workspace panel with a thick black outline and strong separation from a dimmed backdrop. Prioritise readable forms over decoration.
- **Empty states:** Direct and encouraging. Use a dashed black border, plain language, and one clear action.
- **Drag affordance (if used):** None in the first version. Use the status dropdown so every state change remains deliberate and visible.

## 5. Voice / microcopy

Three lines of microcopy that capture the tone of the product. Keep it short — these are the words a stressed user reads at 11pm.

| Where | Text |
|---|---|
| "+" button label | Add task |
| Empty column placeholder | Nothing here! ...yet |
| Toast after "Copy as Prompt Context" | Context copied. Hand it off to your AI tool. |
| Confirm-delete message | Delete this task? This cannot be undone. |
| Handoff toast | Task handed off to {name}. |

## 6. Logo / wordmark

The tracker probably doesn't need a logo, but it does need a name and a wordmark style.

- **Product name:** LeleBye (match PRD §11 team identity)
- **Wordmark style:** LELEBYE in Archivo Black, near-black, with a hot-coral highlight block or underline. Pair it with the subtitle “Vibecoding Project Tracker” in Space Grotesk.

## 7. Interaction details

- Use hard 4–6 px offset shadows rather than blurred shadows
- Keep border widths consistent: 3 px for primary cards, buttons, inputs, and modals.
- Use modest corner rounding only, around 2–6 px. Avoid pill-shaped controls.
- Use motion sparingly. A 150–200 ms movement or fade is enough for button presses and toasts.
- Keep ownership, task type, status, and due-date information obvious before a user opens a card.
- Treat Copy as Prompt Context as a deliberate human action: the app prepares context, but the person chooses when and where to use it.

## 8. Out of scope (this hackathon)

To keep design tight, the following are explicitly not part of `design-done`:

- A dark mode toggle. Pick one mode and ship it.
- Multiple themes. One brand, applied consistently.
- Animations beyond a 200 ms fade on toast notifications.
- A custom icon set. Use [Lucide icons](https://lucide.dev) via Tailwind classes if you need any.

---

*DESIGN.md version: hackathon-starter v1*
