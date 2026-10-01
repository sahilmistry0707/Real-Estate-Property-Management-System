import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Building2,
  Heart,
  GitCompare,
  User,
  LogOut,
  Menu,
  X,
  PlusCircle,
  Shield,
  LayoutDashboard,
} from 'lucide-react';

const Navbar = () => {
  const { user, isAuthenticated, logout, isUser, isAgent, isAdmin } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const closeMenu = () => setMobileMenuOpen(false);

  return (
    <nav className="navbar">
      <div className="container navbar-inner">
        {/* Brand Logo & Name */}
        <Link to="/" className="navbar-brand" onClick={closeMenu}>
          <div className="brand-icon">
            <Building2 size={22} />
          </div>
          <span>EstateHub</span>
        </Link>

        {/* Mobile menu toggle button */}
        <button
          className="mobile-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle navigation"
        >
          {mobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
        </button>

        {/* Navigation links */}
        <ul className={`nav-links ${mobileMenuOpen ? 'open' : ''}`}>
          <li>
            <NavLink
              to="/"
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              onClick={closeMenu}
              end
            >
              Home
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/properties"
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              onClick={closeMenu}
            >
              Properties
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/comparison"
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              onClick={closeMenu}
            >
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <GitCompare size={16} /> Compare
              </span>
            </NavLink>
          </li>

          {/* User Links */}
          {isAuthenticated && isUser && (
            <>
              <li>
                <NavLink
                  to="/wishlist"
                  className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                  onClick={closeMenu}
                >
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <Heart size={16} /> Wishlist
                  </span>
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/user/dashboard"
                  className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                  onClick={closeMenu}
                >
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <LayoutDashboard size={16} /> Dashboard
                  </span>
                </NavLink>
              </li>
            </>
          )}

          {/* Agent Links */}
          {isAuthenticated && isAgent && (
            <>
              <li>
                <NavLink
                  to="/agent/dashboard"
                  className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                  onClick={closeMenu}
                >
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <LayoutDashboard size={16} /> Agent Portal
                  </span>
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/agent/add-property"
                  className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                  onClick={closeMenu}
                >
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <PlusCircle size={16} /> Add Listing
                  </span>
                </NavLink>
              </li>
            </>
          )}

          {/* Admin Links */}
          {isAuthenticated && isAdmin && (
            <>
              <li>
                <NavLink
                  to="/admin/dashboard"
                  className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                  onClick={closeMenu}
                >
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <Shield size={16} /> Admin Panel
                  </span>
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/admin/properties"
                  className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                  onClick={closeMenu}
                >
                  Manage Listings
                </NavLink>
              </li>
            </>
          )}

          {/* Auth Section */}
          <li style={{ marginTop: mobileMenuOpen ? '1rem' : 0 }}>
            {isAuthenticated ? (
              <div className="nav-auth">
                <Link
                  to="/profile"
                  className="user-badge"
                  onClick={closeMenu}
                  title="View Profile"
                >
                  <User size={16} />
                  <span>{user?.fullName?.split(' ')[0]}</span>
                  <span
                    style={{
                      fontSize: '0.7rem',
                      textTransform: 'uppercase',
                      padding: '2px 6px',
                      background: 'var(--primary)',
                      color: 'white',
                      borderRadius: '4px',
                    }}
                  >
                    {user?.role}
                  </span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="btn btn-outline btn-sm"
                  title="Log out"
                >
                  <LogOut size={16} />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="nav-auth">
                <Link to="/login" className="btn btn-outline btn-sm" onClick={closeMenu}>
                  Login
                </Link>
                <Link to="/register" className="btn btn-primary btn-sm" onClick={closeMenu}>
                  Register
                </Link>
              </div>
            )}
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
