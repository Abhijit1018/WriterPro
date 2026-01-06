import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../slices/authSlice';
import {
  CheckCircle,
  Shield,
  Phone,
  Mail,
  MapPin,
  ArrowRight,
  Award,
  PenTool,
  Clock,
  Sparkles,
  Zap,
  Star,
  LineChart,
} from 'lucide-react';

const LandingPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, user, loading, error } = useSelector((state) => state.auth);

  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('1234');
  const [submitted, setSubmitted] = useState(false);

  const services = useMemo(() => ([
    {
      title: 'Accurate transcription',
      desc: 'Human-quality transcription for handwritten and scanned documents.',
      icon: PenTool,
    },
    {
      title: 'Layered QA',
      desc: 'Multi-step QA with human review and AI-assisted checks.',
      icon: Shield,
    },
    {
      title: 'Fast turnaround',
      desc: 'Predictable SLAs for assessments and paid work queues.',
      icon: Clock,
    },
    {
      title: 'Scaled workforce',
      desc: 'Trainees graduate to writers; admins manage payout-ready tasks.',
      icon: Sparkles,
    },
  ]), []);

  const licenses = useMemo(() => ([
    { name: 'Data Handling & Privacy', issuer: 'ISO 27001 aligned controls', note: 'Annual security reviews and access audits.' },
    { name: 'Content Authenticity', issuer: 'Internal QA Certification', note: 'Human + AI scoring on every delivery.' },
    { name: 'Fair Work Charter', issuer: 'WriteEarn Compliance', note: 'Transparent payouts and dispute resolution.' },
  ]), []);

  useEffect(() => {
    if (isAuthenticated && user) {
      navigate(user.role === 'ADMIN' ? '/admin' : '/dashboard', { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitted(true);
    const result = await dispatch(loginUser({ phone_number: phone, otp }));
    if (loginUser.fulfilled.match(result)) {
      const nextRole = result.payload.user.role;
      navigate(nextRole === 'ADMIN' ? '/admin' : '/dashboard');
    } else {
      setSubmitted(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-50">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -left-32 -top-32 h-96 w-96 bg-emerald-500/20 blur-[90px]" />
        <div className="absolute right-0 top-10 h-80 w-80 bg-cyan-500/10 blur-[90px]" />
      </div>

      <header className="sticky top-0 z-30 backdrop-blur bg-slate-950/70 border-b border-white/5">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="h-11 w-11 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white font-black text-lg shadow-lg shadow-emerald-500/30">WE</span>
            <div>
              <p className="text-lg font-bold text-white">WriteEarn</p>
              <p className="text-xs text-slate-300">Transcription · QA · Delivery</p>
            </div>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-slate-200">
            <a href="#services" className="hover:text-emerald-200 transition">Services</a>
            <a href="#licenses" className="hover:text-emerald-200 transition">Licenses</a>
            <a href="#contact" className="hover:text-emerald-200 transition">Contact</a>
          </nav>
          <div className="flex items-center gap-3">
            <button
              onClick={() => document.getElementById('register')?.scrollIntoView({ behavior: 'smooth' })}
              className="hidden md:inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-white text-sm font-semibold hover:bg-white/20 transition border border-white/10"
            >
              Start free
              <ArrowRight size={16} />
            </button>
            <button
              onClick={() => navigate('/admin')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/20 text-sm font-semibold text-white hover:border-emerald-400 hover:text-emerald-200 transition"
            >
              Admin Portal
            </button>
          </div>
        </div>
      </header>

      <main className="relative mx-auto max-w-6xl px-4 sm:px-6 pb-16">
        <section className="grid lg:grid-cols-2 gap-10 py-12 lg:py-16 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-emerald-200 text-xs font-semibold border border-white/10">
              <Zap size={14} /> Trusted transcription workspace
            </div>
            <h1 className="text-4xl sm:text-5xl font-black leading-tight text-white drop-shadow">
              Onboard, assign, and pay writers from one dashboard.
            </h1>
            <p className="text-lg text-slate-200 max-w-2xl">
              Move from trainee to paid work seamlessly. Admins publish tasks, reviewers approve submissions, and payouts land instantly.
            </p>
            <div className="flex flex-wrap gap-4 text-sm text-slate-100">
              <Badge icon={<CheckCircle size={16} />} label="OTP onboarding" />
              <Badge icon={<CheckCircle size={16} />} label="Role-based queues" />
              <Badge icon={<CheckCircle size={16} />} label="Wallet payouts" />
            </div>

            <div className="grid grid-cols-2 gap-3 max-w-md">
              <Metric title="Writers ready" value="128" trend="+12 this week" />
              <Metric title="Avg. accuracy" value="94%" trend="QA verified" />
            </div>
          </div>

          <div id="register" className="relative bg-white/5 border border-white/10 rounded-3xl shadow-2xl p-6 sm:p-8 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-emerald-500/10" />
            <div className="relative flex items-center justify-between mb-4">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-emerald-200 font-bold">Join WriteEarn</p>
                <h3 className="text-xl font-bold text-white">Register or sign in</h3>
              </div>
              <Award className="text-amber-300" />
            </div>
            {error && submitted && (
              <div className="relative mb-3 text-sm text-red-200 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">{error}</div>
            )}
            <form onSubmit={handleSubmit} className="relative space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-100">Phone number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  placeholder="e.g. +1 555 0123"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-100">OTP</label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  placeholder="Use 1234 for demo"
                />
                <p className="text-xs text-slate-300 mt-1">New users are created instantly; trainees complete assessments before paid work.</p>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold py-3 shadow-lg shadow-emerald-500/30 hover:from-emerald-600 hover:to-teal-600 disabled:opacity-60"
              >
                {loading ? 'Verifying...' : 'Continue to workspace'}
                <ArrowRight size={18} />
              </button>
              <p className="text-xs text-slate-300 text-center">Admins sign in with the same flow and are routed to the admin console automatically.</p>
            </form>
          </div>
        </section>

        <section id="services" className="py-12 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-emerald-200 font-bold">What we deliver</p>
              <h2 className="text-3xl font-bold text-white">Services built for teams</h2>
            </div>
            <div className="hidden sm:flex items-center gap-2 text-sm text-emerald-100">
              <Shield className="text-emerald-300" size={18} />
              <span>Secure uploads · Audit trails · Wallet payouts</span>
            </div>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {services.map(({ title, desc, icon: Icon }) => (
              <div key={title} className="bg-white/5 border border-white/10 rounded-2xl p-5 shadow-lg hover:border-emerald-300/40 transition-all">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 rounded-lg bg-emerald-500/15 text-emerald-200"><Icon size={18} /></div>
                  <ArrowRight size={18} className="text-slate-400" />
                </div>
                <h3 className="font-semibold text-white mb-1">{title}</h3>
                <p className="text-sm text-slate-200">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="py-12 grid lg:grid-cols-3 gap-6 items-start">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-emerald-200 font-bold">Workflow</p>
                  <h2 className="text-2xl font-bold text-white">From landing to paid dashboard</h2>
                </div>
                <LineChart className="text-emerald-300" />
              </div>
              <ol className="grid sm:grid-cols-3 gap-4 text-sm text-slate-100">
                <Step title="Register" copy="OTP sign-in creates your trainee profile instantly." />
                <Step title="Complete assessments" copy="Finish two tasks to unlock paid work queues." />
                <Step title="Earn & withdraw" copy="Writers take paid tasks; admins track payouts." />
              </ol>
            </div>

            <div id="licenses" className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-emerald-200 font-bold">Licenses & Proof</p>
                  <h2 className="text-2xl font-bold text-white">Compliance you can show clients</h2>
                </div>
                <Shield className="text-emerald-300 hidden sm:block" />
              </div>
              <div className="grid md:grid-cols-3 gap-4">
                {licenses.map((license) => (
                  <div key={license.name} className="bg-white/5 border border-white/10 rounded-2xl p-5 shadow-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Award className="text-amber-300" size={18} />
                      <h3 className="font-semibold text-white">{license.name}</h3>
                    </div>
                    <p className="text-sm font-medium text-emerald-100">Issued by {license.issuer}</p>
                    <p className="text-sm text-slate-200 mt-2">{license.note}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div id="contact" className="bg-white/5 border border-white/10 rounded-2xl p-6 shadow-lg space-y-4">
            <p className="text-xs uppercase tracking-[0.2em] text-emerald-200 font-bold">Contact</p>
            <h2 className="text-2xl font-bold text-white">We answer in one business day</h2>
            <p className="text-slate-200">Share workload, compliance needs, or onboarding questions. A coordinator will set up your workspace and assign the right writers.</p>
            <div className="grid sm:grid-cols-3 gap-4 text-sm text-slate-100">
              <div className="flex items-center gap-2"><Phone className="text-emerald-300" size={18} /> +1 (555) 012-3030</div>
              <div className="flex items-center gap-2"><Mail className="text-emerald-300" size={18} /> hello@writeearn.com</div>
              <div className="flex items-center gap-2"><MapPin className="text-emerald-300" size={18} /> Remote-first · Global</div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              <h3 className="font-semibold text-white mb-2">Why teams pick WriteEarn</h3>
              <ul className="space-y-2 text-sm text-slate-100">
                <li className="flex items-center gap-2"><CheckCircle className="text-emerald-300" size={16} /> SLAs and pricing in 24h</li>
                <li className="flex items-center gap-2"><CheckCircle className="text-emerald-300" size={16} /> Dedicated coordinator for paid work</li>
                <li className="flex items-center gap-2"><CheckCircle className="text-emerald-300" size={16} /> Trainee pipeline to scale</li>
              </ul>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

const Badge = ({ icon, label }) => (
  <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/10 text-xs font-semibold">
    {icon}
    {label}
  </span>
);

const Metric = ({ title, value, trend }) => (
  <div className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-lg">
    <p className="text-xs uppercase tracking-wide text-slate-200">{title}</p>
    <p className="text-2xl font-bold text-white">{value}</p>
    <p className="text-xs text-emerald-100">{trend}</p>
  </div>
);

const Step = ({ title, copy }) => (
  <li className="rounded-xl border border-white/10 bg-white/5 p-4 shadow-sm">
    <p className="text-sm font-semibold text-white mb-1">{title}</p>
    <p className="text-xs text-slate-200 leading-relaxed">{copy}</p>
  </li>
);

export default LandingPage;
