import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { Ticket, User, LogOut, MapPin, Search, Menu } from 'lucide-react';
import './Navbar.css';
import CityPicker from '../common/CityPicker';
import { AuthContext } from '../../context/AuthContext';

const Navbar = ({ onOpenDrawer }) => {
  const { user, city, setCity, searchTerm, setSearchTerm } = useContext(AuthContext);
  const [isCityModalOpen, setIsCityModalOpen] = React.useState(false);

  return (
    <nav className="glass-nav navbar">
      <div className="container nav-content">
        <Link to="/" className="nav-logo">
          <Ticket className="logo-icon" />
          <span>ShowTick</span>
        </Link>

        <div className="nav-search glass">
          <Search size={18} className="text-muted" />
          <input 
            type="text" 
            placeholder="Search for Movies, Events, Plays and Activities" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="nav-right-actions">
          <div className="city-selector" onClick={() => setIsCityModalOpen(true)} style={{cursor: 'pointer'}}>
            <MapPin size={18} className="text-secondary" />
            <span className="selected-city-name">{city}</span>
          </div>

          <CityPicker 
            isOpen={isCityModalOpen} 
            onClose={() => setIsCityModalOpen(false)} 
            currentCity={city}
            onSelectCity={(newCity) => setCity(newCity)}
          />

          {user ? (
            <div className="user-nav">
              <Link to="/profile" className="nav-profile">
                <span>{user.name || user.email.split('@')[0]}</span>
              </Link>
            </div>
          ) : (
            <Link to="/profile" className="btn-primary-small">
              Sign In
            </Link>
          )}

          <button className="menu-toggle" onClick={onOpenDrawer}>
            <Menu size={24} />
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
