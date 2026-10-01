import React from 'react';
import { Link } from 'react-router-dom';
import { Bed, Bath, Maximize2, MapPin, Heart, GitCompare } from 'lucide-react';

const PropertyCard = ({
  property,
  onWishlistToggle,
  isWishlisted = false,
  onCompareToggle,
  isCompared = false,
}) => {
  if (!property) return null;

  // Safe fallback image for properties
  const defaultImage =
    'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80';

  const imageUrl =
    property.images && property.images.length > 0
      ? property.images[0].startsWith('http')
        ? property.images[0]
        : `http://localhost:5000/${property.images[0]}`
      : defaultImage;

  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(property.price || 0);

  return (
    <div className="property-card">
      <div className="card-img-wrap">
        <img
          src={imageUrl}
          alt={property.title}
          className="card-img"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = defaultImage;
          }}
        />

        {/* Badges Overlay */}
        <div className="card-badges">
          <span className={`badge ${property.purpose === 'Rent' ? 'badge-rent' : 'badge-buy'}`}>
            For {property.purpose}
          </span>
          <span className="badge" style={{ background: 'rgba(15, 23, 42, 0.75)', color: '#fff' }}>
            {property.type}
          </span>
          {property.featured && <span className="badge badge-featured">Featured</span>}
          {property.status && property.status !== 'Available' && (
            <span className="badge badge-rejected">{property.status}</span>
          )}
        </div>

        {/* Wishlist Button Overlay */}
        {onWishlistToggle && (
          <button
            type="button"
            className="card-wishlist-btn"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onWishlistToggle(property);
            }}
            title={isWishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
            aria-label="Wishlist toggle"
          >
            <Heart
              size={18}
              color={isWishlisted ? '#ef4444' : '#64748b'}
              fill={isWishlisted ? '#ef4444' : 'none'}
            />
          </button>
        )}
      </div>

      <div className="card-body">
        <div className="card-price">
          {formattedPrice}
          {property.purpose === 'Rent' && <span> / month</span>}
        </div>

        <h3 className="card-title" title={property.title}>
          <Link to={`/properties/${property._id}`}>{property.title}</Link>
        </h3>

        <div className="card-location">
          <MapPin size={15} color="var(--primary)" />
          <span>
            {property.city}, {property.state || 'USA'}
          </span>
        </div>

        <div className="card-features">
          <div className="feature-item" title="Bedrooms">
            <Bed size={16} />
            <span>{property.bedrooms || 0} Beds</span>
          </div>
          <div className="feature-item" title="Bathrooms">
            <Bath size={16} />
            <span>{property.bathrooms || 0} Baths</span>
          </div>
          <div className="feature-item" title="Area">
            <Maximize2 size={16} />
            <span>{property.area || 0} sq ft</span>
          </div>
        </div>

        <div className="card-actions">
          <Link to={`/properties/${property._id}`} className="btn btn-primary btn-sm">
            View Details
          </Link>
          {onCompareToggle && (
            <button
              type="button"
              className={`btn btn-sm ${isCompared ? 'btn-secondary' : 'btn-outline'}`}
              onClick={() => onCompareToggle(property)}
              title={isCompared ? 'Remove from comparison' : 'Compare property'}
            >
              <GitCompare size={15} />
              {isCompared ? 'Compared' : 'Compare'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PropertyCard;
