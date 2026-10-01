import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminService, bookingService } from '../services/api';
import Loader from '../components/Loader';
import {
  FileText,
  Search,
  Filter,
  ArrowLeft,
  Calendar,
  User,
  Building,
  CheckCircle,
  XCircle,
} from 'lucide-react';

const ManageBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchBookings();
  }, [statusFilter]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError('');
      const params = {};
      if (statusFilter) params.status = statusFilter;

      const res = await adminService.getAllBookings(params);
      setBookings(res.data.bookings || []);
    } catch (err) {
      setError('Failed to fetch platform bookings.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await bookingService.updateStatus(id, newStatus, `Updated by Administrator to ${newStatus}`);
      setBookings((prev) =>
        prev.map((b) => (b._id === id ? { ...b, status: newStatus } : b))
      );
    } catch (err) {
      alert(err.response?.data?.message || 'Status update failed.');
    }
  };

  const filtered = bookings.filter(
    (b) =>
      b.user?.fullName?.toLowerCase().includes(search.toLowerCase()) ||
      b.property?.title?.toLowerCase().includes(search.toLowerCase()) ||
      b.agent?.fullName?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="page-wrapper container">
      <div style={{ marginBottom: '1.5rem' }}>
        <Link to="/admin/dashboard" className="btn btn-outline btn-sm" style={{ gap: '0.4rem' }}>
          <ArrowLeft size={16} />
          <span>Back to Dashboard</span>
        </Link>
      </div>

      <div
        className="page-header"
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}
      >
        <div>
          <h1 className="page-title">Manage Property Bookings & Applications</h1>
          <p className="page-subtitle">
            Global registry of all purchase agreements, rental leases, and token applications
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <select
            className="form-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ width: '160px' }}
          >
            <option value="">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
            <option value="Completed">Completed</option>
          </select>

          <div style={{ position: 'relative', width: '240px' }}>
            <Search
              size={16}
              style={{
                position: 'absolute',
                left: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)',
              }}
            />
            <input
              type="text"
              className="form-control"
              style={{ paddingLeft: '2.2rem' }}
              placeholder="Search user, agent, title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {loading ? (
        <Loader fullScreen={false} message="Loading all booking entries..." />
      ) : (
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Applicant</th>
                <th>Property</th>
                <th>Contract Type</th>
                <th>Preferred Date & Time</th>
                <th>Assigned Agent</th>
                <th>Current Status</th>
                <th>Remarks / Notes</th>
                <th>Admin Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '2rem' }}>
                    No bookings found matching current filters.
                  </td>
                </tr>
              ) : (
                filtered.map((b) => (
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
                      {b.agent?.fullName}
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{b.agent?.phone}</div>
                    </td>
                    <td>
                      <span className={`badge badge-${b.status?.toLowerCase()}`}>{b.status}</span>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.85rem' }}>{b.responseNotes || b.message || '—'}</span>
                    </td>
                    <td>
                      <select
                        className="form-select"
                        value={b.status}
                        onChange={(e) => handleUpdateStatus(b._id, e.target.value)}
                        style={{ padding: '4px 8px', fontSize: '0.85rem' }}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Approved">Approved</option>
                        <option value="Rejected">Rejected</option>
                        <option value="Completed">Completed</option>
                      </select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ManageBookings;
