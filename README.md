# UniBuddy 🎓

**UniBuddy** is a campus mentorship and peer-discovery web platform built for Indian college students (Gen-Z). It connects juniors with verified seniors for 1-on-1 practical mentorship calls (for the price of a canteen meal, not a corporate retainer), maps out essential student-rated spots around campus, and showcases uncurated campus life through micro stories.

Built to Apple-grade standards for code quality, responsiveness, and accessibility using the **Golden Hour Campus** design system.

---

## 🚀 Quick Start

### 1. Installation
Clone or open the repository, then install dependencies:
```bash
npm install
```

### 2. Development Server
Start the local Vite development server:
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 3. Production Build & Linting
Run the production build:
```bash
npm run build
```
Run the ESLint suite:
```bash
npm run lint
```

---

## 🔑 Authentication & Demo Account

This application is **frontend-only**. All authentication and user profiles are mocked client-side with safe local session persistence under the `unibuddy_user` key. Passwords are required during login/registration for UX simulation, but are **never stored or transmitted**.

### Instant Demo Account
You can click **"Try the demo account"** directly in any auth dialog, or log in with:
- **Email:** `rahul@iitb.ac.in`
- **Password:** `password` (any 6+ characters)
- **Profile:** Rahul Verma, IIT Bombay, 1st yr, DSA & Web Dev

---

## 🗺️ Routes & Pages

The application is structured around four primary routes:

1. **`/` — Homepage (Public)**
   - Hero with interactive 3D spring-tilted **UniBuddy Campus Pass** and Golden Hour ambient light blobs.
   - *"Why juniors get stuck"* problem breakdown cards.
   - *"Three steps to clarity"* numbered workflow.
   - *"Everything in one app"* featuring live-component mini previews (mini mentor card, CSS vector campus map, and layered stories stack).
   - *"Built in, not bolted on"* trust and safety strip.
   - Waitlist and pass registration CTA band.

2. **`/mentors` — Mentors Directory (Protected)**
   - ADPList-inspired mentor catalog with live debounced search (by name, skill, or college).
   - Multi-filtering by skill, college, year of study, and a Rating 4+ toggle.
   - Sorting by top-rated, most-reviewed, and price (low-to-high / high-to-low).
   - Shimmer loading skeletons on initial load.
   - Responsive mentor profile drawer (desktop slide-over / mobile bottom sheet) with 3x2 proof-of-skill tiles, recent verified reviews, and booking simulation.

3. **`/map` — Campus Map (Protected)**
   - Open-source mapping powered by Leaflet and OpenStreetMap.
   - Automatic college location resolution via in-memory cached Nominatim lookup.
   - Custom SVG/CSS div-icon pins (pulsing college pin + category-coded place markers for Food, Study, Stay, and Fitness).
   - Student-vetted spots sidebar with walk time, ratings, tags, and expandable student reviews.
   - Recenter control, tile error recovery, and theme-tinted map tiles.

4. **`/stories` — Campus Stories (Protected, Dark Mode)**
   - Full immersion dark canvas (`#0B0A10`) with radial color glow.
   - Framer Motion swipe stack supporting horizontal drag physics, keyboard navigation (Left/Right arrows, 'L' to like), and touch gesture support.
   - Autoplay handling for videos (only the top card plays, muted by default with an audio toggle).
   - Instagram Reels-style action rail (like with burst animations, double-tap to like, comments bottom sheet, share sheet, and report/mute menu).

---

## ⚙️ Environment Variables & Configuration

The app requires **NO API keys** and **NO paid billing accounts**.

To configure custom map tile layers, copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

### Environment Settings:
| Variable | Default Value | Description |
| :--- | :--- | :--- |
| `VITE_MAP_TILE_URL` | `https://tile.openstreetmap.org/{z}/{x}/{y}.png` | OpenStreetMap tile endpoint URL template. |
| `VITE_MAP_ATTRIBUTION` | `&copy; OpenStreetMap contributors` | Legal license attribution markup for tile provider. |

---

## 🗺️ Open-Source Maps Architecture

### 1. Leaflet & OpenStreetMap Tiles
- The map is implemented using **Leaflet 1.9.x** and **react-leaflet v4.x** (the official React 18 release line).
- Per OpenStreetMap's license requirement, attribution remains visible at all times, styled in a sleek translucent glass pill.

### 2. Public Tile Server Guidelines
- OpenStreetMap's public tile servers (`tile.openstreetmap.org`) are operated by volunteer donations for testing and light personal usage.
- **For production deployments or heavy traffic:** Point `VITE_MAP_TILE_URL` to a commercial tile provider (such as MapTiler, Stadia Maps, Jawg) or a self-hosted tile server.

### 3. Nominatim Geocoding Policy
- To resolve unfamiliar or custom college names entered by users, the platform calls the free OpenStreetMap **Nominatim** geocoder.
- **Strict Compliance:** Requests are strictly limited to at most one request per distinct college per session, guarded by a module-level in-memory cache and a 6-second `AbortController` timeout. Nominatim is **never** invoked on keystroke or for autocomplete.

### 4. Future Upgrade Path: MapLibre GL & Vector Tiles
For teams looking to elevate map aesthetics further:
- The map layer can be seamlessly transitioned to **MapLibre GL JS** paired with free vector tiles from providers like **OpenFreeMap** (which require zero API keys, no billing, and support 60fps vector rotation and 3D terrain).

---

## ♿ Accessibility & Polish Standards

- **Semantic Hierarchy:** Single `h1` per view, landmark tags (`<header>`, `<nav>`, `<main>`, `<section>`, `<aside>`, `<footer>`).
- **prefers-reduced-motion:** Fully respects OS motion reduction preferences by disabling card spring tilts, pulsing map rings, reveal-on-scroll animations, and swipe flourishes.
- **Keyboard Navigation:** Full keyboard navigation support (Enter/Space on cards, focus trapping within modals/sheets/drawers, Escape to dismiss, Arrow keys for story navigation).
- **Mobile First:** Engineered with 44px+ minimum touch targets, zero horizontal scrolling, and fluid layouts validated at 360px, 768px, 1024px, and 1440px.
- **Zero Legacy Brand Occurrences:** Thoroughly purged of all legacy naming; 100% unified under **UniBuddy**.

---

## 🛠️ Tech Stack

- **Runtime & Bundler:** Vite 5 + React 18 (JSX)
- **Routing:** react-router-dom v6
- **Motion & Gestures:** framer-motion 11
- **Mapping:** leaflet 1.9 + react-leaflet 4
- **Icons:** lucide-react (strokeWidth: 1.75)
- **Typography:** Bricolage Grotesque (800, 700) & Inter (400, 500, 600) via Google Fonts CSS2
- **Styling:** Vanilla CSS with custom properties & modular stylesheets (no Tailwind / UI kit bloat)
