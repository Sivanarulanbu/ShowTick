import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Home from './pages/Home';
import MovieDetails from './pages/MovieDetails';
import SeatSelection from './pages/SeatSelection';
import Checkout from './pages/Checkout';
import Profile from './pages/Profile';
import TicketDetail from './pages/TicketDetail';
import ProtectedRoute from './components/common/ProtectedRoute';
import RoleProtectedRoute from './components/common/RoleProtectedRoute';
import SideDrawer from './components/layout/SideDrawer';
import AdminDashboard from './pages/AdminDashboard';
import ManagerDashboard from './pages/ManagerDashboard';
import { AuthContext } from './context/AuthContext';

function App() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { user, logout } = React.useContext(AuthContext);

  return (
    <Router>
      <div className="app-container">
        <Navbar onOpenDrawer={() => setIsDrawerOpen(true)} />
        <SideDrawer 
          isOpen={isDrawerOpen} 
          onClose={() => setIsDrawerOpen(false)} 
          user={user}
          onLogout={logout}
        />
        <main className="page-wrapper">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/movie/:id" element={<MovieDetails />} />
            <Route path="/book/:showId" element={<SeatSelection />} />
            <Route 
              path="/checkout" 
              element={
                <ProtectedRoute>
                  <Checkout />
                </ProtectedRoute>
              } 
            />
            <Route path="/profile" element={<Profile />} />
            <Route 
              path="/ticket/:ticketId" 
              element={
                <ProtectedRoute>
                  <TicketDetail />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin" 
              element={
                <RoleProtectedRoute allowedRoles={['ADMIN']}>
                  <AdminDashboard />
                </RoleProtectedRoute>
              } 
            />
            <Route 
              path="/manager" 
              element={
                <RoleProtectedRoute allowedRoles={['THEATRE_MANAGER', 'ADMIN']}>
                  <ManagerDashboard />
                </RoleProtectedRoute>
              } 
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
