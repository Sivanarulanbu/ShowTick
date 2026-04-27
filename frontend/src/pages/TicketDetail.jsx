import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import './TicketDetail.css';
import { Ticket as TicketIcon, Calendar, Clock, MapPin, ArrowLeft, Download } from 'lucide-react';

const TicketDetail = () => {
    const { ticketId } = useParams();
    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTicket = async () => {
            try {
                const res = await api.get(`bookings/history/`);
                const found = res.data.find(b => b.ticket_id === ticketId);
                setBooking(found);
            } catch (err) {
                console.error("Failed to fetch ticket", err);
            } finally {
                setLoading(false);
            }
        };
        fetchTicket();
    }, [ticketId]);

    if (loading) return <div className="container loading"><div className="spinner"></div></div>;
    if (!booking) return <div className="container" style={{paddingTop: '2rem'}}><p>Ticket not found.</p><Link to="/profile">Back to Profile</Link></div>;

    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${booking.ticket_id}`;

    return (
        <div className="ticket-detail-page container animate-fade-in">
            <Link to="/profile" className="back-link no-print">
                <ArrowLeft size={18} /> Back to Profile
            </Link>

            <div className="ticket-visual-wrapper">
                <div className="ticket-container glass">
                    <div className="ticket-header-modern">
                        <div className="ticket-brand">
                            <div className="logo-icon">
                                <TicketIcon size={24} />
                            </div>
                            <div className="brand-text">
                                <h3>ShowTick</h3>
                                <span>Official E-Ticket</span>
                            </div>
                        </div>
                        <div className="booking-status-tag">
                            {booking.booking_status}
                        </div>
                    </div>

                    <div className="ticket-body">
                        <div className="movie-banner">
                            <div className="movie-title-section">
                                <span className="label">Movie</span>
                                <h2>{booking.show.movie.title}</h2>
                                <div className="genre-pill">{booking.show.movie.genre}</div>
                            </div>
                            <div className="qr-box no-print">
                                <img src={qrUrl} alt="QR" />
                            </div>
                        </div>

                        <div className="ticket-info-grid">
                            <div className="info-group">
                                <label><Calendar size={12}/> Date</label>
                                <span>{new Date(booking.show.start_time).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' })}</span>
                            </div>
                            <div className="info-group">
                                <label><Clock size={12}/> Time</label>
                                <span>{new Date(booking.show.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                            <div className="info-group">
                                <label><MapPin size={12}/> Theatre</label>
                                <span>{booking.show.screen.theatre.name}</span>
                            </div>
                            <div className="info-group">
                                <label><TicketIcon size={12}/> Screen & Seats</label>
                                <span>Screen {booking.show.screen.screen_number} | {booking.seats.map(s => s.seat_number).join(', ')}</span>
                            </div>
                        </div>

                        <div className="user-section">
                            <div className="user-info">
                                <label>Guest Name</label>
                                <p>{booking.user_name || 'Verified Guest'}</p>
                            </div>
                            <div className="booking-id-section">
                                <label>Booking ID</label>
                                <p className="mono">#{booking.ticket_id.split('-')[0].toUpperCase()}</p>
                            </div>
                        </div>
                    </div>

                    <div className="ticket-stub-divider">
                        <div className="perforation"></div>
                    </div>

                    <div className="ticket-footer-modern">
                        <div className="footer-content">
                            <div className="price-tag">
                                <label>Paid Amount</label>
                                <h3>₹{booking.total_amount}</h3>
                            </div>
                            <div className="print-action no-print">
                                <button className="btn-print" onClick={() => window.print()}>
                                    <Download size={18} /> Print Ticket
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Print Only QR and Full Details */}
                <div className="print-only-section">
                    <div className="print-header">
                        <h1>SHOWTICK E-TICKET</h1>
                    </div>
                    <div className="print-qr">
                        <img src={qrUrl} alt="QR" />
                    </div>
                    <div className="print-details">
                        <table>
                            <tbody>
                                <tr>
                                    <td>Movie</td>
                                    <td><strong>{booking.show.movie.title}</strong> ({booking.show.movie.language})</td>
                                </tr>
                                <tr>
                                    <td>Theatre</td>
                                    <td>{booking.show.screen.theatre.name}</td>
                                </tr>
                                <tr>
                                    <td>Screen</td>
                                    <td>Audi {booking.show.screen.screen_number}</td>
                                </tr>
                                <tr>
                                    <td>Guest Name</td>
                                    <td>{booking.user_name}</td>
                                </tr>
                                <tr>
                                    <td>Date & Time</td>
                                    <td>{new Date(booking.show.start_time).toLocaleString()}</td>
                                </tr>
                                <tr>
                                    <td>Seats</td>
                                    <td>{booking.seats.map(s => s.seat_number).join(', ')}</td>
                                </tr>
                                <tr>
                                    <td>Booking ID</td>
                                    <td>{booking.ticket_id}</td>
                                </tr>
                                <tr>
                                    <td>Amount Paid</td>
                                    <td>₹{booking.total_amount}</td>
                                </tr>
                            </tbody>
                        </table>
                        <div className="print-footer">
                            <p>Thank you for booking with ShowTick. Please arrive 15 minutes before showtime.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TicketDetail;
