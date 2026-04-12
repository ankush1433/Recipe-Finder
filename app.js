// ============================================================
//  Recipe Finder — app.js
//  Milestones 2 + 3 + 4
//  Features: API fetch, search (debounced), filter by category,
//  sort A-Z / Z-A, favourites (localStorage), dark/light mode
//  (localStorage), pagination, modal with full details
// ============================================================

const BASE_URL = "https://www.themealdb.com/api/json/v1/1";
const PAGE_SIZE = 12;

// ── DOM References ────────────────────────────────────────────
const recipeGrid     = document.getElementById("recipeGrid");
const loadingSpinner = document.getElementById("loadingSpinner");
const errorMsg       = document.getElementById("errorMsg");
const emptyState     = document.getElementById("emptyState");
const navCategories  = document.getElementById("navCategories");
const searchInput    = document.getElementById("searchInput");
const searchClear    = document.getElementById("searchClear");
const sortSelect     = document.getElementById("sortSelect");
const favToggle      = document.getElementById("favToggle");
const themeToggle    = document.getElementById("themeToggle");
const modal          = document.getElementById("modal");
const modalBackdrop  = document.getElementById("modalBackdrop");
const modalClose     = document.getElementById("modalClose");
const modalContent   = document.getElementById("modalContent");
const paginationEl   = document.getElementById("pagination");
const resultsInfo    = document.getElementById("resultsInfo");

// ── State ─────────────────────────────────────────────────────
let allMeals       = [];   // raw meals from API
let filteredMeals  = [];   // after search + sort
let currentPage    = 1;
let activeCategory = "";
let searchQuery    = "";
let sortOrder      = "";
let showFavsOnly   = false;
let favourites     = JSON.parse(localStorage.getItem("rf_favourites") || "[]");

// ── Theme Init ────────────────────────────────────────────────
(function initTheme() {
  const saved = localStorage.getItem("rf_theme") || "light";
  document.documentElement.setAttribute("data-theme", saved);
  themeToggle.textContent = saved === "dark" ? "☀️" : "🌙";
})();

// ── Theme Toggle ──────────────────────────────────────────────
themeToggle.addEventListener("click", () => {
  const current = document.documentElement.getAttribute("data-theme");
  const next = current === "dark" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", next);
  localStorage.setItem("rf_theme", next);
  themeToggle.textContent = next === "dark" ? "☀️" : "🌙";
});

// ── Favourites Helpers ────────────────────────────────────────
function isFav(id) {
  return favourites.includes(String(id));
}

function toggleFav(id) {
  id = String(id);
  if (isFav(id)) {
    favourites = favourites.filter(f => f !== id);
  } else {
    favourites.push(id);
  }
  localStorage.setItem("rf_favourites", JSON.stringify(favourites));
}

// ── UI State Helpers ──────────────────────────────────────────
function showLoading() {
  loadingSpinner.classList.remove("hidden");
  recipeGrid.classList.add("hidden");
  emptyState.classList.add("hidden");
  errorMsg.classList.add("hidden");
  paginationEl.classList.add("hidden");
  resultsInfo.classList.add("hidden");
}

function hideLoading() {
  loadingSpinner.classList.add("hidden");
  recipeGrid.classList.remove("hidden");
}

function showError(msg) {
  loadingSpinner.classList.add("hidden");
  errorMsg.textContent = "⚠️ " + msg;
  errorMsg.classList.remove("hidden");
}

