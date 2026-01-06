import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useSelector, useDispatch } from 'react-redux';
import { updateWallet } from '../slices/authSlice';
import { ZoomIn, ZoomOut, Save } from 'lucide-react';

const Workspace = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { token, user } = useSelector(state => state.auth);
    const dispatch = useDispatch();

    const [task, setTask] = useState(null);
    const [content, setContent] = useState('');
    const [zoom, setZoom] = useState(1);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        // Fetch task details? Or assume we have it? Dashboard passed only ID.
        // We need image URL.
        // Let's fetch list and find, or detail endpoint.
        // We haven't implemented detail endpoint specifically in viewset (ModelViewSet has it by default).
        axios.get(`http://localhost:8000/api/tasks/${id}/`, {
            headers: { Authorization: `Bearer ${token}` }
        }).then(res => setTask(res.data)).catch(err => console.error(err));
    }, [id, token]);

    const handleSubmit = async () => {
        setSubmitting(true);
        try {
            const res = await axios.post('http://localhost:8000/api/submissions/', {
                task: id,
                typed_content: content
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.data.status === 'APPROVED') {
                alert('Submission Approved! Payment released.');

                // Update specific user state from backend response (balance, role, etc)
                if (res.data.user) {
                    localStorage.setItem('user', JSON.stringify(res.data.user));
                    // A bit hacky to force redux update without a specialized action, 
                    // but re-login or reload works. 
                    // Let's reload to update the whole app state/sidebar
                    setTimeout(() => window.location.href = '/dashboard', 500);
                    return;
                }

                if (res.data.promoted) {
                    alert('🎉 CONGRATULATIONS! You have been promoted to a Writer! You can now access Paid Tasks.');
                }

                if (user.role === 'WRITER' && task.type === 'PAID') {
                    // Update balance locally for demo smoothness
                    const earnings = parseFloat(task.deposit_amount) + parseFloat(task.reward_amount);
                    dispatch(updateWallet(parseFloat(user.wallet_balance) + earnings));
                }
                navigate('/dashboard');
            } else if (res.data.status === 'REJECTED') {
                alert('Submission Rejected. Low accuracy.');
                navigate('/dashboard');
            } else {
                alert('Submission Pending.');
                navigate('/dashboard');
            }
        } catch (err) {
            alert('Submission failed');
        } finally {
            setSubmitting(false);
        }
    };

    if (!task) return <div>Loading...</div>;

    return (
        <div className="flex h-screen flex-col">
            <header className="bg-teal-700 text-white p-3 flex justify-between items-center shadow-md z-10">
                <div className="font-bold">Task #{id} - {task.type}</div>
                <div className="text-sm">Time Remaining: {task.time_limit}:00</div>
                <button
                    onClick={() => navigate('/dashboard')}
                    className="bg-teal-800 px-3 py-1 rounded text-sm hover:bg-teal-900"
                >
                    Cancel
                </button>
            </header>

            <div className="flex-1 flex overflow-hidden">
                {/* Left: Image Viewer */}
                <div className="flex-1 bg-slate-800 relative overflow-hidden flex flex-col">
                    <div className="absolute top-2 left-2 z-20 flex gap-2 bg-black/50 p-1 rounded">
                        <button onClick={() => setZoom(z => Math.max(0.5, z - 0.25))} className="p-1 text-white hover:bg-white/20 rounded"><ZoomOut size={20} /></button>
                        <span className="text-white text-xs flex items-center">{Math.round(zoom * 100)}%</span>
                        <button onClick={() => setZoom(z => Math.min(3, z + 0.25))} className="p-1 text-white hover:bg-white/20 rounded"><ZoomIn size={20} /></button>
                    </div>

                    <div className="flex-1 overflow-auto flex items-center justify-center p-8 cursor-grab active:cursor-grabbing">
                        {/* Placeholder image if not providing actual uploads in this demo */}
                        <img
                            src={task.image_url || "https://dummyimage.com/600x800/fff/000.png&text=Sample+Text+Document"}
                            alt="Task"
                            style={{ transform: `scale(${zoom})`, transition: 'transform 0.1s' }}
                            className="max-w-none shadow-2xl origin-center"
                        />
                    </div>
                </div>

                {/* Right: Editor */}
                <div className="w-1/2 flex flex-col border-l border-slate-300 bg-white">
                    <textarea
                        className="flex-1 p-6 text-lg font-mono focus:outline-none resize-none"
                        placeholder="Start transcribing here..."
                        value={content}
                        onChange={e => setContent(e.target.value)}
                    />
                    <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end">
                        <button
                            onClick={handleSubmit}
                            disabled={submitting}
                            className="flex items-center gap-2 bg-teal-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-teal-700 disabled:opacity-50 shadow-sm"
                        >
                            <Save size={18} />
                            {submitting ? 'Submitting...' : 'Submit & Finish'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Workspace;
