import React from 'react';
import { createPortal } from 'react-dom';
import './CityPicker.css';
import { X, MapPin } from 'lucide-react';

const CityPicker = ({ isOpen, onClose, currentCity, onSelectCity }) => {
  const cities = [
    { name: 'Mumbai', icon: '🏙️' },
    { name: 'Delhi', icon: '🏛️' },
    { name: 'Bangalore', icon: '🌳' },
    { name: 'Hyderabad', icon: '🏰' },
    { name: 'Chennai', icon: '🌊' },
    { name: 'Pune', icon: '🎓' },
    { name: 'Kolkata', icon: '🌉' },
    { name: 'Ahmedabad', icon: '🕌' },
  ];

  if (!isOpen) return null;

  return createPortal(
    <div className="city-picker-overlay animate-fade-in" onClick={onClose}>
      <div className="city-picker-modal glass" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
            <h3>Select City</h3>
            <button className="close-btn" onClick={onClose}><X size={20} /></button>
        </div>
        
        <div className="popular-cities">
            <p className="section-label">Popular Cities</p>
            <div className="cities-grid">
                {cities.map(city => (
                    <div 
                        key={city.name} 
                        className={`city-card ${currentCity === city.name ? 'active' : ''}`}
                        onClick={() => {
                            onSelectCity(city.name);
                            onClose();
                        }}
                    >
                        <span className="city-emoji">{city.icon}</span>
                        <span className="city-name">{city.name}</span>
                    </div>
                ))}
            </div>
        </div>

        <div className="manual-search">
            <MapPin size={18} className="text-muted" />
            <input type="text" placeholder="Search for your city..." />
        </div>
      </div>
    </div>,
    document.body
  );
};

export default CityPicker;
