import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { ArrowLeft, ArrowRight } from 'lucide-react';

const Wallet = () => {
    const { user, token } = useSelector((state) => state.auth);
    const [transactions, setTransactions] = useState([]);

    // We don't have a transaction API yet, let's create a quick one in views or just mock data
    // Actually Transaction model exists. Let's assume we can fetch it.
    // I need to add TransactionViewSet to backend or filter.
    // For now I'll Mock IT in frontend to save backend restart time, 
    // BUT the prompt said "do all the remaining task". 
    // Ideally I should expose standard ViewSet.

    useEffect(() => {
        // Fetch real if possible, else mock
        // Let's assume endpoint /api/transactions/ exists for now, 
        // I will add it to backend shortly.
        axios.get('http://localhost:8000/api/transactions/', {
            headers: { Authorization: `Bearer ${token}` }
        }).then(res => setTransactions(res.data)).catch(err => {
            console.log("Failed to fetch transactions", err);
        });
    }, [token]);

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-slate-800">My Wallet</h1>

            {/* Balance Card */}
            <div className="bg-gradient-to-r from-teal-700 to-teal-500 rounded-2xl p-6 text-white shadow-lg max-w-md">
                <p className="text-teal-100 font-medium mb-1">Total Balance</p>
                <h2 className="text-4xl font-bold">${user.wallet_balance}</h2>
                <div className="mt-6 flex gap-3">
                    <button className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg text-sm font-semibold backdrop-blur-sm transition">
                        Withdraw Funds
                    </button>
                    <button className="bg-amber-500 hover:bg-amber-600 text-black px-4 py-2 rounded-lg text-sm font-semibold transition">
                        Add Funds
                    </button>
                </div>
            </div>

            {/* Transactions */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 font-semibold text-slate-700">
                    Recent Transactions
                </div>
                <div className="divide-y divide-slate-100">
                    {transactions.length === 0 ? (
                        <div className="p-8 text-center text-slate-500">No transactions found.</div>
                    ) : (
                        transactions.map(tx => (
                            <div key={tx.id} className="flex items-center justify-between p-4 hover:bg-slate-50">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-full ${tx.type === 'DEPOSIT' || tx.type === 'PAYOUT' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                        {tx.type === 'REFUND' || tx.type === 'PAYOUT' ? <ArrowLeft size={18} /> : <ArrowRight size={18} />}
                                    </div>
                                    <div>
                                        <p className="font-medium text-slate-800 capitalize">{tx.type.toLowerCase()}</p>
                                        <p className="text-xs text-slate-400">{new Date(tx.timestamp).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <span className={`font-bold ${tx.type === 'DEPOSIT' || tx.type === 'PAYOUT' ? 'text-green-600' : 'text-slate-900'}`}>
                                    {tx.type === 'DEPOSIT' || tx.type === 'PAYOUT' ? '+' : '-'}${tx.amount}
                                </span>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default Wallet;
