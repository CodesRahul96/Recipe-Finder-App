import React, { useEffect, useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { translateIngredient } from '../utils/ingredientTranslations';
import { hindiRecipes } from '../data/hindiRecipes';
import { generateRecipeSchema } from '../utils/schemaGenerator';

const RecipeModal = ({ recipe, onClose, isFavorite, onToggleFavorite, onShowToast }) => {
  const { t, language } = useLanguage();
  const [checkedIngredients, setCheckedIngredients] = useState({});
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedIng, setCopiedIng] = useState(false);

  // Translation & Hindi Data
  const hindiData = recipe ? hindiRecipes[recipe.strMeal] : null;
  const hasHindiData = language === 'hi' && Boolean(hindiData);

  // Dynamic Schema.org injection into document head for SEO (invisible to user)
  useEffect(() => {
    if (!recipe) return;

    document.body.style.overflow = 'hidden';
    const originalTitle = document.title;
    document.title = `${recipe.strMeal} - ${t.appTitlePrefix}${t.appTitleSuffix}`;

    const schemaData = generateRecipeSchema(recipe, hindiData || {});
    const scriptTag = document.createElement('script');
    scriptTag.type = 'application/ld+json';
    scriptTag.id = 'recipe-schema-jsonld';
    scriptTag.text = JSON.stringify(schemaData, null, 2);
    document.head.appendChild(scriptTag);

    return () => {
      document.body.style.overflow = 'auto';
      document.title = originalTitle;
      const existing = document.getElementById('recipe-schema-jsonld');
      if (existing) {
        document.head.removeChild(existing);
      }
    };
  }, [recipe, t, hindiData]);

  if (!recipe) return null;

  // Extract ingredients
  const ingredients = [];
  for (let i = 1; i <= 20; i++) {
    const ingredient = recipe[`strIngredient${i}`];
    const measure = recipe[`strMeasure${i}`];
    if (ingredient && ingredient.trim()) {
      ingredients.push({ id: i, ingredient: ingredient.trim(), measure: measure ? measure.trim() : '' });
    }
  }

  const toggleIngredientCheck = (id) => {
    setCheckedIngredients(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const displayInstructions = hasHindiData 
      ? hindiData.instructions 
      : recipe.strInstructions;

  const getIngredientName = (name) => {
      return language === 'hi' ? translateIngredient(name) : name;
  };

  // Nutrition estimations
  const calVal = hindiData?.calories ? parseInt(hindiData.calories) : 420;
  const carbsVal = Math.round(calVal * 0.11);
  const proteinVal = Math.round(calVal * 0.05);
  const fatVal = Math.round(calVal * 0.04);
  const timeVal = hindiData?.time || '35 mins';
  const servingsVal = hindiData?.servings || '4 Servings';
  const difficultyVal = hindiData?.difficulty || 'Medium';

  const getRecipeShareUrl = () => {
    const url = new URL(window.location.origin + window.location.pathname);
    url.searchParams.set('recipe', recipe.idMeal);
    return url.toString();
  };

  const handleCopyLink = () => {
    const shareUrl = getRecipeShareUrl();
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopiedLink(true);
      if (onShowToast) onShowToast(t.copiedLink, 'success');
      setTimeout(() => setCopiedLink(false), 2500);
    });
  };

  const handleShare = () => {
    const shareUrl = getRecipeShareUrl();
    if (navigator.share) {
      navigator.share({
        title: `${recipe.strMeal} Recipe`,
        text: `Check out this delicious recipe for ${recipe.strMeal} on DesiDelights!`,
        url: shareUrl,
      }).catch(() => {});
    } else {
      handleCopyLink();
    }
  };

  const handleCopyIngredientsList = () => {
    const textList = `${recipe.strMeal} - Ingredients:\n` + 
      ingredients.map(item => `• ${item.measure ? item.measure + ' ' : ''}${getIngredientName(item.ingredient)}`).join('\n');
    
    navigator.clipboard.writeText(textList).then(() => {
      setCopiedIng(true);
      if (onShowToast) onShowToast(t.copiedIngredients, 'success');
      setTimeout(() => setCopiedIng(false), 2500);
    });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-950/85 backdrop-blur-md transition-opacity duration-300"
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-5xl bg-slate-900 rounded-3xl shadow-2xl overflow-hidden max-h-[94vh] sm:max-h-[90vh] flex flex-col md:flex-row animate-scale-up border border-white/15 z-10 my-auto">
        {/* Top Controls */}
        <div className="absolute top-3 sm:top-4 right-3 sm:right-4 z-30 flex items-center gap-1.5 sm:gap-2">
          {/* Share Button */}
          <button
            type="button"
            onClick={handleShare}
            className="p-2 sm:p-2.5 bg-slate-950/75 hover:bg-slate-950/90 rounded-full text-white backdrop-blur-md transition-all cursor-pointer border border-white/15 min-w-[38px] min-h-[38px] flex items-center justify-center shadow-lg hover:scale-105"
            title={t.shareRecipe}
          >
            <svg className="w-4 sm:w-5 h-4 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
          </button>

          {/* Close Modal Button */}
          <button
            type="button"
            onClick={onClose}
            className="p-2 sm:p-2.5 bg-slate-950/75 hover:bg-slate-950/90 rounded-full text-white backdrop-blur-md transition-all cursor-pointer border border-white/15 min-w-[38px] min-h-[38px] flex items-center justify-center shadow-lg hover:scale-105"
            aria-label="Close modal"
          >
            <svg className="w-4 sm:w-5 h-4 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Favorite Button on Image */}
        <button
          type="button"
          onClick={() => onToggleFavorite(recipe)}
          className={`absolute top-3 sm:top-4 left-3 sm:left-4 z-30 p-2.5 sm:p-3 rounded-full backdrop-blur-md transition-all duration-300 shadow-xl cursor-pointer min-w-[38px] min-h-[38px] flex items-center justify-center ${
            isFavorite 
            ? 'bg-rose-500 text-white shadow-rose-500/40 scale-110' 
            : 'bg-slate-950/75 text-white hover:bg-slate-950 hover:scale-110 border border-white/15'
          }`}
          aria-label="Toggle favorite"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 sm:h-5 w-4 sm:h-5" viewBox="0 0 20 20" fill={isFavorite ? "currentColor" : "none"} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={isFavorite ? "0" : "1.5"} fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
          </svg>
        </button>

        {/* Left Hero Image Column */}
        <div className="w-full md:w-5/12 h-48 sm:h-64 md:h-auto relative shrink-0">
          <img
            src={recipe.strMealThumb}
            alt={recipe.strMeal}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent md:bg-gradient-to-r md:from-transparent md:to-slate-900" />
          
          {/* Quick Info Badges */}
          <div className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4 flex flex-wrap gap-1.5">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-bold bg-slate-950/80 text-amber-300 border border-amber-500/30 backdrop-blur-md shadow-lg">
              <span>⏱️</span>
              <span>{timeVal}</span>
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-bold bg-slate-950/80 text-blue-300 border border-blue-500/30 backdrop-blur-md shadow-lg">
              <span>👥</span>
              <span>{servingsVal}</span>
            </span>
          </div>
        </div>

        {/* Right Scrollable Content Column */}
        <div className="w-full md:w-7/12 p-4 sm:p-6 md:p-8 overflow-y-auto custom-scrollbar flex flex-col justify-between">
          <div>
            {/* Title & Badges */}
            <div className="mb-5 sm:mb-6">
              <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black text-white mb-2 sm:mb-3 pr-12 leading-tight">
                {recipe.strMeal}
              </h2>
              
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-xs sm:text-sm mb-3 sm:mb-4">
                <span className="px-2.5 sm:px-3.5 py-0.5 sm:py-1 bg-orange-500/20 text-orange-300 font-bold rounded-lg sm:rounded-xl border border-orange-500/30">
                  {recipe.strCategory || 'Main Course'}
                </span>
                <span className="px-2.5 sm:px-3.5 py-0.5 sm:py-1 bg-purple-500/20 text-purple-300 font-bold rounded-lg sm:rounded-xl border border-purple-500/30">
                  {recipe.strArea || 'Global'}
                </span>
                <span className="px-2.5 sm:px-3.5 py-0.5 sm:py-1 bg-emerald-500/20 text-emerald-300 font-bold rounded-lg sm:rounded-xl border border-emerald-500/30">
                  {difficultyVal}
                </span>
              </div>

              {/* Nutrition Breakdown */}
              <div className="bg-slate-950/70 p-3 sm:p-4 rounded-2xl border border-white/10 shadow-inner">
                <div className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 sm:mb-3">
                  {t.nutritionBreakdown}
                </div>
                <div className="grid grid-cols-4 gap-2 text-center">
                  <div className="flex flex-col items-center">
                    <span className="text-[10px] sm:text-[11px] text-gray-400 uppercase">{t.calories}</span>
                    <span className="font-extrabold text-white text-xs sm:text-sm md:text-base text-amber-400">{calVal} kcal</span>
                  </div>
                  <div className="flex flex-col items-center border-l border-white/10">
                     <span className="text-[10px] sm:text-[11px] text-gray-400 uppercase">{t.carbs}</span>
                     <span className="font-extrabold text-white text-xs sm:text-sm md:text-base text-blue-400">{carbsVal}g</span>
                  </div>
                  <div className="flex flex-col items-center border-l border-white/10">
                     <span className="text-[10px] sm:text-[11px] text-gray-400 uppercase">{t.protein}</span>
                     <span className="font-extrabold text-white text-xs sm:text-sm md:text-base text-emerald-400">{proteinVal}g</span>
                  </div>
                  <div className="flex flex-col items-center border-l border-white/10">
                     <span className="text-[10px] sm:text-[11px] text-gray-400 uppercase">{t.fat}</span>
                     <span className="font-extrabold text-white text-xs sm:text-sm md:text-base text-rose-400">{fatVal}g</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Interactive Ingredients Checklist */}
            <div className="mb-6 sm:mb-8">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                  <span className="w-1.5 h-4 sm:h-5 bg-orange-500 rounded-full"></span>
                  <span>{t.ingredients}</span>
                </h3>
                
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopyIngredientsList}
                    className="text-[11px] sm:text-xs text-orange-400 hover:text-orange-300 font-semibold px-2 py-1 bg-orange-500/10 hover:bg-orange-500/20 rounded-lg border border-orange-500/30 transition-colors cursor-pointer flex items-center gap-1"
                    title={t.copyIngredients}
                  >
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                    </svg>
                    <span>{copiedIng ? '✓ Copied' : t.copyIngredients}</span>
                  </button>

                  <span className="text-[11px] sm:text-xs text-gray-400 font-medium hidden sm:inline">
                    {Object.values(checkedIngredients).filter(Boolean).length}/{ingredients.length}
                  </span>
                </div>
              </div>
              <p className="text-[11px] sm:text-xs text-gray-400 mb-2.5">{t.ingredientsSub}</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5">
                {ingredients.map((item) => {
                  const isChecked = Boolean(checkedIngredients[item.id]);
                  return (
                    <div 
                      key={item.id}
                      onClick={() => toggleIngredientCheck(item.id)}
                      className={`flex items-center gap-2.5 p-2 sm:p-2.5 rounded-xl border transition-all duration-200 cursor-pointer select-none min-h-[40px] ${
                        isChecked 
                          ? 'bg-emerald-950/30 border-emerald-500/40 text-gray-500 line-through'
                          : 'bg-white/5 hover:bg-white/10 border-white/10 text-gray-200'
                      }`}
                    >
                      <div className={`w-4 sm:w-5 h-4 sm:h-5 rounded-lg border flex items-center justify-center transition-all shrink-0 ${
                        isChecked 
                          ? 'bg-emerald-500 border-emerald-500 text-slate-950'
                          : 'border-white/30 bg-white/5'
                      }`}>
                        {isChecked && (
                          <svg className="w-3 sm:w-3.5 h-3 sm:h-3.5 font-bold stroke-current" viewBox="0 0 24 24" fill="none">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <div className="text-xs sm:text-sm">
                        <span className="font-bold text-white mr-1">{item.measure}</span>
                        <span>{getIngredientName(item.ingredient)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Step-by-Step Cooking Instructions */}
            <div className="mb-6 sm:mb-8">
              <h3 className="text-base sm:text-lg font-bold text-white mb-2.5 flex items-center gap-2">
                <span className="w-1.5 h-4 sm:h-5 bg-amber-500 rounded-full"></span>
                <span>{t.instructions}</span>
              </h3>
              <div className="text-gray-300 leading-relaxed text-xs sm:text-sm md:text-base space-y-2.5 bg-slate-950/40 p-3 sm:p-4 rounded-2xl border border-white/5">
                {displayInstructions.split(/\r?\n+/).filter(Boolean).map((para, pIdx) => (
                  <p key={pIdx} className="leading-relaxed">
                    {para}
                  </p>
                ))}
              </div>
            </div>
          </div>

          {/* User-Friendly Action Toolbar */}
          <div className="pt-3 sm:pt-4 border-t border-white/10 flex flex-col sm:flex-row gap-2 sm:gap-2.5">
            {/* Watch YouTube Video Tutorial */}
            {recipe.strYoutube && (
              <a
                href={recipe.strYoutube}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-bold text-xs sm:text-sm transition-all duration-300 shadow-lg shadow-red-600/30 hover:scale-[1.02] cursor-pointer min-h-[42px]"
              >
                <svg className="w-4 sm:w-5 h-4 sm:h-5 shrink-0 fill-current" viewBox="0 0 24 24">
                  <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
                </svg>
                <span>{t.watchVideo}</span>
              </a>
            )}

            {/* Copy Recipe Link Button */}
            <button
              type="button"
              onClick={handleCopyLink}
              className="inline-flex items-center justify-center gap-2 px-3.5 sm:px-4 py-2.5 sm:py-3 bg-slate-800 hover:bg-slate-700 border border-white/15 text-white rounded-2xl font-semibold text-xs sm:text-sm transition-all duration-300 cursor-pointer shadow-md min-h-[42px] hover:scale-[1.02]"
            >
              <svg className="w-4 h-4 text-orange-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
              <span>{copiedLink ? '✓ Link Copied' : t.copyRecipeLink}</span>
            </button>

            {/* Share Recipe Button */}
            <button
              type="button"
              onClick={handleShare}
              className="inline-flex items-center justify-center gap-2 px-3.5 sm:px-4 py-2.5 sm:py-3 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white rounded-2xl font-bold text-xs sm:text-sm transition-all duration-300 cursor-pointer shadow-md shadow-orange-500/20 min-h-[42px] hover:scale-[1.02]"
            >
              <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              <span>{t.shareRecipe}</span>
            </button>

            {/* Print Recipe Button */}
            <button
              type="button"
              onClick={handlePrint}
              className="p-2.5 sm:p-3 bg-slate-800 hover:bg-slate-700 border border-white/15 text-white rounded-2xl transition-all cursor-pointer min-h-[42px] min-w-[42px] flex items-center justify-center hover:scale-[1.02]"
              title={t.printRecipe}
            >
              <svg className="w-4 sm:w-5 h-4 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecipeModal;
