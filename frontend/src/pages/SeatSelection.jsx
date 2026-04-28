import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import './SeatSelection.css';

const SeatSelection = () => {
  const { showId } = useParams();
  const navigate = useNavigate();
  const [seats, setSeats] = useState([]);
  const [show, setShow] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds

  useEffect(() => {
    if (timeLeft <= 0) {
      alert("Session expired. Please start again.");
      navigate(-1);
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, navigate]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [seatsRes, showRes] = await Promise.all([
          api.get(`bookings/seats/${showId}/`),
          api.get(`bookings/shows/${showId}/`)
        ]);
        setSeats(seatsRes.data);
        setShow(showRes.data);
      } catch (err) {
        console.error("Failed to fetch selection data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
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
    sessionStorage.setItem('booking_data', JSON.stringify({ showId, selectedSeats }));
    navigate('/checkout');
  };

  if (loading || !show) return <div className="container loading"><div className="spinner"></div></div>;

  const seatsByRow = seats.reduce((acc, seat) => {
    const rowMatch = seat.seat_number.match(/^[A-Z]+/);
    const row = rowMatch ? rowMatch[0] : 'Other';
    if (!acc[row]) acc[row] = [];
    acc[row].push(seat);
    return acc;
  }, {});

  return (
    <div className="seat-selection-page animate-fade-in">
      <div className="selection-header-bms">
        <div className="header-top">
           <button className="back-btn-circle" onClick={() => navigate(-1)}>&larr;</button>
           <div className="header-info">
              <h1>{show.movie?.title}</h1>
              <p>{show.screen?.theatre?.name} | {new Date(show.start_time).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</p>
           </div>
           <div className="timer-badge">
              <span>{formatTime(timeLeft)}</span>
           </div>
        </div>
      </div>

      <div className="container selection-body">
        <div className="seats-container">
          {Object.keys(seatsByRow).sort().map(rowStr => {
             const rowSeats = seatsByRow[rowStr];
             rowSeats.sort((a, b) => {
                 const numA = parseInt(a.seat_number.replace(rowStr, '')) || 0;
                 const numB = parseInt(b.seat_number.replace(rowStr, '')) || 0;
                 return numA - numB;
             });

             return (
               <React.Fragment key={rowStr}>
                 {/* Mocked Price Category Headers */}
                 {rowStr === 'A' && <div className="price-category-label">₹180 ELITE</div>}
                 {rowStr === 'N' && <div className="price-category-label divider">₹180 ELITE</div>}
                 {rowStr === 'R' && <div className="price-category-label divider">₹120 NORMAL</div>}
                 {rowStr === 'V' && <div className="price-category-label divider">₹60 PREMIUM</div>}

                 <div className="seat-row-group">
                   <div className="row-label">{rowStr}</div>
                   <div className="row-seats">
                     {rowSeats.map(seat => {
                       const isSelected = selectedSeats.some(s => s.id === seat.id);
                       const cName = `seat ${!seat.is_available ? 'booked' : isSelected ? 'selected' : 'available'} ${seat.seat_type === 'VIP' ? 'vip' : ''}`;
                       
                       return (
                         <div 
                           key={seat.id} 
                           className={cName}
                           onClick={() => toggleSeat(seat)}
                           title={`${seat.seat_number} - ${seat.seat_type}`}
                         >
                           <span className="seat-number-label">{seat.seat_number.replace(rowStr, '')}</span>
                         </div>
                       );
                     })}
                   </div>
                 </div>
               </React.Fragment>
             );
          })}
        </div>

        <div className="screen-indicator">
           <div className="screen-bar"></div>
           <p>All eyes this way please</p>
        </div>

        <div className="seat-legend-bms">
          <div className="legend-item"><div className="seat available"></div> <span>Available</span></div>
          <div className="legend-item"><div className="seat selected"></div> <span>Selected</span></div>
          <div className="legend-item"><div className="seat booked"></div> <span>Sold</span></div>
        </div>
      </div>

      <div className={`booking-bar-bms ${selectedSeats.length > 0 ? 'visible' : ''}`}>
        <button className="pay-button" onClick={handleCheckout}>
           Pay ₹{selectedSeats.length * (show.price || 250)}
        </button>
      </div>
    </div>
  );
};

export default SeatSelection;
