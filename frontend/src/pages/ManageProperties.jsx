import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminService, propertyService } from '../services/api';
import Loader from '../components/Loader';
import {
  Building2,
  Search,
  CheckCircle,
  XCircle,
  Trash2,
  Eye,
  ArrowLeft,
  Filter,
} from 'lucide-react';

const ManageProperties = () => {
  const [properties, setProperties] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProperties();
  }, [statusFilter]);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      setError('');
      const params = {};
      if (statusFilter) params.approvalStatus = statusFilter;

      const res = await adminService.getAllProperties(params);
      setProperties(res.data.properties || []);
    } catch (err) {
      setError('Failed to fetch property directory.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await adminService.approveProperty(id);
      setProperties((prev) =>
        prev.map((p) => (p._id === id ? { ...p, approvalStatus: 'Approved' } : p))
      );
    } catch (err) {
      alert(err.response?.data?.message || 'Approval failed.');
    }
  };

  const handleReject = async (id) => {
    const reason = prompt('Enter rejection rationale:', 'Documentation insufficient');
    if (reason === null) return;

    try {
      await adminService.rejectProperty(id, reason);
      setProperties((prev) =>
        prev.map((p) => (p._id === id ? { ...p, approvalStatus: 'Rejected', rejectionReason: reason } : p))
      );
    } catch (err) {
      alert(err.response?.data?.message || 'Rejection failed.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this listing?')) return;
    try {
      await propertyService.delete(id);
      setProperties((prev) => prev.filter((p) => p._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Deletion failed.');
    }
  };

  const filtered = properties.filter(
    (p) =>
      p.title?.toLowerCase().includes(search.toLowerCase()) ||
      p.city?.toLowerCase().includes(search.toLowerCase()) ||
      p.agent?.fullName?.toLowerCase().includes(search.toLowerCase())
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
          <h1 className="page-title">Manage Property Listings</h1>
          <p className="page-subtitle">Verify, approve, reject, or archive property submissions across the platform</p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          {/* Status filter dropdown */}
          <select
            className="form-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ width: '170px' }}
          >
            <option value="">All Approvals</option>
            <option value="Pending">Pending Only</option>
            <option value="Approved">Approved Only</option>
            <option value="Rejected">Rejected Only</option>
          </select>

          {/* Search */}
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
              placeholder="Search title, city, agent..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {loading ? (
        <Loader fullScreen={false} message="Loading all property listings..." />
      ) : (
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Property</th>
                <th>Type & Purpose</th>
                <th>Price</th>
                <th>Location</th>
                <th>Agent</th>
                <th>Approval</th>
                <th>Listing Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '2rem' }}>
                    No properties match your filter.
                  </td>
                </tr>
              ) : (
                filtered.map((p) => (
                  <tr key={p._id}>
                    <td>
                      <strong>{p.title}</strong>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {p.area} sq ft • {p.bedrooms || 0} BHK
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
                      {p.city}, {p.state}
                    </td>
                    <td>{p.agent?.fullName || 'Agent'}</td>
                    <td>
                      <span className={`badge badge-${p.approvalStatus?.toLowerCase() || 'pending'}`}>
                        {p.approvalStatus || 'Pending'}
                      </span>
                    </td>
                    <td>
                      <span className={`badge badge-${p.status?.toLowerCase() || 'available'}`}>
                        {p.status || 'Available'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.35rem' }}>
                        <Link
                          to={`/properties/${p._id}`}
                          className="btn btn-outline btn-sm"
                          title="View property details"
                        >
                          <Eye size={14} />
                        </Link>
                        {p.approvalStatus !== 'Approved' && (
                          <button
                            type="button"
                            className="btn btn-success btn-sm"
                            onClick={() => handleApprove(p._id)}
                            title="Approve Listing"
                          >
                            Approve
                          </button>
                        )}
                        {p.approvalStatus !== 'Rejected' && (
                          <button
                            type="button"
                            className="btn btn-danger btn-sm"
                            onClick={() => handleReject(p._id)}
                            title="Reject Listing"
                          >
                            Reject
                          </button>
                        )}
                        <button
                          type="button"
                          className="btn btn-outline btn-sm"
                          onClick={() => handleDelete(p._id)}
                          title="Delete Listing"
                          style={{ color: 'var(--danger)' }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
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

export default ManageProperties;
