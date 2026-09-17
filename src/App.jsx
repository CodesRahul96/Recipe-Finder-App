import { useState, useEffect, lazy, Suspense } from 'react';
import { 
  searchRecipes, 
  getIndianRecipes, 
  getAllGlobalRecipes, 
  getRecipeById, 
  getVegetarianIndian, 
  getSpicyIndian, 
  getDessertIndian, 
  getRandomRecipe, 
  filterByIngredient, 
  filterByCuisine, 
  filterByCategory 
} from './services/api';
import SearchBar from './components/SearchBar';
import RecipeCard from './components/RecipeCard';
import CategoryFilter from './components/CategoryFilter';
import Toast from './components/Toast';
import { useLanguage } from './context/LanguageContext';

// Lazy load the modal
const RecipeModal = lazy(() => import('./components/RecipeModal'));

function App() {
  const [recipes, setRecipes] = useState([]);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSurpriseLoading, setIsSurpriseLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('Popular');
  const [selectedCuisine, setSelectedCuisine] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [filterView, setFilterView] = useState('cuisine'); // 'cuisine' | 'category'
  const [toast, setToast] = useState(null);

  const { t, language, toggleLanguage } = useLanguage();
  
  // Favorites State (persisted in localStorage)
  const [favorites, setFavorites] = useState(() => {
    try {
      const saved = localStorage.getItem('favorites');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Keep localStorage and active Favorites view in sync
  useEffect(() => {
    try {
      localStorage.setItem('favorites', JSON.stringify(favorites));
    } catch (e) {
      console.warn('Could not save favorites to localStorage', e);
    }

    if (activeTab === 'Favorites') {
      setRecipes(favorites);
      if (favorites.length === 0) {
        setError('noFavoritesDesc');
      } else {
        setError(null);
      }
    }
  }, [favorites, activeTab]);

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
  };

  const toggleFavorite = (recipe) => {
    setFavorites(prev => {
      const exists = prev.find(f => f.idMeal === recipe.idMeal);
      if (exists) {
        showToast(t.toastUnfavorited, 'info');
        return prev.filter(f => f.idMeal !== recipe.idMeal);
      } else {
        showToast(t.toastFavorited, 'heart');
        const itemToSave = {
          idMeal: recipe.idMeal,
          strMeal: recipe.strMeal,
          strMealThumb: recipe.strMealThumb,
          strArea: recipe.strArea || 'Global',
          strCategory: recipe.strCategory || 'Main Course',
          strInstructions: recipe.strInstructions,
          strYoutube: recipe.strYoutube
        };
        return [...prev, itemToSave];
      }
    });
  };

  // Initial Load + Deep Link URL (?recipe=idMeal) Support
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const initialRecipes = await getAllGlobalRecipes();
        setRecipes(initialRecipes);

        const urlParams = new URLSearchParams(window.location.search);
        const recipeId = urlParams.get('recipe');
        if (recipeId) {
          const directMeal = await getRecipeById(recipeId);
          if (directMeal) {
            setSelectedRecipe(directMeal);
          }
        }
      } catch {
        setError('errorLoad');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleRecipeClick = async (recipe) => {
    if (!recipe.strInstructions) {
      const fullRecipe = await getRecipeById(recipe.idMeal);
      setSelectedRecipe(fullRecipe || recipe);
    } else {
      setSelectedRecipe(recipe);
    }

    const url = new URL(window.location);
    url.searchParams.set('recipe', recipe.idMeal);
    window.history.pushState({}, '', url);
  };

  const handleCloseModal = () => {
    setSelectedRecipe(null);
    const url = new URL(window.location);
    url.searchParams.delete('recipe');
    window.history.pushState({}, '', url);
  };

  const handleSearch = async (query, mode = 'dish') => {
    setLoading(true);
    setActiveTab('Search');
    try {
      if (!query || !query.trim()) {
        const initialRecipes = await getAllGlobalRecipes();
        setRecipes(initialRecipes);
        return;
      }

      let data = [];
      if (mode === 'ingredient') {
        data = await filterByIngredient(query);
      } else {
        data = await searchRecipes(query);
      }
      
      setRecipes(data);
      if (data.length === 0) setError('noResultsDesc');
      else setError(null);
    } catch {
      setError('errorSearch');
    } finally {
      setLoading(false);
    }
  };

  const handleSurpriseMe = async () => {
    setIsSurpriseLoading(true);
    try {
      const randomMeal = await getRandomRecipe();
      if (randomMeal) {
        if (!randomMeal.strInstructions) {
          const fullRecipe = await getRecipeById(randomMeal.idMeal);
          handleRecipeClick(fullRecipe || randomMeal);
        } else {
          handleRecipeClick(randomMeal);
        }
      }
    } catch (err) {
      console.error("Surprise Me error:", err);
    } finally {
      setIsSurpriseLoading(false);
    }
  };

  const handleCuisineSelect = async (cuisineId) => {
    setSelectedCuisine(cuisineId);
    setActiveTab('Cuisine');
    setError(null);
    setLoading(true);
    try {
      const data = await filterByCuisine(cuisineId);
      setRecipes(data);
      if (data.length === 0) setError('noResultsDesc');
    } catch {
      setError('errorFilter');
    } finally {
      setLoading(false);
    }
  };

  const handleCategorySelect = async (categoryId) => {
    setSelectedCategory(categoryId);
    setActiveTab('Category');
    setError(null);
    setLoading(true);
    try {
      const data = await filterByCategory(categoryId);
      setRecipes(data);
      if (data.length === 0) setError('noResultsDesc');
    } catch {
      setError('errorFilter');
    } finally {
      setLoading(false);
    }
  };

  const handleResetFilters = async () => {
    setSelectedCuisine('All');
    setSelectedCategory('All');
    setActiveTab('Popular');
    setError(null);
    setLoading(true);
    try {
      const data = await getAllGlobalRecipes();
      setRecipes(data);
    } catch {
      setError('errorLoad');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFilter = async (type) => {
    setError(null);
    setActiveTab(type);

    if (type === 'Favorites') {
        setRecipes(favorites);
        if (favorites.length === 0) setError('noFavoritesDesc');
        return;
    }

    setLoading(true);
    try {
      let data = [];
      if (type === 'Popular') {
        setSelectedCuisine('All');
        setSelectedCategory('All');
        data = await getAllGlobalRecipes();
      } else if (type === 'Indian') {
        setSelectedCuisine('India');
        data = await getIndianRecipes();
      } else if (type === 'Vegetarian') {
        data = await getVegetarianIndian();
      } else if (type === 'Spicy') {
        data = await getSpicyIndian();
      } else if (type === 'Dessert') {
        data = await getDessertIndian();
      }
      setRecipes(data);
      if (data.length === 0) setError('noResultsDesc');
    } catch {
      setError('errorFilter');
    } finally {
      setLoading(false);
    }
  };

  const isFavorite = (id) => favorites.some(f => f.idMeal === id);

  return (
    <div className="min-h-screen relative bg-slate-950 text-white overflow-hidden pb-24 sm:pb-32">
      {/* Dynamic Ambient Background Lights */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-15%] left-[-10%] w-[65vw] sm:w-[55vw] h-[65vw] sm:h-[55vw] bg-orange-600/15 rounded-full blur-[140px] mix-blend-screen animate-float" />
        <div className="absolute bottom-[-15%] right-[-10%] w-[60vw] sm:w-[50vw] h-[60vw] sm:h-[50vw] bg-rose-600/10 rounded-full blur-[120px] mix-blend-screen animate-float" style={{ animationDelay: '2.5s' }} />
        <div className="absolute top-[35%] left-[25%] w-[40vw] sm:w-[35vw] h-[40vw] sm:h-[35vw] bg-amber-500/10 rounded-full blur-[100px] mix-blend-screen animate-float" style={{ animationDelay: '5s' }} />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        {/* Sticky Responsive Header */}
        <header className="sticky top-2 sm:top-4 z-40 my-2 sm:my-4 flex flex-col md:flex-row justify-between items-center py-3 px-3.5 sm:px-6 rounded-2xl sm:rounded-3xl bg-slate-900/85 backdrop-blur-2xl border border-white/15 shadow-2xl gap-3">
            {/* Top Row on Mobile: Logo on Left & Actions (Favorites + Lang) on Right */}
            <div className="flex items-center justify-between w-full md:w-auto">
              <div 
                onClick={handleResetFilters}
                className="text-xl sm:text-2xl font-black tracking-tighter flex items-center gap-2.5 cursor-pointer group select-none"
              >
                  <span className="w-9 sm:w-10 h-9 sm:h-10 rounded-xl sm:rounded-2xl bg-gradient-to-br from-orange-500 via-rose-500 to-amber-500 flex items-center justify-center shadow-lg shadow-orange-500/30 group-hover:scale-105 transition-transform shrink-0">
                      <svg className="w-5 sm:w-6 h-5 sm:w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                  </span>
                  <span className="font-black text-lg sm:text-2xl">
                    {t.appTitlePrefix}<span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-400">{t.appTitleSuffix}</span>
                  </span>
              </div>

              {/* Mobile Right Action Bar: Prominent Favorites + Language */}
              <div className="flex items-center gap-2 md:hidden">
                <button
                  type="button"
                  onClick={() => handleQuickFilter('Favorites')}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer border ${
                    activeTab === 'Favorites'
                      ? 'bg-rose-600 text-white border-rose-500 shadow-rose-600/40'
                      : 'bg-slate-800/90 text-rose-300 border-rose-500/30 hover:bg-rose-600/20'
                  }`}
                  aria-label="View Favorites"
                >
                  <span className="text-sm">❤️</span>
                  <span className="font-black bg-rose-500 text-white px-1.5 py-0.2 rounded-full text-[10px]">
                    {favorites.length}
                  </span>
                </button>

                <button 
                  onClick={toggleLanguage}
                  className="px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all border border-white/15 font-bold text-xs cursor-pointer shadow-md"
                  title="Switch Language (EN / हिंदी)"
                >
                  {language === 'en' ? '🇮🇳 HI' : '🇬🇧 EN'}
                </button>
              </div>
            </div>
            
            {/* Center Category Navigation Tabs */}
            <div className="flex items-center justify-between md:justify-center w-full md:w-auto gap-2 overflow-x-auto custom-scrollbar pb-1 md:pb-0">
               <nav className="flex items-center gap-1 sm:gap-1.5 text-xs sm:text-sm font-medium bg-slate-950/60 p-1 sm:p-1.5 rounded-2xl border border-white/10 shrink-0 mx-auto md:mx-0">
                  {['Popular', 'Indian', 'Vegetarian', 'Spicy', 'Dessert'].map((tab) => {
                    return (
                      <button
                        key={tab}
                        onClick={() => handleQuickFilter(tab)}
                        className={`inline-flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 rounded-xl transition-all duration-300 cursor-pointer min-h-[32px] sm:min-h-[36px] ${
                          activeTab === tab 
                            ? 'bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow-md shadow-orange-500/30 font-bold scale-[1.02]' 
                            : 'text-gray-400 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        <span className="whitespace-nowrap">{t[`nav${tab}`]}</span>
                      </button>
                    );
                  })}
              </nav>
            </div>

            {/* Desktop Action Bar on Right: Dedicated Favorites Button + Language */}
            <div className="hidden md:flex items-center gap-3">
              <button
                type="button"
                onClick={() => handleQuickFilter('Favorites')}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold transition-all duration-300 shadow-lg cursor-pointer border hover:scale-105 ${
                  activeTab === 'Favorites'
                    ? 'bg-rose-600 text-white border-rose-500 shadow-rose-600/40'
                    : 'bg-rose-500/15 text-rose-300 border-rose-500/30 hover:bg-rose-500/25'
                }`}
                title="View Favorites"
              >
                <span>❤️</span>
                <span>{t.navFavorites}</span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-black shadow-sm ${
                  activeTab === 'Favorites' ? 'bg-white text-rose-600' : 'bg-rose-500 text-white'
                }`}>
                  {favorites.length}
                </span>
              </button>

              <button 
                onClick={toggleLanguage}
                className="w-10 h-10 rounded-2xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all border border-white/15 font-extrabold text-xs cursor-pointer shadow-md hover:scale-105"
                title="Switch Language (EN / हिंदी)"
              >
                {language === 'en' ? '🇮🇳 HI' : '🇬🇧 EN'}
              </button>
            </div>
        </header>

        {/* Hero Section (Hidden when on Favorites tab to give full focus to saved dishes) */}
        {activeTab !== 'Favorites' && (
          <div className="text-center mb-6 sm:mb-8 pt-4 sm:pt-10">
            <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1 sm:py-1.5 rounded-full text-[11px] sm:text-xs md:text-sm font-semibold bg-orange-500/10 text-orange-300 border border-orange-500/25 mb-4 sm:mb-6 backdrop-blur-md">
              <span>✨</span>
              <span className="truncate max-w-[280px] sm:max-w-none">{t.appSubtitle}</span>
            </div>

            <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black mb-4 sm:mb-6 tracking-tight leading-[1.08] sm:leading-[1.02]">
              {t.heroTitle} <br />
              <span className="bg-gradient-to-r from-orange-400 via-rose-500 to-amber-400 bg-clip-text text-transparent">
                {t.heroTitleSpan}
              </span>
            </h1>
            <p className="text-xs sm:text-base md:text-lg text-gray-400 max-w-3xl mx-auto font-light leading-relaxed mb-6 sm:mb-8 px-2">
              {t.heroSubtitle}
            </p>

            {/* Highlights Bar */}
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 md:gap-8 text-xs sm:text-sm text-gray-300">
              <div className="flex items-center gap-1.5 sm:gap-2 bg-slate-900/60 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl sm:rounded-2xl border border-white/10 backdrop-blur-md">
                <span className="text-sm sm:text-base">🍳</span>
                <span className="font-bold text-white text-[11px] sm:text-xs md:text-sm">{t.statRecipes}</span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2 bg-slate-900/60 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl sm:rounded-2xl border border-white/10 backdrop-blur-md">
                <span className="text-sm sm:text-base">🌎</span>
                <span className="font-bold text-white text-[11px] sm:text-xs md:text-sm">{t.statCuisines}</span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2 bg-slate-900/60 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl sm:rounded-2xl border border-white/10 backdrop-blur-md">
                <span className="text-sm sm:text-base">⚡</span>
                <span className="font-bold text-white text-[11px] sm:text-xs md:text-sm">{t.statFree}</span>
              </div>
            </div>
          </div>
        )}

        {/* Search Bar & Filters (Hidden when viewing Favorites) */}
        {activeTab !== 'Favorites' ? (
          <>
            <SearchBar 
              onSearch={handleSearch} 
              onSurpriseMe={handleSurpriseMe}
              isSurpriseLoading={isSurpriseLoading}
            />

            <CategoryFilter
              selectedCuisine={selectedCuisine}
              onSelectCuisine={handleCuisineSelect}
              selectedCategory={selectedCategory}
              onSelectCategory={handleCategorySelect}
              filterView={filterView}
              setFilterView={setFilterView}
            />
          </>
        ) : (
          /* Favorites Header Banner */
          <div className="pt-4 sm:pt-8 pb-4 mb-6 sm:mb-8 text-center border-b border-white/10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-500/15 text-rose-300 border border-rose-500/30 text-xs sm:text-sm font-bold mb-3 shadow-lg">
              <span>❤️</span>
              <span>{t.navFavorites} ({favorites.length})</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-white mb-2">
              Your Favorite Recipes
            </h2>
            <p className="text-xs sm:text-sm text-gray-400 max-w-md mx-auto">
              All your hand-picked recipes saved locally on your device for instant cooking access anytime.
            </p>
          </div>
        )}

        {/* Active Filter Info & Results Count */}
        <div className="flex items-center justify-between gap-3 mb-6 sm:mb-8 px-1">
          <div className="text-xs sm:text-sm text-gray-400 flex items-center gap-1.5 sm:gap-2">
            <span>{t.showingRecipes}</span>
            <span className="font-bold text-white bg-slate-800 px-2 sm:px-2.5 py-0.5 rounded-md sm:rounded-lg border border-white/10 text-xs sm:text-sm">
              {recipes.length}
            </span>
            <span>{t.recipesCount}</span>
          </div>

          {(selectedCuisine !== 'All' || selectedCategory !== 'All' || activeTab !== 'Popular') && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1 sm:gap-1.5 text-xs text-orange-400 hover:text-orange-300 font-semibold bg-orange-500/10 hover:bg-orange-500/20 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl border border-orange-500/30 transition-colors cursor-pointer min-h-[32px]"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>{t.resetFilters}</span>
            </button>
          )}
        </div>

        {/* Recipe Cards Grid */}
        {loading && !selectedRecipe ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {[...Array(8)].map((_, i) => (
                <div key={i} className="h-[360px] sm:h-[390px] md:h-[420px] rounded-3xl bg-slate-900/60 animate-pulse border border-white/10" />
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-16 sm:py-24 flex flex-col items-center bg-slate-900/40 rounded-3xl border border-white/10 p-6 sm:p-8 my-6">
            <div className={`w-16 sm:w-20 h-16 sm:h-20 mb-4 sm:mb-5 rounded-full flex items-center justify-center ${error === 'noFavoritesDesc' ? 'bg-rose-500/10 text-rose-500' : 'bg-white/5 text-gray-500'}`}>
              {error === 'noFavoritesDesc' ? (
                <svg className="w-8 sm:w-10 h-8 sm:h-10 fill-current" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-8 sm:w-10 h-8 sm:h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">{error === 'noFavoritesDesc' ? t.noFavorites : t.noResults}</h3>
            <p className="text-gray-400 max-w-md mx-auto text-xs sm:text-sm mb-5 sm:mb-6">{t[error] || error}</p>
            <button
              type="button"
              onClick={handleResetFilters}
              className="px-6 py-2.5 bg-gradient-to-r from-orange-500 to-amber-600 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-lg shadow-orange-500/30 hover:scale-105 transition-transform cursor-pointer"
            >
              {error === 'noFavoritesDesc' ? '✨ Explore Recipes' : t.resetFilters}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {recipes.map((recipe) => (
              <RecipeCard 
                key={recipe.idMeal} 
                recipe={recipe} 
                onClick={handleRecipeClick}
                isFavorite={isFavorite(recipe.idMeal)}
                onToggleFavorite={toggleFavorite}
              />
            ))}
          </div>
        )}

        {/* Footer */}
        <footer className="mt-20 sm:mt-32 pb-6 sm:pb-8 text-center text-gray-500 text-xs sm:text-sm">
          <p>
            {t.footerDist} <span className="text-white font-medium">CodesRahul</span> • <a href="https://www.codesrahul.xyz" target="_blank" rel="noopener noreferrer" className="hover:text-orange-400 transition-colors">www.codesrahul.xyz</a>
          </p>
        </footer>
      </div>

      {/* Modal with Suspense */}
      <Suspense fallback={
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md">
          <div className="w-10 sm:w-12 h-10 sm:h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      }>
        {selectedRecipe && (
          <RecipeModal 
            recipe={selectedRecipe} 
            onClose={handleCloseModal}
            isFavorite={isFavorite(selectedRecipe.idMeal)}
            onToggleFavorite={toggleFavorite}
            onShowToast={showToast}
          />
        )}
      </Suspense>

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}

export default App;
