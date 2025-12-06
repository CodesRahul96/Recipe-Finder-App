import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';

const SearchBar = ({ onSearch }) => {
  const [term, setTerm] = useState('');
  const { t } = useLanguage();

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(term);
  };

  return (
    <div className="relative z-10 w-full max-w-2xl mx-auto mb-16">
      <form onSubmit={handleSubmit} className="relative group">
        <div className="absolute -inset-1 bg-linear-to-r from-orange-400 to-red-600 rounded-2xl blur-lg opacity-30 group-hover:opacity-60 transition duration-500 animate-pulse-slow"></div>
        <div className="relative flex items-center bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl transition-all duration-300 group-hover:bg-white/15 group-hover:border-white/30 transform group-hover:scale-[1.01]">
          <input
            type="text"
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder={t.searchPlaceholder}
            className="w-full bg-transparent border-none text-lg text-white placeholder-gray-500 focus:ring-0 px-4 py-5 h-16"
          />
          <button
            type="submit"
            className="mr-2 px-8 py-3 bg-white text-dark-bg font-bold rounded-xl hover:scale-105 active:scale-95 transition-all duration-300 shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.5)] cursor-pointer"
          >
            Search
          </button>
        </div>
      </form>
    </div>
  );
};

export default SearchBar;
