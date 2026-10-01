import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { propertyService } from '../services/api';
import Loader from '../components/Loader';
import {
  Building2,
  Save,
  AlertCircle,
  ArrowLeft,
  CheckCircle,
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

const EditProperty = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'Apartment',
    purpose: 'Buy',
    price: '',
    area: '',
    bedrooms: 0,
    bathrooms: 0,
    furnishing: 'Semi-Furnished',
    address: '',
    city: '',
    state: '',
    pincode: '',
    latitude: 40.7128,
    longitude: -74.006,
    status: 'Available',
    featured: false,
  });

  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);

  useEffect(() => {
    fetchProperty();
  }, [id]);

  const fetchProperty = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await propertyService.getById(id);
      const prop = res.data.property;

      setFormData({
        title: prop.title || '',
        description: prop.description || '',
        type: prop.type || 'Apartment',
        purpose: prop.purpose || 'Buy',
        price: prop.price || '',
        area: prop.area || '',
        bedrooms: prop.bedrooms || 0,
        bathrooms: prop.bathrooms || 0,
        furnishing: prop.furnishing || 'Semi-Furnished',
        address: prop.address || '',
        city: prop.city || '',
        state: prop.state || '',
        pincode: prop.pincode || '',
        latitude: prop.latitude || 40.7128,
        longitude: prop.longitude || -74.006,
        status: prop.status || 'Available',
        featured: !!prop.featured,
      });

      setSelectedAmenities(prop.amenities || []);
    } catch (err) {
      setError('Failed to load property data.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleAmenityToggle = (amenity) => {
    if (selectedAmenities.includes(amenity)) {
      setSelectedAmenities(selectedAmenities.filter((a) => a !== amenity));
    } else {
      setSelectedAmenities([...selectedAmenities, amenity]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError('');

      const data = new FormData();
      Object.keys(formData).forEach((key) => {
        data.append(key, formData[key]);
      });

      selectedAmenities.forEach((amenity) => {
        data.append('amenities', amenity);
      });

      selectedFiles.forEach((file) => {
        data.append('images', file);
      });

      await propertyService.update(id, data);
      alert('Property updated successfully!');
      navigate('/agent/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update property.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <Loader fullScreen={true} message="Loading property details..." />;
  }

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
        <h1 className="page-title">Edit Property Listing</h1>
        <p className="page-subtitle">Update pricing, description, coordinates, and availability</p>
      </div>

      <div className="card" style={{ padding: '2.5rem' }}>
        {error && (
          <div className="alert alert-danger">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Property Title *</label>
            <input
              type="text"
              name="title"
              className="form-control"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Purpose</label>
              <select
                name="purpose"
                className="form-select"
                value={formData.purpose}
                onChange={handleChange}
              >
                <option value="Buy">For Buy</option>
                <option value="Rent">For Rent</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Property Type</label>
              <select
                name="type"
                className="form-select"
                value={formData.type}
                onChange={handleChange}
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
                value={formData.price}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Area (Sq Ft) *</label>
              <input
                type="number"
                name="area"
                className="form-control"
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
                value={formData.bathrooms}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Availability Status</label>
              <select
                name="status"
                className="form-select"
                value={formData.status}
                onChange={handleChange}
              >
                <option value="Available">Available</option>
                <option value="Sold">Sold</option>
                <option value="Rented">Rented</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Description *</label>
            <textarea
              name="description"
              className="form-textarea"
              rows="4"
              value={formData.description}
              onChange={handleChange}
              required
            ></textarea>
          </div>

          <div className="form-group">
            <label className="form-label">Address *</label>
            <input
              type="text"
              name="address"
              className="form-control"
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
                value={formData.city}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">State *</label>
              <input
                type="text"
                name="state"
                className="form-control"
                value={formData.state}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Latitude *</label>
              <input
                type="number"
                step="any"
                name="latitude"
                className="form-control"
                value={formData.latitude}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Longitude *</label>
              <input
                type="number"
                step="any"
                name="longitude"
                className="form-control"
                value={formData.longitude}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group" style={{ margin: '1.5rem 0' }}>
            <label className="form-label">Amenities</label>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                gap: '0.75rem',
              }}
            >
              {COMMON_AMENITIES.map((item) => (
                <label
                  key={item}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.5rem',
                    borderRadius: '6px',
                    border: '1px solid var(--border)',
                    backgroundColor: selectedAmenities.includes(item)
                      ? 'var(--primary-light)'
                      : '#ffffff',
                    cursor: 'pointer',
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
          </div>

          <div className="form-group">
            <label className="form-label">Upload Additional Photos</label>
            <input
              type="file"
              name="images"
              className="form-control"
              multiple
              accept="image/*"
              onChange={(e) => setSelectedFiles(Array.from(e.target.files))}
            />
          </div>

          <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
            <button type="submit" className="btn btn-primary btn-lg" style={{ flex: 1 }} disabled={saving}>
              <Save size={18} />
              <span>{saving ? 'Updating Listing...' : 'Save Changes'}</span>
            </button>
            <button type="button" className="btn btn-outline btn-lg" onClick={() => navigate('/agent/dashboard')}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProperty;
