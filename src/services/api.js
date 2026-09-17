import { curatedIndianRecipes } from "../data/curatedIndianRecipes";

const BASE_URL = "https://www.themealdb.com/api/json/v1/1";

// In-memory cache for fast responses
const cache = new Map();

const fetchWithCache = async (url) => {
  if (cache.has(url)) {
    return cache.get(url);
  }

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    cache.set(url, data);
    return data;
  } catch (error) {
    console.error(`Error fetching ${url}:`, error);
    return null;
  }
};

export const POPULAR_CUISINES = [
  { id: "All", name: "All Cuisines", flag: "🌍" },
  { id: "India", name: "Indian", flag: "🇮🇳" },
  { id: "Italian", name: "Italian", flag: "🇮🇹" },
  { id: "Mexican", name: "Mexican", flag: "🇲🇽" },
  { id: "Chinese", name: "Chinese", flag: "🇨🇳" },
  { id: "Thai", name: "Thai", flag: "🇹🇭" },
  { id: "American", name: "American", flag: "🇺🇸" },
  { id: "British", name: "British", flag: "🇬🇧" },
  { id: "Japanese", name: "Japanese", flag: "🇯🇵" },
  { id: "Spanish", name: "Spanish", flag: "🇪🇸" },
  { id: "French", name: "French", flag: "🇫🇷" }
];

export const POPULAR_CATEGORIES = [
  { id: "All", name: "All Dishes", icon: "🍲" },
  { id: "Vegetarian", name: "Vegetarian", icon: "🥗" },
  { id: "Chicken", name: "Chicken", icon: "🍗" },
  { id: "Dessert", name: "Desserts", icon: "🍰" },
  { id: "Seafood", name: "Seafood", icon: "🍤" },
  { id: "Pasta", name: "Pasta", icon: "🍝" },
  { id: "Breakfast", name: "Breakfast", icon: "🍳" },
  { id: "Lamb", name: "Lamb & Meat", icon: "🥩" },
  { id: "Starter", name: "Starters & Snacks", icon: "🥟" }
];

export const getIndianRecipes = async () => {
  try {
    const mealMap = new Map();
    // 1. Add curated Indian recipes first
    curatedIndianRecipes.forEach(m => mealMap.set(m.idMeal, m));

    // 2. Query TheMealDB India area endpoint
    const data = await fetchWithCache(`${BASE_URL}/filter.php?a=India`);
    if (data && data.meals) {
      data.meals.forEach(m => {
        if (!mealMap.has(m.idMeal)) {
          mealMap.set(m.idMeal, { ...m, strArea: "India" });
        }
      });
    }

    return Array.from(mealMap.values());
  } catch (error) {
    console.error("Error loading Indian recipes:", error);
    return curatedIndianRecipes;
  }
};

export const getAllGlobalRecipes = async () => {
  try {
    const mealMap = new Map();
    
    // Add curated Indian recipes
    curatedIndianRecipes.forEach(m => mealMap.set(m.idMeal, m));

    // Fetch prominent categories to build rich global feed
    const categoryKeys = ["Chicken", "Vegetarian", "Dessert", "Pasta", "Seafood"];
    const promises = categoryKeys.map(c => fetchWithCache(`${BASE_URL}/filter.php?c=${c}`));
    const results = await Promise.all(promises);

    results.forEach((data, index) => {
      if (data && data.meals) {
        data.meals.forEach(m => {
          if (!mealMap.has(m.idMeal)) {
            mealMap.set(m.idMeal, { ...m, strCategory: categoryKeys[index] });
          }
        });
      }
    });

    return Array.from(mealMap.values());
  } catch (error) {
    console.error("Error loading global recipes:", error);
    return await getIndianRecipes();
  }
};

export const filterByCuisine = async (cuisineId) => {
  if (cuisineId === "All") {
    return await getAllGlobalRecipes();
  }
  if (cuisineId === "India") {
    return await getIndianRecipes();
  }

  try {
    const data = await fetchWithCache(`${BASE_URL}/filter.php?a=${encodeURIComponent(cuisineId)}`);
    return data && data.meals ? data.meals.map(m => ({ ...m, strArea: cuisineId })) : [];
  } catch {
    return [];
  }
};

