import React from 'react';
import { Link } from 'react-router-dom';
import { Building2, Mail, Phone, MapPin, Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          {/* Col 1: Brand Info */}
          <div>
            <div className="footer-brand">
              <Building2 size={24} style={{ color: 'var(--primary)' }} />
              <span>EstateHub</span>
            </div>
            <p className="footer-desc">
              Next-generation real estate property management platform connecting buyers,
              tenants, agents, and administrators with verified listings and interactive map
              insights.
            </p>
          </div>

          {/* Col 2: Quick Links */}
          <div className="footer-col">
            <h4>Quick Navigation</h4>
            <ul>
              <li>
                <Link to="/">Home Overview</Link>
              </li>
              <li>
                <Link to="/properties">Browse Properties</Link>
              </li>
              <li>
                <Link to="/comparison">Compare Homes</Link>
              </li>
              <li>
                <Link to="/login">Account Login</Link>
              </li>
              <li>
                <Link to="/register">Create Account</Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Categories */}
          <div className="footer-col">
            <h4>Property Categories</h4>
            <ul>
              <li>
                <Link to="/properties?type=Apartment">Modern Apartments</Link>
              </li>
              <li>
                <Link to="/properties?type=Villa">Luxury Villas</Link>
              </li>
              <li>
                <Link to="/properties?type=House">Family Houses</Link>
              </li>
              <li>
                <Link to="/properties?type=Commercial">Commercial Spaces</Link>
              </li>
              <li>
                <Link to="/properties?type=Plot">Residential Plots</Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Contact */}
          <div className="footer-col">
            <h4>Contact Support</h4>
            <ul>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MapPin size={16} style={{ color: 'var(--primary)' }} />
                <span>100 Business Parkway, Tech City</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Phone size={16} style={{ color: 'var(--primary)' }} />
                <span>+1 (800) 555-REAL</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Mail size={16} style={{ color: 'var(--primary)' }} />
                <span>support@estatehub.com</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} Real Estate Property Management System. All rights reserved.</p>
          <p style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            Built for seamless Real Estate Discovery & Management <Heart size={14} color="#ef4444" fill="#ef4444" />
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
