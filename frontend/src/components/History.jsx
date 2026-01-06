import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { CheckCircle, XCircle, Clock } from 'lucide-react';

const History = () => {
    const { token } = useSelector((state) => state.auth);
    const [submissions, setSubmissions] = useState([]);

    useEffect(() => {
        axios.get('http://localhost:8000/api/submissions/', {
            headers: { Authorization: `Bearer ${token}` }
        }).then(res => setSubmissions(res.data)).catch(console.error);
    }, [token]);

    const getStatusIcon = (status) => {
        switch (status) {
            case 'APPROVED': return <CheckCircle className="text-green-500" size={20} />;
            case 'REJECTED': return <XCircle className="text-red-500" size={20} />;
            default: return <Clock className="text-amber-500" size={20} />;
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-slate-800">Task History</h1>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <table className="w-full text-left text-sm text-slate-600">
                    <thead className="bg-slate-50 text-xs uppercase font-medium text-slate-500 border-b border-slate-200">
                        <tr>
                            <th className="px-6 py-3">Task ID</th>
                            <th className="px-6 py-3">Date</th>
                            <th className="px-6 py-3">Score</th>
                            <th className="px-6 py-3">Google Doc</th>
                            <th className="px-6 py-3">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {submissions.length === 0 ? (
                            <tr><td colSpan="5" className="px-6 py-8 text-center">No history yet.</td></tr>
                        ) : (
                            submissions.map(sub => (
                                <tr key={sub.id} className="hover:bg-slate-50">
                                    <td className="px-6 py-4 font-medium">#{sub.task}</td>
                                    <td className="px-6 py-4">{new Date(sub.created_at).toLocaleDateString()}</td>
                                    <td className="px-6 py-4">{Math.round(sub.ocr_match_score * 100)}%</td>
                                    <td className="px-6 py-4">
                                        {sub.google_doc_link ? (
                                            <a href={sub.google_doc_link} target="_blank" rel="noreferrer" className="text-teal-600 hover:underline">
                                                Open Doc
                                            </a>
                                        ) : '-'}
                                    </td>
                                    <td className="px-6 py-4 flex items-center gap-2">
                                        {getStatusIcon(sub.status)}
                                        <span className={`font-medium ${sub.status === 'APPROVED' ? 'text-green-700' :
                                                sub.status === 'REJECTED' ? 'text-red-700' : 'text-amber-700'
                                            }`}>{sub.status}</span>
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

export default History;
