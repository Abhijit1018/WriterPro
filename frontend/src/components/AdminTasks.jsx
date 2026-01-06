import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { PlusCircle, Upload, RefreshCw, FileDown } from 'lucide-react';

const API_URL = 'http://localhost:8000/api';

const AdminTasks = () => {
  const { token } = useSelector((state) => state.auth);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    type: 'ASSESSMENT',
    deposit_amount: '0',
    reward_amount: '0',
    time_limit: '30',
    image_url: null,
  });
  const [importing, setImporting] = useState(false);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/tasks/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTasks(res.data);
    } catch (err) {
      console.error('Failed to load tasks', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      const payload = new FormData();
      payload.append('type', form.type);
      payload.append('deposit_amount', form.deposit_amount || '0');
      payload.append('reward_amount', form.reward_amount || '0');
      payload.append('time_limit', form.time_limit || '30');
      if (form.image_url) {
        payload.append('image_url', form.image_url);
      }
      await axios.post(`${API_URL}/tasks/`, payload, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
      });
      setForm({ type: 'ASSESSMENT', deposit_amount: '0', reward_amount: '0', time_limit: '30', image_url: null });
      fetchTasks();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to create task');
    } finally {
      setCreating(false);
    }
  };

  const handleImportCsv = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    try {
      const text = await file.text();
      // Expect CSV header: type,deposit_amount,reward_amount,time_limit,image_url
      const lines = text.split(/\r?\n/).filter(Boolean);
      const header = lines.shift()?.split(',').map((h) => h.trim().toLowerCase());
      const idx = {
        type: header?.indexOf('type'),
        deposit_amount: header?.indexOf('deposit_amount'),
        reward_amount: header?.indexOf('reward_amount'),
        time_limit: header?.indexOf('time_limit'),
        image_url: header?.indexOf('image_url'),
      };

      for (const line of lines) {
        const cols = line.split(',');
        const row = {
          type: cols[idx.type]?.trim() || 'ASSESSMENT',
          deposit_amount: cols[idx.deposit_amount]?.trim() || '0',
          reward_amount: cols[idx.reward_amount]?.trim() || '0',
          time_limit: cols[idx.time_limit]?.trim() || '30',
          image_url: cols[idx.image_url]?.trim() || '',
        };

        const payload = new FormData();
        payload.append('type', row.type);
        payload.append('deposit_amount', row.deposit_amount);
        payload.append('reward_amount', row.reward_amount);
        payload.append('time_limit', row.time_limit);

        if (row.image_url) {
          try {
            const res = await fetch(row.image_url, { mode: 'cors' });
            const blob = await res.blob();
            const filename = row.image_url.split('/').pop() || 'image.jpg';
            payload.append('image_url', new File([blob], filename, { type: blob.type || 'image/jpeg' }));
          } catch (err) {
            console.warn('Failed to fetch image for row; skipping image.', err);
          }
        }

        await axios.post(`${API_URL}/tasks/`, payload, {
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
        });
      }

      fetchTasks();
      e.target.value = '';
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to import CSV');
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm text-slate-500">Add new work items and monitor their status.</p>
          <h1 className="text-2xl font-bold text-slate-900">Tasks</h1>
        </div>
        <div className="flex items-center gap-3">
          <label className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 text-sm font-semibold text-slate-700 hover:text-teal-700 cursor-pointer">
            <FileDown size={16} /> Import CSV
            <input type="file" accept=".csv" className="hidden" onChange={handleImportCsv} />
          </label>
          <button onClick={fetchTasks} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 text-sm font-semibold text-slate-700 hover:text-teal-700">
            <RefreshCw size={16} /> Refresh
          </button>
        </div>
      </div>

      <form onSubmit={handleCreate} className="grid md:grid-cols-5 gap-4 bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
        <div className="md:col-span-2">
          <label className="text-sm font-medium text-slate-700">Task Type</label>
          <select
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="ASSESSMENT">Assessment (free)</option>
            <option value="PAID">Paid</option>
          </select>
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700">Deposit</label>
          <input
            type="number"
            step="0.01"
            value={form.deposit_amount}
            onChange={(e) => setForm({ ...form, deposit_amount: e.target.value })}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
            placeholder="0.00"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700">Reward</label>
          <input
            type="number"
            step="0.01"
            value={form.reward_amount}
            onChange={(e) => setForm({ ...form, reward_amount: e.target.value })}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
            placeholder="0.00"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700">Time limit (minutes)</label>
          <input
            type="number"
            value={form.time_limit}
            onChange={(e) => setForm({ ...form, time_limit: e.target.value })}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
            placeholder="30"
          />
        </div>
        <div className="md:col-span-2">
          <label className="text-sm font-medium text-slate-700">Upload document image</label>
          <label className="mt-1 w-full flex items-center gap-2 rounded-lg border border-dashed border-slate-300 px-3 py-2 text-sm text-slate-600 cursor-pointer hover:border-teal-500">
            <Upload size={16} />
            <span>{form.image_url ? form.image_url.name : 'Choose file'}</span>
            <input type="file" accept="image/*" className="hidden" onChange={(e) => setForm({ ...form, image_url: e.target.files?.[0] || null })} />
          </label>
        </div>
        <div className="md:col-span-3 flex items-end">
          <button
            type="submit"
            disabled={creating}
            className="inline-flex items-center gap-2 px-4 py-3 rounded-lg bg-teal-700 text-white font-semibold hover:bg-teal-800 disabled:opacity-60"
          >
            <PlusCircle size={18} />
            {creating ? 'Creating...' : 'Add task'}
          </button>
          {importing && <span className="ml-3 text-sm text-slate-600">Importing CSV...</span>}
        </div>
      </form>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-x-auto">
        <table className="min-w-full text-sm text-slate-700">
          <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500">
            <tr>
              <th className="px-4 py-3 text-left">ID</th>
              <th className="px-4 py-3 text-left">Type</th>
              <th className="px-4 py-3 text-left">Deposit</th>
              <th className="px-4 py-3 text-left">Reward</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Time</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr><td colSpan="6" className="px-4 py-6 text-center text-slate-500">Loading tasks...</td></tr>
            ) : tasks.length === 0 ? (
              <tr><td colSpan="6" className="px-4 py-6 text-center text-slate-500">No tasks yet.</td></tr>
            ) : (
              tasks.map((task) => (
                <tr key={task.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-semibold">#{task.id}</td>
                  <td className="px-4 py-3">{task.type}</td>
                  <td className="px-4 py-3">${task.deposit_amount}</td>
                  <td className="px-4 py-3">${task.reward_amount}</td>
                  <td className="px-4 py-3 font-medium">{task.status}</td>
                  <td className="px-4 py-3">{task.time_limit}m</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminTasks;
