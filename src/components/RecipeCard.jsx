import React, { memo } from 'react';
import { useLanguage } from '../context/LanguageContext';

const RecipeCard = memo(({ recipe, onClick, isFavorite, onToggleFavorite }) => {
  const { t } = useLanguage();

  return (
    <div 
      onClick={() => onClick(recipe)}
      className="group relative h-96 rounded-3xl overflow-hidden cursor-pointer transition-all duration-500 hover:-translate-y-4 hover:shadow-[0_20px_40px_-15px_rgba(99,102,241,0.3)]"
    >
      {/* Background Image */}
      <img
        src={recipe.strMealThumb}
        alt={recipe.strMeal}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        loading="lazy"
      />
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-linear-to-t from-dark-bg via-dark-bg/50 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-300" />
      
      {/* Favorite Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggleFavorite(recipe);
        }}
        className={`absolute top-4 right-4 z-20 p-3 rounded-full backdrop-blur-md transition-all duration-300 ${
          isFavorite 
            ? 'bg-red-500 text-white shadow-lg shadow-red-500/30 scale-110' 
            : 'bg-black/30 text-white hover:bg-black/50 hover:scale-110'
        }`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
        </svg>
      </button>

      {/* Content */}
      <div className="absolute inset-0 p-6 flex flex-col justify-end transform transition-transform duration-300">
        <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
          {recipe.strCategory && (
            <span className="inline-block px-3 py-1 mb-3 text-xs font-bold tracking-wider text-accent-500 uppercase bg-accent-500/10 backdrop-blur-md rounded-full border border-accent-500/20">
              {recipe.strCategory}
            </span>
          )}
          <h3 className="text-2xl font-bold text-white mb-2 leading-tight drop-shadow-lg">
            {recipe.strMeal}
          </h3>
          <div className="h-0 group-hover:h-auto overflow-hidden transition-all duration-300 opacity-0 group-hover:opacity-100">
             <p className="text-sm text-gray-300 mt-2 font-medium">{t.clickDetails} &rarr;</p>
          </div>
        </div>
      </div>
      
      {/* Border Highlight */}
      <div className="absolute inset-0 border-2 border-white/0 rounded-3xl group-hover:border-white/20 transition-colors duration-300 pointer-events-none" />
    </div>
  );
});

export default RecipeCard;