// ── Fetch ─────────────────────────────────────────────────────
async function fetchJSON(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Network error: ${res.status}`);
  return res.json();
}

// ── Load Categories ───────────────────────────────────────────
async function loadCategories() {
  try {
    const data = await fetchJSON(`${BASE_URL}/categories.php`);

    // Array HOF: filter out Beef
    const categories = data.categories.filter(cat => cat.strCategory !== "Beef");

    categories.forEach(cat => {
      const btn = document.createElement("button");
      btn.classList.add("cat-btn");
      btn.textContent = cat.strCategory;
      btn.dataset.cat = cat.strCategory;
      btn.addEventListener("click", () => onCategoryClick(cat.strCategory, btn));
      navCategories.appendChild(btn);
    });
  } catch (err) {
    console.error("Failed to load categories:", err);
  }
}

// ── Load Meals ────────────────────────────────────────────────
async function loadMealsByCategory(category) {
  showLoading();
  try {
    const url = category
      ? `${BASE_URL}/filter.php?c=${encodeURIComponent(category)}`
      : `${BASE_URL}/search.php?s=`;

    const data = await fetchJSON(url);

    // Array HOF: filter out any beef meals just in case
    allMeals = (data.meals || []).filter(meal =>
      meal.strCategory !== "Beef"
    );

    applyFiltersAndRender();
  } catch (err) {
    showError("Failed to load recipes. Please check your connection.");
  }
}

// ── Core: Apply Search + Sort + Favs, then Render ─────────────
function applyFiltersAndRender() {
  hideLoading();

  let result = allMeals;

  // 1. Favourites filter (Array HOF: filter)
  if (showFavsOnly) {
    result = result.filter(meal => isFav(meal.idMeal));
  }

  // 2. Search filter (Array HOF: filter)
  if (searchQuery.trim() !== "") {
    const q = searchQuery.toLowerCase();
    result = result.filter(meal =>
      meal.strMeal.toLowerCase().includes(q)
    );
  }

  // 3. Sort (Array HOF: sort)
  if (sortOrder === "az") {
    result = [...result].sort((a, b) => a.strMeal.localeCompare(b.strMeal));
  } else if (sortOrder === "za") {
    result = [...result].sort((a, b) => b.strMeal.localeCompare(a.strMeal));
  }

  filteredMeals = result;
  currentPage = 1;
  renderPage();
}

// ── Render Page (Pagination) ──────────────────────────────────
function renderPage() {
  recipeGrid.innerHTML = "";

  if (filteredMeals.length === 0) {
    emptyState.classList.remove("hidden");
    paginationEl.classList.add("hidden");
    resultsInfo.classList.add("hidden");
    return;
  }

  emptyState.classList.add("hidden");

  const totalPages = Math.ceil(filteredMeals.length / PAGE_SIZE);
  const start = (currentPage - 1) * PAGE_SIZE;
  const end = start + PAGE_SIZE;

  // Array HOF: slice + forEach
  const pageMeals = filteredMeals.slice(start, end);
  pageMeals.forEach((meal, i) => {
    const card = createCard(meal);
    card.style.animationDelay = `${i * 0.04}s`;
    recipeGrid.appendChild(card);
  });

  // Results info
  resultsInfo.textContent = `Showing ${start + 1}–${Math.min(end, filteredMeals.length)} of ${filteredMeals.length} recipes`;
  resultsInfo.classList.remove("hidden");

  // Pagination
  renderPagination(totalPages);
}

// ── Render Pagination Controls ────────────────────────────────
function renderPagination(totalPages) {
  if (totalPages <= 1) {
    paginationEl.classList.add("hidden");
    return;
  }

  paginationEl.classList.remove("hidden");
  paginationEl.innerHTML = "";

  const prev = makePageBtn("← Prev", currentPage === 1, () => {
    currentPage--;
    renderPage();
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
  paginationEl.appendChild(prev);

  // Array HOF: Array.from + map to build page number buttons
  Array.from({ length: totalPages }, (_, i) => i + 1).forEach(n => {
    const btn = makePageBtn(String(n), false, () => {
      currentPage = n;
      renderPage();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
    if (n === currentPage) btn.classList.add("active");
    paginationEl.appendChild(btn);
  });

  const next = makePageBtn("Next →", currentPage === totalPages, () => {
    currentPage++;
    renderPage();
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
  paginationEl.appendChild(next);
}

function makePageBtn(label, disabled, onClick) {
  const btn = document.createElement("button");
  btn.classList.add("page-btn");
  btn.textContent = label;
  btn.disabled = disabled;
  btn.addEventListener("click", onClick);
  return btn;
}

// ── Create Card ───────────────────────────────────────────────
function createCard(meal) {
  const card = document.createElement("div");
  card.classList.add("card");
  card.setAttribute("role", "button");
  card.setAttribute("tabindex", "0");
  card.setAttribute("aria-label", `View recipe for ${meal.strMeal}`);

  const faved = isFav(meal.idMeal);

  card.innerHTML = `
    <div class="card-img-wrap">
      <img src="${meal.strMealThumb}" alt="${meal.strMeal}" loading="lazy" />
      ${meal.strArea ? `<span class="card-area-badge">${meal.strArea}</span>` : ""}
      <button class="card-fav-btn ${faved ? "faved" : ""}" data-id="${meal.idMeal}" title="${faved ? "Remove from favourites" : "Add to favourites"}">
        ${faved ? "❤️" : "🤍"}
      </button>
    </div>
    <div class="card-body">
      <div class="card-title">${meal.strMeal}</div>
      ${meal.strCategory ? `<span class="card-category">${meal.strCategory}</span>` : ""}
      <div class="card-footer">
        <button class="btn-details">View Recipe →</button>
      </div>
    </div>
  `;

  // Fav button — stop propagation so card click doesn't also open modal
  const favBtn = card.querySelector(".card-fav-btn");
  favBtn.addEventListener("click", e => {
    e.stopPropagation();
    toggleFav(meal.idMeal);
    const nowFaved = isFav(meal.idMeal);
    favBtn.textContent = nowFaved ? "❤️" : "🤍";
    favBtn.classList.toggle("faved", nowFaved);
    favBtn.title = nowFaved ? "Remove from favourites" : "Add to favourites";
    // If in fav-only mode, re-render so removed item disappears
    if (showFavsOnly) applyFiltersAndRender();
  });

  card.addEventListener("click", () => openModal(meal.idMeal));
  card.addEventListener("keydown", e => { if (e.key === "Enter") openModal(meal.idMeal); });

  return card;
}

// ── Category Click ────────────────────────────────────────────
function onCategoryClick(category, clickedBtn) {
  document.querySelectorAll(".cat-btn").forEach(btn => btn.classList.remove("active"));
  clickedBtn.classList.add("active");
  activeCategory = category;
  // Reset search + sort when switching category
  searchInput.value = "";
  searchQuery = "";
  sortSelect.value = "";
  sortOrder = "";
  searchClear.classList.add("hidden");
  loadMealsByCategory(category);
}

// ── Search — Debounced ─────────────────────────────────────────
let debounceTimer;
searchInput.addEventListener("input", () => {
  searchQuery = searchInput.value;
  searchClear.classList.toggle("hidden", searchQuery === "");
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    applyFiltersAndRender();
  }, 350);
});

searchClear.addEventListener("click", () => {
  searchInput.value = "";
  searchQuery = "";
  searchClear.classList.add("hidden");
  applyFiltersAndRender();
});

// ── Sort ──────────────────────────────────────────────────────
sortSelect.addEventListener("change", () => {
  sortOrder = sortSelect.value;
  applyFiltersAndRender();
});

// ── Favourites Toggle ─────────────────────────────────────────
favToggle.addEventListener("click", () => {
  showFavsOnly = !showFavsOnly;
  favToggle.classList.toggle("active", showFavsOnly);
  favToggle.title = showFavsOnly ? "Show all recipes" : "Show favourites";
  applyFiltersAndRender();
});

// ── Modal ─────────────────────────────────────────────────────
async function openModal(mealId) {
  modal.classList.remove("hidden");
  document.body.style.overflow = "hidden";
  modalContent.innerHTML = `<div class="spinner-wrap" style="padding:60px 0"><div class="spinner"></div></div>`;

  try {
    const data = await fetchJSON(`${BASE_URL}/lookup.php?i=${mealId}`);
    renderModalContent(data.meals[0]);
  } catch (err) {
    modalContent.innerHTML = `<div class="modal-body"><p>Failed to load recipe details.</p></div>`;
  }
}

function renderModalContent(meal) {
  // Array HOF: map + filter to collect ingredients
  const ingredients = Array.from({ length: 20 }, (_, i) => i + 1)
    .map(i => ({
      ingredient: meal[`strIngredient${i}`],
      measure: meal[`strMeasure${i}`]
    }))
    .filter(item => item.ingredient && item.ingredient.trim() !== "");

  const ingredientChips = ingredients
    .map(item => `<span class="ingredient-chip">${item.measure ? item.measure.trim() + " " : ""}${item.ingredient}</span>`)
    .join("");

  const faved = isFav(meal.idMeal);

  modalContent.innerHTML = `
    <img class="modal-img" src="${meal.strMealThumb}" alt="${meal.strMeal}" />
    <div class="modal-body">
      <h2 class="modal-title">${meal.strMeal}</h2>
      <div class="modal-meta">
        ${meal.strCategory ? `<span class="modal-tag">🍽 ${meal.strCategory}</span>` : ""}
        ${meal.strArea     ? `<span class="modal-tag">🌍 ${meal.strArea}</span>`     : ""}
        <button class="modal-fav-btn ${faved ? "faved" : ""}" data-id="${meal.idMeal}">
          ${faved ? "❤️ Saved" : "🤍 Save Recipe"}
        </button>
      </div>

      <div class="modal-section-title">Ingredients</div>
      <div class="modal-ingredients">${ingredientChips}</div>

      <div class="modal-section-title">Instructions</div>
      <p class="modal-instructions">${meal.strInstructions || "No instructions available."}</p>
    </div>
  `;

  // Fav button inside modal
  const mfBtn = modalContent.querySelector(".modal-fav-btn");
  mfBtn.addEventListener("click", () => {
    toggleFav(meal.idMeal);
    const nowFaved = isFav(meal.idMeal);
    mfBtn.textContent = nowFaved ? "❤️ Saved" : "🤍 Save Recipe";
    mfBtn.classList.toggle("faved", nowFaved);
    // Sync card in background
    const cardFavBtn = recipeGrid.querySelector(`.card-fav-btn[data-id="${meal.idMeal}"]`);
    if (cardFavBtn) {
      cardFavBtn.textContent = nowFaved ? "❤️" : "🤍";
      cardFavBtn.classList.toggle("faved", nowFaved);
    }
    if (showFavsOnly) applyFiltersAndRender();
  });
}

function closeModal() {
  modal.classList.add("hidden");
  document.body.style.overflow = "";
}

modalClose.addEventListener("click", closeModal);
modalBackdrop.addEventListener("click", closeModal);
document.addEventListener("keydown", e => { if (e.key === "Escape") closeModal(); });

// ── Init ──────────────────────────────────────────────────────
async function init() {
  await loadCategories();
  await loadMealsByCategory("");
}

init();