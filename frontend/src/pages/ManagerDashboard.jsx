import React, { useState, useEffect, useContext } from 'react';
import { Calendar, MonitorPlay, Plus, Edit, Trash2, X, User, TrendingUp, Ticket, Grid, Layers, ShieldCheck } from 'lucide-react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import './AdminDashboard.css';
import './ManagerDashboard.css';

const ManagerDashboard = () => {
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('insights');
  const [shows, setShows] = useState([]);
  const [moviesList, setMoviesList] = useState([]);
  const [screensList, setScreensList] = useState([]);
  const [theatresList, setTheatresList] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState(null);

  // Form States
  const [showAddShow, setShowAddShow] = useState(false);
  const [editingShow, setEditingShow] = useState(null);
  const [newShow, setNewShow] = useState({ movie: '', screen: '', start_time: '', price: '' });

  const [showAddScreen, setShowAddScreen] = useState(false);
  const [editingScreen, setEditingScreen] = useState(null);
  const [newScreen, setNewScreen] = useState({ theatre: '', screen_number: '', total_seats: '' });

  const [showBulkSeats, setShowBulkSeats] = useState(false);
  const [bulkSeatData, setBulkSeatData] = useState({ screen_id: '', rows: 'A,B,C,D,E', seats_per_row: 10, seat_type: 'NORMAL' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [mRes, sRes, tRes, shRes, bRes, stRes] = await Promise.all([
        api.get('movies/'),
        api.get('theatres/screens/'),
        api.get('theatres/'),
        api.get('bookings/shows/'),
        api.get('bookings/bookings/'),
        api.get('bookings/manager/stats/')
      ]);
      setMoviesList(mRes.data);
      setScreensList(sRes.data);
      setTheatresList(tRes.data);
      setShows(shRes.data);
      setBookings(bRes.data);
      setStats(stRes.data);
    } catch (err) {
      console.error("Failed to fetch dashboard data", err);
    }
  };

  const handleSaveShow = async (e) => {
    e.preventDefault();
    try {
      if (editingShow) {
        const res = await api.put(`bookings/shows/${editingShow.id}/`, newShow);
        setShows(shows.map(s => s.id === editingShow.id ? res.data : s));
        alert("Show updated!");
      } else {
        const res = await api.post('bookings/shows/', newShow);
        setShows([res.data, ...shows]);
        alert("Show added!");
      }
      setShowAddShow(false);
      setEditingShow(null);
      setNewShow({ movie: '', screen: '', start_time: '', price: '' });
    } catch (err) { alert("Error saving show"); }
  };

  const handleBulkCreateSeats = async (e) => {
    e.preventDefault();
    try {
      const rowsArray = bulkSeatData.rows.split(',').map(r => r.trim());
      await api.post('theatres/seats/bulk_create/', {
        screen_id: bulkSeatData.screen_id,
        rows: rowsArray,
        seats_per_row: parseInt(bulkSeatData.seats_per_row),
        seat_type: bulkSeatData.seat_type
      });
      alert("Seats generated successfully!");
      setShowBulkSeats(false);
    } catch (err) { alert("Error generating seats"); }
  };

  const handleDeleteShow = async (id) => {
    if (window.confirm("Delete this show?")) {
      await api.delete(`bookings/shows/${id}/`);
      setShows(shows.filter(s => s.id !== id));
    }
  };

  const handleSaveScreen = async (e) => {
    e.preventDefault();
    try {
      if (editingScreen) {
        const res = await api.put(`theatres/screens/${editingScreen.id}/`, newScreen);
        setScreensList(screensList.map(s => s.id === editingScreen.id ? res.data : s));
        alert("Screen updated!");
      } else {
        const res = await api.post('theatres/screens/', newScreen);
        setScreensList([res.data, ...screensList]);
        alert("Screen added!");
      }
      setShowAddScreen(false);
      setEditingScreen(null);
      setNewScreen({ theatre: '', screen_number: '', total_seats: '' });
    } catch (err) { alert("Error saving screen"); }
  };

  const handleDeleteScreen = async (id) => {
    if (window.confirm("Delete this screen?")) {
      await api.delete(`theatres/screens/${id}/`);
      setScreensList(screensList.filter(s => s.id !== id));
    }
  };

  const renderInsights = () => (
    <div className="insights-panel animate-fade-in">
      <div className="stats-grid">
        <div className="stat-card glass">
          <div className="stat-icon" style={{ background: 'rgba(255, 183, 3, 0.1)', color: '#ffb703' }}><TrendingUp size={28} /></div>
          <div className="stat-info">
            <p>Total Revenue</p>
            <h3>₹{stats?.total_revenue || 0}</h3>
          </div>
        </div>
        <div className="stat-card glass">
          <div className="stat-icon" style={{ background: 'rgba(76, 175, 80, 0.1)', color: '#4caf50' }}><Ticket size={28} /></div>
          <div className="stat-info">
            <p>Confirmed Bookings</p>
            <h3>{stats?.total_bookings || 0}</h3>
          </div>
        </div>
        <div className="stat-card glass">
          <div className="stat-icon" style={{ background: 'rgba(33, 150, 243, 0.1)', color: '#2196f3' }}><MonitorPlay size={28} /></div>
          <div className="stat-info">
            <p>Active Shows</p>
            <h3>{shows.length}</h3>
          </div>
        </div>
      </div>

      <div className="dashboard-panel glass" style={{ marginTop: '2rem' }}>
        <div className="panel-header">
          <h3><ShieldCheck size={20} /> Recent Activity</h3>
        </div>
        <div className="activity-list">
          {stats?.recent_activity?.map(act => (
            <div key={act.id} className="activity-item" style={{ padding: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between' }}>
              <div>
                <strong>{act.show_details?.movie_title}</strong>
                <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>{new Date(act.created_at).toLocaleString()}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span className="status-confirmed">CONFIRMED</span>
                <p>₹{act.total_amount}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderShows = () => (
    <div className="dashboard-panel glass animate-fade-in">
      <div className="panel-header">
        <h3>Scheduled Shows</h3>
        <button onClick={() => setShowAddShow(!showAddShow)} className="btn-primary">
          {showAddShow ? <X size={16} /> : <Plus size={16} />} {showAddShow ? 'Cancel' : 'Add Show'}
        </button>
      </div>

      {showAddShow && (
        <div className="form-panel glass animate-fade-in" style={{ marginBottom: '2.5rem', padding: '2rem' }}>
          <div className="form-header-row">
            <h4><MonitorPlay size={20} className="text-primary" /> {editingShow ? 'Edit Scheduled Show' : 'Schedule New Show'}</h4>
            <p className="form-subtitle">Fill in the details to schedule a movie showtime for your theatre.</p>
          </div>
          <form onSubmit={handleSaveShow} className="premium-form">
            <div className="form-row-three">
              <div className="form-group">
                <label>Movie</label>
                <div className="input-with-icon">
                  <select value={newShow.movie} onChange={e => setNewShow({...newShow, movie: e.target.value})} required className="form-control-premium">
                    <option value="">Select Movie</option>
                    {moviesList.map(m => <option key={m.id} value={m.id} style={{color: '#000'}}>{m.title}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Screen</label>
                <div className="input-with-icon">
                  <select value={newShow.screen} onChange={e => setNewShow({...newShow, screen: e.target.value})} required className="form-control-premium">
                    <option value="">Select Screen</option>
                    {screensList.map(s => (
                      <option key={s.id} value={s.id} style={{color: '#000'}}>
                        {theatresList.find(t => t.id === s.theatre)?.name} - Screen {s.screen_number}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Start Time</label>
                <input type="datetime-local" value={newShow.start_time} onChange={e => setNewShow({...newShow, start_time: e.target.value})} required className="form-control-premium" />
              </div>
            </div>
            
            <div className="form-actions-row">
              <div className="form-group price-input-group">
                <label>Base Price (₹)</label>
                <input type="number" placeholder="250" value={newShow.price} onChange={e => setNewShow({...newShow, price: e.target.value})} required className="form-control-premium" />
              </div>
              <button type="submit" className="btn-save-premium">
                <ShieldCheck size={18} /> {editingShow ? 'Update Show' : 'Save Show'}
              </button>
            </div>
          </form>
        </div>
      )}

      <table className="data-table">
        <thead>
          <tr>
            <th>Movie</th>
            <th>Screen</th>
            <th>Timing</th>
            <th>Price</th>
            <th style={{ textAlign: 'right' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {shows.map(show => (
            <tr key={show.id}>
              <td><strong>{show.movie_details?.title}</strong></td>
              <td>{show.screen_details?.theatre_name} (S{show.screen_details?.screen_number})</td>
              <td>{new Date(show.start_time).toLocaleDateString()} {new Date(show.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
              <td style={{ color: '#4caf50', fontWeight: 'bold' }}>₹{show.price}</td>
              <td>
                <div className="action-btns">
                  <button className="icon-btn" onClick={() => { setEditingShow(show); setNewShow({ movie: show.movie, screen: show.screen, start_time: show.start_time.slice(0,16), price: show.price }); setShowAddShow(true); }}><Edit size={16} /></button>
                  <button className="icon-btn delete" onClick={() => handleDeleteShow(show.id)}><Trash2 size={16} /></button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderScreens = () => (
    <div className="dashboard-panel glass animate-fade-in">
      <div className="panel-header">
        <h3>Screens & Layout</h3>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button onClick={() => setShowBulkSeats(!showBulkSeats)} className="btn-outline">
            <Layers size={16} /> Generate Seats
          </button>
          <button onClick={() => setShowAddScreen(!showAddScreen)} className="btn-primary">
            <Plus size={16} /> Add Screen
          </button>
        </div>
      </div>

      {showBulkSeats && (
        <div className="form-panel glass animate-fade-in" style={{ marginBottom: '2.5rem', padding: '2rem' }}>
          <div className="form-header-row">
            <h4><Grid size={20} className="text-primary" /> Bulk Seat Generator</h4>
            <p className="form-subtitle">Automatically generate multiple seats for a screen based on rows and columns.</p>
          </div>
          <form onSubmit={handleBulkCreateSeats} className="premium-form">
            <div className="form-row-three">
              <div className="form-group">
                <label>Select Screen</label>
                <select value={bulkSeatData.screen_id} onChange={e => setBulkSeatData({...bulkSeatData, screen_id: e.target.value})} required className="form-control-premium">
                  <option value="">Select Screen</option>
                  {screensList.map(s => <option key={s.id} value={s.id} style={{color: '#000'}}>{theatresList.find(t => t.id === s.theatre)?.name} - S{s.screen_number}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Rows (e.g. A,B,C,D)</label>
                <input type="text" value={bulkSeatData.rows} onChange={e => setBulkSeatData({...bulkSeatData, rows: e.target.value})} placeholder="A,B,C,D" className="form-control-premium" />
              </div>
              <div className="form-group">
                <label>Seats Per Row</label>
                <input type="number" value={bulkSeatData.seats_per_row} onChange={e => setBulkSeatData({...bulkSeatData, seats_per_row: e.target.value})} className="form-control-premium" />
              </div>
            </div>
            <div className="form-actions-row">
              <p className="form-info-text">This will create {bulkSeatData.rows.split(',').length * bulkSeatData.seats_per_row} seats instantly.</p>
              <button type="submit" className="btn-save-premium">
                <Layers size={18} /> Generate Seats
              </button>
            </div>
          </form>
        </div>
      )}

      {showAddScreen && (
        <div className="form-panel glass animate-fade-in" style={{ marginBottom: '2.5rem', padding: '2rem' }}>
          <div className="form-header-row">
            <h4><Grid size={20} className="text-primary" /> {editingScreen ? 'Edit Screen Details' : 'Register New Screen'}</h4>
            <p className="form-subtitle">Add a new cinema hall to your theatre location.</p>
          </div>
          <form onSubmit={handleSaveScreen} className="premium-form">
            <div className="form-row-three">
              <div className="form-group">
                <label>Theatre</label>
                <select value={newScreen.theatre} onChange={e => setNewScreen({...newScreen, theatre: e.target.value})} required className="form-control-premium">
                  <option value="">Select Theatre</option>
                  {theatresList.map(t => <option key={t.id} value={t.id} style={{color: '#000'}}>{t.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Screen Number</label>
                <input type="text" placeholder="e.g. 1 or IMAX" value={newScreen.screen_number} onChange={e => setNewScreen({...newScreen, screen_number: e.target.value})} required className="form-control-premium" />
              </div>
              <div className="form-group">
                <label>Total Capacity</label>
                <input type="number" placeholder="200" value={newScreen.total_seats} onChange={e => setNewScreen({...newScreen, total_seats: e.target.value})} required className="form-control-premium" />
              </div>
            </div>
            <div className="form-actions-row">
              <div style={{ flex: 1 }}></div>
              <button type="submit" className="btn-save-premium">
                <ShieldCheck size={18} /> {editingScreen ? 'Update Screen' : 'Save Screen'}
              </button>
            </div>
          </form>
        </div>
      )}

      <table className="data-table">
        <thead>
          <tr>
            <th>Theatre</th>
            <th>Screen #</th>
            <th>Capacity</th>
            <th style={{ textAlign: 'right' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {screensList.map(screen => (
            <tr key={screen.id}>
              <td><strong>{theatresList.find(t => t.id === screen.theatre)?.name}</strong></td>
              <td><span className="manager-badge" style={{ padding: '0.2rem 0.5rem', borderRadius: '4px' }}>S{screen.screen_number}</span></td>
              <td>{screen.total_seats} Seats</td>
              <td>
                <div className="action-btns">
                  <button className="icon-btn" onClick={() => { setEditingScreen(screen); setNewScreen({ theatre: screen.theatre, screen_number: screen.screen_number, total_seats: screen.total_seats }); setShowAddScreen(true); }}><Edit size={16} /></button>
                  <button className="icon-btn delete" onClick={() => handleDeleteScreen(screen.id)}><Trash2 size={16} /></button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderBookings = () => (
    <div className="dashboard-panel glass animate-fade-in">
      <div className="panel-header">
        <h3>Live Bookings</h3>
      </div>
      <table className="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Movie</th>
            <th>Customer</th>
            <th>Seats</th>
            <th>Amount</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {bookings.map(b => (
            <tr key={b.id}>
              <td><code style={{ fontSize: '0.8rem' }}>#{b.ticket_id.slice(0,8)}</code></td>
              <td>{b.show_details?.movie_title}</td>
              <td>{b.user_details?.name || b.user}</td>
              <td>{b.seat_numbers?.join(', ')}</td>
              <td>₹{b.total_amount}</td>
              <td><span className={`booking-status status-${b.booking_status.toLowerCase()}`}>{b.booking_status}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="dashboard-page container animate-fade-in">
      <div className="manager-header">
        <div>
          <h2>Manager Hub</h2>
          <p style={{ color: 'rgba(255,255,255,0.5)', marginTop: '0.5rem' }}>Welcome back, {user?.name}. Here's what's happening at your theatres.</p>
        </div>
        <span className="manager-badge"><User size={18} /> {user?.role}</span>
      </div>

      <div className="dashboard-tabs">
        <button className={`dashboard-tab manager ${activeTab === 'insights' ? 'active' : ''}`} onClick={() => setActiveTab('insights')}><TrendingUp size={18} /> Insights</button>
        <button className={`dashboard-tab manager ${activeTab === 'shows' ? 'active' : ''}`} onClick={() => setActiveTab('shows')}><Calendar size={18} /> Shows</button>
        <button className={`dashboard-tab manager ${activeTab === 'screens' ? 'active' : ''}`} onClick={() => setActiveTab('screens')}><Grid size={18} /> Screens</button>
        <button className={`dashboard-tab manager ${activeTab === 'bookings' ? 'active' : ''}`} onClick={() => setActiveTab('bookings')}><Ticket size={18} /> Bookings</button>
      </div>

      {activeTab === 'insights' && renderInsights()}
      {activeTab === 'shows' && renderShows()}
      {activeTab === 'screens' && renderScreens()}
      {activeTab === 'bookings' && renderBookings()}
    </div>
  );
};

export default ManagerDashboard;
