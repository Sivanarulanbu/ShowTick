import React from 'react';
import { Link } from 'react-router-dom';
import { Play } from 'lucide-react';
import './MovieCard.css';

const MovieCard = ({ movie }) => {
  return (
    <Link to={`/movie/${movie.id}`} className="movie-card glass">
      <div className="poster-wrapper">
        <img src={movie.poster_image || movie.poster_url || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400'} alt={movie.title} />
        <div className="poster-overlay">
          <button className="book-btn"><Play size={16} /> Book Now</button>
        </div>
      </div>
      <div className="movie-info">
        <h3>{movie.title}</h3>
        <div className="movie-meta">
          <span className="lang">{movie.language}</span>
          <span className="duration">{movie.duration} min</span>
        </div>
      </div>
    </Link>
  );
};

export default MovieCard;
