import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

const NotFound = () => {
  return (
    <div
      className="page-wrapper container"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        textAlign: 'center',
      }}
    >
      <div style={{ fontSize: '6rem', fontWeight: 800, color: 'var(--primary)', lineHeight: 1 }}>
        404
      </div>
      <h2 style={{ fontSize: '2rem', marginTop: '1rem', marginBottom: '0.5rem', color: 'var(--secondary)' }}>
        Page Not Found
      </h2>
      <p style={{ color: 'var(--text-muted)', maxWidth: '460px', marginBottom: '2rem' }}>
        The page you are looking for might have been removed, had its name changed, or is temporarily
        unavailable.
      </p>

      <div style={{ display: 'flex', gap: '1rem' }}>
        <Link to="/" className="btn btn-primary" style={{ gap: '0.5rem' }}>
          <Home size={18} />
          <span>Return Home</span>
        </Link>
        <Link to="/properties" className="btn btn-outline" style={{ gap: '0.5rem' }}>
          <span>Explore Properties</span>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
