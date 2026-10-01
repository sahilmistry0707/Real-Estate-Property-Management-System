import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { propertyService, wishlistService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import MapView from '../components/MapView';
import Loader from '../components/Loader';
import {
  Bed,
  Bath,
  Maximize2,
  MapPin,
  Heart,
  GitCompare,
  Calendar,
  MessageSquare,
  Phone,
  Mail,
  Building,
  CheckCircle,
  Navigation,
  ArrowLeft,
  Share2,
  Check,
} from 'lucide-react';

const PropertyDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, isUser } = useAuth();

  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedImage, setSelectedImage] = useState(0);

  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isCompared, setIsCompared] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const fetchDetails = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await propertyService.getById(id);
      const propData = response.data.property;
      setProperty(propData);

      // Check wishlist status
      if (isAuthenticated && isUser) {
        try {
          const wishRes = await wishlistService.check(id);
          setIsWishlisted(wishRes.data.isWishlisted);
        } catch (e) {
          // Non-critical
        }
      }

      // Check compare status
      const compared = JSON.parse(localStorage.getItem('comparedProperties') || '[]');
      setIsCompared(compared.some((p) => p._id === id));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load property details.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleWishlistToggle = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (!isUser) {
      alert('Only registered buyers/tenants can add to wishlist.');
      return;
    }

    try {
      if (isWishlisted) {
        await wishlistService.remove(id);
        setIsWishlisted(false);
      } else {
        await wishlistService.add(id);
        setIsWishlisted(true);
      }
    } catch (err) {
      console.error('Wishlist toggle error:', err);
    }
  };

  const handleCompareToggle = () => {
    let current = JSON.parse(localStorage.getItem('comparedProperties') || '[]');
    const exists = current.some((p) => p._id === id);

    if (exists) {
      current = current.filter((p) => p._id !== id);
      setIsCompared(false);
    } else {
      if (current.length >= 4) {
        alert('You can compare a maximum of 4 properties at once.');
        return;
      }
      current.push(property);
      setIsCompared(true);
    }

    localStorage.setItem('comparedProperties', JSON.stringify(current));
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return <Loader fullScreen={true} message="Loading property specifications..." />;
  }

  if (error || !property) {
    return (
      <div className="page-wrapper container" style={{ textAlign: 'center', padding: '4rem 1rem' }}>
        <h2>Property Not Found</h2>
        <p style={{ color: 'var(--text-muted)', margin: '1rem 0' }}>{error || 'Unable to retrieve property.'}</p>
        <Link to="/properties" className="btn btn-primary">
          Back to Listings
        </Link>
      </div>
    );
  }

  const defaultImg =
    'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1200&q=80';
  const images = property.images && property.images.length > 0 ? property.images : [defaultImg];

  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(property.price || 0);

  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${property.latitude},${property.longitude}`;

  return (
    <div className="page-wrapper container">
      {/* Top Navigation breadcrumb */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.5rem',
        }}
      >
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="btn btn-outline btn-sm"
          style={{ gap: '0.4rem' }}
        >
          <ArrowLeft size={16} />
          <span>Back</span>
        </button>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            type="button"
            className={`btn btn-sm ${isWishlisted ? 'btn-danger' : 'btn-outline'}`}
            onClick={handleWishlistToggle}
            style={{ gap: '0.35rem' }}
          >
            <Heart size={16} fill={isWishlisted ? '#ffffff' : 'none'} />
            <span>{isWishlisted ? 'Saved' : 'Save'}</span>
          </button>

          <button
            type="button"
            className={`btn btn-sm ${isCompared ? 'btn-secondary' : 'btn-outline'}`}
            onClick={handleCompareToggle}
            style={{ gap: '0.35rem' }}
          >
            <GitCompare size={16} />
            <span>{isCompared ? 'In Compare' : 'Compare'}</span>
          </button>

          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={handleShare}
            style={{ gap: '0.35rem' }}
          >
            {copied ? <Check size={16} color="green" /> : <Share2 size={16} />}
            <span>{copied ? 'Link Copied!' : 'Share'}</span>
          </button>
        </div>
      </div>

      {/* Title & Price Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '1.5rem',
        }}
      >
        <div>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <span className={`badge ${property.purpose === 'Rent' ? 'badge-rent' : 'badge-buy'}`}>
              For {property.purpose}
            </span>
            <span className="badge" style={{ background: '#e2e8f0', color: '#1e293b' }}>
              {property.type}
            </span>
            <span className={`badge badge-${property.status?.toLowerCase() || 'available'}`}>
              {property.status}
            </span>
            {property.featured && <span className="badge badge-featured">Featured</span>}
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--secondary)' }}>
            {property.title}
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)' }}>
            <MapPin size={16} color="var(--primary)" />
            <span>
              {property.address}, {property.city}, {property.state} {property.pincode}
            </span>
          </div>
        </div>

        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--primary)' }}>
            {formattedPrice}
            {property.purpose === 'Rent' && (
              <span style={{ fontSize: '1rem', fontWeight: 500, color: 'var(--text-muted)' }}>
                {' '}
                / month
              </span>
            )}
          </div>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Est. ${(property.price / (property.area || 1)).toFixed(0)}/sq ft
          </span>
        </div>
      </div>

      {/* Image Gallery */}
      <div style={{ marginBottom: '2.5rem' }}>
        <div
          style={{
            height: '460px',
            borderRadius: 'var(--radius-lg)',
            overflow: 'hidden',
            backgroundColor: '#0f172a',
            marginBottom: '0.75rem',
          }}
        >
          <img
            src={
              images[selectedImage].startsWith('http')
                ? images[selectedImage]
                : `http://localhost:5000/${images[selectedImage]}`
            }
            alt={property.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = defaultImg;
            }}
          />
        </div>

        {images.length > 1 && (
          <div style={{ display: 'flex', gap: '0.75rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
            {images.map((img, idx) => {
              const src = img.startsWith('http') ? img : `http://localhost:5000/${img}`;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedImage(idx)}
                  style={{
                    width: '100px',
                    height: '70px',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    border: selectedImage === idx ? '3px solid var(--primary)' : '1px solid var(--border)',
                    padding: 0,
                    cursor: 'pointer',
                    flexShrink: 0,
                  }}
                >
                  <img src={src} alt="thumbnail" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Main Grid: Details (Left) + Actions/Agent Card (Right) */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2.5rem' }}>
        {/* Left Column: Specs, Description, Amenities, Map */}
        <div>
          {/* Key Attributes Bar */}
          <div
            className="card"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
              gap: '1rem',
              textAlign: 'center',
              marginBottom: '2rem',
            }}
          >
            <div>
              <Bed size={24} style={{ color: 'var(--primary)', margin: '0 auto 0.35rem' }} />
              <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{property.bedrooms || 0} BHK</div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Bedrooms</span>
            </div>
            <div>
              <Bath size={24} style={{ color: 'var(--primary)', margin: '0 auto 0.35rem' }} />
              <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{property.bathrooms || 0} Baths</div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Bathrooms</span>
            </div>
            <div>
              <Maximize2 size={24} style={{ color: 'var(--primary)', margin: '0 auto 0.35rem' }} />
              <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{property.area} sq ft</div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Super Built-up</span>
            </div>
            <div>
              <Building size={24} style={{ color: 'var(--primary)', margin: '0 auto 0.35rem' }} />
              <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{property.furnishing}</div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Furnishing</span>
            </div>
          </div>

          {/* Description */}
          <div className="card" style={{ marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--secondary)' }}>
              Property Overview & Details
            </h3>
            <p style={{ whiteSpace: 'pre-line', color: '#334155', lineHeight: 1.8 }}>
              {property.description}
            </p>
          </div>

          {/* Amenities */}
          {property.amenities && property.amenities.length > 0 && (
            <div className="card" style={{ marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--secondary)' }}>
                Features & Amenities
              </h3>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                  gap: '0.75rem',
                }}
              >
                {property.amenities.map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.5rem 0.75rem',
                      backgroundColor: '#f8fafc',
                      borderRadius: '8px',
                      border: '1px solid var(--border)',
                      fontSize: '0.9rem',
                    }}
                  >
                    <CheckCircle size={16} color="var(--success)" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Location & Map Directions */}
          <div className="card" style={{ marginBottom: '2rem' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1rem',
              }}
            >
              <div>
                <h3 style={{ fontSize: '1.25rem', color: 'var(--secondary)' }}>Location & Map</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  Exact coordinates: {property.latitude}, {property.longitude}
                </p>
              </div>
              <a
                href={directionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline btn-sm"
                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <Navigation size={16} />
                <span>Get Directions</span>
              </a>
            </div>

            <MapView singleProperty={property} height="360px" zoom={14} />
          </div>
        </div>

        {/* Right Column: Buy/Rent Actions, Visit Scheduling & Agent Profile */}
        <div>
          {/* Action Card: Schedule Visit / Buy / Rent */}
          <div className="card" style={{ marginBottom: '1.75rem' }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Take the Next Step</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
              Schedule an in-person property walkthrough or initiate a {property.purpose?.toLowerCase()}{' '}
              request.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {/* Buy / Rent Application (No fake payment) */}
              <Link
                to={`/booking?propertyId=${property._id}&bookingType=${
                  property.purpose === 'Rent' ? 'Rental Booking' : 'Purchase Booking'
                }`}
                className="btn btn-primary btn-lg"
                style={{ width: '100%' }}
              >
                <Building size={18} />
                <span>
                  {property.purpose === 'Rent' ? 'Apply to Rent' : 'Request to Purchase'}
                </span>
              </Link>

              {/* Book Visit */}
              <Link
                to={`/booking?propertyId=${property._id}&bookingType=Visit`}
                className="btn btn-secondary btn-lg"
                style={{ width: '100%' }}
              >
                <Calendar size={18} />
                <span>Schedule a Free Visit</span>
              </Link>

              {/* Send Inquiry */}
              <Link
                to={`/inquiry?propertyId=${property._id}`}
                className="btn btn-outline"
                style={{ width: '100%' }}
              >
                <MessageSquare size={16} />
                <span>Send Quick Inquiry</span>
              </Link>
            </div>
          </div>

          {/* Agent Information Card */}
          {property.agent && (
            <div className="card">
              <h3 style={{ fontSize: '1.15rem', marginBottom: '1rem', color: 'var(--secondary)' }}>
                Listing Agent
              </h3>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
                <div
                  style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--primary-light)',
                    color: 'var(--primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '1.4rem',
                  }}
                >
                  {property.agent.fullName ? property.agent.fullName.charAt(0) : 'A'}
                </div>

                <div>
                  <h4 style={{ fontSize: '1.05rem', fontWeight: 600 }}>
                    {property.agent.fullName || 'Certified Agent'}
                  </h4>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    {property.agent.agencyName || 'Verified Broker'}
                  </p>
                </div>
              </div>

              {property.agent.bio && (
                <p
                  style={{
                    fontSize: '0.875rem',
                    color: '#475569',
                    fontStyle: 'italic',
                    marginBottom: '1.25rem',
                  }}
                >
                  "{property.agent.bio}"
                </p>
              )}

              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.65rem',
                  borderTop: '1px solid var(--border)',
                  paddingTop: '1rem',
                  fontSize: '0.875rem',
                }}
              >
                {property.agent.phone && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <Phone size={16} color="var(--primary)" />
                    <a href={`tel:${property.agent.phone}`} style={{ color: 'inherit' }}>
                      {property.agent.phone}
                    </a>
                  </div>
                )}
                {property.agent.email && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <Mail size={16} color="var(--primary)" />
                    <a href={`mailto:${property.agent.email}`} style={{ color: 'inherit' }}>
                      {property.agent.email}
                    </a>
                  </div>
                )}
              </div>

              <Link
                to={`/inquiry?propertyId=${property._id}`}
                className="btn btn-outline btn-sm"
                style={{ width: '100%', marginTop: '1.25rem' }}
              >
                Contact Agent Directly
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PropertyDetails;
