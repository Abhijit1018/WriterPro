import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { LayoutDashboard, FileSpreadsheet, Users, LogOut, Menu, ShieldCheck } from 'lucide-react';
import { logout } from '../slices/authSlice';

const AdminLayout = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const NavItem = ({ to, icon: Icon, label, end }) => (
    <NavLink
      to={to}
      end={end}
      onClick={() => setOpen(false)}
      className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-colors ${isActive ? 'bg-teal-50 text-teal-700' : 'text-slate-600 hover:bg-slate-50 hover:text-teal-700'}`}
    >
      <Icon size={18} />
      {label}
    </NavLink>
  );

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

    return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-slate-100 to-slate-50 flex">
      {open && <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-20 lg:hidden" onClick={() => setOpen(false)} />}

      <aside className={`fixed inset-y-0 left-0 w-68 bg-white/90 backdrop-blur border-r border-slate-200 z-30 transition-transform duration-200 lg:translate-x-0 lg:static flex flex-col ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-16 flex items-center px-6 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white flex items-center justify-center shadow-md"><ShieldCheck size={18} /></span>
            <div>
              <p className="text-sm font-bold text-slate-900">Admin Console</p>
              <p className="text-xs text-slate-500">{user?.phone_number}</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          <NavItem to="/admin" icon={LayoutDashboard} label="Work & Tasks" end />
          <NavItem to="/admin/submissions" icon={FileSpreadsheet} label="Submissions" />
          <NavItem to="/admin/users" icon={Users} label="Users" />
        </nav>
        <div className="p-4 border-t border-slate-100">
          <button onClick={handleLogout} className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 font-semibold">
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white/90 backdrop-blur border-b border-slate-200 h-16 flex items-center justify-between px-4 lg:hidden">
          <div className="font-bold text-teal-700">WriteEarn Admin</div>
          <button onClick={() => setOpen(true)} className="p-2"><Menu size={22} /></button>
        </header>
        <main className="flex-1 p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
