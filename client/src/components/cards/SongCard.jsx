import React from 'react';
import { Play, Pause, Heart, Zap, Activity } from 'lucide-react';
import { usePlayer } from '../../context/PlayerContext';
import { MoodBadge, GenreBadge } from '../common/Badge';

const SongCard = ({ song, playlist = null, size = 'md' }) => {
  const { currentSong, isPlaying, playSong, togglePlay, isFavorite, toggleFavorite } = usePlayer();

  const isCurrent = currentSong?.id === song.id;
  const isCurrentPlaying = isCurrent && isPlaying;
  const liked = isFavorite(song.id);

  const handlePlayClick = (e) => {
    e.stopPropagation();
    if (isCurrent) {
      togglePlay();
    } else {
      playSong(song, playlist);
    }
  };

  const handleLikeClick = (e) => {
    e.stopPropagation();
    toggleFavorite(song.id);
  };

  return (
    <div
      onClick={() => handlePlayClick({ stopPropagation: () => {} })}
      className="group relative bg-[#131722]/80 hover:bg-[#1b2132] p-3.5 rounded-2xl border border-white/5 hover:border-white/15 transition-all duration-300 hover:shadow-xl hover:shadow-black/50 cursor-pointer flex flex-col justify-between"
    >
      {/* Cover Image Container */}
      <div className="relative aspect-square w-full rounded-xl overflow-hidden mb-3.5 bg-slate-900 shadow-md">
        <img
          src={song.coverUrl}
          alt={song.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Gradient dark overlay on hover */}
        <div className={`absolute inset-0 bg-black/40 transition-opacity duration-200 ${
          isCurrentPlaying ? 'opacity-60' : 'opacity-0 group-hover:opacity-100'
        }`} />

        {/* Floating Play Button */}
        <div className={`absolute bottom-3 right-3 transition-all duration-300 transform ${
          isCurrentPlaying 
            ? 'opacity-100 scale-100 translate-y-0' 
            : 'opacity-0 scale-90 translate-y-2 group-hover:opacity-100 group-hover:scale-100 group-hover:translate-y-0'
        }`}>
          <button
            onClick={handlePlayClick}
            className={`w-11 h-11 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-110 active:scale-95 ${
              isCurrentPlaying 
                ? 'bg-brand-500 text-white shadow-brand-500/40' 
                : 'bg-white text-slate-950 shadow-black/60'
            }`}
          >
            {isCurrentPlaying ? (
              <Pause className="w-5 h-5 fill-current" />
            ) : (
              <Play className="w-5 h-5 fill-current ml-0.5" />
            )}
          </button>
        </div>

        {/* Playing Animated Equalizer Bars */}
        {isCurrentPlaying && (
          <div className="absolute top-3 left-3 flex items-end gap-1 h-4 px-2 py-1 rounded bg-black/60 backdrop-blur-sm">
            <span className="w-1 bg-brand-400 rounded-full animate-[equalize_0.8s_ease-in-out_infinite_alternate]" style={{ height: '70%' }}></span>
            <span className="w-1 bg-brand-400 rounded-full animate-[equalize_0.6s_ease-in-out_infinite_alternate_0.2s]" style={{ height: '100%' }}></span>
            <span className="w-1 bg-brand-400 rounded-full animate-[equalize_1.1s_ease-in-out_infinite_alternate_0.4s]" style={{ height: '40%' }}></span>
          </div>
        )}

        {/* Mood Pill on Cover */}
        <div className="absolute top-3 right-3">
          <MoodBadge mood={song.mood} size="xs" />
        </div>
      </div>

      {/* Title & Artist */}
      <div className="flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-2">
            <h4 className={`font-semibold text-sm truncate transition-colors ${
              isCurrent ? 'text-brand-400' : 'text-slate-100 group-hover:text-white'
            }`}>
              {song.title}
            </h4>
            <button
              onClick={handleLikeClick}
              className={`p-1 rounded-full transition-colors flex-shrink-0 ${
                liked 
                  ? 'text-rose-500 hover:text-rose-400' 
                  : 'text-slate-500 hover:text-slate-200 opacity-0 group-hover:opacity-100'
              }`}
            >
              <Heart className={`w-4 h-4 ${liked ? 'fill-current' : ''}`} />
            </button>
          </div>

          <p className="text-xs text-slate-400 truncate mt-0.5">
            {song.artist}
          </p>
        </div>

        {/* Metadata Footer: Genre, Tempo, Duration */}
        <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400">
          <GenreBadge genre={song.genre} />
          
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-0.5 text-slate-400" title={`Tempo: ${song.audioFeatures?.tempo} BPM`}>
              <Activity className="w-3 h-3 text-slate-500" />
              <span>{song.audioFeatures?.tempo} BPM</span>
            </span>
            <span className="text-slate-500">•</span>
            <span>{song.durationFormatted}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SongCard;
