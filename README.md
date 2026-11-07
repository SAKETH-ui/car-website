# NOCTIS — Electric Performance / Cold Light

A premium, minimal, single-page scrollytelling website for **NOCTIS**, a fictional electric performance car brand.

Mood: *A city in total blackout at night where the car's light is the only light in the world.* Everything feels quiet, expensive, and precise: vast empty space, few words, and perfect motion.

---

## ⚡ Highlights

- **Scroll-Scrubbed Canvas Sequences**: Full-screen `<canvas>` drawing 187 high-resolution frames for the Hero sequence and 41 frames for the Dismantle sequence, smoothly interpolated via `requestAnimationFrame` with nearest-loaded frame fallbacks.
- **Strict Aesthetic Discipline**:
  - Flat, solid colors: `--asphalt (#07080A)`, `--graphite (#121418)`, `--fog (#8A8F98)`, `--bone (#EDEAE4)`, `--xenon (#CFE3FF)`, and `--taillight (#E1251B)`.
  - Zero gradients, zero glassmorphism / backdrop-filter blur, zero glows, zero drop shadows, and zero bubbly rounded cards.
  - 1px hairline structural grid throughout.
- **Custom Headlight Cursor**: Follows mouse coordinates with `lerp 0.18` (6px xenon dot inside a 28px 1px stroked ring). Morphs into a 44×2px horizontal light bar with mono labels over interactive targets (`VIEW`, `RESERVE`, `OPEN`, `CONFIGURE`).
- **Dynamic Film Grain**: Offscreen procedural noise tile shifted randomly at ~8Hz without vignette or CPU strain.
- **Word-by-Word Engineering Statement**: Dynamic illumination from 15% to 100% opacity driven by viewport scroll progress.
- **Interactive Dismantle Architecture**: Pinned sequence with anchor dots and 1px hairline vectors connecting directly to structural callouts (`BODY`, `BATTERY`, `DRIVE`, `LIGHT`).
- **Full-Width Lineup Accordion**: 5 vehicles (`GT-E`, `S`, `X`, `R`, `ONE`) aligned to the shared 72% floor line with 80ms hover debounce, staggered line reveals, interactive finish swatches, and keyboard navigation.
- **Zero Libraries or Frameworks**: Built with pure HTML5, CSS3, and vanilla JavaScript. Runs from any static local server (e.g. VS Code Live Server).

---

## 📂 Project Structure

```text
├── assets/
│   ├── cars/
│   │   ├── gt-e.webp          # Hero car: matte graphite grand tourer coupe
│   │   ├── s.webp             # Four-door sport sedan: satin bone white
│   │   ├── x.webp             # Coupe-roofline SUV: midnight blue
│   │   ├── r.webp             # Track coupe with wing: satin black & red
│   │   └── one.webp           # Concept hypercar: liquid silver
│   └── frames/
│       ├── hero/              # 187 frames (1600x900 WebP, q78)
│       ├── hero-mobile/       # 187 frames (960x540 WebP, q72)
│       ├── dismantle/         # 41 frames (1600x900 WebP, q78)
│       └── dismantle-mobile/  # 41 frames (960x540 WebP, q72)
├── index.html                 # Semantic HTML structure & accessibility
├── styles.css                 # Design tokens, typography, line masks & layouts
├── main.js                    # Canvas render loop, cursor, preloader & listeners
├── config.js                  # Centralized tuning parameters & content
└── README.md
```

---

## 🚀 Running Locally

Because this project relies on WebP sequence loading and standard ES6 modules, run it through a local HTTP server:

### Option 1: VS Code Live Server
Right-click `index.html` in VS Code and choose **Open with Live Server**.

### Option 2: Python HTTP Server
```bash
python -m http.server 8000
```
Then navigate to: `http://localhost:8000`

### Option 3: Node `serve` / `npx`
```bash
npx serve .
```

---

## ⚙️ Configuration

All key variables can be tuned in `config.js`:
- Section heights (`wrapperHeight: '600vh'`)
- Chapter ranges and text content
- Telemetry bounds (velocity `0–118 KM/H`, range `0.0–4.2 KM`)
- Frame paths and counts
- Dismantle component anchor percentages

---

## ♿ Accessibility & Performance

- **`prefers-reduced-motion`**: Automatically disables scroll-pinning, displays static keyframes with simple opacity transitions, and restores standard cursor.
- **Responsive Layout**: Adapts between desktop cover-fit and mobile contain-fit (<768px) with vertically stacked accordion rows.
- **Decode Pipeline**: Uses `Image.decode()` to eliminate main-thread decoding jank.
