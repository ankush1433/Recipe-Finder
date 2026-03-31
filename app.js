// ============================================================
//  Recipe Finder — app.js
//  Milestone 2: API Integration + Dynamic Display + Responsive
// ============================================================

const BASE_URL = "https://www.themealdb.com/api/json/v1/1";

// ── DOM References ──────────────────────────────────────────
const recipeGrid      = document.getElementById("recipeGrid");
const loadingSpinner  = document.getElementById("loadingSpinner");
const errorMsg        = document.getElementById("errorMsg");
const emptyState      = document.getElementById("emptyState");
const navCategories   = document.getElementById("navCategories");
const modal           = document.getElementById("modal");
const modalBackdrop   = document.getElementById("modalBackdrop");
const modalClose      = document.getElementById("modalClose");
const modalContent    = document.getElementById("modalContent");

// ── State ────────────────────────────────────────────────────
let allMeals     = [];   // current list of meals shown in grid
let activeCategory = ""; // currently selected category

// ── Utility: Show / Hide UI States ───────────────────────────
function showLoading() {
  loadingSpinner.classList.remove("hidden");
  recipeGrid.classList.add("hidden");
  emptyState.classList.add("hidden");
  errorMsg.classList.add("hidden");
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

// ── Fetch Helpers ─────────────────────────────────────────────
async function fetchJSON(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Network error: ${res.status}`);
  return res.json();
}

// ── Load Categories into Nav ──────────────────────────────────
async function loadCategories() {
  try {
    const data = await fetchJSON(`${BASE_URL}/categories.php`);
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

// ── Load Meals by Category ────────────────────────────────────
async function loadMealsByCategory(category) {
  showLoading();
  try {
    let url = category
      ? `${BASE_URL}/filter.php?c=${encodeURIComponent(category)}`
      : `${BASE_URL}/search.php?s=`;         // empty search returns all

    const data = await fetchJSON(url);
    allMeals = (data.meals || []).filter(meal => meal.strCategory !== "Beef");
    hideLoading();
    renderGrid(allMeals);
  } catch (err) {
    showError("Failed to load recipes. Please check your connection.");
  }
}

// ── Render Grid ───────────────────────────────────────────────
function renderGrid(meals) {
  recipeGrid.innerHTML = "";

  if (!meals || meals.length === 0) {
    emptyState.classList.remove("hidden");
    return;
  }

  emptyState.classList.add("hidden");

  meals.forEach(meal => {
    const card = createCard(meal);
    recipeGrid.appendChild(card);
  });
}

// ── Create Card Element ───────────────────────────────────────
function createCard(meal) {
  const card = document.createElement("div");
  card.classList.add("card");
  card.setAttribute("role", "button");
  card.setAttribute("tabindex", "0");
  card.setAttribute("aria-label", `View recipe for ${meal.strMeal}`);

  card.innerHTML = `
    <div class="card-img-wrap">
      <img src="${meal.strMealThumb}" alt="${meal.strMeal}" loading="lazy" />
      ${meal.strArea ? `<span class="card-area-badge">${meal.strArea}</span>` : ""}
    </div>
    <div class="card-body">
      <div class="card-title">${meal.strMeal}</div>
      ${meal.strCategory ? `<span class="card-category">${meal.strCategory}</span>` : ""}
      <div class="card-footer">
        <button class="btn-details" data-id="${meal.idMeal}">View Recipe →</button>
      </div>
    </div>
  `;

  // Open modal on card or button click
  card.addEventListener("click", () => openModal(meal.idMeal));
  card.addEventListener("keydown", e => { if (e.key === "Enter") openModal(meal.idMeal); });

  return card;
}

// ── Category Click ────────────────────────────────────────────
function onCategoryClick(category, clickedBtn) {
  // Update active state on buttons
  document.querySelectorAll(".cat-btn").forEach(btn => btn.classList.remove("active"));
  clickedBtn.classList.add("active");

  activeCategory = category;
  loadMealsByCategory(category);
}

// ── Modal: Open and Fetch Full Details ───────────────────────
async function openModal(mealId) {
  modal.classList.remove("hidden");
  document.body.style.overflow = "hidden";
  modalContent.innerHTML = `<div class="spinner-wrap" style="padding:60px 0"><div class="spinner"></div></div>`;

  try {
    const data = await fetchJSON(`${BASE_URL}/lookup.php?i=${mealId}`);
    const meal = data.meals[0];
    renderModalContent(meal);
  } catch (err) {
    modalContent.innerHTML = `<div class="modal-body"><p>Failed to load recipe details.</p></div>`;
  }
}

// ── Render Modal Content ──────────────────────────────────────
function renderModalContent(meal) {
  // Collect ingredients using Array HOF (map + filter)
  const ingredients = Array.from({ length: 20 }, (_, i) => i + 1)
    .map(i => ({
      ingredient: meal[`strIngredient${i}`],
      measure: meal[`strMeasure${i}`]
    }))
    .filter(item => item.ingredient && item.ingredient.trim() !== "");

  const ingredientChips = ingredients
    .map(item => `<span class="ingredient-chip">${item.measure ? item.measure.trim() + " " : ""}${item.ingredient}</span>`)
    .join("");

  modalContent.innerHTML = `
    <img class="modal-img" src="${meal.strMealThumb}" alt="${meal.strMeal}" />
    <div class="modal-body">
      <h2 class="modal-title">${meal.strMeal}</h2>
      <div class="modal-meta">
        ${meal.strCategory ? `<span class="modal-tag">🍽 ${meal.strCategory}</span>` : ""}
        ${meal.strArea    ? `<span class="modal-tag">🌍 ${meal.strArea}</span>`    : ""}
      </div>

      <div class="modal-section-title">Ingredients</div>
      <div class="modal-ingredients">${ingredientChips}</div>

      <div class="modal-section-title">Instructions</div>
      <p class="modal-instructions">${meal.strInstructions || "No instructions available."}</p>
    </div>
  `;
}

// ── Modal: Close ──────────────────────────────────────────────
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
  await loadMealsByCategory("");   // load all meals on start
}

init();