import React, { useState } from 'react';
import { Disc3, UserPlus, Sparkles, ArrowRight, Lock, Mail, User, Sun, Flame, Wind, CloudRain } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useMood } from '../context/MoodContext';

const RegisterPage = ({ setActiveTab }) => {
  const { register } = useAuth();
  const { selectMood } = useMood();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    bio: '',
    preferredMood: 'Energetic'
  });
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password) {
      setError('Please fill in all required fields.');
      return;
    }
    register(formData);
    if (formData.preferredMood) {
      selectMood(formData.preferredMood);
    }
    setActiveTab('home');
  };

  const moods = [
    { name: 'Happy', icon: Sun, color: 'text-amber-400' },
    { name: 'Energetic', icon: Flame, color: 'text-rose-400' },
    { name: 'Relaxed', icon: Wind, color: 'text-emerald-400' },
    { name: 'Sad', icon: CloudRain, color: 'text-blue-400' }
  ];

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#131724] border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
        {/* Decorative glow */}
        <div className="absolute -left-16 -top-16 w-48 h-48 rounded-full bg-pink-600/25 blur-3xl pointer-events-none" />

        <div className="text-center mb-6 relative z-10">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-600 to-pink-500 flex items-center justify-center mx-auto mb-3 shadow-xl shadow-brand-500/30">
            <UserPlus className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">
            Join MoodTune AI
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Personalized music recommendations aligned with your feelings
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5 relative z-10">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">
              Full Name *
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Sai Suresh"
                className="w-full bg-[#1b2132] text-sm text-white placeholder-slate-500 rounded-xl pl-10 pr-4 py-2 border border-white/10 focus:outline-none focus:border-brand-500 transition"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">
              Email Address *
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="sai.suresh@university.edu"
                className="w-full bg-[#1b2132] text-sm text-white placeholder-slate-500 rounded-xl pl-10 pr-4 py-2 border border-white/10 focus:outline-none focus:border-brand-500 transition"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">
              Password *
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                placeholder="••••••••"
                className="w-full bg-[#1b2132] text-sm text-white placeholder-slate-500 rounded-xl pl-10 pr-4 py-2 border border-white/10 focus:outline-none focus:border-brand-500 transition"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">
              Initial Emotion Preference
            </label>
            <div className="grid grid-cols-2 gap-2">
              {moods.map(({ name, icon: Icon, color }) => (
                <button
                  type="button"
                  key={name}
                  onClick={() => setFormData(prev => ({ ...prev, preferredMood: name }))}
                  className={`flex items-center gap-2 p-2 rounded-xl text-xs font-medium border transition ${
                    formData.preferredMood === name
                      ? 'bg-brand-600/20 border-brand-500 text-white font-bold'
                      : 'bg-white/5 border-white/5 text-slate-400 hover:text-white'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${color}`} />
                  <span>{name}</span>
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 mt-2 rounded-xl bg-gradient-to-r from-brand-600 to-pink-600 hover:opacity-90 text-white font-bold text-sm shadow-lg shadow-brand-600/30 transition hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2"
          >
            <UserPlus className="w-4 h-4" />
            <span>Create Account</span>
          </button>
        </form>

        <div className="mt-5 text-center text-xs text-slate-400">
          <span>Already have an account? </span>
          <button
            onClick={() => setActiveTab('login')}
            className="text-brand-400 font-semibold hover:underline"
          >
            Sign In
          </button>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
