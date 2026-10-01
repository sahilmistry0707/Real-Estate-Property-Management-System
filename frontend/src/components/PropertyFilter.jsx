import React from 'react';
import { Filter, RotateCcw } from 'lucide-react';

const PropertyFilter = ({ filters, onFilterChange, onReset }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    onFilterChange({
      ...filters,
      [name]: value,
    });
  };

  return (
    <div className="filter-panel">
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1.25rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Filter size={20} color="var(--primary)" />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Filter & Refine</h3>
        </div>
        <button
          type="button"
          onClick={onReset}
          className="btn btn-outline btn-sm"
          style={{ gap: '0.25rem' }}
        >
          <RotateCcw size={14} />
          <span>Reset Filters</span>
        </button>
      </div>

      <div className="filter-grid">
        {/* Min Price */}
        <div>
          <label className="form-label">Min Price ($)</label>
          <input
            type="number"
            name="minPrice"
            className="form-control"
            placeholder="0"
            value={filters.minPrice || ''}
            onChange={handleChange}
            min="0"
          />
        </div>

        {/* Max Price */}
        <div>
          <label className="form-label">Max Price ($)</label>
          <input
            type="number"
            name="maxPrice"
            className="form-control"
            placeholder="No limit"
            value={filters.maxPrice || ''}
            onChange={handleChange}
            min="0"
          />
        </div>

        {/* Bedrooms */}
        <div>
          <label className="form-label">Bedrooms</label>
          <select
            name="bedrooms"
            className="form-select"
            value={filters.bedrooms || ''}
            onChange={handleChange}
          >
            <option value="">Any Bedrooms</option>
            <option value="1">1+ BHK</option>
            <option value="2">2+ BHK</option>
            <option value="3">3+ BHK</option>
            <option value="4">4+ BHK</option>
            <option value="5">5+ BHK</option>
          </select>
        </div>

        {/* Bathrooms */}
        <div>
          <label className="form-label">Bathrooms</label>
          <select
            name="bathrooms"
            className="form-select"
            value={filters.bathrooms || ''}
            onChange={handleChange}
          >
            <option value="">Any Bathrooms</option>
            <option value="1">1+ Bath</option>
            <option value="2">2+ Baths</option>
            <option value="3">3+ Baths</option>
            <option value="4">4+ Baths</option>
          </select>
        </div>

        {/* Furnishing */}
        <div>
          <label className="form-label">Furnishing</label>
          <select
            name="furnishing"
            className="form-select"
            value={filters.furnishing || ''}
            onChange={handleChange}
          >
            <option value="">All Furnishing</option>
            <option value="Furnished">Furnished</option>
            <option value="Semi-Furnished">Semi-Furnished</option>
            <option value="Unfurnished">Unfurnished</option>
          </select>
        </div>

        {/* Sort By */}
        <div>
          <label className="form-label">Sort By</label>
          <select
            name="sort"
            className="form-select"
            value={filters.sort || 'newest'}
            onChange={handleChange}
          >
            <option value="newest">Newest First</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default PropertyFilter;
