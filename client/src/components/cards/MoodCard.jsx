import React from 'react';
import { Sun, Flame, Wind, CloudRain, Play, Check } from 'lucide-react';
import { useMood } from '../../context/MoodContext';
import { usePlayer } from '../../context/PlayerContext';

const MoodCard = ({ moodKey, config, songCount = 0 }) => {
  const { currentMood, selectMood } = useMood();
  const { songsList, playSong } = usePlayer();

  const isSelected = currentMood === moodKey;

  const iconMap = {
    Sun: Sun,
    Flame: Flame,
    Wind: Wind,
    CloudRain: CloudRain
  };

  const Icon = iconMap[config.icon] || Sun;

  const handlePlayMoodSession = (e) => {
    e.stopPropagation();
    selectMood(moodKey);
    const matchingSongs = songsList.filter(s => s.mood === moodKey);
    if (matchingSongs.length > 0) {
      playSong(matchingSongs[0], matchingSongs);
    }
  };

  return (
    <div
      onClick={() => selectMood(moodKey)}
      className={`relative group rounded-3xl p-6 cursor-pointer overflow-hidden transition-all duration-300 border ${
        isSelected
          ? `${config.borderActive} bg-gradient-to-br ${config.gradient} shadow-2xl scale-[1.02]`
          : 'border-white/10 bg-[#141824] hover:border-white/20 hover:scale-[1.01]'
      }`}
    >
      {/* Background Decorative Blur Orb */}
      <div 
        className={`absolute -right-8 -top-8 w-40 h-40 rounded-full blur-3xl opacity-30 transition-opacity group-hover:opacity-50 pointer-events-none`}
        style={{ backgroundColor: config.accentColor }}
      />

      <div className="relative z-10 flex flex-col justify-between h-full min-h-[220px]">
        {/* Header: Icon + Badge + Check */}
        <div className="flex items-start justify-between">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-110 ${
            isSelected ? 'bg-black/30 text-white' : 'bg-white/5 text-white border border-white/10'
          }`}>
            <Icon className="w-6 h-6" />
          </div>

          <div className="flex items-center gap-2">
            <span className={`text-[11px] font-semibold uppercase px-2.5 py-1 rounded-full ${
              isSelected ? 'bg-black/20 text-white' : 'bg-white/5 text-slate-300 border border-white/10'
            }`}>
              {songCount} Tracks
            </span>

            {isSelected && (
              <span className="w-6 h-6 rounded-full bg-white text-slate-950 flex items-center justify-center shadow">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </span>
            )}
          </div>
        </div>

        {/* Content: Title, Tagline, Valence & Arousal */}
        <div className="my-4">
          <h3 className={`text-2xl font-extrabold tracking-tight ${
            isSelected ? 'text-white' : 'text-slate-100 group-hover:text-white'
          }`}>
            {config.name}
          </h3>
          <p className={`text-xs mt-1 leading-relaxed ${
            isSelected ? 'text-white/90' : 'text-slate-400'
          }`}>
            {config.tagline}
          </p>

          <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between text-[11px]">
            <span className={isSelected ? 'text-white/80' : 'text-slate-400'}>
              Acoustic Profile:
            </span>
            <span className={`font-mono font-semibold ${isSelected ? 'text-white' : 'text-slate-200'}`}>
              {config.quadrant}
            </span>
          </div>
        </div>

        {/* Action Button: Play Session */}
        <div className="pt-2 flex items-center justify-between">
          <button
            onClick={handlePlayMoodSession}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md ${
              isSelected
                ? 'bg-black text-white hover:bg-black/80'
                : 'bg-white text-slate-950 hover:bg-slate-200'
            }`}
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Play Session</span>
          </button>

          <span className={`text-[11px] ${isSelected ? 'text-white/80' : 'text-slate-400'}`}>
            Valence: {config.valenceRange[0] * 100} - {config.valenceRange[1] * 100}%
          </span>
        </div>
      </div>
    </div>
  );
};

export default MoodCard;
