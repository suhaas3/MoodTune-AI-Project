import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { SAMPLE_SONGS } from '../data/mockData';
import { useMood } from './MoodContext';

const PlayerContext = createContext();

export const PlayerProvider = ({ children }) => {
  const { currentMood } = useMood();
  
  const [songsList, setSongsList] = useState(SAMPLE_SONGS);
  const [currentSong, setCurrentSong] = useState(SAMPLE_SONGS[0]);
  const [queue, setQueue] = useState(SAMPLE_SONGS);
  const [queueIndex, setQueueIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(SAMPLE_SONGS[0].duration);
  const [volume, setVolume] = useState(0.85);
  const [isMuted, setIsMuted] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [isLoop, setIsLoop] = useState(false);
  const [isQueueOpen, setIsQueueOpen] = useState(false);

  // Favorites stored in LocalStorage
  const [favorites, setFavorites] = useState(() => {
    try {
      const saved = localStorage.getItem('moodtune_favorites');
      return saved ? JSON.parse(saved) : ['s-1', 's-5', 's-2'];
    } catch {
      return ['s-1', 's-5', 's-2'];
    }
  });

  // History stored in LocalStorage
  const [history, setHistory] = useState(() => {
    try {
      const saved = localStorage.getItem('moodtune_history');
      return saved ? JSON.parse(saved) : [
        {
          songId: 's-1',
          playedAt: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
          completionRate: 1.0,
          contextMood: 'Happy'
        },
        {
          songId: 's-3',
          playedAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
          completionRate: 0.92,
          contextMood: 'Relaxed'
        },
        {
          songId: 's-2',
          playedAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
          completionRate: 0.85,
          contextMood: 'Energetic'
        }
      ];
    } catch {
      return [];
    }
  });

  const audioRef = useRef(new Audio());
  const synthAudioRef = useRef(null); // Web Audio context fallback
  const synthIntervalRef = useRef(null);
  const timerRef = useRef(null);

  // Sync favorites to localStorage
  useEffect(() => {
    localStorage.setItem('moodtune_favorites', JSON.stringify(favorites));
  }, [favorites]);

  // Sync history to localStorage
  useEffect(() => {
    localStorage.setItem('moodtune_history', JSON.stringify(history));
  }, [history]);

  // Web Audio Synthetic Fallback Generator
  // Creates a pleasant ambient tone when remote MP3 is unreachable (CORS/offline)
  const startSynthSound = (song) => {
    stopSynthSound();
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      synthAudioRef.current = ctx;

      const baseFreq = song.mood === 'Sad' ? 220 : song.mood === 'Relaxed' ? 261.63 : song.mood === 'Happy' ? 329.63 : 392.0;
      const notes = [1, 1.25, 1.33, 1.5, 1.875];
      let step = 0;

      synthIntervalRef.current = setInterval(() => {
        if (!isPlaying && synthAudioRef.current?.state === 'running') return;
        try {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          
          osc.type = song.mood === 'Energetic' ? 'sawtooth' : 'sine';
          const multiplier = notes[step % notes.length];
          step++;

          osc.frequency.setValueAtTime(baseFreq * multiplier, ctx.currentTime);
          
          const maxVol = isMuted ? 0 : volume * 0.12;
          gain.gain.setValueAtTime(0.001, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(maxVol, ctx.currentTime + 0.1);
          gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.2);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start();
          osc.stop(ctx.currentTime + 1.3);
        } catch (e) {
          // ignore synth node errors
        }
      }, 1000);
    } catch (e) {
      // AudioContext not allowed or not supported
    }
  };

  const stopSynthSound = () => {
    if (synthIntervalRef.current) {
      clearInterval(synthIntervalRef.current);
      synthIntervalRef.current = null;
    }
    if (synthAudioRef.current) {
      try {
        synthAudioRef.current.close();
      } catch (e) {}
      synthAudioRef.current = null;
    }
  };

  // Setup HTML5 Audio element listeners
  useEffect(() => {
    const audio = audioRef.current;
    audio.preload = 'metadata';

    const handleLoadedMetadata = () => {
      setDuration(audio.duration || currentSong.duration);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleEnded = () => {
      logListenHistory(currentSong, 1.0);
      if (isLoop) {
        audio.currentTime = 0;
        audio.play().catch(() => {});
      } else {
        nextSong();
      }
    };

    const handleError = () => {
      // If remote MP3 fails to load, gracefully fallback to simulated timeline + Web Audio synth
      console.info('Audio track using fallback playback mode.');
      startSynthSound(currentSong);
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      stopSynthSound();
    };
  }, [currentSong, isLoop, isMuted, volume]);

  // Adjust volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  // Play/Pause effect
  useEffect(() => {
    const audio = audioRef.current;
    if (isPlaying) {
      if (audio.src !== currentSong.audioUrl) {
        audio.src = currentSong.audioUrl;
        audio.load();
      }
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // Fallback simulation timer when autoplay or network blocks
          startSynthSound(currentSong);
        });
      }

      // Fallback timer in case audio file doesn't dispatch timeupdate
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setCurrentTime(prev => {
          if (prev >= duration) {
            handleEndedSimulated();
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    } else {
      audio.pause();
      stopSynthSound();
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, currentSong]);

  const handleEndedSimulated = () => {
    logListenHistory(currentSong, 1.0);
    if (isLoop) {
      setCurrentTime(0);
    } else {
      nextSong();
    }
  };

  const logListenHistory = (song, completionRate = 0.5) => {
    setHistory(prev => [
      {
        songId: song.id,
        playedAt: new Date().toISOString(),
        completionRate: Math.min(1.0, completionRate),
        contextMood: currentMood || song.mood
      },
      ...prev.slice(0, 49) // keep last 50
    ]);
  };

  const playSong = (song, newQueue = null) => {
    stopSynthSound();
    if (newQueue) {
      setQueue(newQueue);
      const idx = newQueue.findIndex(s => s.id === song.id);
      setQueueIndex(idx >= 0 ? idx : 0);
    } else {
      const idx = queue.findIndex(s => s.id === song.id);
      if (idx >= 0) {
        setQueueIndex(idx);
      } else {
        setQueue(prev => [song, ...prev]);
        setQueueIndex(0);
      }
    }
    setCurrentSong(song);
    setDuration(song.duration);
    setCurrentTime(0);
    setIsPlaying(true);
  };

  const togglePlay = () => {
    setIsPlaying(prev => !prev);
  };

  const nextSong = () => {
    if (queue.length === 0) return;
    let nextIdx = queueIndex + 1;
    if (isShuffle) {
      nextIdx = Math.floor(Math.random() * queue.length);
    } else if (nextIdx >= queue.length) {
      nextIdx = 0;
    }
    setQueueIndex(nextIdx);
    const nextTrack = queue[nextIdx];
    setCurrentSong(nextTrack);
    setDuration(nextTrack.duration);
    setCurrentTime(0);
    setIsPlaying(true);
  };

  const prevSong = () => {
    if (queue.length === 0) return;
    if (currentTime > 4) {
      // restart current song if past 4s
      seekTo(0);
      return;
    }
    let prevIdx = queueIndex - 1;
    if (prevIdx < 0) {
      prevIdx = queue.length - 1;
    }
    setQueueIndex(prevIdx);
    const prevTrack = queue[prevIdx];
    setCurrentSong(prevTrack);
    setDuration(prevTrack.duration);
    setCurrentTime(0);
    setIsPlaying(true);
  };

  const seekTo = (seconds) => {
    const clamped = Math.max(0, Math.min(seconds, duration));
    setCurrentTime(clamped);
    if (audioRef.current && isFinite(clamped)) {
      audioRef.current.currentTime = clamped;
    }
  };

  const setVolumeLevel = (vol) => {
    const clamped = Math.max(0, Math.min(vol, 1));
    setVolume(clamped);
    if (clamped > 0 && isMuted) {
      setIsMuted(false);
    }
  };

  const toggleMute = () => {
    setIsMuted(prev => !prev);
  };

  const toggleShuffle = () => {
    setIsShuffle(prev => !prev);
  };

  const toggleLoop = () => {
    setIsLoop(prev => !prev);
  };

  const toggleFavorite = (songId) => {
    setFavorites(prev => {
      if (prev.includes(songId)) {
        return prev.filter(id => id !== songId);
      } else {
        return [...prev, songId];
      }
    });
  };

  const isFavorite = (songId) => {
    return favorites.includes(songId);
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('moodtune_history');
  };

  return (
    <PlayerContext.Provider
      value={{
        songsList,
        currentSong,
        isPlaying,
        currentTime,
        duration,
        volume,
        isMuted,
        isShuffle,
        isLoop,
        queue,
        queueIndex,
        isQueueOpen,
        setIsQueueOpen,
        favorites,
        history,
        playSong,
        togglePlay,
        nextSong,
        prevSong,
        seekTo,
        setVolumeLevel,
        toggleMute,
        toggleShuffle,
        toggleLoop,
        toggleFavorite,
        isFavorite,
        clearHistory
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return context;
};
