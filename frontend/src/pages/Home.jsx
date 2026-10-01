import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { propertyService, wishlistService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import SearchBar from '../components/SearchBar';
import PropertyCard from '../components/PropertyCard';
import MapView from '../components/MapView';
import Loader from '../components/Loader';
import {
  ShieldCheck,
  Compass,
  Key,
  Users,
  Building,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';

const Home = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isUser } = useAuth();
  const [featuredProperties, setFeaturedProperties] = useState([]);
  const [mapProperties, setMapProperties] = useState([]);
  const [wishlistIds, setWishlistIds] = useState(new Set());
  const [comparedProperties, setComparedProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHomeData();
    // Load compared properties from session/local storage
    const savedCompare = JSON.parse(localStorage.getItem('comparedProperties') || '[]');
    setComparedProperties(savedCompare);
  }, []);

  const fetchHomeData = async () => {
    try {
      setLoading(true);
      // Fetch featured properties
      const response = await propertyService.getAll({ featured: true, limit: 6 });
      setFeaturedProperties(response.data.properties || []);

      // Fetch properties with coordinates for map
      const mapRes = await propertyService.getMapProperties();
      setMapProperties(mapRes.data.properties || []);

      // If user is logged in, fetch wishlist IDs
      if (isAuthenticated && isUser) {
        try {
          const wishRes = await wishlistService.getWishlist();
          const ids = new Set(
            (wishRes.data.wishlist || []).map((item) =>
              typeof item.property === 'object' ? item.property._id : item.property
            )
          );
          setWishlistIds(ids);
        } catch (e) {
          console.error('Error loading wishlist in home:', e);
        }
      }
    } catch (error) {
      console.error('Error fetching home data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (searchFilters) => {
    const params = new URLSearchParams();
    if (searchFilters.search) params.append('search', searchFilters.search);
    if (searchFilters.city) params.append('city', searchFilters.city);
    if (searchFilters.purpose) params.append('purpose', searchFilters.purpose);
    if (searchFilters.type) params.append('type', searchFilters.type);
    navigate(`/properties?${params.toString()}`);
  };

  const handleWishlistToggle = async (property) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (!isUser) {
      alert('Only registered buyers/tenants can add to wishlist.');
      return;
    }

    const propId = property._id;
    const isSaved = wishlistIds.has(propId);

    try {
      if (isSaved) {
        await wishlistService.remove(propId);
        setWishlistIds((prev) => {
          const next = new Set(prev);
          next.delete(propId);
          return next;
        });
      } else {
        await wishlistService.add(propId);
        setWishlistIds((prev) => new Set(prev).add(propId));
      }
    } catch (err) {
      console.error('Wishlist action failed:', err);
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

  return (
    <div>
      {/* Hero Section */}
      <section className="hero-section">
        <div className="container hero-content">
          <span
            className="badge badge-featured"
            style={{ marginBottom: '1.25rem', padding: '0.4rem 1rem', fontSize: '0.85rem' }}
          >
            ★ The #1 Real Estate Management Platform
          </span>
          <h1 className="hero-title">Discover Your Perfect Space with Confidence</h1>
          <p className="hero-subtitle">
            Explore thousands of verified homes, luxury villas, commercial units, and rental
            apartments with live OpenStreetMap geolocation.
          </p>

          <SearchBar onSearch={handleSearch} />
        </div>
      </section>

      {/* Stats Counter Bar */}
      <section style={{ backgroundColor: '#ffffff', borderBottom: '1px solid var(--border)', padding: '2rem 0' }}>
        <div className="container">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '2rem',
              textAlign: 'center',
            }}
          >
            <div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary)' }}>2,500+</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Verified Properties</div>
            </div>
            <div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary)' }}>450+</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Certified Agents</div>
            </div>
            <div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary)' }}>12,000+</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Happy Clients</div>
            </div>
            <div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary)' }}>99%</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Satisfaction Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Properties Section */}
      <section className="page-wrapper container">
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            marginBottom: '2rem',
          }}
        >
          <div>
            <h2 className="page-title">Featured Properties</h2>
            <p className="page-subtitle">Handpicked top-rated listings verified by our specialists</p>
          </div>
          <Link
            to="/properties"
            className="btn btn-outline"
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <span>View All Listings</span>
            <ArrowRight size={16} />
          </Link>
        </div>

        {loading ? (
          <Loader message="Loading premier properties..." />
        ) : featuredProperties.length > 0 ? (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: '1.75rem',
            }}
          >
            {featuredProperties.map((property) => (
              <PropertyCard
                key={property._id}
                property={property}
                onWishlistToggle={handleWishlistToggle}
                isWishlisted={wishlistIds.has(property._id)}
                onCompareToggle={handleCompareToggle}
                isCompared={comparedProperties.some((p) => p._id === property._id)}
              />
            ))}
          </div>
        ) : (
          <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
            <Building size={48} color="var(--text-muted)" style={{ margin: '0 auto 1rem' }} />
            <h3>No featured listings available right now</h3>
            <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>
              Check back soon or explore our full collection of properties.
            </p>
            <Link to="/properties" className="btn btn-primary" style={{ marginTop: '1.5rem' }}>
              Browse All Properties
            </Link>
          </div>
        )}
      </section>

      {/* Live Map Discovery Section */}
      <section style={{ backgroundColor: '#ffffff', padding: '4rem 0', borderTop: '1px solid var(--border)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '700px', margin: '0 auto 2.5rem' }}>
            <span className="badge badge-rent" style={{ marginBottom: '0.5rem' }}>
              Interactive Geo-Search
            </span>
            <h2 className="page-title">Map-Based Property Exploration</h2>
            <p className="page-subtitle">
              Locate properties across key neighborhoods and get instant driving or transit directions
              powered by OpenStreetMap.
            </p>
          </div>

          <MapView properties={mapProperties.length > 0 ? mapProperties : featuredProperties} height="500px" />
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="page-wrapper container">
        <div style={{ textAlign: 'center', maxWidth: '650px', margin: '0 auto 3rem' }}>
          <h2 className="page-title">Why Manage Properties With Us?</h2>
          <p className="page-subtitle">
            Engineered from the ground up for transparent transactions, certified agents, and high accuracy.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '2rem',
          }}
        >
          <div className="card">
            <div
              style={{
                width: '50px',
                height: '50px',
                borderRadius: '12px',
                background: 'var(--primary-light)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem',
              }}
            >
              <ShieldCheck size={28} />
            </div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>100% Verified Listings</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.925rem' }}>
              Every property goes through strict administrator verification before publication to ensure
              zero fraudulent listings.
            </p>
          </div>

          <div className="card">
            <div
              style={{
                width: '50px',
                height: '50px',
                borderRadius: '12px',
                background: '#ecfdf5',
                color: '#10b981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem',
              }}
            >
              <Compass size={28} />
            </div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Precise Map Directions</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.925rem' }}>
              OpenStreetMap integration provides exact coordinates, neighborhood details, and 1-click
              navigation routes to visit properties.
            </p>
          </div>

          <div className="card">
            <div
              style={{
                width: '50px',
                height: '50px',
                borderRadius: '12px',
                background: '#fffbeb',
                color: '#f59e0b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem',
              }}
            >
              <Key size={28} />
            </div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Direct Agent Bookings</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.925rem' }}>
              Schedule in-person property tours and submit purchase/rental applications directly without
              intermediaries or extra fees.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section
        style={{
          background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
          color: 'white',
          padding: '4rem 0',
          textAlign: 'center',
        }}
      >
        <div className="container" style={{ maxWidth: '700px' }}>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: '1rem' }}>
            Ready to Find or List Your Next Property?
          </h2>
          <p style={{ color: '#94a3b8', marginBottom: '2rem', fontSize: '1.05rem' }}>
            Join thousands of property seekers and professional agents managing properties smoothly with
            real-time tracking.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/register" className="btn btn-primary btn-lg">
              Get Started Free
            </Link>
            <Link to="/properties" className="btn btn-outline btn-lg" style={{ color: '#0f172a', borderColor: '#475569' }}>
              Explore Properties
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
