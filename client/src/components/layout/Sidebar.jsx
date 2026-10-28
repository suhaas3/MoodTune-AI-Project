import React from 'react';
import { 
  Home, 
  Compass, 
  Sparkles, 
  Heart, 
  History, 
  User, 
  Music, 
  Disc3, 
  SlidersHorizontal,
  LogIn,
  LogOut,
  Flame,
  Sun,
  Wind,
  CloudRain
} from 'lucide-react';
import { useMood } from '../../context/MoodContext';
import { useAuth } from '../../context/AuthContext';
import { usePlayer } from '../../context/PlayerContext';

const Sidebar = ({ activeTab, setActiveTab }) => {
  const { currentMood, selectMood } = useMood();
  const { user, isAuthenticated, logout } = useAuth();
  const { favorites } = usePlayer();

  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'explore', label: 'Explore & Search', icon: Compass },
    { id: 'moods', label: 'Mood Station', icon: Sparkles, badge: 'AI' },
    { id: 'favorites', label: 'Liked Songs', icon: Heart, count: favorites.length },
    { id: 'history', label: 'Listening History', icon: History },
    { id: 'profile', label: 'My Analytics', icon: User },
  ];

  const moodShortcuts = [
    { mood: 'Happy', icon: Sun, color: 'text-amber-400 group-hover:text-amber-300' },
    { mood: 'Energetic', icon: Flame, color: 'text-rose-400 group-hover:text-rose-300' },
    { mood: 'Relaxed', icon: Wind, color: 'text-emerald-400 group-hover:text-emerald-300' },
    { mood: 'Sad', icon: CloudRain, color: 'text-blue-400 group-hover:text-blue-300' },
  ];

  return (
    <aside className="w-64 bg-[#0e111a] border-r border-white/5 flex flex-col h-full select-none flex-shrink-0 z-20">
      {/* Brand Header */}
      <div className="p-6 pb-5 flex items-center justify-between">
        <div 
          onClick={() => setActiveTab('home')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 via-indigo-600 to-pink-500 flex items-center justify-center shadow-lg shadow-brand-500/25 group-hover:scale-105 transition-transform duration-200">
            <Disc3 className="w-6 h-6 text-white animate-spin [animation-duration:8s]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-slate-400">
                MoodTune
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-full bg-brand-500/20 text-brand-400 border border-brand-500/30">
                AI
              </span>
            </div>
            <p className="text-[11px] text-slate-500">Emotion-Aware Audio</p>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="px-3 py-2 flex-1 overflow-y-auto space-y-6">
        <div>
          <p className="px-3 text-[11px] font-semibold tracking-wider text-slate-500 uppercase mb-2">
            Menu
          </p>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                    isActive
                      ? 'bg-gradient-to-r from-brand-600/20 to-brand-600/5 text-white border-l-4 border-brand-500 font-semibold shadow-sm'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 transition-colors ${
                      isActive ? 'text-brand-400' : 'text-slate-400 group-hover:text-slate-200'
                    }`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-gradient-to-r from-brand-600 to-pink-600 text-white font-bold">
                      {item.badge}
                    </span>
                  )}
                  {item.count !== undefined && item.count > 0 && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-slate-400">
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Quick Mood Filter Section */}
        <div>
          <div className="px-3 flex items-center justify-between mb-2">
            <p className="text-[11px] font-semibold tracking-wider text-slate-500 uppercase">
              Quick Mood Vibe
            </p>
            {currentMood && (
              <button 
                onClick={() => selectMood(null)}
                className="text-[10px] text-brand-400 hover:underline"
              >
                Reset
              </button>
            )}
          </div>
          <div className="grid grid-cols-2 gap-1.5 px-1">
            {moodShortcuts.map(({ mood, icon: Icon, color }) => {
              const isSelected = currentMood === mood;
              return (
                <button
                  key={mood}
                  onClick={() => selectMood(mood)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all group ${
                    isSelected
                      ? 'bg-white/10 text-white ring-1 ring-white/20 shadow-md font-semibold'
                      : 'bg-[#141824]/60 text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${color}`} />
                  <span className="truncate">{mood}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* B.Tech DS Project Banner */}
        <div className="px-2">
          <div className="p-3.5 rounded-xl bg-gradient-to-br from-brand-950/60 to-dark-card border border-brand-500/20 text-xs">
            <div className="flex items-center gap-2 text-brand-300 font-semibold mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Hybrid RecEngine</span>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              PyTorch Emotion Network + Librosa feature vectors adapted to your mood.
            </p>
          </div>
        </div>
      </div>

      {/* User Footer Card */}
      <div className="p-4 border-t border-white/5 bg-[#0a0c12]">
        {isAuthenticated ? (
          <div className="flex items-center justify-between">
            <div 
              onClick={() => setActiveTab('profile')}
              className="flex items-center gap-3 cursor-pointer group flex-1 min-w-0 mr-2"
            >
              <img
                src={user.avatar}
                alt={user.name}
                className="w-9 h-9 rounded-full object-cover ring-2 ring-brand-500/40 group-hover:ring-brand-400 transition"
              />
              <div className="truncate">
                <p className="text-xs font-semibold text-slate-200 group-hover:text-white truncate">
                  {user.name}
                </p>
                <p className="text-[11px] text-slate-500 truncate">
                  {user.stats?.topMood} Lover
                </p>
              </div>
            </div>
            <button
              onClick={logout}
              title="Logout"
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setActiveTab('login')}
            className="w-full py-2 px-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold flex items-center justify-center gap-2 transition"
          >
            <LogIn className="w-4 h-4" />
            Sign In / Demo
          </button>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
