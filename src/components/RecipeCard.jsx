import React, { memo } from 'react';
import { useLanguage } from '../context/LanguageContext';

const CUISINE_FLAGS = {
  India: '🇮🇳',
  Italian: '🇮🇹',
  Mexican: '🇲🇽',
  Chinese: '🇨🇳',
  Thai: '🇹🇭',
  American: '🇺🇸',
  British: '🇬🇧',
  Japanese: '🇯🇵',
  Spanish: '🇪🇸',
  French: '🇫🇷',
  Canadian: '🇨🇦',
  Greek: '🇬🇷',
  Moroccan: '🇲🇦',
  Turkish: '🇹🇷',
  Vietnamese: '🇻🇳',
  Jamaican: '🇯🇲'
};

const RecipeCard = memo(({ recipe, onClick, isFavorite, onToggleFavorite }) => {
  const { t } = useLanguage();
  const flag = CUISINE_FLAGS[recipe.strArea] || '🍽️';

  return (
    <div 
      onClick={() => onClick(recipe)}
      className="group relative h-[360px] sm:h-[390px] md:h-[420px] rounded-3xl overflow-hidden cursor-pointer transition-all duration-500 hover:-translate-y-2.5 hover:shadow-[0_25px_50px_-12px_rgba(249,115,22,0.25)] border border-white/10 hover:border-orange-500/40 bg-slate-900/60 backdrop-blur-md"
    >
      {/* Background Image */}
      <img
        src={recipe.strMealThumb}
        alt={recipe.strMeal}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        loading="lazy"
      />
      
      {/* Dynamic Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent opacity-85 group-hover:opacity-90 transition-opacity duration-300" />
      
      {/* Top Floating Badges Bar */}
      <div className="absolute top-3.5 inset-x-3.5 sm:top-4 sm:inset-x-4 flex items-center justify-between z-20 pointer-events-none">
        {/* Cuisine / Area Badge */}
        <span className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full text-[11px] sm:text-xs font-bold bg-slate-950/75 text-white border border-white/15 backdrop-blur-md shadow-lg pointer-events-auto">
          <span>{flag}</span>
          <span className="truncate max-w-[110px] sm:max-w-none">{recipe.strArea || 'Global'}</span>
        </span>

        {/* Favorite Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(recipe);
          }}
          className={`p-2.5 rounded-full backdrop-blur-md transition-all duration-300 pointer-events-auto cursor-pointer shadow-lg min-w-[40px] min-h-[40px] flex items-center justify-center ${
            isFavorite 
              ? 'bg-rose-500 text-white shadow-rose-500/40 scale-110' 
              : 'bg-slate-950/60 text-white/80 hover:text-white hover:bg-slate-950/90 hover:scale-110 border border-white/15'
          }`}
          aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill={isFavorite ? "currentColor" : "none"} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={isFavorite ? "0" : "1.5"} fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      {/* Content Section */}
      <div className="absolute inset-0 p-4 sm:p-6 flex flex-col justify-end transform transition-transform duration-300">
        <div className="transform translate-y-1 group-hover:translate-y-0 transition-transform duration-300">
          {recipe.strCategory && (
            <span className="inline-block px-2.5 sm:px-3 py-1 mb-2 text-[10px] sm:text-xs font-bold tracking-wider text-orange-300 uppercase bg-orange-500/20 backdrop-blur-md rounded-lg border border-orange-500/30">
              {recipe.strCategory}
            </span>
          )}
          <h3 className="text-lg sm:text-xl md:text-2xl font-black text-white mb-1.5 leading-snug drop-shadow-md line-clamp-2">
            {recipe.strMeal}
          </h3>
          
          <div className="h-0 group-hover:h-auto overflow-hidden transition-all duration-300 opacity-0 group-hover:opacity-100 pt-0.5">
             <p className="text-xs sm:text-sm text-orange-300 font-semibold flex items-center gap-1">
               <span>{t.clickDetails}</span>
               <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
             </p>
          </div>
        </div>
      </div>
      
      {/* Glowing Inner Border on Hover */}
      <div className="absolute inset-0 border-2 border-white/0 rounded-3xl group-hover:border-orange-500/30 transition-colors duration-300 pointer-events-none" />
    </div>
  );
});

export default RecipeCard;
