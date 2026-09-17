import React, { memo } from 'react';
import { POPULAR_CUISINES, POPULAR_CATEGORIES } from '../services/api';
import { useLanguage } from '../context/LanguageContext';

const CategoryFilter = memo(({ 
  selectedCuisine, 
  onSelectCuisine, 
  selectedCategory, 
  onSelectCategory,
  filterView,
  setFilterView 
}) => {
  const { t } = useLanguage();

  return (
    <div className="w-full mb-8 sm:mb-10">
      {/* View Switcher: Cuisines vs Categories */}
      <div className="flex items-center justify-center gap-2 sm:gap-3 mb-4 sm:mb-5 px-2">
        <div className="flex bg-slate-900/80 p-1 sm:p-1.5 rounded-2xl border border-white/10 backdrop-blur-xl shadow-xl w-full sm:w-auto max-w-sm justify-center">
          <button
            type="button"
            onClick={() => setFilterView('cuisine')}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-300 cursor-pointer min-h-[36px] ${
              filterView === 'cuisine'
                ? 'bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow-lg shadow-orange-500/25 scale-[1.02]'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <span>🌍</span>
            <span className="truncate">{t.exploreCuisines}</span>
          </button>
          <button
            type="button"
            onClick={() => setFilterView('category')}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-300 cursor-pointer min-h-[36px] ${
              filterView === 'category'
                ? 'bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow-lg shadow-orange-500/25 scale-[1.02]'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <span>🍲</span>
            <span className="truncate">{t.exploreCategories}</span>
          </button>
        </div>
      </div>

      {/* Filter Chips Horizontal Carousel with Touch Scrolling */}
      <div className="w-full overflow-x-auto pb-2 sm:pb-3 custom-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
        <div className="flex items-center justify-start md:justify-center min-w-max gap-2 sm:gap-3 px-1">
          {filterView === 'cuisine' ? (
            POPULAR_CUISINES.map((item) => {
              const isSelected = selectedCuisine === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onSelectCuisine(item.id)}
                  className={`
                    inline-flex items-center gap-1.5 sm:gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-2xl text-xs sm:text-sm font-medium transition-all duration-300 border cursor-pointer select-none min-h-[38px]
                    ${isSelected
                      ? 'bg-gradient-to-r from-orange-500 via-red-500 to-amber-600 text-white border-transparent shadow-lg shadow-orange-500/30 scale-105 font-bold'
                      : 'bg-slate-900/60 text-gray-300 border-white/10 hover:bg-white/10 hover:border-white/20 hover:text-white backdrop-blur-md'}
                  `}
                >
                  <span className="text-base sm:text-lg">{item.flag}</span>
                  <span>{item.name}</span>
                </button>
              );
            })
          ) : (
            POPULAR_CATEGORIES.map((item) => {
              const isSelected = selectedCategory === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onSelectCategory(item.id)}
                  className={`
                    inline-flex items-center gap-1.5 sm:gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-2xl text-xs sm:text-sm font-medium transition-all duration-300 border cursor-pointer select-none min-h-[38px]
                    ${isSelected
                      ? 'bg-gradient-to-r from-orange-500 via-red-500 to-amber-600 text-white border-transparent shadow-lg shadow-orange-500/30 scale-105 font-bold'
                      : 'bg-slate-900/60 text-gray-300 border-white/10 hover:bg-white/10 hover:border-white/20 hover:text-white backdrop-blur-md'}
                  `}
                >
                  <span className="text-base sm:text-lg">{item.icon}</span>
                  <span>{item.name}</span>
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
});

export default CategoryFilter;
