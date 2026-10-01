import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  propertyService,
  bookingService,
  visitService,
  inquiryService,
} from '../services/api';
import Loader from '../components/Loader';
import {
  Building,
  PlusCircle,
  FileText,
  Calendar,
  MessageSquare,
  CheckCircle,
  XCircle,
  Edit,
  Trash2,
  ExternalLink,
  Send,
  AlertCircle,
} from 'lucide-react';

const AgentDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('properties'); // 'properties' | 'bookings' | 'visits' | 'inquiries'

  const [properties, setProperties] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [visits, setVisits] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal / form states for replying or updating status
  const [replyModal, setReplyModal] = useState({ open: false, inquiryId: null, message: '' });
  const [bookingNoteModal, setBookingNoteModal] = useState({
    open: false,
    bookingId: null,
    status: '',
    note: '',
  });

  useEffect(() => {
    fetchAgentData();
  }, []);

  const fetchAgentData = async () => {
    try {
      setLoading(true);
      const [propsRes, bookRes, visitRes, inqRes] = await Promise.allSettled([
        propertyService.getMyProperties(),
        bookingService.getAgentBookings(),
        visitService.getAgentVisits(),
        inquiryService.getAgentInquiries(),
      ]);

      if (propsRes.status === 'fulfilled') {
        setProperties(propsRes.value.data.properties || []);
      }
      if (bookRes.status === 'fulfilled') {
        setBookings(bookRes.value.data.bookings || []);
      }
      if (visitRes.status === 'fulfilled') {
        setVisits(visitRes.value.data.visits || []);
      }
      if (inqRes.status === 'fulfilled') {
        setInquiries(inqRes.value.data.inquiries || []);
      }
    } catch (err) {
      console.error('Error fetching agent data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Property Actions
  const handleDeleteProperty = async (id) => {
    if (!window.confirm('Are you sure you want to delete this property listing?')) return;
    try {
      await propertyService.delete(id);
      setProperties((prev) => prev.filter((p) => p._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete property.');
    }
  };

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await propertyService.updateStatus(id, newStatus);
      setProperties((prev) =>
        prev.map((p) => (p._id === id ? { ...p, status: newStatus } : p))
      );
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update property status.');
    }
  };

  // Booking Actions
  const handleBookingAction = async (e) => {
    e.preventDefault();
    const { bookingId, status, note } = bookingNoteModal;
    try {
      await bookingService.updateStatus(bookingId, status, note);
      setBookings((prev) =>
        prev.map((b) => (b._id === bookingId ? { ...b, status, responseNotes: note } : b))
      );
      setBookingNoteModal({ open: false, bookingId: null, status: '', note: '' });
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update booking status.');
    }
  };

  // Visit Actions
  const handleVisitStatus = async (id, status) => {
    const notes = prompt(`Enter notes for visit status update (${status}):`, '');
    if (notes === null) return; // user cancelled prompt

    try {
      await visitService.updateStatus(id, status, notes);
      setVisits((prev) =>
        prev.map((v) => (v._id === id ? { ...v, status, agentNotes: notes } : v))
      );
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update visit status.');
    }
  };

  // Reply Inquiry Action
  const handleReplySubmit = async (e) => {
    e.preventDefault();
    if (!replyModal.message.trim()) return;

    try {
      await inquiryService.reply(replyModal.inquiryId, replyModal.message);
      setInquiries((prev) =>
        prev.map((i) =>
          i._id === replyModal.inquiryId
            ? { ...i, replyMessage: replyModal.message, status: 'Resolved' }
            : i
        )
      );
      setReplyModal({ open: false, inquiryId: null, message: '' });
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to send reply.');
    }
  };

  if (loading) {
    return <Loader fullScreen={true} message="Loading agent workspace..." />;
  }

  return (
    <div className="page-wrapper container">
      {/* Top Banner */}
      <div
        className="page-header"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <h1 className="page-title">Agent Management Portal</h1>
          <p className="page-subtitle">
            Welcome, {user?.fullName} ({user?.agencyName || 'Independent Broker'}). Manage listings,
            tours, and client inquiries.
          </p>
        </div>

        <Link to="/agent/add-property" className="btn btn-primary" style={{ gap: '0.4rem' }}>
          <PlusCircle size={18} />
          <span>Add New Property Listing</span>
        </Link>
      </div>

      {/* KPI Stats */}
      <div className="stat-card-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary)' }}>
            <Building size={24} />
          </div>
          <div>
            <div className="stat-val">{properties.length}</div>
            <div className="stat-lbl">My Listings</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#fffbeb', color: '#f59e0b' }}>
            <FileText size={24} />
          </div>
          <div>
            <div className="stat-val">{bookings.filter((b) => b.status === 'Pending').length}</div>
            <div className="stat-lbl">Pending Applications</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#ecfdf5', color: '#10b981' }}>
            <Calendar size={24} />
          </div>
          <div>
            <div className="stat-val">{visits.filter((v) => v.status === 'Pending').length}</div>
            <div className="stat-lbl">Pending Visits</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#eff6ff', color: '#2563eb' }}>
            <MessageSquare size={24} />
          </div>
          <div>
            <div className="stat-val">{inquiries.length}</div>
            <div className="stat-lbl">Client Inquiries</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border)', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <button
          type="button"
          className={`btn ${activeTab === 'properties' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setActiveTab('properties')}
          style={{ borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }}
        >
          <Building size={16} />
          <span>My Listings ({properties.length})</span>
        </button>

        <button
          type="button"
          className={`btn ${activeTab === 'bookings' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setActiveTab('bookings')}
          style={{ borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }}
        >
          <FileText size={16} />
          <span>Bookings & Applications ({bookings.length})</span>
        </button>

        <button
          type="button"
          className={`btn ${activeTab === 'visits' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setActiveTab('visits')}
          style={{ borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }}
        >
          <Calendar size={16} />
          <span>Visit Requests ({visits.length})</span>
        </button>

        <button
          type="button"
          className={`btn ${activeTab === 'inquiries' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setActiveTab('inquiries')}
          style={{ borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }}
        >
          <MessageSquare size={16} />
          <span>Client Inquiries ({inquiries.length})</span>
        </button>
      </div>

      {/* Tab 1: Properties Table */}
      {activeTab === 'properties' && (
        <div>
          {properties.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
              <Building size={40} color="var(--text-muted)" style={{ margin: '0 auto 0.75rem' }} />
              <h3>No listings yet</h3>
              <p style={{ color: 'var(--text-muted)', margin: '0.5rem 0 1.25rem' }}>
                You have not listed any properties for buy or rent.
              </p>
              <Link to="/agent/add-property" className="btn btn-primary">
                Add Your First Property
              </Link>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Title & Location</th>
                    <th>Purpose & Type</th>
                    <th>Price</th>
                    <th>Admin Approval</th>
                    <th>Availability Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {properties.map((p) => (
                    <tr key={p._id}>
                      <td>
                        <strong>{p.title}</strong>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          {p.city}, {p.state}
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${p.purpose === 'Rent' ? 'badge-rent' : 'badge-buy'}`}>
                          {p.purpose}
                        </span>{' '}
                        <span style={{ fontSize: '0.85rem' }}>{p.type}</span>
                      </td>
                      <td>
                        <strong>${p.price?.toLocaleString()}</strong>
                        {p.purpose === 'Rent' && <span style={{ fontSize: '0.8rem' }}>/mo</span>}
                      </td>
                      <td>
                        <span className={`badge badge-${p.approvalStatus?.toLowerCase() || 'pending'}`}>
                          {p.approvalStatus || 'Pending'}
                        </span>
                      </td>
                      <td>
                        <select
                          className="form-select"
                          value={p.status}
                          onChange={(e) => handleUpdateStatus(p._id, e.target.value)}
                          style={{ padding: '4px 8px', fontSize: '0.85rem' }}
                        >
                          <option value="Available">Available</option>
                          <option value="Sold">Sold</option>
                          <option value="Rented">Rented</option>
                        </select>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.4rem' }}>
                          <Link
                            to={`/properties/${p._id}`}
                            className="btn btn-outline btn-sm"
                            title="Preview property"
                          >
                            <ExternalLink size={14} />
                          </Link>
                          <Link
                            to={`/agent/edit-property/${p._id}`}
                            className="btn btn-outline btn-sm"
                            title="Edit listing"
                          >
                            <Edit size={14} />
                          </Link>
                          <button
                            type="button"
                            className="btn btn-danger btn-sm"
                            onClick={() => handleDeleteProperty(p._id)}
                            title="Delete listing"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Bookings / Applications */}
      {activeTab === 'bookings' && (
        <div>
          {bookings.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
              <FileText size={40} color="var(--text-muted)" style={{ margin: '0 auto 0.75rem' }} />
              <h3>No booking applications received</h3>
              <p style={{ color: 'var(--text-muted)' }}>
                When clients apply to purchase or rent your listings, applications will show up here.
              </p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Applicant</th>
                    <th>Property</th>
                    <th>Type</th>
                    <th>Requested Date</th>
                    <th>Status</th>
                    <th>Remarks / Notes</th>
                    <th>Update Status</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((b) => (
                    <tr key={b._id}>
                      <td>
                        <strong>{b.user?.fullName}</strong>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          {b.user?.phone} • {b.user?.email}
                        </div>
                      </td>
                      <td>
                        <Link to={`/properties/${b.property?._id}`} style={{ color: 'var(--primary)', fontWeight: 500 }}>
                          {b.property?.title}
                        </Link>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          ${b.property?.price?.toLocaleString()}
                        </div>
                      </td>
                      <td>
                        <span className="badge badge-rent">{b.bookingType}</span>
                      </td>
                      <td>
                        {new Date(b.preferredDate).toLocaleDateString()}
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{b.preferredTime}</div>
                      </td>
                      <td>
                        <span className={`badge badge-${b.status?.toLowerCase()}`}>{b.status}</span>
                      </td>
                      <td>
                        <span style={{ fontSize: '0.85rem' }}>
                          {b.responseNotes || b.message || '—'}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.35rem' }}>
                          <button
                            type="button"
                            className="btn btn-success btn-sm"
                            onClick={() =>
                              setBookingNoteModal({
                                open: true,
                                bookingId: b._id,
                                status: 'Approved',
                                note: '',
                              })
                            }
                          >
                            Approve
                          </button>
                          <button
                            type="button"
                            className="btn btn-danger btn-sm"
                            onClick={() =>
                              setBookingNoteModal({
                                open: true,
                                bookingId: b._id,
                                status: 'Rejected',
                                note: '',
                              })
                            }
                          >
                            Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Visit Requests */}
      {activeTab === 'visits' && (
        <div>
          {visits.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
              <Calendar size={40} color="var(--text-muted)" style={{ margin: '0 auto 0.75rem' }} />
              <h3>No visit requests</h3>
              <p style={{ color: 'var(--text-muted)' }}>No in-person tours requested right now.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Property</th>
                    <th>Visit Date & Time</th>
                    <th>Status</th>
                    <th>User Note</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {visits.map((v) => (
                    <tr key={v._id}>
                      <td>
                        <strong>{v.user?.fullName}</strong>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          {v.user?.phone} • {v.user?.email}
                        </div>
                      </td>
                      <td>
                        <strong>{v.property?.title}</strong>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          {v.property?.address}
                        </div>
                      </td>
                      <td>
                        {new Date(v.visitDate).toLocaleDateString()}
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{v.timeSlot}</div>
                      </td>
                      <td>
                        <span className={`badge badge-${v.status?.toLowerCase()}`}>{v.status}</span>
                      </td>
                      <td>
                        <span style={{ fontSize: '0.85rem' }}>{v.notes || '—'}</span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.35rem' }}>
                          <button
                            type="button"
                            className="btn btn-success btn-sm"
                            onClick={() => handleVisitStatus(v._id, 'Confirmed')}
                          >
                            Confirm
                          </button>
                          <button
                            type="button"
                            className="btn btn-danger btn-sm"
                            onClick={() => handleVisitStatus(v._id, 'Cancelled')}
                          >
                            Cancel
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Inquiries */}
      {activeTab === 'inquiries' && (
        <div>
          {inquiries.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
              <MessageSquare size={40} color="var(--text-muted)" style={{ margin: '0 auto 0.75rem' }} />
              <h3>No client inquiries yet</h3>
              <p style={{ color: 'var(--text-muted)' }}>Messages from property seekers will appear here.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {inquiries.map((inq) => (
                <div key={inq._id} className="card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h3 style={{ fontSize: '1.1rem' }}>{inq.subject}</h3>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        From: <strong>{inq.name}</strong> ({inq.email} • {inq.phone || 'No phone'})
                      </p>
                      {inq.property && (
                        <p style={{ fontSize: '0.85rem', color: 'var(--primary)', marginTop: '0.2rem' }}>
                          Property: {inq.property.title}
                        </p>
                      )}
                    </div>
                    <span className={`badge badge-${inq.status?.toLowerCase()}`}>{inq.status}</span>
                  </div>

                  <p style={{ backgroundColor: '#f8fafc', padding: '0.75rem', borderRadius: '8px', margin: '0.75rem 0', fontSize: '0.9rem' }}>
                    "{inq.message}"
                  </p>

                  {inq.replyMessage ? (
                    <div style={{ fontSize: '0.85rem', color: '#15803d', backgroundColor: '#f0fdf4', padding: '0.5rem 0.75rem', borderRadius: '6px' }}>
                      <strong>Your Reply:</strong> {inq.replyMessage}
                    </div>
                  ) : (
                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      style={{ alignSelf: 'flex-start' }}
                      onClick={() => setReplyModal({ open: true, inquiryId: inq._id, message: '' })}
                    >
                      <Send size={14} />
                      <span>Reply to Client</span>
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Reply Inquiry Modal */}
      {replyModal.open && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000,
            padding: '1rem',
          }}
        >
          <div className="card" style={{ maxWidth: '500px', width: '100%' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Reply to Inquiry</h3>
            <form onSubmit={handleReplySubmit}>
              <div className="form-group">
                <label className="form-label">Your Response Message</label>
                <textarea
                  className="form-textarea"
                  rows="4"
                  placeholder="Enter your detailed response to the client..."
                  value={replyModal.message}
                  onChange={(e) => setReplyModal({ ...replyModal, message: e.target.value })}
                  required
                ></textarea>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setReplyModal({ open: false, inquiryId: null, message: '' })}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Send Response
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Booking Decision Note Modal */}
      {bookingNoteModal.open && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000,
            padding: '1rem',
          }}
        >
          <div className="card" style={{ maxWidth: '500px', width: '100%' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>
              {bookingNoteModal.status} Booking Application
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1rem' }}>
              Add remarks, appointment confirmation, or the rationale for this decision.
            </p>
            <form onSubmit={handleBookingAction}>
              <div className="form-group">
                <label className="form-label">Notes for Applicant</label>
                <textarea
                  className="form-textarea"
                  rows="3"
                  placeholder="e.g. Please bring ID proof and pre-approval letter for contract signing."
                  value={bookingNoteModal.note}
                  onChange={(e) =>
                    setBookingNoteModal({ ...bookingNoteModal, note: e.target.value })
                  }
                ></textarea>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() =>
                    setBookingNoteModal({ open: false, bookingId: null, status: '', note: '' })
                  }
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`btn ${
                    bookingNoteModal.status === 'Approved' ? 'btn-success' : 'btn-danger'
                  }`}
                >
                  Confirm {bookingNoteModal.status}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgentDashboard;
