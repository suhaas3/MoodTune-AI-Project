import React, { useState } from 'react';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Shuffle, 
  Repeat, 
  Heart, 
  Volume2, 
  VolumeX, 
  ListMusic, 
  Maximize2,
  Sparkles
} from 'lucide-react';
import { usePlayer } from '../../context/PlayerContext';
import { MoodBadge } from '../common/Badge';

const formatTime = (seconds) => {
  if (isNaN(seconds) || seconds < 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
};

const BottomPlayer = () => {
  const {
    currentSong,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    isShuffle,
    isLoop,
    isQueueOpen,
    setIsQueueOpen,
    queue,
    togglePlay,
    nextSong,
    prevSong,
    seekTo,
    setVolumeLevel,
    toggleMute,
    toggleShuffle,
    toggleLoop,
    isFavorite,
    toggleFavorite
  } = usePlayer();

  const [isHoveringSeek, setIsHoveringSeek] = useState(false);

  if (!currentSong) return null;

  const liked = isFavorite(currentSong.id);
  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <footer className="fixed bottom-0 left-0 right-0 h-22 bg-[#0c0e14]/95 backdrop-blur-2xl border-t border-white/10 px-4 md:px-6 flex items-center justify-between z-30 select-none shadow-2xl">
      {/* Top subtle progress bar across entire screen */}
      <div 
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const clickX = e.clientX - rect.left;
          const ratio = clickX / rect.width;
          seekTo(ratio * duration);
        }}
        className="absolute top-0 left-0 right-0 h-[2px] bg-white/5 cursor-pointer group"
      >
        <div 
          className="h-full bg-gradient-to-r from-brand-500 to-pink-500 relative transition-[width] duration-150"
          style={{ width: `${progressPercent}%` }}
        >
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-white opacity-0 group-hover:opacity-100 shadow-md"></div>
        </div>
      </div>

      {/* 1. Left Section: Track Info & Favorite */}
      <div className="flex items-center gap-3.5 w-1/4 min-w-[200px]">
        <div className="relative group w-13 h-13 rounded-xl overflow-hidden bg-slate-900 flex-shrink-0 shadow-md">
          <img
            src={currentSong.coverUrl}
            alt={currentSong.title}
            className={`w-full h-full object-cover ${isPlaying ? 'scale-105' : ''} transition-transform duration-500`}
          />
          {isPlaying && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <div className="flex items-end gap-0.5 h-3">
                <span className="w-0.5 bg-brand-400 rounded-full animate-[equalize_0.7s_infinite_alternate]" style={{ height: '50%' }}></span>
                <span className="w-0.5 bg-brand-400 rounded-full animate-[equalize_0.5s_infinite_alternate_0.1s]" style={{ height: '90%' }}></span>
                <span className="w-0.5 bg-brand-400 rounded-full animate-[equalize_0.9s_infinite_alternate_0.3s]" style={{ height: '60%' }}></span>
              </div>
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h4 className="font-semibold text-sm text-slate-100 truncate hover:text-white cursor-pointer">
              {currentSong.title}
            </h4>
            <MoodBadge mood={currentSong.mood} size="xs" />
          </div>
          <p className="text-xs text-slate-400 truncate mt-0.5">
            {currentSong.artist} • <span className="text-slate-500">{currentSong.genre}</span>
          </p>
        </div>

        <button
          onClick={() => toggleFavorite(currentSong.id)}
          className={`p-2 rounded-full hover:bg-white/5 transition-colors ${
            liked ? 'text-rose-500' : 'text-slate-400 hover:text-white'
          }`}
          title={liked ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Heart className={`w-4 h-4 ${liked ? 'fill-current' : ''}`} />
        </button>
      </div>

      {/* 2. Center Section: Playback Controls & Seekbar */}
      <div className="flex flex-col items-center justify-center flex-1 max-w-2xl px-4">
        {/* Buttons */}
        <div className="flex items-center gap-4 sm:gap-6 mb-1.5">
          <button
            onClick={toggleShuffle}
            className={`p-1.5 rounded-full transition-colors ${
              isShuffle ? 'text-brand-400' : 'text-slate-400 hover:text-white'
            }`}
            title={isShuffle ? 'Shuffle enabled' : 'Shuffle disabled'}
          >
            <Shuffle className="w-4 h-4" />
          </button>

          <button
            onClick={prevSong}
            className="p-1.5 text-slate-300 hover:text-white hover:scale-105 active:scale-95 transition"
            title="Previous track"
          >
            <SkipBack className="w-5 h-5 fill-current" />
          </button>

          <button
            onClick={togglePlay}
            className="w-10 h-10 rounded-full bg-white text-slate-950 hover:scale-105 active:scale-95 transition shadow-lg shadow-white/10 flex items-center justify-center"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 fill-current" />
            ) : (
              <Play className="w-5 h-5 fill-current ml-0.5" />
            )}
          </button>

          <button
            onClick={nextSong}
            className="p-1.5 text-slate-300 hover:text-white hover:scale-105 active:scale-95 transition"
            title="Next track"
          >
            <SkipForward className="w-5 h-5 fill-current" />
          </button>

          <button
            onClick={toggleLoop}
            className={`p-1.5 rounded-full transition-colors ${
              isLoop ? 'text-brand-400' : 'text-slate-400 hover:text-white'
            }`}
            title={isLoop ? 'Repeat enabled' : 'Repeat disabled'}
          >
            <Repeat className="w-4 h-4" />
          </button>
        </div>

        {/* Seekbar Slider */}
        <div className="w-full flex items-center gap-3">
          <span className="text-[11px] font-mono text-slate-400 w-10 text-right">
            {formatTime(currentTime)}
          </span>

          <div 
            className="relative flex-1 flex items-center group py-1"
            onMouseEnter={() => setIsHoveringSeek(true)}
            onMouseLeave={() => setIsHoveringSeek(false)}
          >
            <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-slate-200 group-hover:bg-brand-500 rounded-full transition-colors"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <input
              type="range"
              min={0}
              max={duration || 100}
              value={currentTime}
              onChange={(e) => seekTo(Number(e.target.value))}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </div>

          <span className="text-[11px] font-mono text-slate-500 w-10">
            {formatTime(duration)}
          </span>
        </div>
      </div>

      {/* 3. Right Section: Volume & Queue */}
      <div className="flex items-center justify-end gap-3 w-1/4 min-w-[180px]">
        {/* Queue button */}
        <button
          onClick={() => setIsQueueOpen(prev => !prev)}
          className={`p-2 rounded-lg transition-colors flex items-center gap-1.5 text-xs ${
            isQueueOpen ? 'text-brand-400 bg-brand-500/15' : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
          title="Play Queue"
        >
          <ListMusic className="w-4 h-4" />
          <span className="hidden sm:inline font-mono text-[11px]">{queue.length}</span>
        </button>

        {/* Volume controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleMute}
            className="p-1.5 text-slate-400 hover:text-white transition"
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted || volume === 0 ? (
              <VolumeX className="w-4 h-4 text-rose-400" />
            ) : (
              <Volume2 className="w-4 h-4" />
            )}
          </button>

          <div className="w-20 hidden sm:flex items-center">
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={isMuted ? 0 : volume}
              onChange={(e) => setVolumeLevel(Number(e.target.value))}
              className="w-full h-1 bg-white/20 rounded-lg accent-brand-500"
            />
          </div>
        </div>
      </div>
    </footer>
  );
};

export default BottomPlayer;
