import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import './Checkout.css';
import { CreditCard, CheckCircle, Clock } from 'lucide-react';

const Checkout = () => {
  const navigate = useNavigate();
  const [bookingData, setBookingData] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [totalAmount, setTotalAmount] = useState(0);
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds
  const [foodItems, setFoodItems] = useState([]);
  const [selectedFood, setSelectedFood] = useState({}); // { id: quantity }

  useEffect(() => {
    const fetchFood = async () => {
      try {
        const res = await api.get('bookings/food/');
        setFoodItems(res.data);
      } catch (err) {
        console.error("Failed to fetch food", err);
      }
    };
    fetchFood();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  useEffect(() => {
    const data = sessionStorage.getItem('booking_data');
    if (data) {
      const parsedData = JSON.parse(data);
      setBookingData(parsedData);
    } else {
      navigate('/');
    }
  }, [navigate]);

  const ticketTotal = bookingData ? bookingData.selectedSeats.length * 250 : 0;
  const foodTotal = Object.entries(selectedFood).reduce((total, [id, qty]) => {
    const item = foodItems.find(fi => fi.id === parseInt(id));
    return total + (item ? item.price * qty : 0);
  }, 0);
  const subtotal = ticketTotal + foodTotal;
  const convFee = subtotal * 0.1;
  const total = subtotal + convFee;

  const handlePayment = async (simulateSuccess = true) => {
    setProcessing(true);
    
    try {
      // 1. Initiate booking session
      const foodPayload = Object.entries(selectedFood)
        .filter(([_, qty]) => qty > 0)
        .map(([id, quantity]) => ({ id: parseInt(id), quantity }));

      const createRes = await api.post('bookings/create/', {
        show: bookingData.showId,
        seats: bookingData.selectedSeats.map(s => s.id),
        coupon_code: couponCode,
        food_items: foodPayload
      });
      
      const ticketId = createRes.data.ticket_id;

      // 2. Simulate User Payment interaction delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      // 3. Verify Payment
      await api.post('bookings/payment/verify/', {
        booking_id: ticketId,
        payment_token: simulateSuccess ? 'sandbox-success-token' : 'sandbox-fail-token'
      });
      
      setSuccess(true);
      sessionStorage.removeItem('booking_data');
    } catch (err) {
      console.error(err);
      if (err.response && err.response.data.detail) {
        alert(`Booking Error: ${err.response.data.detail}`);
      } else {
        alert("Payment gateway failed. Please try again or ensure you are logged in.");
      }
    } finally {
      setProcessing(false);
    }
  };

  if (!bookingData) return null;

  if (success) {
    return (
      <div className="checkout-page animate-fade-in container success-view">
        <CheckCircle size={80} className="success-icon" />
        <h2>Booking Confirmed!</h2>
        <p>Your tickets have been successfully booked. Have a great time!</p>
        <button className="btn-primary" onClick={() => navigate('/')}>
          Return to Home
        </button>
      </div>
    );
  }

  return (
    <div className="checkout-page container animate-fade-in">
      <div className="timer-banner glass">
        <Clock size={16} />
        <span>Seats are locked for <strong>{formatTime(timeLeft)}</strong>. Finish payment before timer ends!</span>
      </div>

      <div className="checkout-grid">
        <div className="order-summary-container">
          <div className="order-summary glass">
            <h2>Order Summary</h2>
            <div className="summary-details">
              <div className="summary-row">
                <span>Tickets ({bookingData.selectedSeats.length})</span>
                <span>₹{ticketTotal}</span>
              </div>
              {foodTotal > 0 && (
                <div className="summary-row text-success">
                    <span>Food & Snacks</span>
                    <span>₹{foodTotal}</span>
                </div>
              )}
              <div className="summary-row">
                <span>Convenience Fee</span>
                <span>₹{convFee.toFixed(2)}</span>
              </div>
              <div className="divider"></div>
              <div className="summary-row total">
                <span>Total Amount</span>
                <span>₹{total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="food-selection glass" style={{ marginTop: '1.5rem' }}>
            <h3>Hungry? Add some snacks!</h3>
            <div className="food-list">
              {foodItems.map(item => (
                <div key={item.id} className="food-item-row">
                  <div className="food-info">
                    <img src={item.image_url || 'https://via.placeholder.com/50'} alt={item.name} />
                    <div>
                        <p className="food-name">{item.name}</p>
                        <p className="food-price">₹{item.price}</p>
                    </div>
                  </div>
                  <div className="food-actions">
                    <button onClick={() => setSelectedFood({ ...selectedFood, [item.id]: Math.max(0, (selectedFood[item.id] || 0) - 1) })}>-</button>
                    <span>{selectedFood[item.id] || 0}</span>
                    <button onClick={() => setSelectedFood({ ...selectedFood, [item.id]: (selectedFood[item.id] || 0) + 1 })}>+</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
            
            <div className="coupon-box glass" style={{ marginTop: '1.5rem', padding: '1rem', borderRadius: '12px' }}>
              <p style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>Have a coupon?</p>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input 
                  type="text" 
                  placeholder="Enter code" 
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="glass-input"
                  style={{ flex: 1, padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border)', background: 'rgba(0,0,0,0.2)', color: 'white' }}
                />
              </div>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>Try "WELCOME10" for 10% off!</p>
        
        <div className="payment-section glass">
          <h2>Payment Details</h2>
          <p className="subtitle">MVP Simulation - Test both scenarios</p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <button 
              className={`btn-primary pay-btn ${processing ? 'processing' : ''}`} 
              onClick={() => handlePayment(true)}
              disabled={processing}
            >
              {processing ? (
                <span className="btn-content">
                  <span className="spinner-small"></span> Processing...
                </span>
              ) : (
                <span className="btn-content">
                  <CreditCard size={20} /> Simulate Successful Payment
                </span>
              )}
            </button>

            <button 
              className="btn-outline pay-btn"
              onClick={() => handlePayment(false)}
              disabled={processing}
              style={{ borderColor: 'var(--primary)', color: 'var(--primary)' }}
            >
              <span className="btn-content">Simulate Failed Payment</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
