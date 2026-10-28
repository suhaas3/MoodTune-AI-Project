import React from 'react';

export const MoodBadge = ({ mood, size = 'sm' }) => {
  const styles = {
    Happy: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    Energetic: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
    Relaxed: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    Sad: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
  };

  const currentStyle = styles[mood] || 'bg-violet-500/15 text-violet-300 border-violet-500/30';
  const sizeClasses = size === 'xs' ? 'text-[10px] px-1.5 py-0.5' : 'text-xs px-2.5 py-1';

  return (
    <span className={`inline-flex items-center gap-1 font-medium rounded-full border ${sizeClasses} ${currentStyle}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse"></span>
      {mood}
    </span>
  );
};

export const GenreBadge = ({ genre }) => (
  <span className="inline-block text-[11px] font-medium px-2 py-0.5 rounded-md bg-white/5 text-slate-300 border border-white/10">
    {genre}
  </span>
);
