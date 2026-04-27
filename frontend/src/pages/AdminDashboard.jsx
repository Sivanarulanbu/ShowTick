import React, { useState, useEffect } from 'react';
import { Users, Film, Building2, Ticket, TrendingUp, Plus, Edit, Trash2, X, ShieldCheck, PieChart, Activity } from 'lucide-react';
import api from '../services/api';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [movies, setMovies] = useState([]);
  const [theatres, setTheatres] = useState([]);
  const [bookings, setBookings] = useState([]);
  
  // Form States
  const [showAddMovie, setShowAddMovie] = useState(false);
  const [newMovie, setNewMovie] = useState({
    title: '', description: '', duration: '', language: '', genre: 'Drama', release_date: '', poster_url: '', trailer_url: ''
  });
  const [showAddTheatre, setShowAddTheatre] = useState(false);
  const [newTheatre, setNewTheatre] = useState({
    name: '', city: '', location: ''
  });
  const [editingMovie, setEditingMovie] = useState(null);
  const [editingTheatre, setEditingTheatre] = useState(null);
  const [posterFile, setPosterFile] = useState(null);
  
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [sRes, mRes, tRes, bRes] = await Promise.all([
        api.get('bookings/admin/stats/'),
        api.get('movies/'),
        api.get('theatres/'),
        api.get('bookings/bookings/')
      ]);
      setStats(sRes.data);
      setMovies(mRes.data);
      setTheatres(tRes.data);
      setBookings(bRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveMovie = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      Object.keys(newMovie).forEach(key => {
        if (newMovie[key]) formData.append(key, newMovie[key]);
      });
      if (posterFile) formData.append('poster_image', posterFile);

      if (editingMovie) {
        await api.put(`movies/${editingMovie.id}/`, formData);
        alert("Movie updated!");
      } else {
        await api.post('movies/', formData);
        alert("Movie added!");
      }
      fetchData();
      setShowAddMovie(false);
      setEditingMovie(null);
      setNewMovie({ title: '', description: '', duration: '', language: '', genre: 'Drama', release_date: '', poster_url: '', trailer_url: '' });
      setPosterFile(null);
    } catch (err) { 
      const errorMsg = err.response?.data ? JSON.stringify(err.response.data) : err.message;
      alert("Failed to save movie: " + errorMsg); 
    }
  };

  const handleSaveTheatre = async (e) => {
    e.preventDefault();
    try {
      if (editingTheatre) {
        await api.put(`theatres/${editingTheatre.id}/`, newTheatre);
        alert("Theatre updated!");
      } else {
        await api.post('theatres/', newTheatre);
        alert("Theatre added!");
      }
      fetchData();
      setShowAddTheatre(false);
      setEditingTheatre(null);
      setNewTheatre({ name: '', city: '', location: '' });
    } catch (err) { alert("Failed to save theatre"); }
  };

  const renderOverview = () => (
    <div className="animate-fade-in">
      <div className="stats-grid">
        <div className="stat-card glass">
          <div className="stat-icon" style={{ background: 'rgba(229, 9, 20, 0.1)', color: '#e50914' }}><TrendingUp size={28} /></div>
          <div className="stat-info">
            <p>Total Revenue</p>
            <h3>₹{stats?.total_revenue || 0}</h3>
          </div>
        </div>
        <div className="stat-card glass">
          <div className="stat-icon" style={{ background: 'rgba(76, 175, 80, 0.1)', color: '#4caf50' }}><Ticket size={28} /></div>
          <div className="stat-info">
            <p>Confirmed</p>
            <h3>{stats?.total_bookings || 0}</h3>
          </div>
        </div>
        <div className="stat-card glass">
          <div className="stat-icon" style={{ background: 'rgba(33, 150, 243, 0.1)', color: '#2196f3' }}><Film size={28} /></div>
          <div className="stat-info">
            <p>Total Movies</p>
            <h3>{movies.length}</h3>
          </div>
        </div>
      </div>

      <div className="dashboard-panel glass" style={{ marginTop: '2rem' }}>
        <div className="panel-header">
          <h3><PieChart size={20} /> Revenue by City</h3>
        </div>
        <div className="city-stats" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          {stats?.city_stats?.map(c => (
            <div key={c.city} className="glass" style={{ padding: '1.5rem', borderRadius: '12px', textAlign: 'center' }}>
              <h4 style={{ margin: '0 0 0.5rem 0', color: 'rgba(255,255,255,0.6)' }}>{c.city}</h4>
              <p style={{ fontSize: '1.5rem', fontWeight: '700' }}>₹{c.revenue}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderMovies = () => (
    <div className="dashboard-panel glass animate-fade-in">
      <div className="panel-header">
        <h3>Movies Library</h3>
        <button onClick={() => setShowAddMovie(!showAddMovie)} className="btn-primary">
          {showAddMovie ? <X size={16} /> : <Plus size={16} />} {showAddMovie ? 'Cancel' : 'Add Movie'}
        </button>
      </div>

      {showAddMovie && (
        <div className="form-panel glass">
          <h4><Film size={18} /> Movie Details</h4>
          <form onSubmit={handleSaveMovie} className="form-grid">
            <div className="form-group"><label>Title</label><input type="text" value={newMovie.title} onChange={e => setNewMovie({...newMovie, title: e.target.value})} required className="form-control" /></div>
            <div className="form-group"><label>Genre</label><input type="text" value={newMovie.genre} onChange={e => setNewMovie({...newMovie, genre: e.target.value})} required className="form-control" /></div>
            <div className="form-group"><label>Language</label><input type="text" value={newMovie.language} onChange={e => setNewMovie({...newMovie, language: e.target.value})} required className="form-control" /></div>
            <div className="form-group"><label>Duration (min)</label><input type="number" value={newMovie.duration} onChange={e => setNewMovie({...newMovie, duration: e.target.value})} required className="form-control" /></div>
            <div className="form-group"><label>Release Date</label><input type="date" value={newMovie.release_date} onChange={e => setNewMovie({...newMovie, release_date: e.target.value})} required className="form-control" /></div>
            <div className="form-group"><label>Poster File</label><input type="file" onChange={e => setPosterFile(e.target.files[0])} className="form-control" /></div>
            <div className="form-group"><label>Poster URL (Optional)</label><input type="text" value={newMovie.poster_url} onChange={e => setNewMovie({...newMovie, poster_url: e.target.value})} className="form-control" /></div>
            <div className="form-group"><label>Trailer URL (YouTube)</label><input type="text" value={newMovie.trailer_url} onChange={e => setNewMovie({...newMovie, trailer_url: e.target.value})} className="form-control" /></div>
            <div className="form-group full-width"><label>Description</label><textarea value={newMovie.description} onChange={e => setNewMovie({...newMovie, description: e.target.value})} rows="3" required className="form-control" /></div>
            <button type="submit" className="btn-primary full-width">Save Movie</button>
          </form>
        </div>
      )}

      <table className="data-table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Genre</th>
            <th>Language</th>
            <th style={{ textAlign: 'right' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {movies.map(movie => (
            <tr key={movie.id}>
              <td>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <img src={movie.poster_image || movie.poster_url || 'https://via.placeholder.com/40x60'} alt="" style={{ width: '40px', height: '60px', objectFit: 'cover', borderRadius: '4px' }} />
                  <strong>{movie.title}</strong>
                </div>
              </td>
              <td><span style={{ background: 'rgba(255,255,255,0.05)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>{movie.genre}</span></td>
              <td>{movie.language}</td>
              <td>
                <div className="action-btns">
                  <button className="icon-btn" onClick={() => { setEditingMovie(movie); setNewMovie({...movie, release_date: movie.release_date?.split('T')[0]}); setShowAddMovie(true); }}><Edit size={16} /></button>
                  <button className="icon-btn delete" onClick={async () => { 
                    if(window.confirm("Delete movie? This will also remove all associated shows and bookings.")) { 
                      try {
                        await api.delete(`movies/${movie.id}/`); 
                        fetchData(); 
                      } catch (err) {
                        alert("Failed to delete movie: " + (err.response?.data?.detail || err.message));
                      }
                    } 
                  }}><Trash2 size={16} /></button>
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
        <h3>All Transactions</h3>
      </div>
      <table className="data-table">
        <thead>
          <tr>
            <th>Ticket ID</th>
            <th>Movie</th>
            <th>User</th>
            <th>Amount</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {bookings.map(b => (
            <tr key={b.id}>
              <td><code>#{b.ticket_id.slice(0,8)}</code></td>
              <td>{b.show_details?.movie_title}</td>
              <td>{b.user_details?.name || b.user}</td>
              <td>₹{b.total_amount}</td>
              <td><span className={`booking-status status-${b.booking_status.toLowerCase()}`} style={{ padding: '0.2rem 0.6rem', borderRadius: '20px', fontSize: '0.7rem' }}>{b.booking_status}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="dashboard-page container animate-fade-in">
      <div className="dashboard-header">
        <div>
          <h2>Admin Console</h2>
          <p style={{ color: 'rgba(255,255,255,0.5)', marginTop: '0.5rem' }}>Global platform management and financial oversight.</p>
        </div>
        <div className="manager-badge" style={{ borderColor: 'rgba(229, 9, 20, 0.3)', color: '#e50914', background: 'rgba(229, 9, 20, 0.05)' }}>
          <ShieldCheck size={18} /> Super Admin
        </div>
      </div>

      <div className="dashboard-tabs">
        <button className={`dashboard-tab ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}><Activity size={18} /> Overview</button>
        <button className={`dashboard-tab ${activeTab === 'movies' ? 'active' : ''}`} onClick={() => setActiveTab('movies')}><Film size={18} /> Movies</button>
        <button className={`dashboard-tab ${activeTab === 'theatres' ? 'active' : ''}`} onClick={() => setActiveTab('theatres')}><Building2 size={18} /> Theatres</button>
        <button className={`dashboard-tab ${activeTab === 'bookings' ? 'active' : ''}`} onClick={() => setActiveTab('bookings')}><Ticket size={18} /> Bookings</button>
      </div>

      {activeTab === 'overview' && renderOverview()}
      {activeTab === 'movies' && renderMovies()}
      {activeTab === 'bookings' && renderBookings()}
      
      {activeTab === 'theatres' && (
        <div className="dashboard-panel glass animate-fade-in">
          <div className="panel-header">
            <h3>Partner Theatres</h3>
            <button onClick={() => setShowAddTheatre(!showAddTheatre)} className="btn-primary">
              {showAddTheatre ? <X size={16} /> : <Plus size={16} />} {showAddTheatre ? 'Cancel' : 'Add Theatre'}
            </button>
          </div>
          
          {showAddTheatre && (
            <div className="form-panel glass">
              <h4><Building2 size={18} /> Theatre Details</h4>
              <form onSubmit={handleSaveTheatre} className="form-grid">
                <div className="form-group"><label>Name</label><input type="text" value={newTheatre.name} onChange={e => setNewTheatre({...newTheatre, name: e.target.value})} required className="form-control" /></div>
                <div className="form-group"><label>City</label><input type="text" value={newTheatre.city} onChange={e => setNewTheatre({...newTheatre, city: e.target.value})} required className="form-control" /></div>
                <div className="form-group full-width"><label>Location</label><input type="text" value={newTheatre.location} onChange={e => setNewTheatre({...newTheatre, location: e.target.value})} required className="form-control" /></div>
                <button type="submit" className="btn-primary full-width">Save Theatre</button>
              </form>
            </div>
          )}

          <table className="data-table">
            <thead>
              <tr><th>Name</th><th>City</th><th style={{ textAlign: 'right' }}>Actions</th></tr>
            </thead>
            <tbody>
              {theatres.map(t => (
                <tr key={t.id}>
                  <td><strong>{t.name}</strong></td>
                  <td>{t.city}</td>
                  <td>
                    <div className="action-btns">
                      <button className="icon-btn" onClick={() => { setEditingTheatre(t); setNewTheatre(t); setShowAddTheatre(true); }}><Edit size={16} /></button>
                      <button className="icon-btn delete" onClick={async () => { 
                        if(window.confirm("Delete theatre? This will remove all screens and shows.")) { 
                          try {
                            await api.delete(`theatres/${t.id}/`); 
                            fetchData(); 
                          } catch (err) {
                            alert("Failed to delete theatre: " + (err.response?.data?.detail || err.message));
                          }
                        } 
                      }}><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
