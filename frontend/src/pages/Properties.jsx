import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { propertyService, wishlistService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import SearchBar from '../components/SearchBar';
import PropertyFilter from '../components/PropertyFilter';
import PropertyCard from '../components/PropertyCard';
import MapView from '../components/MapView';
import Loader from '../components/Loader';
import { LayoutGrid, Map as MapIcon, SlidersHorizontal, AlertCircle } from 'lucide-react';

const Properties = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { isAuthenticated, isUser } = useAuth();

  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'map' | 'split'
  const [showFilters, setShowFilters] = useState(false);

  const [wishlistIds, setWishlistIds] = useState(new Set());
  const [comparedProperties, setComparedProperties] = useState([]);

  // Filters state from query parameters
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    city: searchParams.get('city') || '',
    purpose: searchParams.get('purpose') || '',
    type: searchParams.get('type') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    bedrooms: searchParams.get('bedrooms') || '',
    bathrooms: searchParams.get('bathrooms') || '',
    furnishing: searchParams.get('furnishing') || '',
    sort: searchParams.get('sort') || 'newest',
  });

  useEffect(() => {
    // Sync filters from URL search params when they change
    const updated = {
      search: searchParams.get('search') || '',
      city: searchParams.get('city') || '',
      purpose: searchParams.get('purpose') || '',
      type: searchParams.get('type') || '',
      minPrice: searchParams.get('minPrice') || '',
      maxPrice: searchParams.get('maxPrice') || '',
      bedrooms: searchParams.get('bedrooms') || '',
      bathrooms: searchParams.get('bathrooms') || '',
      furnishing: searchParams.get('furnishing') || '',
      sort: searchParams.get('sort') || 'newest',
    };
    setFilters(updated);
    fetchProperties(updated);
  }, [searchParams]);

  useEffect(() => {
    // Load compared list
    const saved = JSON.parse(localStorage.getItem('comparedProperties') || '[]');
    setComparedProperties(saved);

    // If user is logged in, fetch wishlist items
    if (isAuthenticated && isUser) {
      loadWishlist();
    }
  }, [isAuthenticated, isUser]);

  const loadWishlist = async () => {
    try {
      const res = await wishlistService.getWishlist();
      const ids = new Set(
        (res.data.wishlist || []).map((item) =>
          typeof item.property === 'object' ? item.property._id : item.property
        )
      );
      setWishlistIds(ids);
    } catch (err) {
      console.error('Failed to load wishlist:', err);
    }
  };

  const fetchProperties = async (currentFilters) => {
    try {
      setLoading(true);
      setError('');
      // Clean up empty params
      const cleanParams = {};
      Object.keys(currentFilters).forEach((key) => {
        if (currentFilters[key]) cleanParams[key] = currentFilters[key];
      });

      const response = await propertyService.getAll(cleanParams);
      setProperties(response.data.properties || []);
    } catch (err) {
      setError('Failed to fetch properties. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateUrlParams = (newFilters) => {
    const params = new URLSearchParams();
    Object.keys(newFilters).forEach((key) => {
      if (newFilters[key]) params.set(key, newFilters[key]);
    });
    setSearchParams(params);
  };

  const handleSearch = (searchData) => {
    const merged = { ...filters, ...searchData };
    setFilters(merged);
    updateUrlParams(merged);
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    updateUrlParams(newFilters);
  };

  const handleResetFilters = () => {
    const reset = {
      search: '',
      city: '',
      purpose: '',
      type: '',
      minPrice: '',
      maxPrice: '',
      bedrooms: '',
      bathrooms: '',
      furnishing: '',
      sort: 'newest',
    };
    setFilters(reset);
    setSearchParams(new URLSearchParams());
  };

  const handleWishlistToggle = async (property) => {
    if (!isAuthenticated) {
      alert('Please log in to add properties to your wishlist.');
      return;
    }
    if (!isUser) {
      alert('Only registered buyers/tenants can maintain a wishlist.');
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
      console.error('Wishlist update failed:', err);
    }
  };

  const handleCompareToggle = (property) => {
    let current = [...comparedProperties];
    const exists = current.some((p) => p._id === property._id);

    if (exists) {
      current = current.filter((p) => p._id !== property._id);
    } else {
      if (current.length >= 4) {
        alert('You can compare a maximum of 4 properties at a time.');
        return;
      }
      current.push(property);
    }

    setComparedProperties(current);
    localStorage.setItem('comparedProperties', JSON.stringify(current));
  };

  return (
    <div className="page-wrapper container">
      <div className="page-header">
        <h1 className="page-title">Explore Properties</h1>
        <p className="page-subtitle">
          Find your dream home or commercial property with comprehensive filter and map tools
        </p>
      </div>

      {/* Top Search Bar */}
      <div style={{ marginBottom: '1.5rem' }}>
        <SearchBar onSearch={handleSearch} initialValues={filters} />
      </div>

      {/* Control bar: Filters toggle, view switch (grid/map), results count */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '1.5rem',
        }}
      >
        <button
          type="button"
          className="btn btn-outline"
          onClick={() => setShowFilters(!showFilters)}
          style={{ gap: '0.4rem' }}
        >
          <SlidersHorizontal size={16} />
          <span>{showFilters ? 'Hide Filters' : 'Advanced Filters'}</span>
        </button>

        <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Showing <strong>{properties.length}</strong> available listings
        </div>

        {/* View Switcher Buttons */}
        <div style={{ display: 'flex', gap: '0.35rem', background: '#e2e8f0', padding: '4px', borderRadius: '8px' }}>
          <button
            type="button"
            className={`btn btn-sm ${viewMode === 'grid' ? 'btn-primary' : 'btn-outline'}`}
            style={{ border: 'none' }}
            onClick={() => setViewMode('grid')}
          >
            <LayoutGrid size={16} />
            <span>Grid</span>
          </button>
          <button
            type="button"
            className={`btn btn-sm ${viewMode === 'map' ? 'btn-primary' : 'btn-outline'}`}
            style={{ border: 'none' }}
            onClick={() => setViewMode('map')}
          >
            <MapIcon size={16} />
            <span>Map</span>
          </button>
          <button
            type="button"
            className={`btn btn-sm ${viewMode === 'split' ? 'btn-primary' : 'btn-outline'}`}
            style={{ border: 'none' }}
            onClick={() => setViewMode('split')}
          >
            <span>Split View</span>
          </button>
        </div>
      </div>

      {/* Advanced Filters Panel (Collapsible) */}
      {showFilters && (
        <PropertyFilter
          filters={filters}
          onFilterChange={handleFilterChange}
          onReset={handleResetFilters}
        />
      )}

      {error && (
        <div className="alert alert-danger">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Content Rendering based on loading & viewMode */}
      {loading ? (
        <Loader fullScreen={false} message="Fetching verified properties..." />
      ) : properties.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '4rem 1rem' }}>
          <AlertCircle size={48} color="var(--text-muted)" style={{ margin: '0 auto 1rem' }} />
          <h3>No properties match your current search criteria</h3>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>
            Try loosening your filters, changing your price range, or searching a different city.
          </p>
          <button
            type="button"
            className="btn btn-primary"
            style={{ marginTop: '1.5rem' }}
            onClick={handleResetFilters}
          >
            Clear All Filters
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '1.75rem',
          }}
        >
          {properties.map((property) => (
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
      ) : viewMode === 'map' ? (
        <div>
          <MapView properties={properties} height="650px" />
        </div>
      ) : (
        /* Split View: Left List, Right Sticky Map */
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '1.5rem',
            alignItems: 'start',
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr',
              gap: '1.25rem',
              maxHeight: '800px',
              overflowY: 'auto',
              paddingRight: '0.5rem',
            }}
          >
            {properties.map((property) => (
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

          <div style={{ position: 'sticky', top: '90px' }}>
            <MapView properties={properties} height="800px" />
          </div>
        </div>
      )}
    </div>
  );
};

export default Properties;
