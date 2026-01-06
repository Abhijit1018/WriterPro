import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { CheckCircle2, XCircle, Clock, RefreshCw } from 'lucide-react';
import API_URL from '../config';

const AdminSubmissions = () => {
  const { token } = useSelector((state) => state.auth);
  const [submissions, setSubmissions] = useState([]);
  const [filter, setFilter] = useState('ALL');
  const [loading, setLoading] = useState(false);

  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/submissions/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSubmissions(res.data);
    } catch (err) {
      console.error('Failed to load submissions', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleModerate = async (id, status) => {
    try {
      const res = await axios.post(`${API_URL}/submissions/${id}/moderate/`, { status }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSubmissions((prev) => prev.map((s) => (s.id === id ? res.data.submission : s)));
    } catch (err) {
      alert(err.response?.data?.error || 'Unable to update submission');
    }
  };

  const filtered = submissions.filter((s) => (filter === 'ALL' ? true : s.status === filter));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm text-slate-500">Review, approve, or reject submissions.</p>
          <h1 className="text-2xl font-bold text-slate-900">Submissions</h1>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="ALL">All</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
          </select>
          <button onClick={fetchSubmissions} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 text-sm font-semibold text-slate-700 hover:text-teal-700">
            <RefreshCw size={16} /> Refresh
          </button>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-x-auto">
        <table className="min-w-full text-sm text-slate-700">
          <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500">
            <tr>
              <th className="px-4 py-3 text-left">ID</th>
              <th className="px-4 py-3 text-left">Task</th>
              <th className="px-4 py-3 text-left">User</th>
              <th className="px-4 py-3 text-left">Score</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr><td colSpan="6" className="px-4 py-6 text-center text-slate-500">Loading submissions...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan="6" className="px-4 py-6 text-center text-slate-500">No submissions found.</td></tr>
            ) : (
              filtered.map((submission) => (
                <tr key={submission.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-semibold">#{submission.id}</td>
                  <td className="px-4 py-3">Task #{submission.task}</td>
                  <td className="px-4 py-3">User #{submission.user}</td>
                  <td className="px-4 py-3">{Math.round(submission.ocr_match_score * 100)}%</td>
                  <td className="px-4 py-3 font-semibold">{submission.status}</td>
                  <td className="px-4 py-3 space-x-2">
                    <button
                      onClick={() => handleModerate(submission.id, 'APPROVED')}
                      disabled={submission.status === 'APPROVED'}
                      className="inline-flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 disabled:opacity-50"
                    >
                      <CheckCircle2 size={16} /> Approve
                    </button>
                    <button
                      onClick={() => handleModerate(submission.id, 'REJECTED')}
                      disabled={submission.status === 'REJECTED'}
                      className="inline-flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-semibold bg-red-50 text-red-700 hover:bg-red-100 disabled:opacity-50"
                    >
                      <XCircle size={16} /> Reject
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3 text-amber-800 text-sm">
        <Clock size={16} />
        Once a submission is approved, deposits and rewards are paid out automatically; assessments count toward trainee promotions.
      </div>
    </div>
  );
};

export default AdminSubmissions;
