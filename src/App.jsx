import { useState, useEffect, lazy, Suspense } from 'react';
import { searchRecipes, getIndianRecipes, getRecipeById, getVegetarianIndian, getSpicyIndian } from './services/api';
import SearchBar from './components/SearchBar';
import RecipeCard from './components/RecipeCard';
import { useLanguage } from './context/LanguageContext';

// Lazy load the modal
const RecipeModal = lazy(() => import('./components/RecipeModal'));

function App() {
  const [recipes, setRecipes] = useState([]);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('Popular');
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

  useEffect(() => {
    localStorage.setItem('favorites', JSON.stringify(favorites));
  }, [favorites]);

  const toggleFavorite = (recipe) => {
    setFavorites(prev => {
      const exists = prev.find(f => f.idMeal === recipe.idMeal);
      if (exists) {
        return prev.filter(f => f.idMeal !== recipe.idMeal);
      } else {
        return [...prev, recipe];
      }
    });
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const initialRecipes = await getIndianRecipes();
        setRecipes(initialRecipes);
      } catch {
        setError('errorLoad');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []); // Remove 't' dependency as we use keys now

  const handleSearch = async (query) => {
    setLoading(true);
    setActiveTab('Search');
    try {
      if (!query.trim()) {
        const initialRecipes = await getIndianRecipes();
        setRecipes(initialRecipes);
        return;
      }

      const data = await searchRecipes(query);
      const indianRecipes = data.filter(r => r.strArea === 'Indian');
      
      setRecipes(indianRecipes);
      if (indianRecipes.length === 0) setError('noResultsDesc'); // Use key
      else setError(null);
    } catch {
      setError('errorSearch');
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
        data = await getIndianRecipes();
      } else if (type === 'Vegetarian') {
        data = await getVegetarianIndian();
      } else if (type === 'Spicy') {
        data = await getSpicyIndian();
      }
      setRecipes(data);
      if (data.length === 0) setError('noResultsDesc');
    } catch {
      setError('errorFilter');
    } finally {
      setLoading(false);
    }
  };

  const handleRecipeClick = async (recipe) => {
    if (!recipe.strInstructions) {
      const fullRecipe = await getRecipeById(recipe.idMeal);
      setSelectedRecipe(fullRecipe);
    } else {
      setSelectedRecipe(recipe);
    }
  };

  // Check if a recipe is favorited
  const isFavorite = (id) => favorites.some(f => f.idMeal === id);

  return (
    <div className="min-h-screen relative bg-dark-bg text-white overflow-hidden pb-32">
      {/* Dynamic Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[60vw] h-[60vw] bg-primary-600/20 rounded-full blur-[120px] mix-blend-screen animate-float" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] bg-orange-600/10 rounded-full blur-[100px] mix-blend-screen animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute top-[40%] left-[30%] w-[30vw] h-[30vw] bg-yellow-600/10 rounded-full blur-[80px] mix-blend-screen animate-float" style={{ animationDelay: '4s' }} />
      </div>

      <div className="relative z-10 max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Navigation / Header */}
        <header className="flex flex-col md:flex-row justify-between items-center py-6 mb-8 gap-4">
            <div className="text-2xl font-black tracking-tighter flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-linear-to-br from-orange-500 to-red-600 flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                </span>
                <span>{t.appTitlePrefix}<span className="text-orange-400">{t.appTitleSuffix}</span></span>
            </div>
            
            <div className="flex items-center gap-4">
               <nav className="flex gap-2 md:gap-4 text-sm font-medium bg-white/5 p-1 rounded-full backdrop-blur-md border border-white/10">
                  {['Popular', 'Vegetarian', 'Spicy', 'Favorites'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => handleQuickFilter(tab)}
                      className={`px-3 py-2 rounded-full transition-all duration-300 ${
                        activeTab === tab 
                          ? 'bg-orange-600 text-white shadow-lg shadow-orange-500/30' 
                          : 'text-gray-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      {t[`nav${tab}`]}
                    </button>
                  ))}
              </nav>

              <button 
                onClick={toggleLanguage}
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors border border-white/10 font-bold"
                title="Switch Language"
              >
                {language === 'en' ? 'HI' : 'EN'}
              </button>
            </div>
        </header>

        {/* Huge Hero */}
        <div className="text-center mb-20 pt-10">
          <h1 className="text-6xl md:text-8xl font-black mb-8 tracking-tighter leading-[0.9]">
            {t.heroTitle} <br />
            <span className="text-gradient from-orange-400 via-red-500 to-yellow-500">{t.heroTitleSpan}</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-400 max-w-2xl mx-auto font-light leading-relaxed">
            {t.heroSubtitle}
          </p>
        </div>

        {/* Search Only */}
        <SearchBar onSearch={handleSearch} />

        {/* Grid Content */}
        {loading && !selectedRecipe ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[...Array(8)].map((_, i) => (
                <div key={i} className="h-96 rounded-3xl bg-white/5 animate-pulse border border-white/5" />
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-32 flex flex-col items-center">
            <div className="w-24 h-24 mb-6 rounded-full bg-white/5 flex items-center justify-center">
                 <svg className="w-12 h-12 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            </div>
            <h3 className="text-3xl font-bold text-white mb-2">{error === 'noFavoritesDesc' ? t.noFavorites : t.noResults}</h3>
            <p className="text-gray-400 max-w-md mx-auto">{t[error] || error}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
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
        <footer className="mt-32 pb-8 text-center text-gray-500 text-sm">
          <p>
            {t.footerDist} <span className="text-white font-medium">CodesRahul</span> • <a href="https://www.codesrahul.xyz" target="_blank" rel="noopener noreferrer" className="hover:text-orange-400 transition-colors">www.codesrahul.xyz</a>
          </p>
        </footer>
      </div>

      {/* Modal with Suspense */}
      <Suspense fallback={
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      }>
        {selectedRecipe && (
          <RecipeModal 
            recipe={selectedRecipe} 
            onClose={() => setSelectedRecipe(null)}
            isFavorite={isFavorite(selectedRecipe.idMeal)}
            onToggleFavorite={toggleFavorite}
          />
        )}
      </Suspense>
    </div>
  );
}

export default App;
