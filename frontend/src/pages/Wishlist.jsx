import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { wishlistService } from '../services/api';
import PropertyCard from '../components/PropertyCard';
import Loader from '../components/Loader';
import { Heart, Trash2, ArrowRight } from 'lucide-react';

const Wishlist = () => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [comparedProperties, setComparedProperties] = useState([]);

  useEffect(() => {
    fetchWishlist();
    const saved = JSON.parse(localStorage.getItem('comparedProperties') || '[]');
    setComparedProperties(saved);
  }, []);

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await wishlistService.getWishlist();
      setWishlist(response.data.wishlist || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load your wishlist.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (property) => {
    const propId = property._id;
    try {
      await wishlistService.remove(propId);
      setWishlist((prev) => prev.filter((item) => item.property?._id !== propId));
    } catch (err) {
      console.error('Failed to remove from wishlist:', err);
    }
  };

  const handleCompareToggle = (property) => {
    let current = [...comparedProperties];
    const exists = current.some((p) => p._id === property._id);

    if (exists) {
      current = current.filter((p) => p._id !== property._id);
    } else {
      if (current.length >= 4) {
        alert('You can compare a maximum of 4 properties at once.');
        return;
      }
      current.push(property);
    }

    setComparedProperties(current);
    localStorage.setItem('comparedProperties', JSON.stringify(current));
  };

  if (loading) {
    return <Loader fullScreen={true} message="Loading your saved properties..." />;
  }

  return (
    <div className="page-wrapper container">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 className="page-title">My Saved Properties</h1>
          <p className="page-subtitle">
            Review homes and properties you have earmarked for purchase or rental
          </p>
        </div>
        <span className="badge badge-featured" style={{ fontSize: '0.9rem', padding: '0.4rem 0.8rem' }}>
          {wishlist.length} Saved {wishlist.length === 1 ? 'Home' : 'Homes'}
        </span>
      </div>

      {error && (
        <div className="alert alert-danger">
          <span>{error}</span>
        </div>
      )}

      {wishlist.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '4rem 1rem' }}>
          <Heart size={48} color="#cbd5e1" style={{ margin: '0 auto 1rem' }} />
          <h3>Your wishlist is currently empty</h3>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>
            Click the heart icon on any property listing to save it here for quick access later.
          </p>
          <Link to="/properties" className="btn btn-primary" style={{ marginTop: '1.5rem' }}>
            <span>Browse Properties</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '1.75rem',
          }}
        >
          {wishlist.map((item) => {
            const prop = item.property;
            if (!prop) return null;
            return (
              <PropertyCard
                key={prop._id}
                property={prop}
                onWishlistToggle={handleRemove}
                isWishlisted={true}
                onCompareToggle={handleCompareToggle}
                isCompared={comparedProperties.some((p) => p._id === prop._id)}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Wishlist;
