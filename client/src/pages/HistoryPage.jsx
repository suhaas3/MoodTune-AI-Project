import React from 'react';
import { History, Play, Trash2, Clock, CheckCircle, Compass } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { MoodBadge, GenreBadge } from '../components/common/Badge';

const formatRelativeTime = (isoString) => {
  try {
    const diffMs = Date.now() - new Date(isoString).getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  } catch {
    return 'Recently';
  }
};

const HistoryPage = ({ setActiveTab }) => {
  const { history, songsList, playSong, clearHistory } = usePlayer();

  // Map history records to full song objects
  const historyItems = history.map(record => {
    const song = songsList.find(s => s.id === record.songId);
    return {
      ...record,
      song: song || songsList[0]
    };
  });

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <History className="w-6 h-6 text-brand-400" />
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              Listening History & Telemetry
            </h1>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Implicit feedback logged to continuously adapt the hybrid collaborative recommendation weights.
          </p>
        </div>

        {historyItems.length > 0 && (
          <button
            onClick={clearHistory}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 text-xs font-semibold transition"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear History</span>
          </button>
        )}
      </div>

      {/* History Items List */}
      {historyItems.length > 0 ? (
        <div className="bg-[#121622] rounded-3xl border border-white/5 overflow-hidden">
          <div className="p-4 border-b border-white/5 flex items-center justify-between text-xs font-semibold text-slate-400 uppercase tracking-wider">
            <span className="w-12 text-center">#</span>
            <span className="flex-1">Title & Artist</span>
            <span className="hidden sm:inline w-28">Mood Context</span>
            <span className="hidden md:inline w-28 text-center">Completion</span>
            <span className="w-24 text-right">Played</span>
          </div>

          <div className="divide-y divide-white/5">
            {historyItems.map((item, index) => (
              <div
                key={`${item.songId}-${item.playedAt}-${index}`}
                onClick={() => playSong(item.song)}
                className="flex items-center justify-between p-3.5 hover:bg-white/[0.04] transition-colors cursor-pointer group"
              >
                {/* Index / Play hover */}
                <div className="w-12 flex items-center justify-center">
                  <span className="text-xs font-mono text-slate-500 group-hover:hidden">
                    {index + 1}
                  </span>
                  <Play className="w-4 h-4 text-brand-400 fill-current hidden group-hover:block" />
                </div>

                {/* Cover & Info */}
                <div className="flex items-center gap-3.5 flex-1 min-w-0 pr-4">
                  <img
                    src={item.song.coverUrl}
                    alt={item.song.title}
                    className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-white group-hover:text-brand-300 truncate">
                      {item.song.title}
                    </p>
                    <p className="text-xs text-slate-400 truncate">
                      {item.song.artist}
                    </p>
                  </div>
                </div>

                {/* Mood Context */}
                <div className="hidden sm:flex items-center w-28">
                  <MoodBadge mood={item.contextMood || item.song.mood} size="xs" />
                </div>

                {/* Completion Rate */}
                <div className="hidden md:flex items-center justify-center w-28">
                  <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                    {Math.round(item.completionRate * 100)}%
                  </span>
                </div>

                {/* Relative Timestamp */}
                <div className="w-24 text-right text-xs font-mono text-slate-400 flex items-center justify-end gap-1">
                  <Clock className="w-3 h-3 text-slate-500" />
                  <span>{formatRelativeTime(item.playedAt)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-20 bg-[#121622]/40 rounded-3xl border border-dashed border-white/10 p-8 max-w-md mx-auto">
          <History className="w-12 h-12 text-slate-500 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white">No listening history</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
            Songs you stream will automatically appear here with their completion telemetry and emotion states.
          </p>
          <button
            onClick={() => setActiveTab('explore')}
            className="mt-5 px-5 py-2.5 rounded-full bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold inline-flex items-center gap-2 transition"
          >
            <Compass className="w-4 h-4" />
            <span>Start Listening</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default HistoryPage;
