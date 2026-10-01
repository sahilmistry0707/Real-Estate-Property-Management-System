import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { inquiryService, propertyService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/Loader';
import {
  Send,
  Building,
  Mail,
  Phone,
  User,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
} from 'lucide-react';

const Inquiry = () => {
  const [searchParams] = useSearchParams();
  const propertyId = searchParams.get('propertyId');
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [property, setProperty] = useState(null);
  const [loadingProperty, setLoadingProperty] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: user?.fullName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    subject: propertyId ? 'Inquiry regarding property listing' : 'General Real Estate Inquiry',
    message: '',
  });

  useEffect(() => {
    if (propertyId) {
      loadPropertySummary();
    }
  }, [propertyId]);

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: user.fullName || prev.name,
        email: user.email || prev.email,
        phone: user.phone || prev.phone,
      }));
    }
  }, [user]);

  const loadPropertySummary = async () => {
    try {
      setLoadingProperty(true);
      const res = await propertyService.getById(propertyId);
      setProperty(res.data.property);
    } catch (err) {
      console.error('Could not load property for inquiry:', err);
    } finally {
      setLoadingProperty(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name || !formData.email || !formData.message) {
      setError('Please fill in all required fields.');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        subject: formData.subject,
        message: formData.message,
        propertyId: propertyId || undefined,
      };

      await inquiryService.create(payload);
      setSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit inquiry. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="page-wrapper container" style={{ maxWidth: '600px' }}>
        <div className="card" style={{ textAlign: 'center', padding: '3.5rem 2rem' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: '#ecfdf5',
              color: 'var(--success)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem',
            }}
          >
            <CheckCircle size={36} />
          </div>
          <h2 style={{ fontSize: '1.75rem', marginBottom: '0.75rem', color: 'var(--secondary)' }}>
            Inquiry Sent Successfully!
          </h2>
          <p style={{ color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '2rem' }}>
            Thank you for reaching out. The listing agent has received your details and message and
            will connect with you shortly by phone or email.
          </p>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            {propertyId ? (
              <Link to={`/properties/${propertyId}`} className="btn btn-outline">
                <ArrowLeft size={16} />
                <span>Back to Property</span>
              </Link>
            ) : (
              <Link to="/properties" className="btn btn-outline">
                Browse Properties
              </Link>
            )}
            <Link to={isAuthenticated ? '/user/dashboard' : '/'} className="btn btn-primary">
              Return to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrapper container" style={{ maxWidth: '850px' }}>
      <div className="page-header">
        <h1 className="page-title">Contact Agent & Send Inquiry</h1>
        <p className="page-subtitle">
          Submit questions regarding specifications, pricing, leasing terms, or negotiation
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: property ? '1.8fr 1.2fr' : '1fr', gap: '2rem' }}>
        {/* Inquiry Form */}
        <div className="card">
          {error && (
            <div className="alert alert-danger">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Your Full Name *</label>
              <div style={{ position: 'relative' }}>
                <User
                  size={18}
                  style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-muted)',
                  }}
                />
                <input
                  type="text"
                  name="name"
                  className="form-control"
                  style={{ paddingLeft: '2.5rem' }}
                  placeholder="John Smith"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Email Address *</label>
                <div style={{ position: 'relative' }}>
                  <Mail
                    size={18}
                    style={{
                      position: 'absolute',
                      left: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: 'var(--text-muted)',
                    }}
                  />
                  <input
                    type="email"
                    name="email"
                    className="form-control"
                    style={{ paddingLeft: '2.5rem' }}
                    placeholder="john@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <div style={{ position: 'relative' }}>
                  <Phone
                    size={18}
                    style={{
                      position: 'absolute',
                      left: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: 'var(--text-muted)',
                    }}
                  />
                  <input
                    type="tel"
                    name="phone"
                    className="form-control"
                    style={{ paddingLeft: '2.5rem' }}
                    placeholder="+1 (555) 000-0000"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Subject</label>
              <input
                type="text"
                name="subject"
                className="form-control"
                value={formData.subject}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Your Message / Query *</label>
              <textarea
                name="message"
                className="form-textarea"
                rows="5"
                placeholder="I am interested in this listing and would like to know more about the terms, move-in date, or scheduling a viewing..."
                value={formData.message}
                onChange={handleChange}
                required
              ></textarea>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg"
              style={{ width: '100%' }}
              disabled={submitting}
            >
              <Send size={18} />
              <span>{submitting ? 'Submitting Inquiry...' : 'Submit Inquiry'}</span>
            </button>
          </form>
        </div>

        {/* Selected Property Preview Sidebar (if propertyId provided) */}
        {property && (
          <div>
            <div className="card">
              <span className="badge badge-rent" style={{ marginBottom: '0.75rem' }}>
                Related Property
              </span>
              <img
                src={
                  property.images && property.images.length > 0
                    ? property.images[0].startsWith('http')
                      ? property.images[0]
                      : `http://localhost:5000/${property.images[0]}`
                    : 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=400&q=80'
                }
                alt={property.title}
                style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: '8px', marginBottom: '0.75rem' }}
              />
              <h4 style={{ fontSize: '1.05rem', fontWeight: 600 }}>{property.title}</h4>
              <p style={{ color: 'var(--primary)', fontWeight: 700, margin: '0.25rem 0' }}>
                ${property.price?.toLocaleString()}
                {property.purpose === 'Rent' && ' /mo'}
              </p>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                {property.city}, {property.state}
              </p>

              {property.agent && (
                <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    Listing Agent
                  </div>
                  <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{property.agent.fullName}</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    {property.agent.agencyName}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Inquiry;
