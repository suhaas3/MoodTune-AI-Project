import React from 'react';
import { Sparkles, Play, Flame, Sun, Wind, CloudRain, ArrowRight, Zap, RefreshCw } from 'lucide-react';
import { useMood } from '../context/MoodContext';
import { usePlayer } from '../context/PlayerContext';
import { useAuth } from '../context/AuthContext';
import SongCard from '../components/cards/SongCard';
import { MoodBadge } from '../components/common/Badge';

const HomePage = ({ setActiveTab }) => {
  const { currentMood, selectMood, moodConfig } = useMood();
  const { songsList, playSong } = usePlayer();
  const { user } = useAuth();

  // Greeting by hour
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  // Filter recommendations based on active mood or diverse hybrid mix
  const moodFilteredSongs = currentMood 
    ? songsList.filter(s => s.mood === currentMood) 
    : songsList.slice(0, 6);

  const energeticSongs = songsList.filter(s => s.mood === 'Energetic');
  const relaxedSongs = songsList.filter(s => s.mood === 'Relaxed');
  const happySongs = songsList.filter(s => s.mood === 'Happy');

  const activeConfig = currentMood ? moodConfig[currentMood] : null;

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            {greeting}, <span className="bg-clip-text text-transparent bg-gradient-to-r from-brand-400 to-pink-400">{user.name.split(' ')[0]}</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Adaptive AI calibrated to your current emotion state & listening history.
          </p>
        </div>

        {/* Quick Mood Pill Switcher */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('moods')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-600/15 hover:bg-brand-600/25 border border-brand-500/30 text-brand-300 text-xs font-semibold transition"
          >
            <Sparkles className="w-4 h-4" />
            <span>Customize Mood Model</span>
          </button>
        </div>
      </div>

      {/* Mood Hero Banner */}
      <div className={`relative overflow-hidden rounded-3xl p-6 md:p-8 border transition-all duration-500 ${
        activeConfig 
          ? `bg-gradient-to-r ${activeConfig.gradient} ${activeConfig.borderActive} shadow-2xl` 
          : 'bg-gradient-to-r from-[#171b29] via-[#1f2538] to-[#171b29] border-white/10'
      }`}>
        {/* Subtle decorative circles */}
        <div className="absolute right-0 top-0 -mt-12 -mr-12 w-80 h-80 rounded-full bg-white/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/30 backdrop-blur-md text-white text-xs font-semibold mb-3 border border-white/10">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Emotion-Aware Engine Active</span>
            {currentMood && <span>• {currentMood}</span>}
          </div>

          <h2 className="text-2xl md:text-4xl font-black text-white tracking-tight leading-tight">
            {currentMood 
              ? `${activeConfig.name} Mood Session` 
              : 'Tune into your emotional wavelength'}
          </h2>

          <p className="text-sm md:text-base text-white/80 mt-2 leading-relaxed">
            {currentMood 
              ? activeConfig.description 
              : 'Our PyTorch Deep Learning classifier models valence and arousal to recommend tracks tuned directly to your emotional state.'}
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              onClick={() => {
                if (moodFilteredSongs.length > 0) {
                  playSong(moodFilteredSongs[0], moodFilteredSongs);
                }
              }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white text-slate-950 font-bold text-sm hover:scale-105 active:scale-95 transition shadow-lg shadow-black/30"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Play Emotion Mix ({moodFilteredSongs.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('moods')}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-black/40 hover:bg-black/60 text-white font-medium text-xs backdrop-blur-sm border border-white/15 transition"
            >
              <span>Explore All 4 Mood Quadrants</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Section 1: Emotion-Aware Recommendations */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg md:text-xl font-bold text-white tracking-tight">
                {currentMood ? `Recommended for ${currentMood} Mood` : 'Recommended For You'}
              </h3>
              {currentMood && <MoodBadge mood={currentMood} />}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Ranked with hybrid valence-arousal scoring and audio feature similarity.
            </p>
          </div>

          <button 
            onClick={() => setActiveTab('explore')}
            className="text-xs font-semibold text-brand-400 hover:text-brand-300 flex items-center gap-1"
          >
            <span>See All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {moodFilteredSongs.map(song => (
            <SongCard key={song.id} song={song} playlist={moodFilteredSongs} />
          ))}
        </div>
      </div>

      {/* Section 2: High Energy & Workout Beats */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-rose-500" />
              <h3 className="text-lg md:text-xl font-bold text-white tracking-tight">
                High Energy & Peak Velocity
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              High tempo (130+ BPM) and high arousal for cardio, workouts, and adrenaline.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {energeticSongs.map(song => (
            <SongCard key={song.id} song={song} playlist={energeticSongs} />
          ))}
        </div>
      </div>

      {/* Section 3: Ambient Chillout & Calm */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="flex items-center gap-2">
              <Wind className="w-5 h-5 text-emerald-400" />
              <h3 className="text-lg md:text-xl font-bold text-white tracking-tight">
                Calm & Ambient Horizons
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Gentle acoustic chords and neo-classical melodies for deep study and rest.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {relaxedSongs.map(song => (
            <SongCard key={song.id} song={song} playlist={relaxedSongs} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
