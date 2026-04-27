import React, { useEffect, useState, useContext } from 'react';
import api from '../services/api';
import './Home.css';
import MovieCard from '../components/movies/MovieCard';
import FilterSidebar from '../components/movies/FilterSidebar';
import { AuthContext } from '../context/AuthContext';
import { ChevronRight } from 'lucide-react';

const Home = () => {
  const { city, searchTerm } = useContext(AuthContext);
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [languageFilter, setLanguageFilter] = useState('');
  const [genreFilter, setGenreFilter] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState(searchTerm);

  const quickLanguages = ['Hindi', 'English', 'Tamil', 'Telugu', 'Malayalam', 'Kannada'];

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    const fetchMovies = async () => {
      setLoading(true);
      try {
        let url = `movies/?city=${city}`;
        if (debouncedSearch) url += `&search=${debouncedSearch}`;
        if (languageFilter) url += `&language=${languageFilter}`;
        if (genreFilter) url += `&genre=${genreFilter}`;
        
        const response = await api.get(url);
        if (response.data) {
          setMovies(response.data);
        }
      } catch (err) {
        console.error("Failed to fetch movies", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMovies();
  }, [city, debouncedSearch, languageFilter, genreFilter]);

  if (loading) return <div className="container loading"><div className="spinner"></div></div>;

  const filteredMovies = movies; // Now handled by backend

  return (
    <div className="home-page animate-fade-in">
      <div className="hero-banner-carousel">
        <img src="https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&q=80&w=2000&h=400" alt="Stream Banner" />
      </div>

      <div className="container main-layout">
        <FilterSidebar 
          languageFilter={languageFilter} 
          setLanguageFilter={setLanguageFilter}
          genreFilter={genreFilter}
          setGenreFilter={setGenreFilter}
        />

        <div className="content-area">
          <div className="page-header">
            <h2>Movies In {city}</h2>
            <div className="quick-filters">
              {quickLanguages.map(lang => (
                <button 
                  key={lang} 
                  className={`chip ${languageFilter === lang ? 'active' : ''}`}
                  onClick={() => setLanguageFilter(languageFilter === lang ? '' : lang)}
                >
                  {lang}
                </button>
              ))}
            </div>
          </div>

          <div className="coming-soon-banner glass">
              <div className="banner-text">
                  <h3>Coming Soon</h3>
                  <p>Explore upcoming movies</p>
              </div>
              <ChevronRight size={24} />
          </div>

          <div className="movies-grid">
            {filteredMovies.map(movie => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
          
          {filteredMovies.length === 0 && (
            <div className="no-movies glass">
              <p>No movies found matching your filters in {city}.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
