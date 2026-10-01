import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminService } from '../services/api';
import Loader from '../components/Loader';
import {
  Users,
  UserCheck,
  Building,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  TrendingUp,
  PieChart,
  Shield,
  ArrowRight,
} from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [reports, setReports] = useState(null);
  const [pendingProperties, setPendingProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, reportsRes, propsRes] = await Promise.allSettled([
        adminService.getDashboardStats(),
        adminService.getReports(),
        adminService.getAllProperties({ approvalStatus: 'Pending' }),
      ]);

      if (statsRes.status === 'fulfilled') {
        setStats(statsRes.value.data.stats || {});
      }
      if (reportsRes.status === 'fulfilled') {
        setReports(reportsRes.value.data || {});
      }
      if (propsRes.status === 'fulfilled') {
        setPendingProperties(propsRes.value.data.properties || []);
      }
    } catch (err) {
      setError('Failed to fetch administrator statistics.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await adminService.approveProperty(id);
      setPendingProperties((prev) => prev.filter((p) => p._id !== id));
      if (stats) {
        setStats((prev) => ({
          ...prev,
          pendingApprovals: Math.max(0, (prev.pendingApprovals || 1) - 1),
        }));
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Approval failed.');
    }
  };

  const handleReject = async (id) => {
    const reason = prompt('Please enter reason for rejection:', 'Listing does not meet verification criteria');
    if (reason === null) return;

    try {
      await adminService.rejectProperty(id, reason);
      setPendingProperties((prev) => prev.filter((p) => p._id !== id));
      if (stats) {
        setStats((prev) => ({
          ...prev,
          pendingApprovals: Math.max(0, (prev.pendingApprovals || 1) - 1),
        }));
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Rejection failed.');
    }
  };

  if (loading) {
    return <Loader fullScreen={true} message="Loading platform executive dashboard..." />;
  }

  return (
    <div className="page-wrapper container">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="page-title">Platform Administration Panel</h1>
          <p className="page-subtitle">
            System health, listing verifications, user audits, and business reports
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <Link to="/admin/properties" className="btn btn-outline btn-sm">
            Manage Properties
          </Link>
          <Link to="/admin/users" className="btn btn-outline btn-sm">
            Manage Users
          </Link>
          <Link to="/admin/agents" className="btn btn-outline btn-sm">
            Manage Agents
          </Link>
          <Link to="/admin/bookings" className="btn btn-primary btn-sm">
            Manage Bookings
          </Link>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="stat-card-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary)' }}>
            <Building size={24} />
          </div>
          <div>
            <div className="stat-val">{stats?.totalProperties || 0}</div>
            <div className="stat-lbl">Total Properties Listed</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#fffbeb', color: '#f59e0b' }}>
            <Clock size={24} />
          </div>
          <div>
            <div className="stat-val">{stats?.pendingApprovals || pendingProperties.length}</div>
            <div className="stat-lbl">Pending Property Approvals</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#ecfdf5', color: '#10b981' }}>
            <Users size={24} />
          </div>
          <div>
            <div className="stat-val">{stats?.totalUsers || 0}</div>
            <div className="stat-lbl">Registered Clients</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#eff6ff', color: '#2563eb' }}>
            <UserCheck size={24} />
          </div>
          <div>
            <div className="stat-val">{stats?.totalAgents || 0}</div>
            <div className="stat-lbl">Verified Agents</div>
          </div>
        </div>
      </div>

      {/* Pending Approvals Table */}
      <div className="card" style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 600 }}>
              Pending Property Submissions ({pendingProperties.length})
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              Verify details and approve or reject submissions before they go live on OpenStreetMap & listings
            </p>
          </div>
          <Link to="/admin/properties" className="btn btn-outline btn-sm">
            <span>View All Properties</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        {pendingProperties.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)' }}>
            <CheckCircle size={36} color="var(--success)" style={{ margin: '0 auto 0.5rem' }} />
            <p>All property listings have been verified and approved.</p>
          </div>
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
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingProperties.slice(0, 5).map((prop) => (
                  <tr key={prop._id}>
                    <td>
                      <strong>{prop.title}</strong>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {prop.area} sq ft • {prop.bedrooms || 0} BHK
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${prop.purpose === 'Rent' ? 'badge-rent' : 'badge-buy'}`}>
                        {prop.purpose}
                      </span>{' '}
                      <span style={{ fontSize: '0.85rem' }}>{prop.type}</span>
                    </td>
                    <td>
                      <strong>${prop.price?.toLocaleString()}</strong>
                    </td>
                    <td>
                      {prop.city}, {prop.state}
                    </td>
                    <td>{prop.agent?.fullName || 'Agent'}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <Link
                          to={`/properties/${prop._id}`}
                          className="btn btn-outline btn-sm"
                          title="View property details"
                        >
                          Review
                        </Link>
                        <button
                          type="button"
                          className="btn btn-success btn-sm"
                          onClick={() => handleApprove(prop._id)}
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          className="btn btn-danger btn-sm"
                          onClick={() => handleReject(prop._id)}
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

      {/* Reports & Metrics Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {/* Purpose Breakdown */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <TrendingUp size={20} color="var(--primary)" />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Listings Distribution</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                <span>Properties for Buy (Sale)</span>
                <strong>65%</strong>
              </div>
              <div style={{ height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: '65%', height: '100%', background: 'var(--accent)' }}></div>
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                <span>Properties for Rent</span>
                <strong>35%</strong>
              </div>
              <div style={{ height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: '35%', height: '100%', background: 'var(--primary)' }}></div>
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                <span>Apartments & Condos</span>
                <strong>52%</strong>
              </div>
              <div style={{ height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: '52%', height: '100%', background: '#8b5cf6' }}></div>
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                <span>Luxury Villas & Houses</span>
                <strong>30%</strong>
              </div>
              <div style={{ height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: '30%', height: '100%', background: '#f59e0b' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Operational Modules */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <Shield size={20} color="var(--primary)" />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Administrative Controls</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <Link
              to="/admin/users"
              className="btn btn-outline"
              style={{ justifyContent: 'space-between' }}
            >
              <span>Manage Client Accounts</span>
              <ArrowRight size={16} />
            </Link>
            <Link
              to="/admin/agents"
              className="btn btn-outline"
              style={{ justifyContent: 'space-between' }}
            >
              <span>Manage Licensed Agents</span>
              <ArrowRight size={16} />
            </Link>
            <Link
              to="/admin/properties"
              className="btn btn-outline"
              style={{ justifyContent: 'space-between' }}
            >
              <span>Audit & Moderate Properties</span>
              <ArrowRight size={16} />
            </Link>
            <Link
              to="/admin/bookings"
              className="btn btn-outline"
              style={{ justifyContent: 'space-between' }}
            >
              <span>Review Bookings & Applications</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
