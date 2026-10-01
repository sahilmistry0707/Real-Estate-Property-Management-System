import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { propertyService } from '../services/api';
import {
  Building2,
  Upload,
  MapPin,
  DollarSign,
  Maximize2,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
} from 'lucide-react';

const COMMON_AMENITIES = [
  'Parking',
  'Swimming Pool',
  'Gym / Fitness',
  '24/7 Security',
  'Power Backup',
  'Elevator',
  'Clubhouse',
  'Balcony',
  'Garden',
  'WiFi / High-Speed Internet',
  'Air Conditioning',
  'Pet Friendly',
];

const AddProperty = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'Apartment',
    purpose: 'Buy',
    price: '',
    area: '',
    bedrooms: 2,
    bathrooms: 2,
    furnishing: 'Semi-Furnished',
    address: '',
    city: '',
    state: '',
    pincode: '',
    latitude: 40.7128,
    longitude: -74.006,
    featured: false,
  });

  const [selectedAmenities, setSelectedAmenities] = useState(['Parking', '24/7 Security']);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
    if (error) setError('');
  };

  const handleAmenityToggle = (amenity) => {
    if (selectedAmenities.includes(amenity)) {
      setSelectedAmenities(selectedAmenities.filter((a) => a !== amenity));
    } else {
      setSelectedAmenities([...selectedAmenities, amenity]);
    }
  };

  const handleFileChange = (e) => {
    setSelectedFiles(Array.from(e.target.files));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title || !formData.description || !formData.price || !formData.area) {
      setError('Please fill in all mandatory property fields.');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const data = new FormData();
      Object.keys(formData).forEach((key) => {
        data.append(key, formData[key]);
      });

      // Append selected amenities as array
      selectedAmenities.forEach((amenity) => {
        data.append('amenities', amenity);
      });

      // Append image files
      selectedFiles.forEach((file) => {
        data.append('images', file);
      });

      await propertyService.create(data);
      alert('Property listing submitted successfully! Pending administrator approval.');
      navigate('/agent/dashboard');
    } catch (err) {
      setError(
        err.response?.data?.message || 'Failed to create property listing. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-wrapper container" style={{ maxWidth: '900px' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="btn btn-outline btn-sm"
          style={{ gap: '0.4rem' }}
        >
          <ArrowLeft size={16} />
          <span>Back</span>
        </button>
      </div>

      <div className="page-header">
        <h1 className="page-title">Add New Property Listing</h1>
        <p className="page-subtitle">
          List a residential or commercial property for sale or rent with full geolocation details
        </p>
      </div>

      <div className="card" style={{ padding: '2.5rem' }}>
        {error && (
          <div className="alert alert-danger">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Section 1: Basic Info */}
          <h3 style={{ fontSize: '1.15rem', marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
            1. Basic Property Information
          </h3>

          <div className="form-group">
            <label className="form-label">Property Title *</label>
            <input
              type="text"
              name="title"
              className="form-control"
              placeholder="e.g. Luxury 3BHK Penthouse with Skyline View"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Purpose *</label>
              <select
                name="purpose"
                className="form-select"
                value={formData.purpose}
                onChange={handleChange}
                required
              >
                <option value="Buy">For Buy (Sale)</option>
                <option value="Rent">For Rent (Lease)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Property Type *</label>
              <select
                name="type"
                className="form-select"
                value={formData.type}
                onChange={handleChange}
                required
              >
                <option value="Apartment">Apartment</option>
                <option value="Villa">Villa</option>
                <option value="House">House</option>
                <option value="Commercial">Commercial</option>
                <option value="Plot">Plot</option>
                <option value="Studio">Studio</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Price ($) *</label>
              <input
                type="number"
                name="price"
                className="form-control"
                placeholder="250000"
                min="0"
                value={formData.price}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Super Area (Sq Ft) *</label>
              <input
                type="number"
                name="area"
                className="form-control"
                placeholder="1450"
                min="1"
                value={formData.area}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Bedrooms</label>
              <input
                type="number"
                name="bedrooms"
                className="form-control"
                min="0"
                value={formData.bedrooms}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Bathrooms</label>
              <input
                type="number"
                name="bathrooms"
                className="form-control"
                min="0"
                value={formData.bathrooms}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Furnishing</label>
              <select
                name="furnishing"
                className="form-select"
                value={formData.furnishing}
                onChange={handleChange}
              >
                <option value="Furnished">Furnished</option>
                <option value="Semi-Furnished">Semi-Furnished</option>
                <option value="Unfurnished">Unfurnished</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Detailed Description *</label>
            <textarea
              name="description"
              className="form-textarea"
              rows="4"
              placeholder="Describe the interior, architectural finishes, view, proximity to transit and shopping centers..."
              value={formData.description}
              onChange={handleChange}
              required
            ></textarea>
          </div>

          {/* Section 2: Location & Coordinates */}
          <h3 style={{ fontSize: '1.15rem', margin: '2rem 0 1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
            2. Location & Map Coordinates
          </h3>

          <div className="form-group">
            <label className="form-label">Street Address *</label>
            <input
              type="text"
              name="address"
              className="form-control"
              placeholder="e.g. 742 Evergreen Terrace"
              value={formData.address}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">City *</label>
              <input
                type="text"
                name="city"
                className="form-control"
                placeholder="New York"
                value={formData.city}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">State / Province *</label>
              <input
                type="text"
                name="state"
                className="form-control"
                placeholder="NY"
                value={formData.state}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Pincode / ZIP *</label>
              <input
                type="text"
                name="pincode"
                className="form-control"
                placeholder="10001"
                value={formData.pincode}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Latitude (for OpenStreetMap) *</label>
              <input
                type="number"
                step="any"
                name="latitude"
                className="form-control"
                placeholder="40.7128"
                value={formData.latitude}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Longitude (for OpenStreetMap) *</label>
              <input
                type="number"
                step="any"
                name="longitude"
                className="form-control"
                placeholder="-74.0060"
                value={formData.longitude}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Section 3: Amenities */}
          <h3 style={{ fontSize: '1.15rem', margin: '2rem 0 1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
            3. Amenities & Facilities
          </h3>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: '0.75rem',
              marginBottom: '1.5rem',
            }}
          >
            {COMMON_AMENITIES.map((item) => (
              <label
                key={item}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  padding: '0.5rem 0.75rem',
                  borderRadius: '6px',
                  backgroundColor: selectedAmenities.includes(item) ? 'var(--primary-light)' : '#f8fafc',
                  border: '1px solid',
                  borderColor: selectedAmenities.includes(item) ? 'var(--primary)' : 'var(--border)',
                }}
              >
                <input
                  type="checkbox"
                  checked={selectedAmenities.includes(item)}
                  onChange={() => handleAmenityToggle(item)}
                />
                <span>{item}</span>
              </label>
            ))}
          </div>

          {/* Section 4: Images & Feature status */}
          <h3 style={{ fontSize: '1.15rem', margin: '2rem 0 1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
            4. Photos & Highlight
          </h3>

          <div className="form-group">
            <label className="form-label">Upload Property Images (Up to 10)</label>
            <input
              type="file"
              name="images"
              className="form-control"
              multiple
              accept="image/*"
              onChange={handleFileChange}
            />
            <span className="form-hint">
              {selectedFiles.length > 0
                ? `${selectedFiles.length} file(s) selected.`
                : 'Upload high-resolution JPG or PNG pictures.'}
            </span>
          </div>

          <div className="form-group" style={{ marginTop: '1rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                name="featured"
                checked={formData.featured}
                onChange={handleChange}
              />
              <span style={{ fontWeight: 600 }}>Mark as Featured Property Listing</span>
            </label>
          </div>

          <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
            <button
              type="submit"
              className="btn btn-primary btn-lg"
              style={{ flex: 1 }}
              disabled={loading}
            >
              <Upload size={18} />
              <span>{loading ? 'Submitting Property...' : 'Submit Listing for Approval'}</span>
            </button>
            <button
              type="button"
              className="btn btn-outline btn-lg"
              onClick={() => navigate('/agent/dashboard')}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProperty;
