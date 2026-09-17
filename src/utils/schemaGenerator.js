/**
 * Generates Schema.org Recipe JSON-LD metadata for a recipe.
 * Implements the standard Recipe Schema.org structure documented in Allrecipes analysis.
 */
export const generateRecipeSchema = (recipe, extraData = {}) => {
  if (!recipe) return null;

  // Extract ingredients
  const recipeIngredient = [];
  for (let i = 1; i <= 20; i++) {
    const ingredient = recipe[`strIngredient${i}`];
    const measure = recipe[`strMeasure${i}`];
    if (ingredient && ingredient.trim()) {
      const fullText = measure && measure.trim() ? `${measure.trim()} ${ingredient.trim()}` : ingredient.trim();
      recipeIngredient.push(fullText);
    }
  }

  // Parse instructions into HowToStep array
  const rawInstructions = recipe.strInstructions || '';
  const instructionSteps = rawInstructions
    .split(/\r?\n+/)
    .map((step) => step.trim())
    .filter((step) => step.length > 0 && !step.match(/^(step\s*\d+:?)$/i))
    .map((stepText, index) => ({
      '@type': 'HowToStep',
      name: `Step ${index + 1}`,
      text: stepText,
      position: index + 1
    }));

  const prepTime = extraData.prepTime || 'PT15M';
  const cookTime = extraData.cookTime || 'PT30M';
  const totalTime = extraData.totalTime || (extraData.time ? `PT${parseInt(extraData.time) || 45}M` : 'PT45M');
  const servings = extraData.servings ? `${extraData.servings} servings` : '4 servings';

  // Nutrition estimation
  const calories = extraData.calories || '380 kcal';
  const numericCalories = parseInt(calories) || 380;
  
  const nutrition = {
    '@type': 'NutritionInformation',
    calories: `${numericCalories} calories`,
    carbohydrateContent: `${Math.round(numericCalories * 0.11)} g`,
    proteinContent: `${Math.round(numericCalories * 0.05)} g`,
    fatContent: `${Math.round(numericCalories * 0.04)} g`
  };

  return {
    '@context': 'https://schema.org',
    '@type': 'Recipe',
    name: recipe.strMeal,
    image: recipe.strMealThumb ? [recipe.strMealThumb] : [],
    description: recipe.strInstructions ? recipe.strInstructions.slice(0, 160) + '...' : `Delicious Indian recipe for ${recipe.strMeal}`,
    keywords: `${recipe.strCategory || 'Indian'}, ${recipe.strArea || 'Indian'}, Recipe, Desi Delights`,
    recipeCategory: recipe.strCategory || 'Main Course',
    recipeCuisine: recipe.strArea || 'Indian',
    prepTime: prepTime,
    cookTime: cookTime,
    totalTime: totalTime,
    recipeYield: servings,
    recipeIngredient: recipeIngredient,
    recipeInstructions: instructionSteps.length > 0 ? instructionSteps : [
      {
        '@type': 'HowToStep',
        text: rawInstructions
      }
    ],
    nutrition: nutrition,
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      reviewCount: '150'
    },
    video: recipe.strYoutube ? {
      '@type': 'VideoObject',
      name: `How to make ${recipe.strMeal}`,
      description: `Video guide for ${recipe.strMeal}`,
      thumbnailUrl: recipe.strMealThumb,
      contentUrl: recipe.strYoutube
    } : undefined
  };
};
