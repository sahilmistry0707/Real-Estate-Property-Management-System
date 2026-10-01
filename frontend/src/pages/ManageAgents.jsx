import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminService } from '../services/api';
import Loader from '../components/Loader';
import {
  UserCheck,
  Search,
  Building,
  Trash2,
  ArrowLeft,
  Mail,
  Phone,
} from 'lucide-react';

const ManageAgents = () => {
  const [agents, setAgents] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await adminService.getAllAgents();
      setAgents(res.data.agents || []);
    } catch (err) {
      setError('Failed to fetch licensed agents.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    const nextStatus = currentStatus === 'active' ? 'inactive' : 'active';
    try {
      await adminService.updateUserStatus(id, nextStatus);
      setAgents((prev) =>
        prev.map((a) => (a._id === id ? { ...a, status: nextStatus } : a))
      );
    } catch (err) {
      alert(err.response?.data?.message || 'Status update failed.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this agent account?')) return;
    try {
      await adminService.deleteUser(id);
      setAgents((prev) => prev.filter((a) => a._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete agent.');
    }
  };

  const filteredAgents = agents.filter(
    (a) =>
      a.fullName?.toLowerCase().includes(search.toLowerCase()) ||
      a.email?.toLowerCase().includes(search.toLowerCase()) ||
      a.agencyName?.toLowerCase().includes(search.toLowerCase())
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
          <h1 className="page-title">Manage Real Estate Agents</h1>
          <p className="page-subtitle">Verify brokerage affiliations and regulate agent listing privileges</p>
        </div>

        <div style={{ position: 'relative', width: '280px' }}>
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
            style={{ paddingLeft: '2.2rem', paddingRight: '0.75rem' }}
            placeholder="Search agents or agencies..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <Loader fullScreen={false} message="Loading agent network records..." />
      ) : (
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Agent</th>
                <th>Agency / Brokerage</th>
                <th>Contact</th>
                <th>Privilege Status</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAgents.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>
                    No agent accounts found matching your query.
                  </td>
                </tr>
              ) : (
                filteredAgents.map((a) => (
                  <tr key={a._id}>
                    <td>
                      <strong>{a.fullName}</strong>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{a.email}</div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <Building size={14} color="var(--primary)" />
                        <span>{a.agencyName || 'Independent'}</span>
                      </div>
                    </td>
                    <td>{a.phone || '—'}</td>
                    <td>
                      <span className={`badge badge-${a.status === 'active' ? 'active' : 'inactive'}`}>
                        {a.status}
                      </span>
                    </td>
                    <td>{new Date(a.createdAt).toLocaleDateString()}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          type="button"
                          className={`btn btn-sm ${a.status === 'active' ? 'btn-outline' : 'btn-success'}`}
                          onClick={() => handleToggleStatus(a._id, a.status)}
                        >
                          {a.status === 'active' ? 'Revoke / Suspend' : 'Activate'}
                        </button>
                        <button
                          type="button"
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDelete(a._id)}
                          title="Delete Agent"
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

export default ManageAgents;
