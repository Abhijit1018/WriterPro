import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { LayoutDashboard, Wallet, History as HistoryIcon, LogOut, Menu, X, User as UserIcon, Sun } from 'lucide-react';
import { logout } from '../slices/authSlice';
import ThemeToggle from './ThemeToggle';

const DashboardLayout = () => {
    const { user } = useSelector(state => state.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const handleLogout = () => {
        dispatch(logout());
        navigate('/');
    };

    const NavItem = ({ to, icon: Icon, label }) => (
        <NavLink
            to={to}
            end
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium ${isActive ? 'bg-teal-50 text-teal-700' : 'text-slate-600 hover:bg-teal-50/50 hover:text-teal-800'
                }`}
        >
            <Icon size={20} />
            {label}
        </NavLink>
    );

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 via-slate-100 to-slate-50 flex">
            {sidebarOpen && (
                <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />
            )}

            <aside className={`fixed inset-y-0 left-0 w-68 bg-white/90 backdrop-blur border-r border-slate-200 z-30 transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static flex flex-col ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="h-16 flex items-center px-6 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                        <span className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white font-bold flex items-center justify-center shadow-md">WE</span>
                        <div>
                            <p className="text-sm font-bold text-slate-900">WriteEarn</p>
                            <p className="text-xs text-slate-500">Workspace</p>
                        </div>
                    </div>
                </div>

                <div className="p-6 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                        <div className="bg-emerald-50 p-2 rounded-full text-emerald-700">
                            <UserIcon size={22} />
                        </div>
                        <div>
                            <p className="font-semibold text-slate-800 text-sm">User #{user?.id}</p>
                            <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">{user?.role}</p>
                            {user?.role === 'WRITER' && (
                                <p className="text-xs font-bold text-emerald-600 mt-1">${user?.wallet_balance}</p>
                            )}
                        </div>
                    </div>
                </div>

                <nav className="flex-1 p-4 space-y-1">
                    <NavItem to="/dashboard" icon={LayoutDashboard} label="Dashboard" />
                    <NavItem to="/dashboard/wallet" icon={Wallet} label="Wallet" />
                    <NavItem to="/dashboard/history" icon={HistoryIcon} label="History" />
                    <NavItem to="/dashboard/profile" icon={UserIcon} label="Profile" />
                </nav>

                <div className="p-4 border-t border-slate-100 space-y-3">
                    <ThemeToggle />
                    <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg w-full transition-colors font-semibold">
                        <LogOut size={20} />
                        Logout
                    </button>
                </div>
            </aside>

            <div className="flex-1 flex flex-col min-w-0">
                <header className="bg-white/90 backdrop-blur border-b border-slate-200 h-16 flex items-center px-4 justify-between lg:hidden sticky top-0 z-10">
                    <span className="font-bold text-teal-700">WriteEarn</span>
                    <button onClick={() => setSidebarOpen(true)} className="p-2 text-slate-600">
                        <Menu size={24} />
                    </button>
                </header>

                <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
