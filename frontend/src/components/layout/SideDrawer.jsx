import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Bell, ShoppingBag, Clapperboard, CreditCard, HelpCircle, Settings, Award, Shield, Briefcase, LogOut } from 'lucide-react';
import './SideDrawer.css';
import { Link } from 'react-router-dom';
import api from '../../services/api';

const SideDrawer = ({ isOpen, onClose, user, onLogout }) => {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (isOpen && user) {
      fetchNotifications();
    }
  }, [isOpen, user]);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('bookings/notifications/');
      const unread = res.data.filter(n => !n.is_read).length;
      setUnreadCount(unread);
    } catch (err) {
      console.error("Failed to fetch notifications", err);
    }
  };

  return createPortal(
    <div className={`drawer-overlay ${isOpen ? 'open' : ''}`} onClick={onClose}>
      <div className="drawer-content" onClick={e => e.stopPropagation()}>
        <div className="drawer-header">
          <div className="user-section">
            <div className="avatar">{(user?.name || 'H').charAt(0).toUpperCase()}</div>
            <div className="user-info">
              <h3>Hey!</h3>
              {user ? (
                <p className="auth-prompt">Welcome back, <span style={{color: 'white', border: 'none', padding: 0, background: 'none'}}>{user.name}</span></p>
              ) : (
                <Link to="/profile" onClick={onClose} className="auth-prompt">
                  Unlock special offers & great benefits <br />
                  <span>Login / Register</span>
                </Link>
              )}
            </div>
          </div>
          <button className="close-btn" onClick={onClose}><X size={20} /></button>
        </div>

        <div className="drawer-links">
          <div className="link-item">
            <div style={{position: 'relative'}}>
                <Bell size={20} />
                {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
            </div>
            <div className="item-text">
                <span>Notifications</span>
                <small>Stay updated on new releases</small>
            </div>
          </div>
          <Link to="/profile" className="link-item" onClick={onClose}>
            <ShoppingBag size={20} />
            <div className="item-text">
                <span>Your Orders</span>
                <small>View all your bookings & purchases</small>
            </div>
          </Link>
          <div className="link-item">
            <Clapperboard size={20} />
            <div className="item-text">
                <span>Stream Library</span>
                <small>Rented & Purchased Movies</small>
            </div>
          </div>
          <div className="link-item">
            <CreditCard size={20} />
            <div className="item-text">
                <span>Play Credit Card</span>
                <small>View your Play Credit Card details</small>
            </div>
          </div>
          <div className="link-item">
            <HelpCircle size={20} />
            <div className="item-text">
                <span>Help & Support</span>
                <small>Get assistance with your bookings</small>
            </div>
          </div>
          <Link to="/profile" className="link-item" onClick={onClose}>
            <Settings size={20} />
            <div className="item-text">
                <span>Accounts & Settings</span>
                <small>Manage your profile and privacy</small>
            </div>
          </Link>
          <div className="link-item">
            <Award size={20} style={{color: 'var(--warning)'}} />
            <div className="item-text">
                <span>Rewards</span>
                <small>{user?.rewards_points || 0} Points available</small>
            </div>
          </div>
          
          {user?.role === 'ADMIN' && (
            <Link to="/admin" className="link-item" onClick={onClose} style={{ marginTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1.5rem', borderRadius: '0' }}>
              <Shield size={20} style={{color: 'var(--primary)'}} />
              <div className="item-text">
                  <span style={{color: 'var(--primary)'}}>Admin Dashboard</span>
                  <small>System & User Management</small>
              </div>
            </Link>
          )}

          {(user?.role === 'THEATRE_MANAGER' || user?.role === 'ADMIN') && (
            <Link to="/manager" className="link-item" onClick={onClose} style={{ borderRadius: '0' }}>
              <Briefcase size={20} style={{color: 'var(--warning)'}} />
              <div className="item-text">
                  <span style={{color: 'var(--warning)'}}>Theatre Dashboard</span>
                  <small>Screenings & Bookings</small>
              </div>
            </Link>
          )}
        </div>

        {user && (
          <button className="logout-drawer-btn" onClick={() => { onLogout(); onClose(); }}>
            <LogOut size={18} />
            Sign Out
          </button>
        )}
      </div>
    </div>,
    document.body
  );
};

export default SideDrawer;
