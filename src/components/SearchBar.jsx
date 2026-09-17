import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';

const SearchBar = ({ onSearch, onSurpriseMe, isSurpriseLoading }) => {
  const [term, setTerm] = useState('');
  const [searchMode, setSearchMode] = useState('dish'); // 'dish' | 'ingredient'
  const { t } = useLanguage();

  const quickIngredients = ['Paneer', 'Chicken', 'Potato', 'Spinach', 'Lentils', 'Tomatoes', 'Pasta', 'Egg'];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(term, searchMode);
    }
  };

  const handleClear = () => {
    setTerm('');
    if (onSearch) {
      onSearch('', searchMode);
    }
  };

  const handleChipClick = (ingredient) => {
    setSearchMode('ingredient');
    setTerm(ingredient);
    if (onSearch) {
      onSearch(ingredient, 'ingredient');
    }
  };

  return (
    <div className="relative z-10 w-full max-w-3xl mx-auto mb-8 sm:mb-12 px-1 sm:px-0">
      {/* Mode Selector & Surprise Me Header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 mb-3">
        <div className="inline-flex bg-slate-900/80 p-1 rounded-2xl border border-white/10 backdrop-blur-xl shadow-lg w-full sm:w-auto justify-center">
          <button
            type="button"
            onClick={() => {
              setSearchMode('dish');
              if (term) onSearch(term, 'dish');
            }}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-300 cursor-pointer min-h-[36px] ${
              searchMode === 'dish'
                ? 'bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow-md shadow-orange-500/20'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <span>🍲</span>
            <span>{t.searchModeDish}</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setSearchMode('ingredient');
              if (term) onSearch(term, 'ingredient');
            }}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-300 cursor-pointer min-h-[36px] ${
              searchMode === 'ingredient'
                ? 'bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow-md shadow-orange-500/20'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <span>🥕</span>
            <span>{t.searchModeIngredient}</span>
          </button>
        </div>

        {/* Surprise Me Quick Action */}
        <button
          type="button"
          onClick={onSurpriseMe}
          disabled={isSurpriseLoading}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-600 hover:from-amber-600 hover:to-rose-700 text-white text-xs sm:text-sm font-bold rounded-2xl shadow-xl shadow-orange-500/25 hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer disabled:opacity-50 border border-white/20 min-h-[40px]"
        >
          {isSurpriseLoading ? (
            <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <span className="text-base">🎲</span>
          )}
          <span>{isSurpriseLoading ? t.surpriseMeLoading : t.surpriseMe}</span>
        </button>
      </div>

      {/* Main Search Input Form */}
      <form onSubmit={handleSubmit} className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-orange-500 via-rose-500 to-amber-500 rounded-3xl blur-lg opacity-25 group-hover:opacity-50 transition duration-500"></div>
        <div className="relative flex items-center bg-slate-900/90 backdrop-blur-2xl border border-white/15 rounded-3xl shadow-2xl transition-all duration-300 group-hover:border-white/30">
          <div className="pl-4 sm:pl-5 text-gray-400 shrink-0">
            <svg className="w-5 sm:w-6 h-5 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder={searchMode === 'ingredient' ? t.searchIngredientPlaceholder : t.searchPlaceholder}
            className="w-full bg-transparent border-none text-sm sm:text-base md:text-lg text-white placeholder-gray-400 focus:outline-none focus:ring-0 px-3 sm:px-4 py-3 sm:py-4 h-13 sm:h-16"
          />

          {/* Clear Button */}
          {term && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1.5 sm:p-2 text-gray-400 hover:text-white rounded-full hover:bg-white/10 transition-colors cursor-pointer shrink-0"
              title="Clear search"
            >
              <svg className="w-4 sm:w-5 h-4 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}

          <button
            type="submit"
            className="mr-1.5 sm:mr-2.5 px-4 sm:px-7 py-2.5 sm:py-3 bg-white hover:bg-orange-50 text-slate-950 font-bold rounded-2xl hover:scale-105 active:scale-95 transition-all duration-300 shadow-md cursor-pointer text-xs sm:text-sm md:text-base shrink-0 min-h-[38px] sm:min-h-[44px]"
          >
            {t.search}
          </button>
        </div>
      </form>

      {/* Quick Trending Tags */}
      <div className="mt-3.5 flex flex-wrap items-center gap-1.5 sm:gap-2 px-1 text-xs text-gray-400">
        <span className="font-semibold text-gray-300 flex items-center gap-1 shrink-0">
          <span>🔥</span> {t.popularIngredients}
        </span>
        {quickIngredients.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => handleChipClick(item)}
            className="px-2.5 py-1 bg-white/5 hover:bg-orange-500/20 hover:text-orange-300 hover:border-orange-500/40 border border-white/10 rounded-xl transition-all duration-200 cursor-pointer text-[11px] sm:text-xs"
          >
            +{item}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SearchBar;
