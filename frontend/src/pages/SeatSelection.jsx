import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import './SeatSelection.css';

const SeatSelection = () => {
  const { showId } = useParams();
  const navigate = useNavigate();
  const [seats, setSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds

  useEffect(() => {
    if (timeLeft <= 0) {
      alert("Session expired. Please start again.");
      navigate(`/movie/${showId}`); // Ideally redirect back to details
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  useEffect(() => {
    const fetchSeats = async () => {
      try {
        const res = await api.get(`bookings/seats/${showId}/`);
        if (res.data) {
          setSeats(res.data);
        }
      } catch (err) {
        console.error("Failed to fetch seats", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSeats();
  }, [showId]);

  const toggleSeat = (seat) => {
    if (!seat.is_available) return;

    const isSelected = selectedSeats.some(s => s.id === seat.id);
    if (isSelected) {
      setSelectedSeats(selectedSeats.filter(s => s.id !== seat.id));
    } else {
      setSelectedSeats([...selectedSeats, seat]);
    }
  };

  const handleCheckout = () => {
    if (selectedSeats.length === 0) return;
    // Pass selected seats via local storage or state management. Using sessionStorage for simplicity.
    sessionStorage.setItem('booking_data', JSON.stringify({ showId, selectedSeats }));
    navigate('/checkout');
  };

  if (loading) return <div className="container loading"><div className="spinner"></div></div>;

  return (
    <div className="seat-selection-page animate-fade-in container">
      <div className="seat-selection-header">
        <button className="back-btn" onClick={() => navigate(-1)}>&larr; Back</button>
        <div className="timer-box glass">
            <span>Time Left: </span>
            <span className={`timer-val ${timeLeft < 60 ? 'urgent' : ''}`}>{formatTime(timeLeft)}</span>
        </div>
      </div>

      <div className="screen-container glass">
        <div className="screen-curve"></div>
        <span className="screen-text">All eyes this way</span>
      </div>

      <div className="seat-legend">
        <div className="legend-item">
          <div className="seat available"></div> <span>Available</span>
        </div>
        <div className="legend-item">
          <div className="seat selected"></div> <span>Selected</span>
        </div>
        <div className="legend-item">
          <div className="seat booked"></div> <span>Booked</span>
        </div>
      </div>

      <div className="seats-grid">
        {seats.map(seat => {
          const isSelected = selectedSeats.some(s => s.id === seat.id);
          const cName = `seat ${!seat.is_available ? 'booked' : isSelected ? 'selected' : 'available'} ${seat.seat_type === 'VIP' ? 'vip' : ''}`;
          
          return (
            <div 
              key={seat.id} 
              className={cName}
              onClick={() => toggleSeat(seat)}
              title={`${seat.seat_number} - ${seat.seat_type}`}
            >
              <span className="seat-label">{seat.seat_number}</span>
            </div>
          );
        })}
      </div>

      <div className={`booking-bar glass ${selectedSeats.length > 0 ? 'visible' : ''}`}>
        <div className="selection-info">
          <span>{selectedSeats.length} seat(s) selected</span>
        </div>
        <button className="btn-primary" onClick={handleCheckout}>
          Proceed to Checkout
        </button>
      </div>
    </div>
  );
};

export default SeatSelection;
