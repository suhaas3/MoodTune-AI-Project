import React, { useState } from 'react';
import { Disc3, LogIn, Sparkles, ArrowRight, Lock, Mail, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const LoginPage = ({ setActiveTab }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in both email and password.');
      return;
    }
    login(email, password);
    setActiveTab('home');
  };

  const handleDemoLogin = () => {
    login('sai.suresh@moodtune.ai', 'demopass123');
    setActiveTab('home');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#131724] border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
        {/* Glow orb */}
        <div className="absolute -right-16 -top-16 w-48 h-48 rounded-full bg-brand-600/30 blur-3xl pointer-events-none" />

        {/* Brand Header */}
        <div className="text-center mb-8 relative z-10">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-600 via-indigo-600 to-pink-500 flex items-center justify-center mx-auto mb-3 shadow-xl shadow-brand-500/30">
            <Disc3 className="w-8 h-8 text-white animate-spin [animation-duration:10s]" />
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">
            Welcome to MoodTune AI
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Emotion-aware music recommendation engine
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@university.edu"
                className="w-full bg-[#1b2132] text-sm text-white placeholder-slate-500 rounded-xl pl-10 pr-4 py-2.5 border border-white/10 focus:outline-none focus:border-brand-500 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#1b2132] text-sm text-white placeholder-slate-500 rounded-xl pl-10 pr-4 py-2.5 border border-white/10 focus:outline-none focus:border-brand-500 transition"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-sm shadow-lg shadow-brand-600/30 transition hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2"
          >
            <LogIn className="w-4 h-4" />
            <span>Sign In</span>
          </button>
        </form>

        {/* 1-Click Demo Login button */}
        <div className="mt-4 pt-4 border-t border-white/5 relative z-10">
          <button
            type="button"
            onClick={handleDemoLogin}
            className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-brand-300 border border-brand-500/30 font-semibold text-xs transition flex items-center justify-center gap-2"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Quick 1-Click Demo Sign In</span>
          </button>
        </div>

        <div className="mt-6 text-center text-xs text-slate-400">
          <span>Don't have an account yet? </span>
          <button
            onClick={() => setActiveTab('register')}
            className="text-brand-400 font-semibold hover:underline"
          >
            Create an Account
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
