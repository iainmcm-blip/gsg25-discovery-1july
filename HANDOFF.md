# GSG25 Strategic Discovery — Project Handoff

_Last updated: 16 June 2026. Hand this file to a new chat to resume work with full context._

---

## 1. What this is

A **client-facing microsite** that turns Motion's confidential **GSG25 Strategic Discovery deck**
(Global Schools Group's 25th-anniversary brand-strategy discovery) into a richly built, presentable
website. It is shown to **GSG's brand marketing team**. The thesis the site embodies: GSG's brand is
"written but not deployed" — so presenting the discovery *as a working piece of GSG's own brand* is
itself the argument.

It doubles as:
- a **live, presentable experience** (a built-in "Present mode" replaces slides), and
- a **leave-behind** (PDF export + a normal scrollable site).

Source deck: Google Slides `1WVgeZ92O-Ktdekrj_NXZLWZxpy6aqTrOKLP2zhXE_2g`
("GSG25 Strategic Discovery Document", draft 8 June 2026). Two source briefs informed the build:
`~/Downloads/GSG Guidelines.pdf` (logo guidelines) and globalschools.com.

---

## 2. Where everything lives

| | |
|---|---|
| **Local** | `~/Desktop/Motion Sensory Imagery/gsg25-discovery/` |
| **GitHub** | https://github.com/iainmcm-blip/gsg25-discovery (public) |
| **Live (share this)** | https://gsg25-discovery.vercel.app |
| **Vercel project** | `gsg25-discovery`, account `iainmcm-3128`. Deploy with `vercel --prod --yes`. |
| **Design spec** | `../docs/superpowers/specs/2026-06-15-gsg25-discovery-site-design.md` |

> The clean alias `gsg25-discovery.vercel.app` is the public one. Org-scoped deploy URLs
> (`…-iain-mc-mullan-s-projects.vercel.app`) can return 401 (deployment protection).

---

## 3. Architecture

**Stack:** plain **static HTML + Tailwind (Play CDN)**. No framework, no build step. Nine pages,
each a self-contained `.html` that links three shared assets.

```
gsg25-discovery/
├── index.html                  Cover: hero, exec summary, evidentiary table, contents
├── 01-landscape.html           Sector size, family priorities, three trends
├── 02-competitive.html         5 groups (accordions) + territory map + "Thrive" flag
├── 03-brand-audit.html         Says-vs-built, the manifesto (cinematic), GSG≠GIIS architecture
├── 04-founders-vision.html     Atul quote, 5 convictions, "25 years built", recognition
├── 05-voices.html              IN-PROGRESS: research method + independent quotes
├── 06-brand-truths.html        IN-PROGRESS: 5-level proof framework teaser
├── 07-strategic-implications.html  Territory + Learn Limitless⇄Accessible Excellence toggle + guardrails
├── 08-next-steps.html          Actions/owners/timing table + closing
├── robots.txt                  Disallow: /  (noindex)
└── assets/
    ├── gsg.css                 Design system + present-mode + print styles
    ├── gsg.js                  Reveals, count-ups, accordions, A/B toggle, PRESENT MODE engine
    ├── tailwind-config.js      Brand tokens for Tailwind Play CDN
    ├── gsg-mark.svg            OFFICIAL g-mark (icon only)
    └── gsg-logo.svg            OFFICIAL full lockup (mark + wordmark)
```

The nav/footer markup is **duplicated in every page** (no templating). To change nav globally,
edit all 9 — the last bulk edit used a `perl -0777` loop (see §8). The JS injects the
**Present** and **PDF** buttons into `.nav .nav-bar` at runtime, so those are not in the HTML.

---

## 4. Brand system

**Palette (UI tokens, from GSG Guidelines.pdf):** Green `#8EC640`, Light Blue `#29ABE2`,
Deep Blue `#145DAB`, Orange `#F89821`, Red `#E41F27`, ink `#0E1B2C`, navy `#0B1730`,
surface `#F6F8FB`. Used as a **semantic data system** (territory states, claims-confidence tags).

**Type:** brand primary is **Galano Grotesque** (licensed, not used) → substituted with
**Poppins** everywhere (GSG's own secondary face, free on Google Fonts).

**LOGO — IMPORTANT RULE: use the official artwork, never re-approximate it.**
`assets/gsg-mark.svg` (icon, viewBox `0 0 25.94 42`, taller than wide → **size by height, not width**)
and `assets/gsg-logo.svg` (full lockup) were pulled from globalschools.com brand assets
(`/wp-content/uploads/2025/03/GSG_logo.svg`). The logo's own hexes differ slightly from the UI swatches
(green `#6ABD45`, orange `#F6861F`, blue `#28AAE1`, red `#CE171E`, deep blue `#175EAB`, wordmark `#231F20`)
— **do not recolour the logo to match the UI tokens.** An earlier hand-built SVG approximation was
rejected; the official artwork is the source of truth.

---

## 5. Present mode (the headline feature)

Lets the site be *presented* live instead of using slides. All logic is an appended IIFE in `gsg.js`
plus styles in `gsg.css` (`body.present …`, `.present-hud`, `.present-notes`, `.present-progress`).

- **Enter:** `▶ Present` button (nav) or press **P**. **Exit:** `Esc`.
- **Navigate:** `→` / `Space` / `PageDown` = next, `←` / `PageUp` = prev, `N` = facilitator notes,
  `F` = fullscreen. There's a bottom HUD (section label · n/total · prev/next/notes/exit), a top
  progress bar, and a corner brand pill.
- **Beats:** each top-level `<section>` is one beat. Order = the `PAGES` array in gsg.js.
  **Cross-page** advance/resume uses `localStorage 'gsgResume'` (`first`/`last`).
- **Curation:** the cover's executive-summary section has `data-present-skip` so it is **skipped in
  present mode** — deliberately, so it doesn't spoil the §07 decision. It stays visible in the normal
  site / leave-behind. (If asked to include it in the presented flow, remove that one attribute.)
- **Staggered build:** on each beat, `cascade()` re-plays the beat's `.reveal` elements in DOM order
  with incrementing `transition-delay` (~90ms), like deck bullets building. Respects
  `prefers-reduced-motion`.
- **Facilitator notes:** stored in the `NOTES` object in gsg.js, keyed by filename → beat index.
  Shown on the same screen (no second-screen presenter view yet — see §7).
- **PDF / leave-behind:** the `PDF` button calls `window.print()`; the `@media print` block in gsg.css
  linearises everything (expands accordions, shows both A/B options, forces reveals visible, keeps
  dark-section colour).

---

## 6. Locked decisions & rules

- **Audience:** client-facing for the GSG brand marketing team.
- **Stack:** static HTML + Tailwind; GitHub + Vercel. (No framework — keep it that way unless asked.)
- **Visual mood:** *balanced* — restrained navy/white on analytical pages; vibrant + cinematic on the
  cover, manifesto, founder, and strategic-choice beats.
- **§05 & §06:** elegant "research in progress" pages (deck placeholders awaiting primary research).
- **Attribution:** discreet "Prepared by Motion for GSG" in footers/closing.
- **Privacy:** discreet "Confidential" framing + `noindex` + `robots.txt`. Link-shareable, not gated.
- **Copy:** light web-polish of the deck — **all facts, stats, dates and sources kept exact**; only
  phrasing tightened for screen. Don't invent data.
- **Logo:** official artwork only (see §4).
- **Voice/banned words:** follow the user's global CLAUDE.md style rules (no em dashes in prose,
  no agency clichés, Oxford comma, figures as numerals, Day Month Year dates, etc.).

---

## 7. Pending / open items & possible next steps

Nothing is broken or half-done. Candidate enhancements (all optional, none committed):

1. **Real GSG photography** — immersive sections currently use navy gradients + the ring motif.
   Real campus photos slot straight in (swap the decorative SVG blocks / add `<img>`s).
2. **Two-screen presenter view** — notes + next-slide preview on the laptop, clean slides on the
   projector. The current `N` notes panel shows on the shared screen only.
3. **Include the executive summary in present mode** — currently skipped (`data-present-skip` on that
   section in `index.html`). Remove the attribute if the client wants it in the live flow.
4. **Progressive sub-reveals within heavy beats** — e.g. territory-map tiles or the five competitors
   appearing one-by-one (today each whole beat cascades its reveals; sub-stepping would need `data-step`).
5. **Content refresh when primary research lands** — fill in §05 (Voices) and §06 (Brand Truths), and
   revisit the §07 Learn Limitless vs Accessible Excellence decision after the second Atul session.
6. **Offline copy for the meeting** — a zipped local build as a wifi-failure fallback.

Source-deck status to remember: the deck itself is a **draft**; §05–06 await a staff survey, focus
groups, depth interviews, a 9GEMS briefing, the Melissa digital-platform conversation, the India
branding outputs, and a second Atul briefing where the naming decision is settled.

---

## 8. Workflow & gotchas (read before editing)

**Preview** (the Launch/MCP preview is sandboxed away from ~/Desktop):
- Config `gsg25` in workspace `../.claude/launch.json` (ruby webrick, port 8903, serves `/tmp/gsg-preview`).
- After edits, re-sync: `rsync -a --delete --exclude '.git' --exclude 'node_modules' ./ /tmp/gsg-preview/`
  (plain `cp -R` fails — the repo's `.git/objects` are read-only).
- **Preview throttles rAF**: count-ups, reveal animations and CSS transitions look *frozen* in
  screenshots and synchronous evals (e.g. a selected toggle's background reads transparent). They work
  in real browsers — verify by forcing `transition:none` if you need to measure.
- The preview's content-fit viewport can report `innerWidth ≈ 2` / collapsed widths in `eval`; trust
  screenshots, not eval-measured widths.

**Present mode CSS gotcha:** the active beat must stay **in normal flow**
(`display:flex; min-height:100vh`), NOT `position:fixed`. Fixed took it out of flow and the
content-fit preview collapsed (sliver screenshots).

**Deploy toolchain** (no brew/node system-wide; binaries in /tmp):
```
export PATH="/tmp/gh_2.94.0_macOS_arm64/bin:/tmp/node-v24.16.0-darwin-arm64/bin:/tmp/npm-global/bin:$PATH"
cd "~/Desktop/Motion Sensory Imagery/gsg25-discovery"
git add -A && git -c user.email="iainmcm@gmail.com" -c user.name="Iain McMullan" commit -m "…"
git push origin main
vercel --prod --yes        # static deploy
```
`gh` is authenticated as `iainmcm-blip`; Vercel as `iainmcm-3128`.

**Editing the nav across all 9 pages** (it's duplicated): use a `perl -0777 -i -pe` loop over the file
list. The desktop nav is `<nav class="hidden xl:flex …">`; the inner bar div is `.nav-bar`
(JS hook for injecting Present/PDF); hamburger + mobile menu are `xl:hidden`.

---

## 9. One-line summary for the new chat

> Resume the GSG25 Strategic Discovery microsite (`~/Desktop/Motion Sensory Imagery/gsg25-discovery`,
> live at gsg25-discovery.vercel.app, repo iainmcm-blip/gsg25-discovery). Static HTML + Tailwind, 9
> pages, official GSG logo, built-in Present mode + PDF. Read HANDOFF.md §6 (rules) and §8 (gotchas)
> before editing; re-sync to /tmp and `vercel --prod` to deploy.
