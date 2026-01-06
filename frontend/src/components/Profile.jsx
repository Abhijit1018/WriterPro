import React, { useEffect, useMemo, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import { setUser } from '../slices/authSlice';
import ThemeToggle from './ThemeToggle';
import { CheckCircle, Bell, Save, User as UserIcon } from 'lucide-react';

const API_URL = 'http://localhost:8000/api';

const Profile = () => {
  const { user, token } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const [displayName, setDisplayName] = useState(user?.display_name || '');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
  const [notifyEmail, setNotifyEmail] = useState(() => localStorage.getItem('notify_email') === 'true');
  const [notifyInApp, setNotifyInApp] = useState(() => localStorage.getItem('notify_inapp') !== 'false');

  useEffect(() => {
    setDisplayName(user?.display_name || '');
  }, [user]);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('notify_email', notifyEmail);
    localStorage.setItem('notify_inapp', notifyInApp);
  }, [notifyEmail, notifyInApp]);

  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    try {
      const res = await axios.patch(`${API_URL}/me/`, { display_name: displayName }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      dispatch(setUser(res.data));
      setMessage('Profile updated');
    } catch (err) {
      setMessage(err.response?.data?.error || 'Unable to update profile');
    } finally {
      setSaving(false);
    }
  };

  const notifySummary = useMemo(() => {
    const parts = [];
    if (notifyEmail) parts.push('Email alerts');
    if (notifyInApp) parts.push('In-app alerts');
    return parts.length ? parts.join(' · ') : 'All notifications muted';
  }, [notifyEmail, notifyInApp]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <p className="text-sm text-slate-500">Manage your profile, theme, and notifications.</p>
          <h1 className="text-3xl font-bold text-slate-900">Profile & Preferences</h1>
        </div>
        <ThemeToggle />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <span className="p-3 rounded-full bg-emerald-50 text-emerald-700"><UserIcon size={18} /></span>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-emerald-700 font-bold">Profile</p>
                <h3 className="text-xl font-bold text-slate-900">Display name</h3>
              </div>
            </div>
            <label className="block text-sm font-medium text-slate-700">Display name</label>
            <input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="How should we call you?"
              className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            <div className="flex items-center gap-3 mt-4">
              <button
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-teal-700 text-white font-semibold hover:bg-teal-800 disabled:opacity-60"
              >
                <Save size={16} />
                {saving ? 'Saving...' : 'Save profile'}
              </button>
              {message && <span className="text-sm text-emerald-700 flex items-center gap-1"><CheckCircle size={14} /> {message}</span>}
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-emerald-700 font-bold">Theme</p>
                <h3 className="text-xl font-bold text-slate-900">Appearance</h3>
                <p className="text-sm text-slate-600">Choose the interface style that fits your workflow.</p>
              </div>
            </div>
            <div className="grid sm:grid-cols-3 gap-3">
              {['light', 'dark'].map((opt) => (
                <button
                  key={opt}
                  onClick={() => setTheme(opt)}
                  className={`rounded-xl border px-4 py-3 text-left transition ${theme === opt ? 'border-teal-500 bg-teal-50 text-teal-800' : 'border-slate-200 bg-white text-slate-800 hover:border-teal-300'}`}
                >
                  <p className="font-semibold capitalize">{opt} mode</p>
                  <p className="text-xs text-slate-500">{opt === 'dark' ? 'Low-glare, focused UI' : 'Bright, neutral UI'}</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <Bell className="text-amber-500" size={18} />
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-emerald-700 font-bold">Notifications</p>
                <h3 className="text-lg font-bold text-slate-900">Preferences</h3>
              </div>
            </div>
            <div className="space-y-3 text-sm text-slate-700">
              <label className="flex items-center justify-between gap-3">
                <span>Email alerts</span>
                <input type="checkbox" checked={notifyEmail} onChange={(e) => setNotifyEmail(e.target.checked)} className="w-4 h-4" />
              </label>
              <label className="flex items-center justify-between gap-3">
                <span>In-app alerts</span>
                <input type="checkbox" checked={notifyInApp} onChange={(e) => setNotifyInApp(e.target.checked)} className="w-4 h-4" />
              </label>
            </div>
            <p className="text-xs text-slate-500 mt-3">{notifySummary}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
