# ProgressOS

A fast, beautiful, local-first progress tracking and learning operating system built with **Next.js 16**, **Tailwind CSS v4**, and **Dexie.js (IndexedDB)**. Inspired by the sleek, minimalist aesthetics of Linear, Raycast, and Things 3.

---

## ✨ Features

- **🚀 100% Local-First Persistence**: Powered by Dexie.js (IndexedDB) with zero external database dependencies or required logins. Your data stays entirely in your browser.
- **🗺️ Multi-Roadmap Management**:
  - Interactive roadmap view with expandable weeks and day cards.
  - Dense table/list view with quick completion toggles.
  - Per-day task checklists, notes with auto-save, and time tracking.
  - Per-day repository link support with automatic display of GitHub links when present.
  - Complete pre-seeded 13-week, 90-day AI Engineering roadmap.
- **🎯 Today's Focus ("My Day")**: Daily focus backlog categorized by roadmap, task priorities (Urgent, High, Medium, Low), and quick completion triggers.
- **📖 Daily Learning Journal**: Log reflections (What I learned, What I built, Problems encountered, Key takeaways, and commit links) with streak tracking.
- **📊 Activity & Analytics**: Visualized via Recharts — 14-day study hours breakdown, 30-day consistency heatmap, and category metrics.
- **⚡ Keyboard Shortcuts & Command Palette**:
  - `Cmd+K` / `Ctrl+K`: Global search across roadmaps, days, tasks, and journals.
  - `C`: Quick-create task modal from anywhere.
- **📦 Portable Import / Export**:
  - Full JSON backup and restore with Zod schema validation.
  - Smart conflict resolution preserving completed tasks and user notes.
- **🎨 Modern Aesthetic**:
  - Custom brand logo and responsive design (desktop & mobile).
  - Dark mode: Obsidian black (`#08080a`) with charcoal grey (`#111114`) and crimson red (`#e11d48`) accents.
  - Light mode: Warm off-white (`#f7f6f3`) theme.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router, Webpack)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Database**: [Dexie.js](https://dexie.org/) (IndexedDB)
- **Validation**: [Zod](https://zod.dev/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Charts**: [Recharts](https://recharts.org/)
- **Effects**: [canvas-confetti](https://www.npmjs.com/package/canvas-confetti)

---

## 🚀 Getting Started

### 1. Clone & Install

```bash
git clone https://github.com/Aniketh003/progress-os.git
cd progress-os
npm install
```

### 2. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Build for Production

```bash
npm run build
npm run start
```

---

## 📄 License

MIT License. Feel free to use and customize for your own learning journeys!
