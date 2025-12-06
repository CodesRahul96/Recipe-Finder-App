const BASE_URL = "https://www.themealdb.com/api/json/v1/1";

// Simple in-memory cache
const cache = new Map();

const fetchWithCache = async (url) => {
  if (cache.has(url)) {
    return cache.get(url);
  }

  try {
    const response = await fetch(url);
    const data = await response.json();
    cache.set(url, data); // Simple in-memory cache
    return data;
  } catch (error) {
    console.error(`Error fetching ${url}:`, error);
    throw error;
  }
};

export const searchRecipes = async (query) => {
  try {
    const data = await fetchWithCache(`${BASE_URL}/search.php?s=${query}`);
    return data.meals || [];
  } catch {
    return [];
  }
};

export const getRecipeById = async (id) => {
  try {
    const data = await fetchWithCache(`${BASE_URL}/lookup.php?i=${id}`);
    return data.meals ? data.meals[0] : null;
  } catch {
    return null;
  }
};

export const getCategories = async () => {
  try {
    const data = await fetchWithCache(`${BASE_URL}/list.php?c=list`);
    return data.meals || [];
  } catch {
    return [];
  }
};

export const filterByCategory = async (category) => {
  try {
    const data = await fetchWithCache(`${BASE_URL}/filter.php?c=${category}`);
    return data.meals || [];
  } catch {
    return [];
  }
};

export const getIndianRecipes = async () => {
  try {
    const data = await fetchWithCache(`${BASE_URL}/filter.php?a=Indian`);
    return data.meals || [];
  } catch {
    return [];
  }
};

export const getVegetarianIndian = async () => {
  const keywords = ["Paneer", "Dal", "Aloo", "Vegetable", "Spinach", "Chole"];
  try {
    const promises = keywords.map((k) => searchRecipes(k));
    const results = await Promise.all(promises);

    // Flatten and deduplicate by idMeal
    const allMeals = results.flat();
    const uniqueMeals = Array.from(
      new Map(allMeals.map((m) => [m.idMeal, m])).values()
    );

    // Filter to ensure they are Indian (double check)
    return uniqueMeals.filter((m) => m.strArea === "Indian");
  } catch {
    return [];
  }
};

export const getSpicyIndian = async () => {
  const keywords = ["Vindaloo", "Madras", "Masala", "Curry", "Chilli"];
  try {
    const promises = keywords.map((k) => searchRecipes(k));
    const results = await Promise.all(promises);

    const allMeals = results.flat();
    const uniqueMeals = Array.from(
      new Map(allMeals.map((m) => [m.idMeal, m])).values()
    );

    return uniqueMeals.filter((m) => m.strArea === "Indian");
  } catch {
    return [];
  }
};