export const filterByCategory = async (categoryId) => {
  if (categoryId === "All") {
    return await getAllGlobalRecipes();
  }

  const mealMap = new Map();

  // If curated matches this category
  curatedIndianRecipes.forEach(m => {
    if (m.strCategory && m.strCategory.toLowerCase() === categoryId.toLowerCase()) {
      mealMap.set(m.idMeal, m);
    }
  });

  try {
    const data = await fetchWithCache(`${BASE_URL}/filter.php?c=${encodeURIComponent(categoryId)}`);
    if (data && data.meals) {
      data.meals.forEach(m => {
        if (!mealMap.has(m.idMeal)) {
          mealMap.set(m.idMeal, { ...m, strCategory: categoryId });
        }
      });
    }
    return Array.from(mealMap.values());
  } catch {
    return Array.from(mealMap.values());
  }
};

export const searchRecipes = async (query) => {
  if (!query || !query.trim()) {
    return await getAllGlobalRecipes();
  }

  const q = query.trim().toLowerCase();
  const mealMap = new Map();

  // Check curated list
  curatedIndianRecipes.forEach(m => {
    if (
      m.strMeal.toLowerCase().includes(q) ||
      (m.strInstructions && m.strInstructions.toLowerCase().includes(q))
    ) {
      mealMap.set(m.idMeal, m);
    }
  });

  try {
    const data = await fetchWithCache(`${BASE_URL}/search.php?s=${encodeURIComponent(q)}`);
    if (data && data.meals) {
      data.meals.forEach(m => mealMap.set(m.idMeal, m));
    }
    return Array.from(mealMap.values());
  } catch {
    return Array.from(mealMap.values());
  }
};

export const getRecipeById = async (id) => {
  const curated = curatedIndianRecipes.find(m => m.idMeal === id);
  if (curated) return curated;

  try {
    const data = await fetchWithCache(`${BASE_URL}/lookup.php?i=${encodeURIComponent(id)}`);
    return data && data.meals ? data.meals[0] : null;
  } catch {
    return null;
  }
};

export const filterByIngredient = async (ingredient) => {
  if (!ingredient || !ingredient.trim()) {
    return await getAllGlobalRecipes();
  }

  const ing = ingredient.trim().toLowerCase();
  const mealMap = new Map();

  // Check curated
  curatedIndianRecipes.forEach(m => {
    for (let i = 1; i <= 20; i++) {
      const item = m[`strIngredient${i}`];
      if (item && item.toLowerCase().includes(ing)) {
        mealMap.set(m.idMeal, m);
        break;
      }
    }
  });

  try {
    const data = await fetchWithCache(`${BASE_URL}/filter.php?i=${encodeURIComponent(ing)}`);
    if (data && data.meals) {
      data.meals.forEach(m => mealMap.set(m.idMeal, m));
    }
  } catch (err) {
    console.warn("Ingredient filter error:", err);
  }

  if (mealMap.size === 0) {
    return await searchRecipes(ingredient);
  }

  return Array.from(mealMap.values());
};

export const getRandomRecipe = async () => {
  try {
    const response = await fetch(`${BASE_URL}/random.php?_t=${Date.now()}`);
    const data = await response.json();
    return data && data.meals ? data.meals[0] : curatedIndianRecipes[0];
  } catch {
    const idx = Math.floor(Math.random() * curatedIndianRecipes.length);
    return curatedIndianRecipes[idx];
  }
};

export const getRandomIndianRecipe = async () => {
  const all = await getIndianRecipes();
  if (all && all.length > 0) {
    const randomIndex = Math.floor(Math.random() * all.length);
    const chosen = all[randomIndex];
    if (!chosen.strInstructions) {
      return await getRecipeById(chosen.idMeal);
    }
    return chosen;
  }
  return curatedIndianRecipes[0];
};

export const getVegetarianIndian = async () => {
  const all = await getIndianRecipes();
  return all.filter(m => {
    const cat = (m.strCategory || "").toLowerCase();
    const name = (m.strMeal || "").toLowerCase();
    return cat === "vegetarian" || cat === "side" || cat === "dessert" || name.includes("paneer") || name.includes("dal") || name.includes("chana") || name.includes("aloo") || name.includes("spinach") || name.includes("modak");
  });
};

export const getSpicyIndian = async () => {
  const all = await getIndianRecipes();
  return all.filter(m => {
    const name = (m.strMeal || "").toLowerCase();
    return name.includes("masala") || name.includes("curry") || name.includes("tandoori") || name.includes("biryani") || name.includes("handi") || name.includes("rogan") || name.includes("vindaloo");
  });
};

export const getDessertIndian = async () => {
  const all = await getIndianRecipes();
  return all.filter(m => {
    const cat = (m.strCategory || "").toLowerCase();
    const name = (m.strMeal || "").toLowerCase();
    return cat === "dessert" || name.includes("jamun") || name.includes("kheer") || name.includes("modak") || name.includes("halwa");
  });
};
