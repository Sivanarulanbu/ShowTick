import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import './ShowtimeSelection.css';
import { Heart, MapPin, ChevronLeft, Search, Info } from 'lucide-react';

const ShowtimeSelection = () => {
    const { movieId } = useParams();
    const navigate = useNavigate();
    const [movie, setMovie] = useState(null);
    const [shows, setShows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState(0); // Index of dates

    // Mock dates for the selector
    const dates = [
        { day: 'THU', date: '30', month: 'APR' },
        { day: 'FRI', date: '01', month: 'MAY' },
        { day: 'SAT', date: '02', month: 'MAY' },
        { day: 'SUN', date: '03', month: 'MAY' },
        { day: 'MON', date: '04', month: 'MAY' },
        { day: 'TUE', date: '05', month: 'MAY' },
        { day: 'WED', date: '06', month: 'MAY' },
    ];

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [mvRes, shRes] = await Promise.all([
                    api.get(`movies/${movieId}/`),
                    api.get(`bookings/shows/?movie=${movieId}`)
                ]);
                setMovie(mvRes.data);
                setShows(shRes.data);
            } catch (err) {
                console.error("Error fetching showtimes", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [movieId]);

    if (loading || !movie) return <div className="container loading"><div className="spinner"></div></div>;

    const groupedShows = shows.reduce((acc, show) => {
        const key = `${show.screen?.theatre?.name} | ${show.screen?.theatre?.city}`;
        if (!acc[key]) acc[key] = [];
        acc[key].push(show);
        return acc;
    }, {});

    return (
        <div className="showtime-selection-page animate-fade-in">
            {/* Header Section */}
            <div className="selection-page-header">
                <div className="container header-content">
                    <button className="back-link" onClick={() => navigate(-1)}>
                        <ChevronLeft size={24} />
                    </button>
                    <div className="movie-summary">
                        <h1>{movie.title} - ({movie.language || 'Tamil'})</h1>
                        <div className="meta-tags">
                            <span className="cert-tag">UA16+</span>
                            <span className="genre-tag">{movie.genre}</span>
                            <span className="runtime-tag">{Math.floor(movie.duration / 60)}h {movie.duration % 60}m</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Date and Filter Bar */}
            <div className="date-filter-bar">
                <div className="container bar-content">
                    <div className="date-selector">
                        {dates.map((d, i) => (
                            <div 
                                key={i} 
                                className={`date-item ${selectedDate === i ? 'active' : ''}`}
                                onClick={() => setSelectedDate(i)}
                            >
                                <span className="day">{d.day}</span>
                                <span className="date">{d.date}</span>
                                <span className="month">{d.month}</span>
                            </div>
                        ))}
                    </div>
                    <div className="filters-row">
                        <div className="filter-item">Tamil • 2D</div>
                        <div className="filter-item">Price Range</div>
                        <div className="filter-item">Show Timings</div>
                        <Search size={20} className="search-icon" />
                    </div>
                </div>
            </div>

            {/* Availability Legend */}
            <div className="legend-bar">
                <div className="container legend-content">
                    <div className="legend-item available"><span className="dot"></span> AVAILABLE</div>
                    <div className="legend-item fast-filling"><span className="dot"></span> FAST FILLING</div>
                </div>
            </div>

            {/* Theatres List */}
            <div className="container theatres-list">
                {Object.entries(groupedShows).map(([theatreKey, theatreShows]) => (
                    <div key={theatreKey} className="theatre-card-bms">
                        <div className="theatre-main-info">
                            <div className="theatre-name-section">
                                <Heart size={18} className="heart-icon" />
                                <div className="name-box">
                                    <h3>{theatreKey.split('|')[0]}</h3>
                                    <div className="theatre-sub-tags">
                                        <span><Info size={14} /> INFO</span>
                                        <span className="cancellation">Non-cancellable</span>
                                    </div>
                                </div>
                            </div>
                            <div className="showtimes-grid">
                                {theatreShows.map(show => (
                                    <Link key={show.id} to={`/book/${show.id}`} className="showtime-pill">
                                        <div className="time">{new Date(show.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                        <div className="format">4K DOLBY 7.1</div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
                
                {Object.keys(groupedShows).length === 0 && (
                    <div className="empty-shows">
                        <h3>No shows available for the selected date.</h3>
                        <p>Try selecting another date or movie.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ShowtimeSelection;
