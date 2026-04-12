# 🍽️ Recipe Finder

A responsive web application to search, filter, sort, and save recipes from around the world — powered by TheMealDB public API and built with pure Vanilla JavaScript.

---

## 🌐 Live Demo

> [Deployed link here — add after GitHub Pages deployment]

---

## 📌 Purpose

Recipe Finder lets users discover thousands of real recipes by cuisine and category. Users can search by name, filter by meal type, sort alphabetically, and save favourites — all with a clean UI that works on any device.

---

## 🌐 API Used

**TheMealDB** — `https://www.themealdb.com/api/json/v1/1/`

Free, no API key required. Endpoints used: `search.php`, `filter.php`, `categories.php`, `lookup.php`.

---

## ✨ Features

| Feature | Implementation |
|---|---|
| Search by name | `Array.filter()` with debounce (350ms) |
| Filter by category | API `filter.php` + `Array.filter()` |
| Sort A–Z / Z–A | `Array.sort()` with `localeCompare` |
| Favourites | `Array.filter()` + `localStorage` |
| Dark / Light mode | CSS variables + `localStorage` |
| Pagination | `Array.slice()` — 12 recipes per page |
| Loading spinner | Shown on every API call |
| Error handling | Network errors caught and displayed |
| Responsive design | Mobile, tablet, desktop layouts |
| Recipe modal | Full ingredients + instructions on click |

> All searching, filtering, and sorting use **Array Higher-Order Functions** (`filter`, `map`, `sort`, `find`, `reduce`) — no `for` or `while` loops used for data operations.

---

## 🛠️ Technologies

HTML5 · CSS3 · Vanilla JavaScript (ES6+) · Fetch API · LocalStorage

No frameworks or libraries — pure Vanilla JS.

---

## 📁 Project Structure

```
recipe-finder/
├── index.html    — Page structure
├── style.css     — Styling, dark mode, responsive layout
├── app.js        — All logic: API, HOFs, localStorage, UI
└── README.md     — Documentation
```

---

## 🚀 How to Run

1. Clone the repo: `git clone https://github.com/ankush1433/recipe-finder.git`
2. Open `index.html` in a browser (or use VS Code Live Server)

No installation needed.

---

## 🗓️ Milestones

| Milestone | Description | Deadline |
|---|---|---|
| 1 | Project setup, README, idea planning | 23rd March ✅ |
| 2 | API integration, dynamic display, responsiveness | 1st April ✅ |
| 3 | Search, filter, sort, favourites, dark mode, pagination | 8th April ✅ |
| 4 | Final cleanup, deployment, documentation | 10th April ✅ |

---

## 👤 Author

**[Your Name]** — [GitHub](https://github.com/ankush1433)