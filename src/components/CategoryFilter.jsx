import React, { memo } from 'react';

const CategoryFilter = memo(({ categories, selectedCategory, onSelectCategory }) => {
  return (
    <div className="w-full overflow-x-auto pb-4 mb-12 scrollbar-hide mask-gradient-x">
      <div className="flex justify-center min-w-max space-x-4 px-4">
        <button
          onClick={() => onSelectCategory(null)}
          className={`
            px-6 py-2.5 rounded-full text-sm font-semibold tracking-wide uppercase transition-all duration-300 border cursor-pointer select-none
            ${!selectedCategory
              ? 'bg-white text-dark-bg border-white shadow-[0_0_20px_rgba(255,255,255,0.3)] scale-105'
              : 'bg-transparent text-gray-400 border-white/10 hover:border-white/40 hover:text-white'}
          `}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat.strCategory}
            onClick={() => onSelectCategory(cat.strCategory)}
            className={`
              px-6 py-2.5 rounded-full text-sm font-semibold tracking-wide uppercase transition-all duration-300 border cursor-pointer select-none
              ${selectedCategory === cat.strCategory
                ? 'bg-white text-dark-bg border-white shadow-[0_0_20px_rgba(255,255,255,0.3)] scale-105'
                : 'bg-transparent text-gray-400 border-white/10 hover:border-white/40 hover:text-white'}
            `}
          >
            {cat.strCategory}
          </button>
        ))}
      </div>
    </div>
  );
});

export default CategoryFilter;
