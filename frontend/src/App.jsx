import React, { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

// Public Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Properties from './pages/Properties';
import PropertyDetails from './pages/PropertyDetails';
import Comparison from './pages/Comparison';
import Inquiry from './pages/Inquiry';
import NotFound from './pages/NotFound';

// Protected User Pages
import Wishlist from './pages/Wishlist';
import Booking from './pages/Booking';
import Profile from './pages/Profile';
import UserDashboard from './pages/UserDashboard';

// Protected Agent Pages
import AgentDashboard from './pages/AgentDashboard';
import AddProperty from './pages/AddProperty';
import EditProperty from './pages/EditProperty';

// Protected Admin Pages
import AdminDashboard from './pages/AdminDashboard';
import ManageUsers from './pages/ManageUsers';
import ManageAgents from './pages/ManageAgents';
import ManageProperties from './pages/ManageProperties';
import ManageBookings from './pages/ManageBookings';

// Scroll to top on route change
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function App() {
  return (
    <div className="app-container">
      <ScrollToTop />
      <Navbar />
      <main className="main-content">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/properties" element={<Properties />} />
          <Route path="/properties/:id" element={<PropertyDetails />} />
          <Route path="/comparison" element={<Comparison />} />
          <Route path="/inquiry" element={<Inquiry />} />

          {/* User Protected Routes */}
          <Route
            path="/wishlist"
            element={
              <ProtectedRoute allowedRoles={['user']}>
                <Wishlist />
              </ProtectedRoute>
            }
          />
          <Route
            path="/booking"
            element={
              <ProtectedRoute allowedRoles={['user', 'agent', 'admin']}>
                <Booking />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute allowedRoles={['user', 'agent', 'admin']}>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/user/dashboard"
            element={
              <ProtectedRoute allowedRoles={['user']}>
                <UserDashboard />
              </ProtectedRoute>
            }
          />

          {/* Agent Protected Routes */}
          <Route
            path="/agent/dashboard"
            element={
              <ProtectedRoute allowedRoles={['agent', 'admin']}>
                <AgentDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/agent/add-property"
            element={
              <ProtectedRoute allowedRoles={['agent', 'admin']}>
                <AddProperty />
              </ProtectedRoute>
            }
          />
          <Route
            path="/agent/edit-property/:id"
            element={
              <ProtectedRoute allowedRoles={['agent', 'admin']}>
                <EditProperty />
              </ProtectedRoute>
            }
          />

          {/* Admin Protected Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <ManageUsers />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/agents"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <ManageAgents />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/properties"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <ManageProperties />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/bookings"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <ManageBookings />
              </ProtectedRoute>
            }
          />

          {/* 404 Catch-All */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
