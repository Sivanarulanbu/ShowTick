import React from 'react';
import './FilterSidebar.css';
import { ChevronDown } from 'lucide-react';

const FilterSidebar = ({ languageFilter, setLanguageFilter, genreFilter, setGenreFilter }) => {
  const languages = ['Hindi', 'English', 'Tamil', 'Telugu', 'Malayalam', 'Kannada', 'Marathi', 'Punjabi'];
  const genres = ['Action', 'Drama', 'Sci-Fi', 'Comedy', 'Romantic', 'Horror', 'Thriller'];

  return (
    <aside className="filter-sidebar glass">
      <h2 className="sidebar-title">Filters</h2>
      
      <div className="filter-group">
        <div className="filter-header">
          <span>Languages</span>
          <ChevronDown size={16} />
        </div>
        <div className="filter-options">
          {languages.map(lang => (
            <button 
              key={lang} 
              className={`filter-tag ${languageFilter === lang ? 'active' : ''}`}
              onClick={() => setLanguageFilter(languageFilter === lang ? '' : lang)}
            >
              {lang}
            </button>
          ))}
        </div>
      </div>

      <div className="filter-group">
        <div className="filter-header">
          <span>Genres</span>
          <ChevronDown size={16} />
        </div>
        <div className="filter-options">
          {genres.map(genre => (
            <button 
              key={genre} 
              className={`filter-tag ${genreFilter === genre ? 'active' : ''}`}
              onClick={() => setGenreFilter(genreFilter === genre ? '' : genre)}
            >
              {genre}
            </button>
          ))}
        </div>
      </div>

      <button className="browse-cinemas-btn btn-outline" style={{width: '100%', marginTop: '1rem'}}>
        Browse by Cinemas
      </button>
    </aside>
  );
};

export default FilterSidebar;
