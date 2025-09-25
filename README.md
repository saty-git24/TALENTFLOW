# 🌟 TalentFlow

Welcome to **TalentFlow** — a modern, visually engaging candidate and job management platform built for efficient hiring teams!  
Easily manage job postings, track applicants with a Kanban board, and assess candidates in a slick, single-page app.

---

## 🗂️ Project Structure

```
talentflow-fresh/
├── public/                # Static assets & HTML
├── src/
│   ├── App.jsx            # Main React shell
│   ├── main.jsx           # App entrypoint & setup
│   ├── db/                # IndexedDB, seed data & utils
│   ├── features/          # Feature modules (candidates, assessments, etc.)
│   ├── pages/             # Top-level pages (Settings)
│   ├── components/        # Reusable UI elements
│   └── styles/            # CSS (Tailwind/custom)
├── index.html             # Vite HTML entry
├── vite.config.js         # Vite config
├── eslint.config.js       # Linting config
└── README.md              # Project docs
```

---

## 🚀 Tech Stack

- **Frontend:**  
  - ⚛️ React (SPA)
  - ⚡ Vite (dev server/build)
  - 🧭 React Router (routing)
  - 🧩 React DnD (drag & drop)
  - 💾 Dexie.js (IndexedDB in-browser DB)
  - 🧪 MSW (Mock Service Worker for API mocks)
  - 🎨 TailwindCSS (or custom styles)
  - 🧹 ESLint (code linting)
- **Persistence:**  
  - 🗄️ IndexedDB (via Dexie.js)
- **DevTools:**  
  - 🔥 Vite, ESLint

---

## ✨ Features

- 📋 **Kanban-Style Candidate Tracking:**  
  Drag-and-drop to move candidates through hiring stages.
- 📝 **Job & Candidate Data Management:**  
  Add/edit jobs, candidates, assessments, & responses.
- 💾 **Import/Export:**  
  Save or load your local data, reset with one click.
- 🧑‍💻 **Dynamic Assessments:**  
  Multi-choice, long/short text, and more for custom candidate forms.
- 👤 **Profile & Settings:**  
  Manage your info, notifications, appearance.
- ⚙️ **Mock API & DB:**  
  Everything works offline—perfect for demos & rapid iteration!

---

## 🏁 Getting Started

### 📦 Prerequisites

- Node.js (v16+ recommended)
- npm or yarn

### ⚡ Quickstart

1. **Clone the repository**
   ```bash
   git clone https://github.com/saty-git24/TALENTFLOW.git
   cd TALENTFLOW/talentflow-fresh
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Run locally**
   ```bash
   npm run dev
   # or
   yarn dev
   ```
   Then visit [http://localhost:3000](http://localhost:3000) 🚀

---

## 🕹 Usage

- Create/manage job postings
- Track candidates on a slick Kanban board
- Design and assign assessments
- Export/import all your app data easily
- Personalize your profile and settings

---

## 🤝 Contributing

We love contributions!  
Fork, branch, code, and PR away.  
For big changes, open an issue to chat first.

1. Fork this repo
2. Make your changes in a branch (`git checkout -b cool-feature`)
3. Commit & push
4. Open a Pull Request!

---



> **TalentFlow** — Find talent, fast and fun! 🎉
