import React, { useEffect, useState, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import './MovieDetails.css';
import { Calendar, Clock, MapPin, Star, Play, Share2, Heart, X } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const MovieDetails = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const [movie, setMovie] = useState(null);
  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewData, setReviewData] = useState({ rating: 5, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [isWatchlisted, setIsWatchlisted] = useState(false);
  const [showTrailer, setShowTrailer] = useState(false);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const mvRes = await api.get(`movies/${id}/`);
        setMovie(mvRes.data);
        
        const shRes = await api.get(`bookings/shows/?movie=${id}`);
        if (shRes.data) {
          setShows(shRes.data);
        }

        if (user) {
          const wlRes = await api.get(`movies/watchlist/`);
          setIsWatchlisted(wlRes.data.some(item => item.movie === parseInt(id)));
        }
      } catch (err) {
        console.error("Error fetching detail", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id, user]);

  const toggleWatchlist = async () => {
    if (!user) return alert("Please login to add to wishlist");
    try {
      if (isWatchlisted) {
        // Find the watchlist item ID to delete
        const wlRes = await api.get(`movies/watchlist/`);
        const item = wlRes.data.find(i => i.movie === parseInt(id));
        if (item) {
          await api.delete(`movies/watchlist/${item.id}/`);
          setIsWatchlisted(false);
        }
      } else {
        await api.post(`movies/watchlist/`, { movie: id });
        setIsWatchlisted(true);
      }
    } catch (err) {
      console.error("Failed to toggle watchlist", err);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!user) return alert("Please login to review");
    setSubmittingReview(true);
    try {
      await api.post('movies/reviews/', { ...reviewData, movie: id });
      alert("Review submitted!");
      setReviewData({ rating: 5, comment: '' });
      const mvRes = await api.get(`movies/${id}/`);
      setMovie(mvRes.data);
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to submit review");
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading || !movie) return <div className="container loading"><div className="spinner"></div></div>;

  return (
    <div className="movie-details-page animate-fade-in">
      <div className="movie-hero-section" style={{ backgroundImage: `url(${movie.poster_image || movie.poster_url})` }}>
        <div className="hero-overlay"></div>
        <div className="container hero-container">
          <div className="movie-poster-box glass">
            <img src={movie.poster_image || movie.poster_url} alt={movie.title} />
            <div className="in-cinemas-tag">In cinemas</div>
            <div className="trailer-btn" onClick={() => setShowTrailer(true)}>
                <Play size={16} fill="white" /> 
                <span>Trailers (1)</span>
            </div>
          </div>

          <div className="movie-details-box">
            <div className="title-share">
                <h1 className="movie-title">{movie.title}</h1>
                <div className="action-buttons-row">
                    <button 
                        className={`share-btn-glass glass ${isWatchlisted ? 'active' : ''}`} 
                        onClick={toggleWatchlist}
                        title={isWatchlisted ? "Remove from wishlist" : "Add to wishlist"}
                    >
                        <Heart size={20} fill={isWatchlisted ? "var(--primary)" : "none"} color={isWatchlisted ? "var(--primary)" : "currentColor"} />
                    </button>
                    <button className="share-btn-glass glass"><Share2 size={20} /></button>
                </div>
            </div>

            <div className="rating-bar-bms glass">
                <div className="rating-left">
                    <Star size={24} fill="var(--primary)" color="var(--primary)" />
                    <span className="rating-val">{movie.avg_rating}/10</span>
                    <span className="votes">(18.9K+ Votes)</span>
                </div>
                <button className="rate-now-btn">Rate now</button>
            </div>

            <div className="movie-meta-line">
              <span>{Math.floor(movie.duration / 60)}h {movie.duration % 60}m</span>
              <span className="dot">•</span>
              <span>{movie.genre}</span>
              <span className="dot">•</span>
              <span>UA13+</span>
              <span className="dot">•</span>
              <span>10 Apr, 2026</span>
            </div>

            <div className="format-badges">
                <span className="badge-outline">2D</span>
                <span className="badge-outline">{movie.language}</span>
            </div>

            <Link to={`/book/${shows[0]?.id || ''}`} className="btn-primary main-book-btn">
                Book tickets
            </Link>
          </div>
        </div>
      </div>

      <div className="container movie-content-grid">
        <div className="shows-section">
          <h2>About the movie</h2>
          <p className="description">{movie.description}</p>
          
          <div className="divider" style={{margin: '3rem 0'}}></div>
          
          <h2>Available Shows</h2>
          {shows.length === 0 ? (
            <div className="empty-state glass">
              <p>No shows available currently.</p>
            </div>
          ) : (
            <div className="shows-list-bms">
              {Object.entries(
                shows.reduce((acc, show) => {
                  const key = `${show.screen?.theatre?.name} - ${show.screen?.theatre?.city}`;
                  if (!acc[key]) acc[key] = [];
                  acc[key].push(show);
                  return acc;
                }, {})
              ).map(([theatreKey, theatreShows]) => (
                <div key={theatreKey} className="theatre-row-bms glass">
                  <div className="theatre-info-side">
                    <Heart size={16} className="heart-icon" />
                    <div className="theatre-meta">
                      <h4>{theatreKey}</h4>
                      <div className="theatre-tags">
                        <span><MapPin size={10} /> INFO</span>
                        <span className="cancellation-tag">Non-cancellable</span>
                      </div>
                    </div>
                  </div>
                  <div className="showtimes-grid-bms">
                    {theatreShows.map(show => (
                      <Link key={show.id} to={`/book/${show.id}`} className="showtime-btn-bms">
                        <div className="time-val">
                          {new Date(show.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                        <div className="format-val">4K DOLBY 7.1</div>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="reviews-section">
          <h2>Reviews</h2>
          {user ? (
            <form className="review-form glass" onSubmit={handleReviewSubmit}>
              <h4>Review this movie</h4>
              <div className="rating-input">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(star => (
                   <span 
                    key={star} 
                    className={`star-dot ${star <= reviewData.rating ? 'active' : ''}`}
                    onClick={() => setReviewData({...reviewData, rating: star})}
                   ></span>
                ))}
                <span className="rating-display">{reviewData.rating}/10</span>
              </div>
              <textarea 
                placeholder="Share your experience..."
                value={reviewData.comment}
                onChange={e => setReviewData({...reviewData, comment: e.target.value})}
                required
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button className="btn-primary" type="submit" disabled={submittingReview} style={{ padding: '0.8rem 2rem' }}>
                  {submittingReview ? "Posting..." : "Post Review"}
                </button>
              </div>
            </form>
          ) : (
            <div className="glass" style={{
              borderRadius: '16px', 
              marginBottom: '2rem',
              padding: '2rem',
              textAlign: 'center',
              background: 'linear-gradient(145deg, rgba(255,255,255,0.05), rgba(0,0,0,0.2))',
              border: '1px solid rgba(255,255,255,0.1)'
            }}>
                <h4 style={{ marginBottom: '0.75rem', fontSize: '1.2rem' }}>Share Your Thoughts</h4>
                <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.95rem' }}>Join the community to rate and review this movie.</p>
                <Link to="/" className="btn-primary" style={{ display: 'inline-block' }}>Sign In to Review</Link>
            </div>
          )}

          <div className="reviews-list">
            {movie.reviews && movie.reviews.map(review => (
              <div key={review.id} className="review-card glass">
                 <div className="review-head">
                    <strong>{review.user.email.split('@')[0]}</strong>
                    <span className="rev-rating"><Star size={12} fill="var(--primary)" /> {review.rating}/10</span>
                 </div>
                 <p>{review.comment}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      {showTrailer && movie.trailer_url && (
        <div className="trailer-modal-overlay" onClick={() => setShowTrailer(false)}>
            <div className="trailer-modal-content glass" onClick={e => e.stopPropagation()}>
                <button className="close-trailer" onClick={() => setShowTrailer(false)}><X size={30} /></button>
                <iframe 
                    width="100%" 
                    height="100%" 
                    src={movie.trailer_url.replace('watch?v=', 'embed/')} 
                    title="Movie Trailer" 
                    frameBorder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowFullScreen
                ></iframe>
            </div>
        </div>
      )}
    </div>
  );
};

export default MovieDetails;
