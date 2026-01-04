'use client';

import React, { useState } from 'react';
import { Target, Clock, Trophy, Sparkles, LayoutGrid } from 'lucide-react';
import { Header } from './Header';
import { WeekCard } from './WeekCard';
import { Leaderboard } from './Leaderboard';
import { ProgressBar } from './ui/ProgressBar';
import { Card, CardContent } from './ui/Card';
import { Button } from './ui/Button';
import { useProgress } from '@/contexts/ProgressContext';
import { useAuth } from '@/contexts/AuthContext';
import { WEEKS_DATA } from '@/types';

export function Dashboard() {
  const { progress, loading, getNextIncompleteWeek, getCompletedCount, getTotalTimeSpent } = useProgress();
  const { isDemoMode } = useAuth();
  const [view, setView] = useState<'all' | 'leaderboard'>('all');

  const nextWeek = getNextIncompleteWeek();
  const completedCount = getCompletedCount();
  const totalTimeSpent = getTotalTimeSpent();

  const formatTotalTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    if (minutes > 0) return `${minutes}m`;
    return '0m';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />
        <div className="flex items-center justify-center h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      
      <main className="max-w-5xl mx-auto px-4 py-6">
        {/* Demo Mode Banner */}
        {isDemoMode && (
          <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700 rounded-xl">
            <p className="text-sm text-amber-800 dark:text-amber-200">
              <strong>Demo Mode:</strong> Your progress is saved locally in your browser. 
              To enable cloud sync and leaderboard features, configure Firebase in your environment.
            </p>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="flex items-center gap-4 py-4">
              <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <Target className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {completedCount}/10
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Weeks Complete
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center gap-4 py-4">
              <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <Clock className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {formatTotalTime(totalTimeSpent)}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Total Time
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center gap-4 py-4">
              <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {nextWeek ? `Week ${nextWeek}` : 'Done! 🎉'}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {nextWeek ? 'Next Up' : 'All Complete'}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Progress Bar */}
        <Card className="mb-6">
          <CardContent className="py-4">
            <ProgressBar
              value={completedCount}
              max={10}
              size="lg"
              color={completedCount === 10 ? 'green' : 'blue'}
            />
          </CardContent>
        </Card>

        {/* View Toggle */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            {view === 'all' ? 'Your Journey' : 'Leaderboard'}
          </h2>
          <div className="flex gap-2">
            <Button
              variant={view === 'all' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setView('all')}
            >
              <LayoutGrid className="w-4 h-4 mr-1" />
              Progress
            </Button>
            <Button
              variant={view === 'leaderboard' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setView('leaderboard')}
            >
              <Trophy className="w-4 h-4 mr-1" />
              Leaderboard
            </Button>
          </div>
        </div>

        {/* Content */}
        {view === 'all' ? (
          <div className="space-y-4">
            {WEEKS_DATA.map((week) => {
              const weekProgress = progress.find((p) => p.weekId === week.id);
              return (
                <WeekCard
                  key={week.id}
                  week={week}
                  progress={weekProgress}
                  isRecommended={nextWeek === week.id}
                />
              );
            })}
          </div>
        ) : (
          <Leaderboard />
        )}

        {/* Completion Message */}
        {completedCount === 10 && (
          <Card className="mt-8 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 border-green-200 dark:border-green-700">
            <CardContent className="text-center py-8">
              <div className="text-6xl mb-4">🎉</div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                Congratulations!
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                You&apos;ve completed all 10 weeks of the AI Resolution Program!
                <br />
                You spent a total of <strong>{formatTotalTime(totalTimeSpent)}</strong> on your AI journey.
              </p>
            </CardContent>
          </Card>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-12 py-6 border-t border-gray-200 dark:border-gray-700">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Part of the{' '}
            <a
              href="https://aidbnewyear.com/program"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              AI Daily Brief New Year&apos;s Resolution Program
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
