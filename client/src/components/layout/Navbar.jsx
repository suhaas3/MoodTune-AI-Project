import React from 'react';
import { Search, Sparkles, X, SlidersHorizontal, Sun, Flame, Wind, CloudRain, Bell } from 'lucide-react';
import { useMood } from '../../context/MoodContext';
import { useAuth } from '../../context/AuthContext';

const Navbar = ({ searchQuery, setSearchQuery, activeTab, setActiveTab, onOpenMobileMenu }) => {
  const { currentMood, selectMood, moodConfig } = useMood();
  const { user, isAuthenticated } = useAuth();

  const moodButtons = [
    { mood: 'Happy', icon: Sun, color: 'hover:text-amber-300' },
    { mood: 'Energetic', icon: Flame, color: 'hover:text-rose-300' },
    { mood: 'Relaxed', icon: Wind, color: 'hover:text-emerald-300' },
    { mood: 'Sad', icon: CloudRain, color: 'hover:text-blue-300' },
  ];

  return (
    <header className="h-18 px-6 py-3.5 bg-[#0e111a]/80 backdrop-blur-xl border-b border-white/5 flex items-center justify-between gap-4 sticky top-0 z-10 select-none">
      {/* Left: Mobile hamburger + Search bar */}
      <div className="flex items-center gap-3 flex-1 max-w-md">
        <button
          onClick={onOpenMobileMenu}
          className="md:hidden p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/5"
        >
          <SlidersHorizontal className="w-5 h-5" />
        </button>

        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              if (activeTab !== 'explore' && e.target.value.trim().length > 0) {
                setActiveTab('explore');
              }
            }}
            placeholder="Search songs, artists, genres or moods..."
            className="w-full bg-[#161a26] text-sm text-slate-200 placeholder-slate-500 rounded-full pl-9 pr-9 py-2 border border-white/10 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/50 transition-all shadow-inner"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Center: Mood Filter Chips */}
      <div className="hidden lg:flex items-center gap-1.5 bg-[#141824] p-1 rounded-full border border-white/5">
        <button
          onClick={() => selectMood(null)}
          className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
            currentMood === null
              ? 'bg-brand-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          All Moods
        </button>

        {moodButtons.map(({ mood, icon: Icon, color }) => {
          const isActive = currentMood === mood;
          return (
            <button
              key={mood}
              onClick={() => selectMood(mood)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all ${
                isActive
                  ? 'bg-white/15 text-white ring-1 ring-white/20 font-semibold'
                  : `text-slate-400 ${color}`
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{mood}</span>
            </button>
          );
        })}
      </div>

      {/* Right: Active Mood indicator + User Profile avatar */}
      <div className="flex items-center gap-3">
        {currentMood && (
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span>Mood Active:</span>
            <span className="font-bold text-white">{currentMood}</span>
          </div>
        )}

        <button 
          onClick={() => setActiveTab('moods')}
          title="Mood Station"
          className="p-2 text-slate-300 hover:text-brand-400 rounded-full hover:bg-white/5 transition relative"
        >
          <Sparkles className="w-5 h-5" />
          <span className="w-2 h-2 rounded-full bg-brand-500 absolute top-1.5 right-1.5 ring-2 ring-[#0e111a]"></span>
        </button>

        <div 
          onClick={() => setActiveTab(isAuthenticated ? 'profile' : 'login')}
          className="flex items-center gap-2 cursor-pointer p-1 rounded-full hover:bg-white/5 transition"
        >
          <img
            src={user.avatar}
            alt={user.name}
            className="w-8 h-8 rounded-full object-cover ring-2 ring-brand-500/40"
          />
        </div>
      </div>
    </header>
  );
};

export default Navbar;
