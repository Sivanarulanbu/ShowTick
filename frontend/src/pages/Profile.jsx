import React, { useState, useEffect, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../services/api';
import './Profile.css';
import { LogIn, UserPlus, LogOut, Ticket, Download, CheckCircle, XCircle, Clock, TrendingUp } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const Profile = () => {
  const { user, login, logout } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [isVerifying, setIsVerifying] = useState(false);
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', phone: '', role: 'CUSTOMER', otp: ''
  });
  const [history, setHistory] = useState([]);
  const [adminStats, setAdminStats] = useState(null);
  const [watchlist, setWatchlist] = useState([]);

  useEffect(() => {
    if (user) {
      fetchHistory();
      if (user.role === 'ADMIN') {
        fetchAdminStats();
      }
      fetchWatchlist();
    }
  }, [user]);

  const fetchWatchlist = async () => {
    try {
      const res = await api.get('movies/watchlist/');
      setWatchlist(res.data);
    } catch {
      console.log('Failed to fetch watchlist');
    }
  };

  const fetchAdminStats = async () => {
    try {
      const res = await api.get('bookings/admin/stats/');
      setAdminStats(res.data);
    } catch {
      setAdminStats(null);
    }
  };

  const fetchHistory = async () => {
    try {
      const res = await api.get('bookings/history/');
      setHistory(res.data);
    } catch {
      console.log('Failed to fetch history');
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isLogin) {
        const res = await api.post('auth/login/', {
          email: formData.email,
          password: formData.password
        });
        const userInfo = res.data.user || { email: formData.email, name: formData.email.split('@')[0], role: 'CUSTOMER' };
        login(userInfo, res.data.access);
        
        // Redirect back or to home
        const origin = location.state?.from?.pathname || '/';
        navigate(origin);
      } else {
        await api.post('auth/register/', formData);
        setIsVerifying(true);
        // Do not switch to isLogin yet, wait for OTP
      }
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.email?.[0] || err.response?.data?.detail || 'Authentication error.';
      alert(msg);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    try {
        await api.post('auth/verify-otp/', {
            email: formData.email,
            otp: formData.otp
        });
        setIsVerifying(false);
        setIsLogin(true);
        alert('Account verified successfully! Please login.');
    } catch (err) {
        alert(err.response?.data?.detail || 'Invalid OTP. Please try again.');
    }
  };

  if (user) {
    return (
      <div className="profile-page container animate-fade-in">
        <div className="profile-card glass">
          <div className="profile-header">
            <div className="avatar">{(user.name || 'U').charAt(0).toUpperCase()}</div>
            <div>
              <h2>{user.name || 'User'}</h2>
              <p className="text-muted">{user.email}</p>
            </div>
          </div>
          
          <div className="profile-stats">
            <div className="stat-box">
              <Ticket className="text-primary" />
              <h3>{history.length}</h3>
              <p>Bookings</p>
            </div>
            <div className="stat-box">
              <UserPlus className="text-primary" />
              <h3>Active</h3>
              <p>Membership</p>
            </div>
          </div>

          {adminStats && (
            <div className="admin-insights glass" style={{ marginTop: '2rem', padding: '1.5rem', borderRadius: '16px' }}>
              <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.8rem' }}>
                <TrendingUp size={20} className="text-primary" /> Admin Insights
              </h3>
              <div className="insights-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
                <div className="insight-card" style={{ background: 'rgba(0,0,0,0.2)', padding: '1.2rem', borderRadius: '12px', border: '1px solid var(--border)', textAlign: 'center' }}>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Revenue</label>
                  <p className="val text-success" style={{ fontSize: '1.5rem', fontWeight: 'bold', marginTop: '0.5rem', color: '#10b981' }}>₹{adminStats.total_revenue}</p>
                </div>
                <div className="insight-card" style={{ background: 'rgba(0,0,0,0.2)', padding: '1.2rem', borderRadius: '12px', border: '1px solid var(--border)', textAlign: 'center' }}>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Confirmed Bookings</label>
                  <p className="val" style={{ fontSize: '1.5rem', fontWeight: 'bold', marginTop: '0.5rem' }}>{adminStats.total_bookings}</p>
                </div>
                <div className="insight-card" style={{ background: 'rgba(0,0,0,0.2)', padding: '1.2rem', borderRadius: '12px', border: '1px solid var(--border)', textAlign: 'center' }}>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Active Locks</label>
                  <p className="val text-warning" style={{ fontSize: '1.5rem', fontWeight: 'bold', marginTop: '0.5rem', color: '#f59e0b' }}>{adminStats.pending_bookings}</p>
                </div>
              </div>
              <h4 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Revenue by City</h4>
              <div className="city-stats-table" style={{ background: 'rgba(0,0,0,0.1)', borderRadius: '12px', border: '1px solid var(--border)', overflow: 'hidden' }}>
                {adminStats.city_stats.map((s, idx) => (
                  <div key={s.city} className="city-row" style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem 1.2rem', borderBottom: idx === adminStats.city_stats.length - 1 ? 'none' : '1px solid var(--border)', fontSize: '0.95rem' }}>
                    <span style={{ textTransform: 'capitalize' }}>{s.city}</span>
                    <span className="revenue" style={{ fontWeight: '600', color: '#10b981' }}>₹{s.revenue}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="profile-section">
            <h3>Your Watchlist ({watchlist.length})</h3>
            {watchlist.length === 0 ? (
              <p className="text-muted">Your watchlist is empty.</p>
            ) : (
              <div className="watchlist-grid">
                {watchlist.map(item => (
                  <div key={item.id} className="watchlist-card glass" onClick={() => navigate(`/movie/${item.movie}`)}>
                    <img src={item.movie_details.poster_url} alt={item.movie_details.title} />
                    <div className="watchlist-overlay">
                        <span>{item.movie_details.title}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="booking-history profile-section">
            <h3>Recent Tickets</h3>
            {history.length === 0 ? (
              <p className="text-muted">No bookings found.</p>
            ) : (
              <div className="history-list">
                {history.map(b => (
                  <div key={b.ticket_id} className="history-card glass">
                    <div className="ticket-header">
                      <div className="status-container">
                        {b.booking_status === 'CONFIRMED' ? <CheckCircle size={14} className="text-success" /> : 
                         b.booking_status === 'FAILED' ? <XCircle size={14} className="text-primary" /> : <Clock size={14} />}
                        <span className={`status-badge status-${b.booking_status.toLowerCase()}`}>{b.booking_status}</span>
                      </div>
                      <span className="date">{new Date(b.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="ticket-body">
                      <p><strong>Ticket ID:</strong> {b.ticket_id}</p>
                      <p><strong>Total:</strong> ₹{b.total_amount}</p>
                      {b.booking_status === 'CONFIRMED' && (
                        <button 
                          className="btn-outline-small" 
                          onClick={() => navigate(`/ticket/${b.ticket_id}`)}
                          style={{ marginTop: '0.5rem', fontSize: '0.75rem', padding: '0.3rem 0.6rem' }}
                        >
                          <Download size={14} /> View E-Ticket
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button className="btn-outline logout-btn" onClick={logout} style={{ marginTop: '2rem' }}>
            <LogOut size={16} /> Logout
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page container animate-fade-in">
      <div className="auth-card glass">
        {isVerifying ? (
          <div className="otp-verification">
            <h2>Verify Your Email</h2>
            <p className="text-muted" style={{ marginBottom: '1.5rem' }}>We've sent a 6-digit OTP to {formData.email}</p>
            <form onSubmit={handleVerifyOTP} className="auth-form">
              <div className="form-group">
                <label>Enter OTP</label>
                <input 
                    type="text" 
                    name="otp" 
                    placeholder="123456" 
                    maxLength="6" 
                    value={formData.otp} 
                    onChange={handleChange} 
                    required 
                    style={{ letterSpacing: '8px', textAlign: 'center', fontSize: '1.5rem' }}
                />
              </div>
              <button type="submit" className="btn-primary auth-submit">
                <CheckCircle size={18} /> Verify & Activate
              </button>
              <button type="button" className="btn-outline" onClick={() => setIsVerifying(false)} style={{ border: 'none', background: 'none', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                Back to Register
              </button>
            </form>
          </div>
        ) : (
          <>
            <div className="auth-tabs">
              <button className={`tab ${isLogin ? 'active' : ''}`} onClick={() => setIsLogin(true)}>Login</button>
              <button className={`tab ${!isLogin ? 'active' : ''}`} onClick={() => setIsLogin(false)}>Register</button>
            </div>

            <form onSubmit={handleSubmit} className="auth-form">
              {!isLogin && (
                <>
                  <div className="form-group">
                    <label>Full Name</label>
                    <input type="text" name="name" value={formData.name} onChange={handleChange} required />
                  </div>
                  <div className="form-group">
                    <label>Phone Number</label>
                    <input type="tel" name="phone" value={formData.phone} onChange={handleChange} />
                  </div>
                  <div className="form-group">
                    <label>Role</label>
                    <select name="role" value={formData.role} onChange={handleChange} className="auth-select">
                      <option value="CUSTOMER">Customer</option>
                      <option value="THEATRE_MANAGER">Theatre Manager</option>
                      <option value="ADMIN">Admin</option>
                    </select>
                  </div>
                </>
              )}
              <div className="form-group">
                <label>Email Address</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input type="password" name="password" value={formData.password} onChange={handleChange} required />
              </div>
              <button type="submit" className="btn-primary auth-submit">
                {isLogin ? <><LogIn size={18} /> Login</> : <><UserPlus size={18} /> Register</>}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default Profile;
