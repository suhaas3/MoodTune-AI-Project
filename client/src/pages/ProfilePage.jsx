import React, { useState } from 'react';
import { 
  User, 
  Clock, 
  Disc, 
  Flame, 
  Sparkles, 
  Edit3, 
  Save, 
  X, 
  Award, 
  Heart,
  TrendingUp,
  Activity
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { usePlayer } from '../context/PlayerContext';
import { MoodBadge } from '../components/common/Badge';

const ProfilePage = () => {
  const { user, updateProfile } = useAuth();
  const { favorites, history } = usePlayer();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user.name,
    bio: user.bio,
    major: user.major
  });

  const handleSave = (e) => {
    e.preventDefault();
    updateProfile(formData);
    setIsEditing(false);
  };

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Profile Card Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-brand-950/80 via-[#161a29] to-[#121622] rounded-3xl p-6 md:p-8 border border-white/10 shadow-2xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
            <div className="relative group">
              <img
                src={user.avatar}
                alt={user.name}
                className="w-24 h-24 md:w-28 md:h-28 rounded-3xl object-cover ring-4 ring-brand-500/40 shadow-xl"
              />
              <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-emerald-500 ring-2 ring-[#121622] flex items-center justify-center">
                <span className="w-2.5 h-2.5 rounded-full bg-white animate-pulse"></span>
              </div>
            </div>

            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/30 text-xs font-semibold mb-1.5">
                <Award className="w-3.5 h-3.5" />
                <span>{user.major}</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
                {user.name}
              </h1>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                @{user.username} • {user.email}
              </p>
              <p className="text-xs md:text-sm text-slate-300 mt-2 max-w-xl leading-relaxed">
                {user.bio}
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 text-xs font-semibold transition"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit Profile</span>
          </button>
        </div>
      </div>

      {/* 4 Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#121622] p-5 rounded-2xl border border-white/5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-brand-500/10 text-brand-400 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400">Total Minutes</p>
            <p className="text-xl font-black text-white mt-0.5">
              {user.stats?.minutesListened?.toLocaleString() || '2,480'}
            </p>
          </div>
        </div>

        <div className="bg-[#121622] p-5 rounded-2xl border border-white/5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center">
            <Disc className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400">Tracks Streamed</p>
            <p className="text-xl font-black text-white mt-0.5">
              {user.stats?.songsPlayed || '94'}
            </p>
          </div>
        </div>

        <div className="bg-[#121622] p-5 rounded-2xl border border-white/5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
            <Flame className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400">Dominant Mood</p>
            <p className="text-xl font-black text-white mt-0.5">
              {user.stats?.topMood || 'Energetic'}
            </p>
          </div>
        </div>

        <div className="bg-[#121622] p-5 rounded-2xl border border-white/5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
            <Heart className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400">Favorite Genre</p>
            <p className="text-xl font-black text-white mt-0.5">
              {user.stats?.favoriteGenre || 'Synthwave'}
            </p>
          </div>
        </div>
      </div>

      {/* Mood Distribution Breakdown & Top Artists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Mood Distribution Card */}
        <div className="bg-[#121622] p-6 rounded-3xl border border-white/5 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                <Activity className="w-5 h-5 text-brand-400" />
                <span>Emotion Affinity Distribution</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Calculated based on duration listened per mood quadrant.
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-brand-400 bg-brand-500/10 px-2 py-1 rounded-md">
              AI Telemetry
            </span>
          </div>

          {/* Progress Bars */}
          <div className="space-y-4 pt-2">
            {user.moodDistribution?.map(item => (
              <div key={item.mood} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-medium">
                  <div className="flex items-center gap-2">
                    <span 
                      className="w-2.5 h-2.5 rounded-full" 
                      style={{ backgroundColor: item.color }} 
                    />
                    <span className="text-slate-200">{item.mood}</span>
                  </div>
                  <span className="font-mono text-slate-400">
                    {item.percentage}% ({item.count} tracks)
                  </span>
                </div>
                <div className="w-full h-2.5 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-1000"
                    style={{ 
                      width: `${item.percentage}%`, 
                      backgroundColor: item.color 
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="p-3.5 bg-white/[0.02] rounded-xl border border-white/5 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Adaptive model learning rate:</span>
            <span className="font-mono text-emerald-400 font-bold">α = 0.85 (Optimal)</span>
          </div>
        </div>

        {/* Top Artists Card */}
        <div className="bg-[#121622] p-6 rounded-3xl border border-white/5 space-y-4">
          <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-brand-400" />
            <span>Top Artists Listened</span>
          </h3>
          <p className="text-xs text-slate-400">
            Artists whose tracks generated the lowest skip rates.
          </p>

          <div className="space-y-3 pt-2">
            {user.topArtists?.map((artist, idx) => (
              <div
                key={artist.name}
                className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 transition"
              >
                <div className="flex items-center gap-3">
                  <span className="w-5 text-center font-mono text-xs text-slate-500">
                    {idx + 1}
                  </span>
                  <img
                    src={artist.image}
                    alt={artist.name}
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-white/10"
                  />
                  <div>
                    <p className="text-sm font-semibold text-white">
                      {artist.name}
                    </p>
                    <p className="text-xs text-slate-400">
                      {artist.plays} session plays
                    </p>
                  </div>
                </div>

                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-brand-500/10 text-brand-300">
                  Top Tier
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditing && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#151926] border border-white/10 rounded-3xl p-6 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">Edit Profile</h3>
              <button
                onClick={() => setIsEditing(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/5"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full bg-[#1c2233] text-sm text-white rounded-xl px-3.5 py-2.5 border border-white/10 focus:outline-none focus:border-brand-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Program / Degree
                </label>
                <input
                  type="text"
                  value={formData.major}
                  onChange={(e) => setFormData(prev => ({ ...prev, major: e.target.value }))}
                  className="w-full bg-[#1c2233] text-sm text-white rounded-xl px-3.5 py-2.5 border border-white/10 focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Bio
                </label>
                <textarea
                  rows={3}
                  value={formData.bio}
                  onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                  className="w-full bg-[#1c2233] text-sm text-white rounded-xl px-3.5 py-2.5 border border-white/10 focus:outline-none focus:border-brand-500 resize-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold transition shadow-lg shadow-brand-600/30"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
