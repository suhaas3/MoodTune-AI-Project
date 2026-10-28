import React, { useState, useMemo } from 'react';
import { Search, Filter, SlidersHorizontal, Music2, RotateCcw } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { useMood } from '../context/MoodContext';
import { GENRES } from '../data/mockData';
import SongCard from '../components/cards/SongCard';

const ExplorePage = ({ searchQuery, setSearchQuery }) => {
  const { songsList } = usePlayer();
  const { currentMood, selectMood } = useMood();

  const [selectedGenre, setSelectedGenre] = useState('All Genres');
  const [sortBy, setSortBy] = useState('recommended'); // 'recommended', 'tempo', 'valence', 'duration'

  // Filter logic
  const filteredSongs = useMemo(() => {
    return songsList.filter(song => {
      // 1. Search Query
      const query = searchQuery.trim().toLowerCase();
      const matchesSearch = !query || (
        song.title.toLowerCase().includes(query) ||
        song.artist.toLowerCase().includes(query) ||
        song.genre.toLowerCase().includes(query) ||
        song.mood.toLowerCase().includes(query) ||
        song.album?.toLowerCase().includes(query)
      );

      // 2. Genre Filter
      const matchesGenre = selectedGenre === 'All Genres' || song.genre.toLowerCase() === selectedGenre.toLowerCase();

      // 3. Mood Filter
      const matchesMood = !currentMood || song.mood === currentMood;

      return matchesSearch && matchesGenre && matchesMood;
    }).sort((a, b) => {
      if (sortBy === 'tempo') {
        return (b.audioFeatures?.tempo || 0) - (a.audioFeatures?.tempo || 0);
      }
      if (sortBy === 'valence') {
        return (b.audioFeatures?.valence || 0) - (a.audioFeatures?.valence || 0);
      }
      if (sortBy === 'duration') {
        return b.duration - a.duration;
      }
      return b.playCount - a.playCount; // default recommended by play count & popularity
    });
  }, [songsList, searchQuery, selectedGenre, currentMood, sortBy]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedGenre('All Genres');
    selectMood(null);
    setSortBy('recommended');
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Page Title & Search Bar */}
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
          Music Discovery & Catalog
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Explore tracks filtered by acoustic feature vectors, mood classifications, and tempo.
        </p>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-[#121622] p-4 rounded-2xl border border-white/5 space-y-4 shadow-sm">
        {/* Genre Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex-shrink-0 mr-1">
            Genre:
          </span>
          {GENRES.map(genre => (
            <button
              key={genre}
              onClick={() => setSelectedGenre(genre)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                selectedGenre === genre
                  ? 'bg-brand-600 text-white shadow-md'
                  : 'bg-white/5 text-slate-300 hover:bg-white/10'
              }`}
            >
              {genre}
            </button>
          ))}
        </div>

        {/* Second Row: Mood Filter Chips + Sort Dropdown */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-white/5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mr-1">
              Emotion:
            </span>
            {['Happy', 'Energetic', 'Relaxed', 'Sad'].map(m => (
              <button
                key={m}
                onClick={() => selectMood(m)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                  currentMood === m
                    ? 'bg-white/15 text-white ring-1 ring-white/30 font-bold'
                    : 'bg-white/5 text-slate-400 hover:text-white'
                }`}
              >
                {m}
              </button>
            ))}
            {currentMood && (
              <button
                onClick={() => selectMood(null)}
                className="text-xs text-brand-400 hover:underline ml-1"
              >
                Clear Mood
              </button>
            )}
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-[#191e2e] text-xs text-slate-200 border border-white/10 rounded-xl px-3 py-1.5 focus:outline-none focus:border-brand-500"
            >
              <option value="recommended">AI Hybrid Rank</option>
              <option value="tempo">Tempo (Fastest BPM)</option>
              <option value="valence">Valence (Most Positive)</option>
              <option value="duration">Track Duration</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-slate-400">
        <span>
          Showing <span className="font-bold text-white">{filteredSongs.length}</span> {filteredSongs.length === 1 ? 'track' : 'tracks'}
        </span>
        {(searchQuery || selectedGenre !== 'All Genres' || currentMood) && (
          <button
            onClick={handleResetFilters}
            className="flex items-center gap-1 text-brand-400 hover:text-brand-300 font-semibold"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset All Filters</span>
          </button>
        )}
      </div>

      {/* Song Grid or Empty State */}
      {filteredSongs.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {filteredSongs.map(song => (
            <SongCard key={song.id} song={song} playlist={filteredSongs} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-[#131722]/50 rounded-3xl border border-dashed border-white/10 p-8 max-w-lg mx-auto">
          <Music2 className="w-12 h-12 text-slate-500 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white">No tracks found</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            We couldn't find any songs matching your current mood and genre combination. Try resetting your search or filters.
          </p>
          <button
            onClick={handleResetFilters}
            className="mt-4 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold inline-flex items-center gap-2 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset All Filters</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default ExplorePage;
