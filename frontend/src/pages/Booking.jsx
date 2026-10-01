import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { propertyService, bookingService, visitService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/Loader';
import {
  Calendar,
  Clock,
  Building,
  CheckCircle,
  AlertCircle,
  ShieldCheck,
  ArrowLeft,
  FileText,
} from 'lucide-react';

const Booking = () => {
  const [searchParams] = useSearchParams();
  const propertyId = searchParams.get('propertyId');
  const initialType = searchParams.get('bookingType') || 'Purchase Booking';
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [property, setProperty] = useState(null);
  const [loadingProperty, setLoadingProperty] = useState(false);
  const [bookingType, setBookingType] = useState(
    initialType === 'Visit' ? 'Property Visit' : initialType
  );

  const [formData, setFormData] = useState({
    preferredDate: '',
    preferredTime: '11:00 AM',
    message: '',
  });

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  // Get tomorrow's date string for min date
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  useEffect(() => {
    if (propertyId) {
      fetchProperty();
    }
  }, [propertyId]);

  const fetchProperty = async () => {
    try {
      setLoadingProperty(true);
      const res = await propertyService.getById(propertyId);
      setProperty(res.data.property);
      // Auto adjust booking type based on property purpose if not explicitly set to Visit
      if (initialType !== 'Visit') {
        if (res.data.property.purpose === 'Rent') {
          setBookingType('Rental Booking');
        } else {
          setBookingType('Purchase Booking');
        }
      }
    } catch (err) {
      console.error('Failed to load property for booking:', err);
    } finally {
      setLoadingProperty(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (!propertyId) {
      setError('Please choose a valid property before submitting a booking request.');
      return;
    }
    if (!formData.preferredDate || !formData.preferredTime) {
      setError('Please select both preferred date and time slot.');
      return;
    }

    try {
      setLoading(true);
      setError('');

      if (bookingType === 'Property Visit') {
        // Submit in-person visit request
        await visitService.create({
          propertyId,
          visitDate: formData.preferredDate,
          timeSlot: formData.preferredTime,
          notes: formData.message,
        });
      } else {
        // Submit purchase / rental contract request
        await bookingService.create({
          propertyId,
          bookingType,
          preferredDate: formData.preferredDate,
          preferredTime: formData.preferredTime,
          message: formData.message,
        });
      }

      setSubmitted(true);
    } catch (err) {
      setError(
        err.response?.data?.message || 'Failed to submit request. Please try again later.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (loadingProperty) {
    return <Loader fullScreen={true} message="Loading property contract info..." />;
  }

  if (submitted) {
    return (
      <div className="page-wrapper container" style={{ maxWidth: '620px' }}>
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
            {bookingType === 'Property Visit' ? 'Visit Scheduled!' : 'Booking Request Submitted!'}
          </h2>
          <p style={{ color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '1.5rem' }}>
            Your request for <strong>{property?.title || 'the selected property'}</strong> on{' '}
            <strong>{formData.preferredDate}</strong> at <strong>{formData.preferredTime}</strong> has
            been dispatched to the listing agent. You can monitor the approval status in your dashboard.
          </p>

          <div
            style={{
              background: '#f8fafc',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              padding: '1rem',
              marginBottom: '2rem',
              textAlign: 'left',
              fontSize: '0.85rem',
              color: '#475569',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, marginBottom: '0.25rem' }}>
              <ShieldCheck size={16} color="var(--primary)" />
              <span>Zero-Commission Policy & Verification</span>
            </div>
            All physical inspections and purchase agreements follow official real estate legal procedures.
            No online payment is processed on this platform.
          </div>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <Link to="/user/dashboard" className="btn btn-primary">
              View in My Dashboard
            </Link>
            <Link to="/properties" className="btn btn-outline">
              Explore More Listings
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrapper container" style={{ maxWidth: '850px' }}>
      <div className="page-header">
        <h1 className="page-title">
          {bookingType === 'Property Visit' ? 'Schedule a Property Visit' : 'Submit Property Booking'}
        </h1>
        <p className="page-subtitle">
          Submit your official application or schedule a physical tour with the designated listing agent
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: property ? '1.8fr 1.2fr' : '1fr', gap: '2rem' }}>
        {/* Booking Form */}
        <div className="card">
          {error && (
            <div className="alert alert-danger">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Booking Type Selector */}
            <div className="form-group">
              <label className="form-label">Application Type</label>
              <select
                className="form-select"
                value={bookingType}
                onChange={(e) => setBookingType(e.target.value)}
              >
                <option value="Purchase Booking">Purchase Booking (Buy Property)</option>
                <option value="Rental Booking">Rental Booking (Lease / Rent)</option>
                <option value="Property Visit">Schedule In-Person Site Visit</option>
              </select>
            </div>

            {/* Date and Time Slot */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Preferred Date *</label>
                <div style={{ position: 'relative' }}>
                  <Calendar
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
                    type="date"
                    name="preferredDate"
                    className="form-control"
                    style={{ paddingLeft: '2.5rem' }}
                    min={minDate}
                    value={formData.preferredDate}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Preferred Time Slot *</label>
                <div style={{ position: 'relative' }}>
                  <Clock
                    size={18}
                    style={{
                      position: 'absolute',
                      left: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: 'var(--text-muted)',
                    }}
                  />
                  <select
                    name="preferredTime"
                    className="form-select"
                    style={{ paddingLeft: '2.5rem' }}
                    value={formData.preferredTime}
                    onChange={handleChange}
                    required
                  >
                    <option value="09:00 AM - 11:00 AM">09:00 AM - 11:00 AM (Morning)</option>
                    <option value="11:00 AM - 01:00 PM">11:00 AM - 01:00 PM (Midday)</option>
                    <option value="02:00 PM - 04:00 PM">02:00 PM - 04:00 PM (Afternoon)</option>
                    <option value="04:00 PM - 06:00 PM">04:00 PM - 06:00 PM (Evening)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Additional Notes */}
            <div className="form-group">
              <label className="form-label">Additional Instructions / Buyer Remarks</label>
              <textarea
                name="message"
                className="form-textarea"
                rows="4"
                placeholder="Mention any specific requirements, financing pre-approval status, or preferred meeting spot..."
                value={formData.message}
                onChange={handleChange}
              ></textarea>
            </div>

            {/* Verification Note (No payment) */}
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.65rem',
                backgroundColor: '#eff6ff',
                border: '1px solid #bfdbfe',
                borderRadius: '8px',
                padding: '0.85rem',
                marginBottom: '1.5rem',
                fontSize: '0.85rem',
                color: '#1e40af',
              }}
            >
              <ShieldCheck size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong>Direct Contract Processing:</strong> You will not be charged online. The assigned
                agent will confirm the appointment and provide contract documentation.
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg"
              style={{ width: '100%' }}
              disabled={loading}
            >
              <FileText size={18} />
              <span>{loading ? 'Submitting...' : 'Confirm and Submit Application'}</span>
            </button>
          </form>
        </div>

        {/* Selected Property Card (Right) */}
        {property && (
          <div>
            <div className="card">
              <h3 style={{ fontSize: '1.1rem', marginBottom: '0.75rem' }}>Listing Summary</h3>
              <img
                src={
                  property.images && property.images.length > 0
                    ? property.images[0].startsWith('http')
                      ? property.images[0]
                      : `http://localhost:5000/${property.images[0]}`
                    : 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=400&q=80'
                }
                alt={property.title}
                style={{ width: '100%', height: '160px', objectFit: 'cover', borderRadius: '8px', marginBottom: '0.75rem' }}
              />
              <h4 style={{ fontSize: '1.05rem', fontWeight: 600 }}>{property.title}</h4>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary)', margin: '0.25rem 0' }}>
                ${property.price?.toLocaleString()}
                {property.purpose === 'Rent' && <span style={{ fontSize: '0.85rem' }}> /mo</span>}
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1rem' }}>
                {property.address}, {property.city}, {property.state}
              </p>

              {property.agent && (
                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '0.75rem' }}>
                  <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                    Handling Agent
                  </span>
                  <div style={{ fontWeight: 600 }}>{property.agent.fullName}</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    {property.agent.phone || property.agent.email}
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

export default Booking;
