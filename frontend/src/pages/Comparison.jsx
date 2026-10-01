import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { GitCompare, Trash2, Check, X, ArrowRight, ExternalLink } from 'lucide-react';

const Comparison = () => {
  const [comparedList, setComparedList] = useState([]);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('comparedProperties') || '[]');
    setComparedList(saved);
  }, []);

  const handleRemove = (id) => {
    const updated = comparedList.filter((p) => p._id !== id);
    setComparedList(updated);
    localStorage.setItem('comparedProperties', JSON.stringify(updated));
  };

  const handleClearAll = () => {
    setComparedList([]);
    localStorage.removeItem('comparedProperties');
  };

  const defaultImg =
    'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=400&q=80';

  return (
    <div className="page-wrapper container">
      <div
        className="page-header"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <h1 className="page-title">Property Comparison Tool</h1>
          <p className="page-subtitle">
            Compare features, pricing, square footage, and amenities side-by-side
          </p>
        </div>

        {comparedList.length > 0 && (
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={handleClearAll}
            style={{ color: 'var(--danger)' }}
          >
            <Trash2 size={16} />
            <span>Clear Comparison List</span>
          </button>
        )}
      </div>

      {comparedList.length < 2 ? (
        <div className="card" style={{ textAlign: 'center', padding: '4rem 1rem' }}>
          <GitCompare size={48} color="#cbd5e1" style={{ margin: '0 auto 1rem' }} />
          <h3>Compare 2 to 4 Properties</h3>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem', maxWidth: '480px', margin: '0.5rem auto 1.5rem' }}>
            {comparedList.length === 1
              ? 'You have 1 property selected. Please select at least one more to start comparing.'
              : 'Browse our properties catalog and click "Compare" on any listings you want to evaluate side-by-side.'}
          </p>
          <Link to="/properties" className="btn btn-primary">
            <span>Browse Properties</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      ) : (
        <div className="comparison-table-wrapper">
          <table className="comparison-table">
            <thead>
              <tr>
                <th style={{ width: '180px' }}>Features</th>
                {comparedList.map((p) => {
                  const img =
                    p.images && p.images.length > 0
                      ? p.images[0].startsWith('http')
                        ? p.images[0]
                        : `http://localhost:5000/${p.images[0]}`
                      : defaultImg;

                  return (
                    <th key={p._id} style={{ minWidth: '240px', verticalAlign: 'top' }}>
                      <div style={{ position: 'relative', marginBottom: '0.75rem' }}>
                        <img
                          src={img}
                          alt={p.title}
                          style={{
                            width: '100%',
                            height: '140px',
                            objectFit: 'cover',
                            borderRadius: '8px',
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => handleRemove(p._id)}
                          style={{
                            position: 'absolute',
                            top: '6px',
                            right: '6px',
                            background: 'rgba(239, 68, 68, 0.9)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '50%',
                            width: '26px',
                            height: '26px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                          }}
                          title="Remove from comparison"
                        >
                          <X size={14} />
                        </button>
                      </div>
                      <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                        {p.title}
                      </h4>
                      <Link
                        to={`/properties/${p._id}`}
                        className="btn btn-primary btn-sm"
                        style={{ width: '100%', marginTop: '0.5rem' }}
                      >
                        <span>View Details</span>
                        <ExternalLink size={12} />
                      </Link>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {/* Price */}
              <tr>
                <td>Price</td>
                {comparedList.map((p) => (
                  <td key={p._id} style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '1.1rem' }}>
                    ${p.price?.toLocaleString()}
                    {p.purpose === 'Rent' && <span style={{ fontSize: '0.8rem', color: '#64748b' }}> /mo</span>}
                  </td>
                ))}
              </tr>

              {/* Purpose */}
              <tr>
                <td>Purpose</td>
                {comparedList.map((p) => (
                  <td key={p._id}>
                    <span className={`badge ${p.purpose === 'Rent' ? 'badge-rent' : 'badge-buy'}`}>
                      For {p.purpose}
                    </span>
                  </td>
                ))}
              </tr>

              {/* Property Type */}
              <tr>
                <td>Property Type</td>
                {comparedList.map((p) => (
                  <td key={p._id} style={{ fontWeight: 500 }}>
                    {p.type}
                  </td>
                ))}
              </tr>

              {/* Area */}
              <tr>
                <td>Area (Sq Ft)</td>
                {comparedList.map((p) => (
                  <td key={p._id}>{p.area} sq ft</td>
                ))}
              </tr>

              {/* Est. Price / Sq Ft */}
              <tr>
                <td>Price / Sq Ft</td>
                {comparedList.map((p) => (
                  <td key={p._id}>${(p.price / (p.area || 1)).toFixed(0)}</td>
                ))}
              </tr>

              {/* Bedrooms */}
              <tr>
                <td>Bedrooms</td>
                {comparedList.map((p) => (
                  <td key={p._id} style={{ fontWeight: 600 }}>
                    {p.bedrooms || 0} BHK
                  </td>
                ))}
              </tr>

              {/* Bathrooms */}
              <tr>
                <td>Bathrooms</td>
                {comparedList.map((p) => (
                  <td key={p._id}>{p.bathrooms || 0}</td>
                ))}
              </tr>

              {/* Furnishing */}
              <tr>
                <td>Furnishing</td>
                {comparedList.map((p) => (
                  <td key={p._id}>{p.furnishing}</td>
                ))}
              </tr>

              {/* Location */}
              <tr>
                <td>City & State</td>
                {comparedList.map((p) => (
                  <td key={p._id}>
                    {p.city}, {p.state}
                  </td>
                ))}
              </tr>

              {/* Amenities */}
              <tr>
                <td>Key Amenities</td>
                {comparedList.map((p) => (
                  <td key={p._id} style={{ fontSize: '0.85rem', textAlign: 'left' }}>
                    {p.amenities && p.amenities.length > 0 ? (
                      <ul style={{ paddingLeft: '1.2rem', listStyle: 'disc' }}>
                        {p.amenities.slice(0, 5).map((a, i) => (
                          <li key={i}>{a}</li>
                        ))}
                        {p.amenities.length > 5 && <li>+{p.amenities.length - 5} more</li>}
                      </ul>
                    ) : (
                      <span style={{ color: 'var(--text-muted)' }}>None specified</span>
                    )}
                  </td>
                ))}
              </tr>

              {/* Action row */}
              <tr>
                <td>Next Action</td>
                {comparedList.map((p) => (
                  <td key={p._id}>
                    <Link
                      to={`/booking?propertyId=${p._id}&bookingType=${
                        p.purpose === 'Rent' ? 'Rental Booking' : 'Purchase Booking'
                      }`}
                      className="btn btn-secondary btn-sm"
                      style={{ width: '100%' }}
                    >
                      {p.purpose === 'Rent' ? 'Rent' : 'Buy'}
                    </Link>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Comparison;
