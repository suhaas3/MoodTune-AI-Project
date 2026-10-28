import React, { createContext, useContext, useState, useEffect } from 'react';
import { MOOD_CONFIG, MOODS } from '../data/mockData';

const MoodContext = createContext();

export const MoodProvider = ({ children }) => {
  const [currentMood, setCurrentMood] = useState(() => {
    return localStorage.getItem('moodtune_active_mood') || null;
  });

  const [tempoFilter, setTempoFilter] = useState([60, 180]); // min, max BPM

  useEffect(() => {
    if (currentMood) {
      localStorage.setItem('moodtune_active_mood', currentMood);
    } else {
      localStorage.removeItem('moodtune_active_mood');
    }
  }, [currentMood]);

  const selectMood = (mood) => {
    if (currentMood === mood) {
      setCurrentMood(null); // toggle off
    } else {
      setCurrentMood(mood);
    }
  };

  const clearMood = () => setCurrentMood(null);

  const getMoodDetails = (mood = currentMood) => {
    if (!mood || !MOOD_CONFIG[mood]) return null;
    return MOOD_CONFIG[mood];
  };

  return (
    <MoodContext.Provider
      value={{
        currentMood,
        selectMood,
        clearMood,
        getMoodDetails,
        moods: MOODS,
        moodConfig: MOOD_CONFIG,
        tempoFilter,
        setTempoFilter
      }}
    >
      {children}
    </MoodContext.Provider>
  );
};

export const useMood = () => {
  const context = useContext(MoodContext);
  if (!context) {
    throw new Error('useMood must be used within a MoodProvider');
  }
  return context;
};
