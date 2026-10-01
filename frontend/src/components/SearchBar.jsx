import React, { useState } from 'react';
import { Search, MapPin, Home, SlidersHorizontal } from 'lucide-react';

const SearchBar = ({ onSearch, initialValues = {} }) => {
  const [keyword, setKeyword] = useState(initialValues.search || '');
  const [city, setCity] = useState(initialValues.city || '');
  const [purpose, setPurpose] = useState(initialValues.purpose || '');
  const [type, setType] = useState(initialValues.type || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch({
      search: keyword.trim(),
      city: city.trim(),
      purpose,
      type,
    });
  };

  const handleReset = () => {
    setKeyword('');
    setCity('');
    setPurpose('');
    setType('');
    onSearch({});
  };

  return (
    <form className="search-bar-wrap" onSubmit={handleSubmit}>
      {/* Keyword Search */}
      <div className="search-input-group">
        <Search size={18} className="search-input-icon" />
        <input
          type="text"
          placeholder="Search by keywords, community, name..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />
      </div>

      {/* City / Location */}
      <div className="search-input-group" style={{ maxWidth: '200px' }}>
        <MapPin size={18} className="search-input-icon" />
        <input
          type="text"
          placeholder="City (e.g. New York)"
          value={city}
          onChange={(e) => setCity(e.target.value)}
        />
      </div>

      {/* Purpose */}
      <div style={{ minWidth: '130px' }}>
        <select
          className="form-select"
          value={purpose}
          onChange={(e) => setPurpose(e.target.value)}
          style={{ height: '100%', padding: '0.75rem' }}
        >
          <option value="">Buy or Rent</option>
          <option value="Buy">For Buy</option>
          <option value="Rent">For Rent</option>
        </select>
      </div>

      {/* Property Type */}
      <div style={{ minWidth: '150px' }}>
        <select
          className="form-select"
          value={type}
          onChange={(e) => setType(e.target.value)}
          style={{ height: '100%', padding: '0.75rem' }}
        >
          <option value="">All Types</option>
          <option value="Apartment">Apartment</option>
          <option value="Villa">Villa</option>
          <option value="House">House</option>
          <option value="Commercial">Commercial</option>
          <option value="Plot">Plot</option>
          <option value="Studio">Studio</option>
        </select>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
        <button type="submit" className="btn btn-primary" style={{ padding: '0.75rem 1.5rem' }}>
          <Search size={18} />
          <span>Find Homes</span>
        </button>
        {(keyword || city || purpose || type) && (
          <button
            type="button"
            className="btn btn-outline"
            onClick={handleReset}
            style={{ padding: '0.75rem 1rem' }}
          >
            Reset
          </button>
        )}
      </div>
    </form>
  );
};

export default SearchBar;
