import React, { useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { translateIngredient } from '../utils/ingredientTranslations';
import { hindiRecipes } from '../data/hindiRecipes';

const RecipeModal = ({ recipe, onClose, isFavorite, onToggleFavorite }) => {
  const { t, language } = useLanguage();

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const originalTitle = document.title;
    document.title = `${recipe.strMeal} - ${t.appTitlePrefix}${t.appTitleSuffix}`;

    return () => {
      document.body.style.overflow = 'auto';
      document.title = originalTitle;
    };
  }, [recipe, t]);

  if (!recipe) return null;

  const ingredients = [];
  for (let i = 1; i <= 20; i++) {
    const ingredient = recipe[`strIngredient${i}`];
    const measure = recipe[`strMeasure${i}`];
    if (ingredient && ingredient.trim()) {
      ingredients.push({ ingredient, measure });
    }
  }

  // Translation and Data Logic
  const hindiData = hindiRecipes[recipe.strMeal];
  const hasHindiData = language === 'hi' && hindiData;

  const displayInstructions = hasHindiData 
      ? hindiData.instructions 
      : recipe.strInstructions;

  const getIngredientName = (name) => {
      return language === 'hi' ? translateIngredient(name) : name;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-4xl bg-dark-card rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col md:flex-row animate-scale-up border border-white/10">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white backdrop-blur-md transition-all cursor-pointer"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Favorite Button */}
        <button
          onClick={() => onToggleFavorite(recipe)}
          className={`absolute top-4 left-4 z-10 p-3 rounded-full backdrop-blur-md transition-all duration-300 ${
            isFavorite 
            ? 'bg-red-500 text-white shadow-lg shadow-red-500/30 scale-110' 
            : 'bg-black/30 text-white hover:bg-black/50 hover:scale-110'
          }`}
        >
           <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
          </svg>
        </button>

        {/* Image Section */}
        <div className="w-full md:w-2/5 h-64 md:h-auto relative">
          <img
            src={recipe.strMealThumb}
            alt={recipe.strMeal}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-linear-to-t from-dark-card to-transparent md:bg-linear-to-r" />
        </div>

        {/* Content Section */}
        <div className="w-full md:w-3/5 p-8 overflow-y-auto custom-scrollbar">
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-white mb-2 pr-12">{recipe.strMeal}</h2>
            <div className="flex flex-wrap gap-2 text-sm mb-4">
              <span className="px-3 py-1 bg-orange-900/40 text-orange-300 rounded-lg border border-orange-800/50">
                {recipe.strCategory}
              </span>
              <span className="px-3 py-1 bg-purple-900/30 text-purple-300 rounded-lg border border-purple-800/50">
                {recipe.strArea}
              </span>
            </div>

            {/* Info Metrics Bar (Only if Hindi data exists) */}
            {hasHindiData && (
              <div className="grid grid-cols-4 gap-2 mb-6 bg-white/5 p-3 rounded-xl border border-white/10 text-center">
                <div className="flex flex-col items-center">
                  <span className="text-xs text-gray-400 uppercase tracking-widest">{t.time}</span>
                  <span className="font-bold text-white text-sm">{hindiData.time}</span>
                </div>
                <div className="flex flex-col items-center border-l border-white/10">
                   <span className="text-xs text-gray-400 uppercase tracking-widest">{t.servings}</span>
                   <span className="font-bold text-white text-sm">{hindiData.servings}</span>
                </div>
                <div className="flex flex-col items-center border-l border-white/10">
                   <span className="text-xs text-gray-400 uppercase tracking-widest">{t.calories}</span>
                   <span className="font-bold text-white text-sm">{hindiData.calories}</span>
                </div>
                <div className="flex flex-col items-center border-l border-white/10">
                   <span className="text-xs text-gray-400 uppercase tracking-widest">{t.difficulty}</span>
                   <span className={`font-bold text-sm ${hindiData.difficulty === 'Easy' ? 'text-green-400' : hindiData.difficulty === 'Medium' ? 'text-yellow-400' : 'text-red-400'}`}>
                     {hindiData.difficulty}
                   </span>
                </div>
              </div>
            )}

            {/* Translation Notice */}
            {language === 'hi' && !hasHindiData && (
               <p className="text-xs text-yellow-500 mt-2 bg-yellow-500/10 p-2 rounded border border-yellow-500/20">
                 नोट: पूरी विधि का हिंदी अनुवाद उपलब्ध नहीं है। (English instructions shown)
               </p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <span className="w-1 h-6 bg-orange-500 rounded-full mr-3"></span>
                {t.ingredients}
              </h3>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {ingredients.map((item, index) => (
                  <li key={index} className="flex items-center text-gray-300 bg-white/5 px-3 py-2 rounded-lg">
                    <span className="w-2 h-2 bg-orange-500 rounded-full mr-3"></span>
                    <span className="font-medium text-white mr-2">{item.measure}</span>
                    <span className="opacity-80">{getIngredientName(item.ingredient)}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <span className="w-1 h-6 bg-yellow-500 rounded-full mr-3"></span>
                {t.instructions}
              </h3>
              <p className="text-gray-300 leading-relaxed whitespace-pre-line text-sm md:text-base">
                {displayInstructions}
              </p>
            </div>

            {recipe.strYoutube && (
              <div className="pt-4">
                <a
                  href={recipe.strYoutube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center w-full px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-colors group cursor-pointer"
                >
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
                  </svg>
                  {t.watchVideo}
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecipeModal;
