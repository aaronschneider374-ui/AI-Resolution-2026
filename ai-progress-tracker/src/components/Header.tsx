'use client';

import React, { useState } from 'react';
import { LogOut, Settings, Menu, X } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { Button } from './ui/Button';
import { Modal } from './ui/Modal';
import { useAuth } from '@/contexts/AuthContext';

export function Header() {
  const { userProfile, signOut, updateUserProfile } = useAuth();
  const [showMenu, setShowMenu] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [shareProgress, setShareProgress] = useState(userProfile?.shareProgress || false);

  const handleSaveSettings = async () => {
    await updateUserProfile({ shareProgress });
    setShowSettings(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-5xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
              <span className="text-xl">🚀</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                AI Progress Tracker
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                10-Week AI Resolution Program
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                {userProfile?.photoURL ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={userProfile.photoURL}
                    alt={userProfile.displayName}
                    className="w-8 h-8 rounded-full"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm font-bold">
                    {userProfile?.displayName?.charAt(0).toUpperCase() || 'U'}
                  </div>
                )}
                <span className="hidden sm:inline text-sm font-medium text-gray-700 dark:text-gray-300">
                  {userProfile?.displayName || 'User'}
                </span>
                {showMenu ? (
                  <X className="w-4 h-4 text-gray-500" />
                ) : (
                  <Menu className="w-4 h-4 text-gray-500" />
                )}
              </button>

              {showMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 py-2">
                  <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {userProfile?.displayName}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {userProfile?.email}
                    </p>
                  </div>
                  
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      setShowSettings(true);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <Settings className="w-4 h-4" />
                    Settings
                  </button>
                  
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      signOut();
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Modal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        title="Settings"
        size="md"
      >
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-900 dark:text-gray-100">
                Share Progress on Leaderboard
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Allow others to see your progress and time spent
              </p>
            </div>
            <button
              onClick={() => setShareProgress(!shareProgress)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                shareProgress ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  shareProgress ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setShowSettings(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveSettings}>Save Changes</Button>
          </div>
        </div>
      </Modal>
    </header>
  );
}
