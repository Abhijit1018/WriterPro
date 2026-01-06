import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser } from '../slices/authSlice';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('1234'); // Hardcoded default
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { loading, error, isAuthenticated, user } = useSelector((state) => state.auth);

    useEffect(() => {
        if (isAuthenticated && user) {
            navigate(user.role === 'ADMIN' ? '/admin' : '/dashboard');
        }
    }, [isAuthenticated, user, navigate]);

    const handleLogin = async (e) => {
        e.preventDefault();
        const result = await dispatch(loginUser({ phone_number: phone, otp }));
        if (loginUser.fulfilled.match(result)) {
            const nextRole = result.payload.user.role;
            navigate(nextRole === 'ADMIN' ? '/admin' : '/dashboard');
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-slate-100">
            <div className="bg-white p-8 rounded-lg shadow-lg w-96 border border-slate-200">
                <h2 className="text-2xl font-bold mb-6 text-teal-800 text-center">WriteEarn Login</h2>
                {error && <p className="text-red-500 mb-4 text-center text-sm">{error}</p>}
                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Phone Number</label>
                        <input
                            type="text"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                            placeholder="Enter mobile number"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700">OTP (Use 1234)</label>
                        <input
                            type="text"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-700 hover:bg-teal-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50"
                    >
                        {loading ? 'Verifying...' : 'Login'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;
