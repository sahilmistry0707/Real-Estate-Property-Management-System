import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  bookingService,
  visitService,
  inquiryService,
  wishlistService,
} from '../services/api';
import Loader from '../components/Loader';
import {
  FileText,
  Calendar,
  Heart,
  MessageSquare,
  Building,
  CheckCircle,
  Clock,
  XCircle,
  Eye,
  ExternalLink,
} from 'lucide-react';

const UserDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('bookings'); // 'bookings' | 'visits' | 'inquiries'

  const [bookings, setBookings] = useState([]);
  const [visits, setVisits] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [wishlistCount, setWishlistCount] = useState(0);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const [bookingsRes, visitsRes, inquiriesRes, wishRes] = await Promise.allSettled([
        bookingService.getUserBookings(),
        visitService.getUserVisits(),
        inquiryService.getUserInquiries(),
        wishlistService.getWishlist(),
      ]);

      if (bookingsRes.status === 'fulfilled') {
        setBookings(bookingsRes.value.data.bookings || []);
      }
      if (visitsRes.status === 'fulfilled') {
        setVisits(visitsRes.value.data.visits || []);
      }
      if (inquiriesRes.status === 'fulfilled') {
        setInquiries(inquiriesRes.value.data.inquiries || []);
      }
      if (wishRes.status === 'fulfilled') {
        setWishlistCount((wishRes.value.data.wishlist || []).length);
      }
    } catch (err) {
      console.error('Error fetching user dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved':
      case 'confirmed':
        return <span className="badge badge-approved">{status}</span>;
      case 'pending':
        return <span className="badge badge-pending">{status}</span>;
      case 'rejected':
      case 'cancelled':
        return <span className="badge badge-rejected">{status}</span>;
      case 'completed':
        return <span className="badge badge-buy">{status}</span>;
      default:
        return <span className="badge">{status}</span>;
    }
  };

  if (loading) {
    return <Loader fullScreen={true} message="Loading your personal dashboard..." />;
  }

  return (
    <div className="page-wrapper container">
      <div className="page-header">
        <h1 className="page-title">Client Dashboard</h1>
        <p className="page-subtitle">
          Welcome back, {user?.fullName}. Track your property applications, scheduled visits, and agent
          communications.
        </p>
      </div>

      {/* Overview Stat Cards */}
      <div className="stat-card-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary)' }}>
            <FileText size={24} />
          </div>
          <div>
            <div className="stat-val">{bookings.length}</div>
            <div className="stat-lbl">Property Applications</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#ecfdf5', color: '#10b981' }}>
            <Calendar size={24} />
          </div>
          <div>
            <div className="stat-val">{visits.length}</div>
            <div className="stat-lbl">Scheduled Visits</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#fffbeb', color: '#f59e0b' }}>
            <MessageSquare size={24} />
          </div>
          <div>
            <div className="stat-val">{inquiries.length}</div>
            <div className="stat-lbl">Inquiries Sent</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#fdf2f8', color: '#ec4899' }}>
            <Heart size={24} />
          </div>
          <div>
            <div className="stat-val">{wishlistCount}</div>
            <div className="stat-lbl">Wishlisted Homes</div>
          </div>
        </div>
      </div>

      {/* Tabs navigation */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border)', marginBottom: '1.5rem' }}>
        <button
          type="button"
          className={`btn ${activeTab === 'bookings' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setActiveTab('bookings')}
          style={{ borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }}
        >
          <FileText size={16} />
          <span>My Applications ({bookings.length})</span>
        </button>

        <button
          type="button"
          className={`btn ${activeTab === 'visits' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setActiveTab('visits')}
          style={{ borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }}
        >
          <Calendar size={16} />
          <span>Property Visits ({visits.length})</span>
        </button>

        <button
          type="button"
          className={`btn ${activeTab === 'inquiries' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setActiveTab('inquiries')}
          style={{ borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }}
        >
          <MessageSquare size={16} />
          <span>Inquiries ({inquiries.length})</span>
        </button>
      </div>

      {/* Tab 1: Bookings & Applications */}
      {activeTab === 'bookings' && (
        <div>
          {bookings.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
              <FileText size={40} color="var(--text-muted)" style={{ margin: '0 auto 0.75rem' }} />
              <h3>No purchase or rental applications yet</h3>
              <p style={{ color: 'var(--text-muted)', margin: '0.5rem 0 1.25rem' }}>
                When you apply to buy or rent a property, track the approval updates here.
              </p>
              <Link to="/properties" className="btn btn-primary">
                Browse Properties
              </Link>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Property</th>
                    <th>Booking Type</th>
                    <th>Preferred Date & Time</th>
                    <th>Agent</th>
                    <th>Status</th>
                    <th>Notes / Reason</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((b) => (
                    <tr key={b._id}>
                      <td>
                        <strong>{b.property?.title || 'Property Listing'}</strong>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          ${b.property?.price?.toLocaleString()}
                        </div>
                      </td>
                      <td>
                        <span className="badge badge-rent">{b.bookingType}</span>
                      </td>
                      <td>
                        {new Date(b.preferredDate).toLocaleDateString()}
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          {b.preferredTime}
                        </div>
                      </td>
                      <td>
                        {b.agent?.fullName || 'Assigned Agent'}
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          {b.agent?.phone}
                        </div>
                      </td>
                      <td>{getStatusBadge(b.status)}</td>
                      <td>
                        <span style={{ fontSize: '0.85rem', color: '#475569' }}>
                          {b.responseNotes || b.message || '—'}
                        </span>
                      </td>
                      <td>
                        {b.property?._id && (
                          <Link
                            to={`/properties/${b.property._id}`}
                            className="btn btn-outline btn-sm"
                            title="View property details"
                          >
                            <Eye size={14} />
                          </Link>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Property Visits */}
      {activeTab === 'visits' && (
        <div>
          {visits.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
              <Calendar size={40} color="var(--text-muted)" style={{ margin: '0 auto 0.75rem' }} />
              <h3>No scheduled property tours</h3>
              <p style={{ color: 'var(--text-muted)', margin: '0.5rem 0 1.25rem' }}>
                Schedule an in-person viewing from any property details page.
              </p>
              <Link to="/properties" className="btn btn-primary">
                Explore Listings
              </Link>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Property</th>
                    <th>Visit Date</th>
                    <th>Time Slot</th>
                    <th>Agent</th>
                    <th>Status</th>
                    <th>Agent Remarks</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {visits.map((v) => (
                    <tr key={v._id}>
                      <td>
                        <strong>{v.property?.title}</strong>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          {v.property?.city}, {v.property?.address}
                        </div>
                      </td>
                      <td>{new Date(v.visitDate).toLocaleDateString()}</td>
                      <td>{v.timeSlot}</td>
                      <td>
                        {v.agent?.fullName}
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          {v.agent?.phone}
                        </div>
                      </td>
                      <td>{getStatusBadge(v.status)}</td>
                      <td>
                        <span style={{ fontSize: '0.85rem' }}>{v.agentNotes || 'Pending review'}</span>
                      </td>
                      <td>
                        {v.property?._id && (
                          <Link
                            to={`/properties/${v.property._id}`}
                            className="btn btn-outline btn-sm"
                          >
                            <Eye size={14} />
                          </Link>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Inquiries */}
      {activeTab === 'inquiries' && (
        <div>
          {inquiries.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
              <MessageSquare size={40} color="var(--text-muted)" style={{ margin: '0 auto 0.75rem' }} />
              <h3>No inquiries submitted</h3>
              <p style={{ color: 'var(--text-muted)', margin: '0.5rem 0 1.25rem' }}>
                Ask questions to agents directly about any property.
              </p>
              <Link to="/inquiry" className="btn btn-primary">
                Send New Inquiry
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {inquiries.map((inq) => (
                <div key={inq._id} className="card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <h3 style={{ fontSize: '1.1rem' }}>{inq.subject}</h3>
                    {getStatusBadge(inq.status)}
                  </div>
                  {inq.property && (
                    <div style={{ fontSize: '0.85rem', color: 'var(--primary)', marginBottom: '0.5rem' }}>
                      Property: {inq.property.title}
                    </div>
                  )}
                  <p style={{ fontSize: '0.9rem', color: '#334155', marginBottom: '0.75rem' }}>
                    "{inq.message}"
                  </p>

                  {inq.replyMessage ? (
                    <div
                      style={{
                        backgroundColor: '#eff6ff',
                        borderLeft: '4px solid var(--primary)',
                        padding: '0.75rem 1rem',
                        borderRadius: '4px',
                        fontSize: '0.875rem',
                      }}
                    >
                      <strong>Agent Reply:</strong> {inq.replyMessage}
                    </div>
                  ) : (
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      Waiting for agent response...
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UserDashboard;
