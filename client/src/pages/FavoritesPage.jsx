import React from 'react';
import { Heart, Play, Clock, Music, Compass } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import SongCard from '../components/cards/SongCard';

const FavoritesPage = ({ setActiveTab }) => {
  const { songsList, favorites, playSong } = usePlayer();

  const favoriteSongs = songsList.filter(song => favorites.includes(song.id));

  const totalDurationSeconds = favoriteSongs.reduce((acc, song) => acc + song.duration, 0);
  const totalMinutes = Math.floor(totalDurationSeconds / 60);

  const handlePlayAll = () => {
    if (favoriteSongs.length > 0) {
      playSong(favoriteSongs[0], favoriteSongs);
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Hero Header */}
      <div className="flex flex-col sm:flex-row sm:items-end gap-6 bg-gradient-to-r from-rose-950/60 via-purple-950/40 to-[#121622] p-6 md:p-8 rounded-3xl border border-rose-500/20 shadow-xl">
        <div className="w-28 h-28 md:w-36 md:h-36 rounded-2xl bg-gradient-to-tr from-rose-600 to-pink-500 flex items-center justify-center shadow-2xl shadow-rose-600/40 flex-shrink-0">
          <Heart className="w-14 h-14 md:w-18 md:h-18 text-white fill-current" />
        </div>

        <div className="space-y-2 flex-1">
          <div className="text-xs font-bold uppercase tracking-wider text-rose-400">
            Curated Collection
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight">
            Liked Songs
          </h1>
          <p className="text-sm text-slate-300">
            {favoriteSongs.length} {favoriteSongs.length === 1 ? 'song' : 'songs'} • Approx. {totalMinutes} minutes
          </p>

          {favoriteSongs.length > 0 && (
            <div className="pt-2">
              <button
                onClick={handlePlayAll}
                className="flex items-center gap-2 px-6 py-3 rounded-full bg-rose-500 hover:bg-rose-400 text-white font-bold text-sm shadow-lg shadow-rose-500/30 hover:scale-105 active:scale-95 transition"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Play All Favorites</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Songs Grid / Empty State */}
      {favoriteSongs.length > 0 ? (
        <div>
          <h3 className="text-lg font-bold text-white mb-4">
            All Favorited Tracks ({favoriteSongs.length})
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {favoriteSongs.map(song => (
              <SongCard key={song.id} song={song} playlist={favoriteSongs} />
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-20 bg-[#121622]/40 rounded-3xl border border-dashed border-white/10 p-8 max-w-md mx-auto">
          <div className="w-16 h-16 rounded-full bg-rose-500/10 flex items-center justify-center mx-auto mb-4 text-rose-400">
            <Heart className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-white">No liked songs yet</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
            Click the heart icon on any track while browsing or playing to save it to your personal library.
          </p>
          <button
            onClick={() => setActiveTab('explore')}
            className="mt-5 px-5 py-2.5 rounded-full bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold inline-flex items-center gap-2 transition"
          >
            <Compass className="w-4 h-4" />
            <span>Discover Music</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default FavoritesPage;
