import React from 'react';
import { Search, Filter, Tag } from 'lucide-react';

const DiscoveryBar = ({ searchTerm, setSearchTerm, languageFilter, setLanguageFilter, genreFilter, setGenreFilter }) => {
  return (
    <div className="discovery-bar">
      <h2>Now Showing</h2>
      <div className="filters glass">
        <div className="search-box">
          <Search size={18} className="text-muted" />
          <input 
            type="text" 
            placeholder="Search movies..." 
            value={searchTerm} 
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-box">
          <Filter size={18} className="text-muted" />
          <select 
            value={languageFilter} 
            onChange={e => setLanguageFilter(e.target.value)}
          >
            <option value="">All Languages</option>
            <option value="English">English</option>
            <option value="Hindi">Hindi</option>
            <option value="Tamil">Tamil</option>
          </select>
        </div>
        <div className="filter-box">
          <Tag size={18} className="text-muted" />
          <select 
            value={genreFilter} 
            onChange={e => setGenreFilter(e.target.value)}
          >
            <option value="">All Genres</option>
            <option value="Drama">Drama</option>
            <option value="Sci-Fi">Sci-Fi</option>
            <option value="Action">Action</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default DiscoveryBar;
