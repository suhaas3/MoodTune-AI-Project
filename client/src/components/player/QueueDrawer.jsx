import React from 'react';
import { X, Play, Music, Sparkles } from 'lucide-react';
import { usePlayer } from '../../context/PlayerContext';
import { MoodBadge } from '../common/Badge';

const QueueDrawer = () => {
  const { isQueueOpen, setIsQueueOpen, queue, currentSong, playSong } = usePlayer();

  if (!isQueueOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-80 sm:w-96 bg-[#10141f] border-l border-white/10 z-40 flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
      {/* Drawer Header */}
      <div className="p-4 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Music className="w-4 h-4 text-brand-400" />
          <h3 className="font-bold text-sm text-white">Up Next Queue</h3>
          <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-slate-400">
            {queue.length}
          </span>
        </div>
        <button
          onClick={() => setIsQueueOpen(false)}
          className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/5"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Currently Playing Card */}
      <div className="p-4 bg-white/[0.02] border-b border-white/5">
        <p className="text-[11px] font-semibold text-brand-400 uppercase tracking-wider mb-2">
          Now Playing
        </p>
        <div className="flex items-center gap-3">
          <img
            src={currentSong.coverUrl}
            alt={currentSong.title}
            className="w-12 h-12 rounded-lg object-cover ring-2 ring-brand-500/50"
          />
          <div className="min-w-0 flex-1">
            <h4 className="text-sm font-semibold text-white truncate">
              {currentSong.title}
            </h4>
            <p className="text-xs text-slate-400 truncate">
              {currentSong.artist}
            </p>
            <div className="mt-1">
              <MoodBadge mood={currentSong.mood} size="xs" />
            </div>
          </div>
        </div>
      </div>

      {/* Up Next List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        <p className="px-3 py-2 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
          Next in Queue
        </p>
        {queue.map((song, idx) => {
          const isThisPlaying = song.id === currentSong.id;
          return (
            <div
              key={`${song.id}-${idx}`}
              onClick={() => playSong(song, queue)}
              className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer group transition-colors ${
                isThisPlaying 
                  ? 'bg-brand-500/10 text-brand-300 border border-brand-500/20' 
                  : 'hover:bg-white/5 text-slate-300'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <span className="text-xs font-mono text-slate-500 w-4 text-center">
                  {idx + 1}
                </span>
                <img
                  src={song.coverUrl}
                  alt={song.title}
                  className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <p className={`text-xs font-medium truncate ${isThisPlaying ? 'text-brand-300 font-bold' : 'group-hover:text-white'}`}>
                    {song.title}
                  </p>
                  <p className="text-[11px] text-slate-500 truncate">
                    {song.artist}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 pl-2">
                <MoodBadge mood={song.mood} size="xs" />
                <span className="text-[11px] font-mono text-slate-500">
                  {song.durationFormatted}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default QueueDrawer;
