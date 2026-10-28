import React from 'react';
import { Sparkles, BrainCircuit, Activity, Disc, Info, CheckCircle2 } from 'lucide-react';
import { useMood } from '../context/MoodContext';
import { usePlayer } from '../context/PlayerContext';
import MoodCard from '../components/cards/MoodCard';

const MoodPage = () => {
  const { currentMood, selectMood, moodConfig } = useMood();
  const { songsList, playSong } = usePlayer();

  const getSongCountForMood = (mood) => {
    return songsList.filter(s => s.mood === mood).length;
  };

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-300 text-xs font-semibold mb-2">
            <BrainCircuit className="w-3.5 h-3.5" />
            <span>Russell's Circumplex Affect Model</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            Emotion Recognition & Mood Station
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Select your desired emotional state or let our deep learning pipeline map acoustic features to mood quadrants.
          </p>
        </div>

        {currentMood && (
          <div className="flex items-center gap-3 bg-[#141824] px-4 py-2 rounded-2xl border border-white/10">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <div>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Current State</p>
              <p className="text-sm font-bold text-white">{currentMood}</p>
            </div>
          </div>
        )}
      </div>

      {/* 4 Mood Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {Object.entries(moodConfig).map(([key, config]) => (
          <MoodCard
            key={key}
            moodKey={key}
            config={config}
            songCount={getSongCountForMood(key)}
          />
        ))}
      </div>

      {/* Interactive 2D Valence-Arousal Coordinate Plane */}
      <div className="bg-[#121622] rounded-3xl p-6 md:p-8 border border-white/10">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-brand-400" />
              <h2 className="text-lg md:text-xl font-bold text-white tracking-tight">
                Valence-Arousal 2D Coordinate Map
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Music Emotion Recognition (MER) extracts Mel-spectrograms & MFCCs to project songs onto continuous $(V, A)$ coordinates.
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
              <span className="text-slate-300">Happy</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
              <span className="text-slate-300">Energetic</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
              <span className="text-slate-300">Relaxed</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
              <span className="text-slate-300">Sad</span>
            </div>
          </div>
        </div>

        {/* 2D Plane Visualization */}
        <div className="relative aspect-[16/9] max-h-[380px] w-full bg-[#0d1017] rounded-2xl border border-white/5 overflow-hidden flex items-center justify-center p-6 select-none">
          {/* Axis lines */}
          <div className="absolute inset-y-4 left-1/2 w-[1px] bg-white/15"></div>
          <div className="absolute inset-x-4 top-1/2 h-[1px] bg-white/15"></div>

          {/* Axis Labels */}
          <span className="absolute top-3 left-1/2 -translate-x-1/2 text-[11px] font-mono font-bold text-rose-400 uppercase tracking-widest bg-[#0d1017] px-2">
            + Arousal (Intensity)
          </span>
          <span className="absolute bottom-3 left-1/2 -translate-x-1/2 text-[11px] font-mono font-bold text-emerald-400 uppercase tracking-widest bg-[#0d1017] px-2">
            - Arousal (Calm)
          </span>
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-mono font-bold text-amber-400 uppercase tracking-widest bg-[#0d1017] px-2">
            + Valence (Positive)
          </span>
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[11px] font-mono font-bold text-blue-400 uppercase tracking-widest bg-[#0d1017] px-2">
            - Valence (Negative)
          </span>

          {/* Quadrant 1: Happy */}
          <div 
            onClick={() => selectMood('Happy')}
            className={`absolute top-4 right-4 w-[46%] h-[44%] rounded-xl transition-all cursor-pointer p-4 flex flex-col justify-between ${
              currentMood === 'Happy' 
                ? 'bg-amber-500/15 border-2 border-amber-400 ring-4 ring-amber-500/20 shadow-lg' 
                : 'hover:bg-amber-500/5 border border-amber-500/10'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-amber-400 text-sm">Q1: HAPPY</span>
              <span className="text-[10px] font-mono text-slate-400">V &gt; 0.5, A &gt; 0.5</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-tight">
              Major scales, optimistic lyrics, uplifting chord cadences.
            </p>
          </div>

          {/* Quadrant 2: Energetic */}
          <div 
            onClick={() => selectMood('Energetic')}
            className={`absolute top-4 left-4 w-[46%] h-[44%] rounded-xl transition-all cursor-pointer p-4 flex flex-col justify-between ${
              currentMood === 'Energetic' 
                ? 'bg-rose-500/15 border-2 border-rose-400 ring-4 ring-rose-500/20 shadow-lg' 
                : 'hover:bg-rose-500/5 border border-rose-500/10'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-rose-400 text-sm">Q2: ENERGETIC</span>
              <span className="text-[10px] font-mono text-slate-400">High Arousal (&gt;0.75)</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-tight">
              Distorted synths, fast percussion (130+ BPM), high spectral centroid.
            </p>
          </div>

          {/* Quadrant 3: Sad */}
          <div 
            onClick={() => selectMood('Sad')}
            className={`absolute bottom-4 left-4 w-[46%] h-[44%] rounded-xl transition-all cursor-pointer p-4 flex flex-col justify-between ${
              currentMood === 'Sad' 
                ? 'bg-blue-500/15 border-2 border-blue-400 ring-4 ring-blue-500/20 shadow-lg' 
                : 'hover:bg-blue-500/5 border border-blue-500/10'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-blue-400 text-sm">Q3: SAD</span>
              <span className="text-[10px] font-mono text-slate-400">V &lt; 0.5, A &lt; 0.5</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-tight">
              Minor keys, slow tempo (&lt;75 BPM), solo piano and emotive vocals.
            </p>
          </div>

          {/* Quadrant 4: Relaxed */}
          <div 
            onClick={() => selectMood('Relaxed')}
            className={`absolute bottom-4 right-4 w-[46%] h-[44%] rounded-xl transition-all cursor-pointer p-4 flex flex-col justify-between ${
              currentMood === 'Relaxed' 
                ? 'bg-emerald-500/15 border-2 border-emerald-400 ring-4 ring-emerald-500/20 shadow-lg' 
                : 'hover:bg-emerald-500/5 border border-emerald-500/10'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-emerald-400 text-sm">Q4: RELAXED</span>
              <span className="text-[10px] font-mono text-slate-400">V &gt; 0.5, A &lt; 0.5</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-tight">
              Soft dynamics, lo-fi beats, gentle acoustic guitars, warm reverberation.
            </p>
          </div>

          {/* Center Coordinates Origin Circle */}
          <div className="w-6 h-6 rounded-full bg-brand-500/30 border-2 border-brand-400 flex items-center justify-center z-10 shadow-lg shadow-brand-500/50">
            <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MoodPage;
