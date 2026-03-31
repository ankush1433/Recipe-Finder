#  Recipe Finder

A responsive web application that lets users discover, search, and explore recipes from around the world — powered by TheMealDB public API.

---

##  Project Purpose

Recipe Finder helps users browse a vast collection of recipes by cuisine, category, or ingredient. Users can search for specific dishes, filter by meal type or region, sort results alphabetically, and save their favourite recipes for quick access.

---

##  API Used

**TheMealDB** — [https://www.themealdb.com/api/json/v1/1/](https://www.themealdb.com/api/json/v1/1/)

- Free to use, no API key required
- Endpoints used:
  - `search.php?s={name}` — Search meals by name
  - `filter.php?c={category}` — Filter by category (e.g., Chicken, Dessert)
  - `filter.php?a={area}` — Filter by cuisine/area (e.g., Indian, Italian)
  - `categories.php` — Get all meal categories
  - `lookup.php?i={id}` — Get full recipe details by ID

---

##  Features

### Core Features
-  **Search** — Search recipes by name using Array HOFs (`filter`, `find`)
-  **Filter** — Filter results by meal category and cuisine area using `Array.filter()`
-  **Sort** — Sort recipes alphabetically (A–Z / Z–A) using `Array.sort()`
-  **Favourites** — Like/save recipes with Local Storage persistence
-  **Dark / Light Mode** — Theme toggle with preference saved to Local Storage
-  **Responsive Design** — Fully functional on mobile, tablet, and desktop

### Bonus Features (Planned)
-  **Debouncing** — Debounced search bar to reduce unnecessary API calls
-  **Pagination** — Paginated results for large data sets
-  **Loading Indicators** — Spinner shown while fetching data

---

##  Technologies Used

| Technology | Purpose |
|---|---|
| HTML5 | Page structure and semantics |
| CSS3 | Styling, layout, and responsive design |
| JavaScript (ES6+) | Logic, DOM manipulation, API calls |
| Fetch API | Fetching data from TheMealDB |
| Array HOFs | `filter`, `map`, `sort`, `find`, `reduce` for data operations |
| Local Storage | Saving favourites and theme preference |

> No frameworks or libraries are used — pure Vanilla JS.

---

##  Project Structure

```
recipe-finder/
├── index.html        # Main HTML file
├── style.css         # Stylesheet (responsive + dark mode)
├── app.js            # Main JavaScript logic
└── README.md         # Project documentation
```

---

##  How to Run the Project

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/recipe-finder.git
   ```

2. **Navigate into the project folder:**
   ```bash
   cd recipe-finder
   ```

3. **Open `index.html` in your browser:**
   - Simply double-click `index.html`, OR
   - Use a live server extension (e.g., VS Code Live Server)

> No installation or build step required — it's plain HTML, CSS, and JS!

---


##  Deployment

The live version will be hosted on **https://ankush1433.github.io/Recipe-Finder/** (link to be added after deployment).

---

##  Author

**[Ankush Verma]**  
[GitHub Profile](https://github.com/ankush1433)