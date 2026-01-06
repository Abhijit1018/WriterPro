import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { ArrowUpRight, RefreshCw } from 'lucide-react';

const API_URL = 'http://localhost:8000/api';

const AdminUsers = () => {
  const { token } = useSelector((state) => state.auth);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/users/`, { headers: { Authorization: `Bearer ${token}` } });
      setUsers(res.data);
    } catch (err) {
      console.error('Failed to load users', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const promoteUser = async (id) => {
    try {
      await axios.patch(
        `${API_URL}/users/${id}/`,
        { role: 'WRITER' },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, role: 'WRITER' } : u)));
    } catch (err) {
      alert(err.response?.data?.detail || 'Unable to promote user');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm text-slate-500">Control user access and promotions.</p>
          <h1 className="text-2xl font-bold text-slate-900">Users</h1>
        </div>
        <button onClick={fetchUsers} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 text-sm font-semibold text-slate-700 hover:text-teal-700">
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-x-auto">
        <table className="min-w-full text-sm text-slate-700">
          <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500">
            <tr>
              <th className="px-4 py-3 text-left">ID</th>
              <th className="px-4 py-3 text-left">Phone</th>
              <th className="px-4 py-3 text-left">Role</th>
              <th className="px-4 py-3 text-left">Wallet</th>
              <th className="px-4 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr><td colSpan="5" className="px-4 py-6 text-center text-slate-500">Loading users...</td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan="5" className="px-4 py-6 text-center text-slate-500">No users found.</td></tr>
            ) : (
              users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-semibold">#{u.id}</td>
                  <td className="px-4 py-3">{u.phone_number}</td>
                  <td className="px-4 py-3 font-medium">{u.role}</td>
                  <td className="px-4 py-3">${u.wallet_balance}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => promoteUser(u.id)}
                      disabled={u.role === 'WRITER' || u.role === 'ADMIN'}
                      className="inline-flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-semibold bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-50"
                    >
                      <ArrowUpRight size={16} /> Promote to Writer
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminUsers;
