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
        <div className="form-panel glass" style={{ marginBottom: '2rem' }}>
          <h4><MonitorPlay size={18} /> {editingShow ? 'Edit Show' : 'New Show'}</h4>
          <form onSubmit={handleSaveShow} className="form-grid">
            <div className="form-group">
              <label>Movie</label>
              <select value={newShow.movie} onChange={e => setNewShow({...newShow, movie: e.target.value})} required className="form-control">
                <option value="">Select Movie</option>
                {moviesList.map(m => <option key={m.id} value={m.id} style={{color: 'black'}}>{m.title}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Screen</label>
              <select value={newShow.screen} onChange={e => setNewShow({...newShow, screen: e.target.value})} required className="form-control">
                <option value="">Select Screen</option>
                {screensList.map(s => (
                  <option key={s.id} value={s.id} style={{color: 'black'}}>
                    {theatresList.find(t => t.id === s.theatre)?.name} - Screen {s.screen_number}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Start Time</label>
              <input type="datetime-local" value={newShow.start_time} onChange={e => setNewShow({...newShow, start_time: e.target.value})} required className="form-control" />
            </div>
            <div className="form-group">
              <label>Price (₹)</label>
              <input type="number" value={newShow.price} onChange={e => setNewShow({...newShow, price: e.target.value})} required className="form-control" />
            </div>
            <button type="submit" className="btn-primary full-width">Save Show</button>
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
        <div className="form-panel glass" style={{ marginBottom: '2rem' }}>
          <h4><Grid size={18} /> Bulk Seat Generator</h4>
          <form onSubmit={handleBulkCreateSeats} className="form-grid">
            <div className="form-group">
              <label>Select Screen</label>
              <select value={bulkSeatData.screen_id} onChange={e => setBulkSeatData({...bulkSeatData, screen_id: e.target.value})} required className="form-control">
                <option value="">Select Screen</option>
                {screensList.map(s => <option key={s.id} value={s.id} style={{color: 'black'}}>{theatresList.find(t => t.id === s.theatre)?.name} - S{s.screen_number}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Rows (comma separated)</label>
              <input type="text" value={bulkSeatData.rows} onChange={e => setBulkSeatData({...bulkSeatData, rows: e.target.value})} placeholder="A,B,C,D" className="form-control" />
            </div>
            <div className="form-group">
              <label>Seats Per Row</label>
              <input type="number" value={bulkSeatData.seats_per_row} onChange={e => setBulkSeatData({...bulkSeatData, seats_per_row: e.target.value})} className="form-control" />
            </div>
            <button type="submit" className="btn-primary full-width">Generate Seats</button>
          </form>
        </div>
      )}

      {showAddScreen && (
        <div className="form-panel glass" style={{ marginBottom: '2rem' }}>
          <h4><Grid size={18} /> {editingScreen ? 'Edit Screen' : 'New Screen'}</h4>
          <form onSubmit={handleSaveScreen} className="form-grid">
            <div className="form-group">
              <label>Theatre</label>
              <select value={newScreen.theatre} onChange={e => setNewScreen({...newScreen, theatre: e.target.value})} required className="form-control">
                <option value="">Select Theatre</option>
                {theatresList.map(t => <option key={t.id} value={t.id} style={{color: 'black'}}>{t.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Screen Number</label>
              <input type="text" value={newScreen.screen_number} onChange={e => setNewScreen({...newScreen, screen_number: e.target.value})} required className="form-control" />
            </div>
            <div className="form-group">
              <label>Total Seats Capacity</label>
              <input type="number" value={newScreen.total_seats} onChange={e => setNewScreen({...newScreen, total_seats: e.target.value})} required className="form-control" />
            </div>
            <button type="submit" className="btn-primary full-width">Save Screen</button>
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
