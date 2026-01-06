import React, { useEffect, useMemo, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { updateWallet } from '../slices/authSlice';
import {
    Banknote,
    Lock,
    Clock,
    Play,
    Pause,
    Users,
    Bell,
    TrendingUp,
    CheckCircle,
    AlertCircle,
    TimerReset,
    ArrowRight,
} from 'lucide-react';

const Dashboard = () => {
    const { user, token } = useSelector((state) => state.auth);
    const [tasks, setTasks] = useState([]);
    const [query, setQuery] = useState('');
    const [typeFilter, setTypeFilter] = useState('ALL');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [sortBy, setSortBy] = useState('recent');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    useEffect(() => {
        fetchTasks();
    }, []);

    const fetchTasks = async () => {
        try {
            const res = await axios.get('http://localhost:8000/api/tasks/', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setTasks(res.data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setError("Failed to load tasks. Your session may have expired.");
            setLoading(false);
        }
    };

    const handleStartTask = async (task) => {
        if (task.status !== 'OPEN') return;

        if (user.role === 'TRAINEE' && task.type === 'PAID') return;

        try {
            await axios.post(`http://localhost:8000/api/tasks/${task.id}/lock/`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (user.role === 'WRITER') {
                dispatch(updateWallet(parseFloat(user.wallet_balance) - parseFloat(task.deposit_amount)));
            }

            navigate(`/workspace/${task.id}`);
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to start task');
        }
    };

    const stats = useMemo(() => {
        const completed = tasks.filter(t => t.status === 'COMPLETED').length;
        const running = tasks.filter(t => t.status === 'LOCKED').length;
        const pending = tasks.filter(t => t.status === 'OPEN').length;
        const paid = tasks.filter(t => t.type === 'PAID').length;
        return {
            total: tasks.length,
            completed,
            running,
            pending,
            paid,
        };
    }, [tasks]);
    const filteredTasks = useMemo(() => {
        let list = [...tasks];
        if (query) {
            list = list.filter((t) => `${t.id}`.includes(query));
        }
        if (typeFilter !== 'ALL') {
            list = list.filter((t) => t.type === typeFilter);
        }
        if (statusFilter !== 'ALL') {
            list = list.filter((t) => t.status === statusFilter);
        }
        switch (sortBy) {
            case 'reward':
                list.sort((a, b) => parseFloat(b.reward_amount) - parseFloat(a.reward_amount));
                break;
            case 'deposit':
                list.sort((a, b) => parseFloat(b.deposit_amount) - parseFloat(a.deposit_amount));
                break;
            case 'time':
                list.sort((a, b) => parseInt(a.time_limit) - parseInt(b.time_limit));
                break;
            default:
                list.sort((a, b) => b.id - a.id);
        }
        return list;
    }, [tasks, query, typeFilter, statusFilter, sortBy]);

    const reminders = [
        { title: 'Finish QA checks', time: 'Today, 4:00 PM', cta: 'Open QA' },
        { title: 'Meet new writers', time: 'Tomorrow, 11:00 AM', cta: 'View roster' },
    ];

    const team = [
        { name: 'Alexandra Deff', status: 'Completed last task' },
        { name: 'Edwin Adenike', status: 'In Progress' },
        { name: 'Isaac Oluwatemilorun', status: 'In Progress' },
        { name: 'David Oshodi', status: 'Pending review' },
    ];

    const progress = Math.min(100, Math.round((stats.completed / Math.max(stats.total || 1, 1)) * 100));

    if (loading) return <div className="text-center py-12 text-slate-500">Loading tasks...</div>;

    if (error) return (
        <div className="text-center py-12">
            <p className="text-red-500 mb-4">{error}</p>
            <button onClick={() => { localStorage.clear(); window.location.href = '/'; }} className="text-teal-700 underline font-semibold">
                Click here to Login Again
            </button>
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <p className="text-sm text-slate-500">Plan, prioritize, and finish tasks with ease.</p>
                    <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
                </div>
                <div className="flex items-center gap-2">
                    <button className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-slate-200 text-sm font-semibold text-slate-700 hover:text-teal-700">
                        <Bell size={16} /> Reminders
                    </button>
                    <button className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-700 text-white text-sm font-semibold hover:bg-teal-800">
                        <Play size={16} /> Add Task
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard title="Total Tasks" value={stats.total} hint="Across all types" icon={<TrendingUp size={18} />} color="from-emerald-500 to-teal-600" />
                <StatCard title="Completed" value={stats.completed} hint="Marked done" icon={<CheckCircle size={18} />} color="from-slate-800 to-slate-900" />
                <StatCard title="Running" value={stats.running} hint="Locked / in progress" icon={<Play size={18} />} color="from-cyan-500 to-blue-500" />
                <StatCard title="Pending" value={stats.pending} hint="Open queue" icon={<Pause size={18} />} color="from-amber-400 to-orange-500" />
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    {/* Filters & Search */}
                    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4">
                        <div className="flex flex-wrap items-center gap-3">
                            <input
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Search by task ID"
                                className="flex-1 min-w-[200px] rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                            />
                            <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="rounded-lg border border-slate-300 px-3 py-2">
                                <option value="ALL">All types</option>
                                <option value="ASSESSMENT">Assessment</option>
                                <option value="PAID">Paid</option>
                            </select>
                            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="rounded-lg border border-slate-300 px-3 py-2">
                                <option value="ALL">All statuses</option>
                                <option value="OPEN">Open</option>
                                <option value="LOCKED">Locked</option>
                                <option value="COMPLETED">Completed</option>
                            </select>
                            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="rounded-lg border border-slate-300 px-3 py-2">
                                <option value="recent">Recent</option>
                                <option value="reward">Top reward</option>
                                <option value="deposit">Highest deposit</option>
                                <option value="time">Shortest time</option>
                            </select>
                        </div>
                    </div>
                    <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
                        <MiniCard title="Paid Tasks" value={stats.paid} icon={<Banknote size={16} />} badge="Wallet linked" />
                        <MiniCard title="Writers" value={team.length} icon={<Users size={16} />} badge="Active" />
                        <MiniCard title="Trainee queue" value={stats.pending} icon={<Clock size={16} />} badge="Waiting" />
                        <MiniCard title="Accuracy target" value="94%" icon={<TrendingUp size={16} />} badge="This week" />
                    </div>

                    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-500">Your workload</p>
                                <h2 className="text-xl font-bold text-slate-900">Available Tasks</h2>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                                <Lock size={16} className="text-slate-400" /> Locked tasks stay reserved for the assignee
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {loading && (
                                Array.from({ length: 6 }).map((_, i) => (
                                    <div key={i} className="bg-slate-900 text-white rounded-2xl p-4 shadow-lg animate-pulse">
                                        <div className="h-4 w-24 bg-white/10 rounded mb-3" />
                                        <div className="h-5 w-48 bg-white/10 rounded mb-2" />
                                        <div className="h-3 w-32 bg-white/10 rounded" />
                                    </div>
                                ))
                            )}

                            {!loading && filteredTasks.map((task) => {
                                const isLocked = task.status !== 'OPEN';
                                const isPaid = task.type === 'PAID';
                                const isDisabled = (user.role === 'TRAINEE' && isPaid) || isLocked;

                                return (
                                    <div key={task.id} className={`bg-slate-900 text-white rounded-2xl p-4 shadow-lg relative overflow-hidden ${isDisabled ? 'opacity-70' : ''}`}>
                                        <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-teal-500/10" />
                                        <div className="relative flex items-center justify-between mb-3">
                                            <span className={`text-xs font-bold px-2 py-1 rounded uppercase tracking-wide ${isPaid ? 'bg-amber-100 text-amber-800' : 'bg-white/20 text-white'}`}>
                                                {task.type}
                                            </span>
                                            {isLocked && <Lock className="text-white/70" size={16} />}
                                        </div>
                                        <h3 className="relative text-lg font-semibold mb-1">Image Transcription #{task.id}</h3>
                                        <p className="relative text-sm text-white/80 mb-3">Time limit: {task.time_limit}m</p>
                                        {isPaid && (
                                            <div className="relative grid grid-cols-2 gap-2 text-sm">
                                                <div className="bg-white/10 rounded-lg px-3 py-2 border border-white/10">
                                                    <p className="text-white/70 text-xs">Deposit</p>
                                                    <p className="font-bold text-amber-200">-${task.deposit_amount}</p>
                                                </div>
                                                <div className="bg-white/10 rounded-lg px-3 py-2 border border-white/10">
                                                    <p className="text-white/70 text-xs">Reward</p>
                                                    <p className="font-bold text-emerald-200">+${task.reward_amount}</p>
                                                </div>
                                            </div>
                                        )}
                                        <button
                                            onClick={() => handleStartTask(task)}
                                            disabled={isDisabled}
                                            className={`relative mt-4 w-full py-2 px-4 rounded-lg font-semibold text-sm transition-colors flex items-center justify-center gap-2 ${isDisabled
                                                ? 'bg-white/10 text-white/50 cursor-not-allowed'
                                                : 'bg-white text-slate-900 hover:bg-slate-100'
                                                }`}
                                        >
                                            {isLocked ? 'Locked / Completed' : (isPaid && user.role === 'WRITER' ? 'Pay & Start' : 'Start Assessment')}
                                            <ArrowRight size={14} />
                                        </button>
                                    </div>
                                );
                            })}

                            {!loading && filteredTasks.length === 0 && (
                                <div className="col-span-full text-center text-slate-500 py-8 bg-white border border-dashed border-slate-200 rounded-2xl">No tasks available right now.</div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-500">Progress</p>
                                <h3 className="text-xl font-bold text-slate-900">{progress}% completed</h3>
                            </div>
                            <TrendingUp className="text-teal-600" size={20} />
                        </div>
                        <div className="mt-4 h-3 rounded-full bg-slate-100 overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-600" style={{ width: `${progress}%` }}></div>
                        </div>
                        {user.role === 'TRAINEE' && (
                            <div className="mt-3 text-sm text-slate-600 flex items-center gap-2">
                                <AlertCircle size={16} className="text-amber-500" />
                                Complete 2 assessments to unlock paid work.
                            </div>
                        )}
                    </div>

                    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-bold text-slate-900">Reminders</h3>
                            <TimerReset size={18} className="text-slate-400" />
                        </div>
                        <div className="space-y-3">
                            {reminders.map((item) => (
                                <div key={item.title} className="p-3 rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-between">
                                    <div>
                                        <p className="font-semibold text-slate-800">{item.title}</p>
                                        <p className="text-xs text-slate-500">{item.time}</p>
                                    </div>
                                    <button className="text-sm font-semibold text-teal-700">{item.cta}</button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-bold text-slate-900">Team</h3>
                            <Users size={18} className="text-slate-400" />
                        </div>
                        <div className="space-y-3">
                            {team.map(member => (
                                <div key={member.name} className="flex items-center justify-between p-3 rounded-xl border border-slate-100">
                                    <div>
                                        <p className="font-semibold text-slate-800">{member.name}</p>
                                        <p className="text-xs text-slate-500">{member.status}</p>
                                    </div>
                                    <span className="text-xs px-2 py-1 rounded-full bg-teal-50 text-teal-700 font-semibold">Active</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ title, value, hint, icon, color }) => (
    <div className={`rounded-2xl p-4 text-white bg-gradient-to-br ${color} shadow-lg`}>
        <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-white/80">{title}</p>
            <span className="p-2 rounded-lg bg-white/15 text-white">{icon}</span>
        </div>
        <div className="text-3xl font-bold leading-tight">{value}</div>
        <p className="text-xs text-white/70 mt-1">{hint}</p>
    </div>
);

const MiniCard = ({ title, value, icon, badge }) => (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between mb-2 text-slate-500 text-sm">
            <span className="flex items-center gap-2 text-slate-700 font-semibold"><span className="text-teal-600">{icon}</span> {title}</span>
            <span className="text-xs px-2 py-1 rounded-full bg-teal-50 text-teal-700 font-semibold">{badge}</span>
        </div>
        <div className="text-2xl font-bold text-slate-900">{value}</div>
    </div>
);

export default Dashboard;
