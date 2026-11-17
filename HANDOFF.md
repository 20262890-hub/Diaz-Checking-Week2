# HANDOFF: WaterWise

**Student:** Marck Gabriel C. Diaz
**Subject:** HUMCOM
**Activity:** 6, Week 1 Checkpoint (repository, design tokens, UX proposal)

---

## 1. UX Project Proposal

### The user problem
Plant-care apps are noisy and fragile. They send many alerts, use tiny buttons and bright photos, and stop working when the Wi-Fi or the soil sensor fails. People with low vision or shaky hands are left out, and heavy apps drain the battery of older phones.

**Design goal in one line:** show ONE thing at the right time and keep the user in charge.

### Target audience
- Home plant owners who forget to water and want a calm reminder, not a feed of notifications.
- People with low vision, shaky hands or limited dexterity, who need big targets, scalable text and voice or haptic feedback.
- Users on older or low-battery phones and slow or unreliable internet, where a light app means less data use and less e-waste.

### Chosen aesthetic theme: "Quiet Greenhouse"
A calm, low-energy look. Dark green text on white, **one** amber card for the urgent thing, and everything healthy stays quiet and grey. There are no photos and the fonts are the phone's own system fonts, so nothing heavy is downloaded. An **eco mode** swaps to a dark, low-refresh screen.

> **Theme lock (No-Switch Policy):** WaterWise / Quiet Greenhouse is my final topic and theme for this project.

### Interface goals
| # | Goal | How it is measured |
|---|------|--------------------|
| 1 | **Big and clear.** One urgent card, one big filled button, the rest outlined. | Touch targets of at least 44 px (`--tap-min`); the main button is 56 px (`--tap-big`). |
| 2 | **For everyone.** Accessible by sight, touch, sound and voice. | Text scales to 200% (all sizes in `rem`); contrast of at least 11:1 for green on white; every status uses icon + word + colour; voice, haptic and spoken feedback planned. |
| 3 | **Eco mode.** Save battery and data. | Dark screen, no photos, system fonts, text-only syncing in batches, animation set to 0 ms. |
| 4 | **Right time.** Quiet until a plant is overdue. | Morning summary, alerts only when overdue, always shows "Synced 2 min ago", one-tap snooze. |
| 5 | **Plan B.** Failure is handled in plain words. | Sensor offline shows a Yes/No soil check, manual override, backup schedule every 3 days, 10-second undo. |
| 6 | **Clear layout.** Strong visual hierarchy. | Only 3 text sizes, one amber card, healthy plants stay grey, generous spacing. |

Source of the idea: my WaterWise design sketch (System & Interface Design, Design Assignment).

---

## 2. Week 1 Deliverables Checklist

| Deliverable | Status | Where |
|-------------|--------|-------|
| Repository initialized (clean folder structure) | Done | `index.html`, `css/style.css`, `HANDOFF.md`, `assets/images/` |
| Design tokens in `:root` | Done | `css/style.css`, section 1 |
| UX project proposal | Done | This file, section 1 |
| Folder naming and saving | Done | Root folder `Activity6_Diaz`, submitted as `.zip` |

## 3. Workspace Structure

```
Activity6_Diaz/
├── index.html          three screens: Home (A), Plant + sensor failure (B), Settings (C)
├── HANDOFF.md          this file
├── css/style.css       :root tokens, eco theme, base styles, app components
├── js/app.js           behaviour: water, snooze, undo, soil check, settings, voice, sync label
└── assets/images/      fern.png, monstera.png, cactus.png, sensor.png, logo-192.png, logo.svg
```

## 4. Design Tokens (declared in `:root`)

**Colour (light):** `--bg` sage white, `--text` near-black green, `--primary` dark green `#0E4426` (11.2:1 on white), `--urgent-*` amber card, `--alert` red for errors, `--line` grey dividers.
**Colour (eco / dark):** the same semantic names remapped under `:root[data-theme="eco"]` and `prefers-color-scheme: dark`.
**Typography:** system font stack; three sizes only: `--text-small` 1rem, `--text-body` 1.1875rem, `--text-title` 1.875rem; weights 400 and 700; line heights 1.55 and 1.2.
**Layout:** spacing scale `--space-1` to `--space-5`, content width `--measure` 36rem, radii `--radius-card` and `--radius-control`, `--border-width` 2px, tap sizes `--tap-min` 2.75rem and `--tap-big` 3.5rem, focus ring tokens.
**Motion:** `--motion` 150ms (0ms in eco mode and for reduced-motion users).

All hex values live in `:root`. Components below it only use variables.

## 5. Handoff: Progress (about 70%)

**Done**
- Screen A (Home): one urgent card with the big "Mark as watered" button and "Snooze 1 hour"; healthy plants stay quiet and grey; "All good" state when nothing is overdue.
- Screen B (Plant): "Sensor not responding" panel with the Yes/No soil check, "Retry sensor", the 3-day backup reminder note, and manual "Mark as watered / Mark as dry" at any time.
- Screen C (Settings): switches for Eco mode, Voice control, Haptic buzz, Spoken confirms; text size 100 to 200%; a demo switch to turn the Fern sensor failure on or off.
- 10-second undo after every action; data saved in `localStorage`; the sync label says "Synced N min ago" and switches to an offline message.
- Multi-column layout from 56rem wide; single column on phones.
- Pictures: PNG plant pictures and a sensor illustration. They are hidden in eco mode (no pictures, saves data) and use `loading="lazy"`.

**Image note:** the PNGs are illustrations generated for this project, not camera photos. To use real photos, replace `fern.png`, `monstera.png`, `cactus.png` with 4:3 images using the same file names.

**How to demo:** open `index.html`. Tap "Mark as watered" then Undo. Open Fern, answer the soil check, press "Retry sensor". In Settings, turn Eco mode on, set text size to 200%, and turn the demo switch off to see the sensor return. Voice control needs a browser with speech recognition (Chrome) and `localhost` or `https`.

**Remaining (about 30%)**
1. Real sensor and cloud sync (currently simulated and stored on the device).
2. Quiet hours and a lock-screen widget.
3. Screen reader and keyboard test pass, plus a contrast re-check of every state.
4. Add and edit plants; replace placeholder pictures with real photos.
5. Final write-up and presentation.
