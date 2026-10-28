import React, { useState } from 'react';
import { MoodProvider, useMood } from './context/MoodContext';
import { AuthProvider } from './context/AuthContext';
import { PlayerProvider } from './context/PlayerContext';

import Sidebar from './components/layout/Sidebar';
import Navbar from './components/layout/Navbar';
import BottomPlayer from './components/player/BottomPlayer';
import QueueDrawer from './components/player/QueueDrawer';

import HomePage from './pages/HomePage';
import ExplorePage from './pages/ExplorePage';
import MoodPage from './pages/MoodPage';
import FavoritesPage from './pages/FavoritesPage';
import HistoryPage from './pages/HistoryPage';
import ProfilePage from './pages/ProfilePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

const AppContent = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { currentMood, moodConfig } = useMood();

  const activeMoodConfig = currentMood ? moodConfig[currentMood] : null;

  const renderActivePage = () => {
    switch (activeTab) {
      case 'home':
        return <HomePage setActiveTab={setActiveTab} />;
      case 'explore':
        return <ExplorePage searchQuery={searchQuery} setSearchQuery={setSearchQuery} />;
      case 'moods':
        return <MoodPage />;
      case 'favorites':
        return <FavoritesPage setActiveTab={setActiveTab} />;
      case 'history':
        return <HistoryPage setActiveTab={setActiveTab} />;
      case 'profile':
        return <ProfilePage />;
      case 'login':
        return <LoginPage setActiveTab={setActiveTab} />;
      case 'register':
        return <RegisterPage setActiveTab={setActiveTab} />;
      default:
        return <HomePage setActiveTab={setActiveTab} />;
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#0c0e14] text-slate-100 font-sans relative">
      {/* Dynamic Background Mood Ambient Glow */}
      {activeMoodConfig && (
        <div 
          className="fixed top-0 right-1/4 w-[600px] h-[600px] rounded-full blur-[140px] opacity-15 pointer-events-none transition-all duration-1000 z-0"
          style={{ backgroundColor: activeMoodConfig.accentColor }}
        />
      )}

      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>

      {/* Mobile Drawer Sidebar */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="relative z-10 w-72 h-full bg-[#0e111a]">
            <Sidebar 
              activeTab={activeTab} 
              setActiveTab={(tab) => {
                setActiveTab(tab);
                setIsMobileMenuOpen(false);
              }} 
            />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden relative z-10">
        <Navbar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
        />

        {/* Scrollable Page Body with padding for BottomPlayer */}
        <main className="flex-1 overflow-y-auto pb-28 md:pb-32">
          {renderActivePage()}
        </main>
      </div>

      {/* Persistent Audio Player & Queue Drawer */}
      <BottomPlayer />
      <QueueDrawer />
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <MoodProvider>
        <PlayerProvider>
          <AppContent />
        </PlayerProvider>
      </MoodProvider>
    </AuthProvider>
  );
}

export default App;
