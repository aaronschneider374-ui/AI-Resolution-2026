'use client';

import React from 'react';
import { Trophy, Clock, CheckCircle2 } from 'lucide-react';
import { Card, CardHeader, CardContent } from './ui/Card';
import { useProgress } from '@/contexts/ProgressContext';
import { useAuth } from '@/contexts/AuthContext';

export function Leaderboard() {
  const { leaderboard } = useProgress();
  const { user } = useAuth();

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  if (leaderboard.length === 0) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Leaderboard
            </h2>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-center text-gray-500 dark:text-gray-400 py-8">
            No participants have shared their progress yet.
            <br />
            <span className="text-sm">
              Enable sharing in your profile to appear here!
            </span>
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-500" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Leaderboard
          </h2>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {leaderboard.map((entry, index) => {
            const isCurrentUser = entry.uid === user?.uid;
            const rank = index + 1;
            
            return (
              <div
                key={entry.uid}
                className={`flex items-center gap-4 px-6 py-4 ${
                  isCurrentUser ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                }`}
              >
                <div className="flex-shrink-0 w-8 text-center">
                  {rank === 1 ? (
                    <span className="text-2xl">🥇</span>
                  ) : rank === 2 ? (
                    <span className="text-2xl">🥈</span>
                  ) : rank === 3 ? (
                    <span className="text-2xl">🥉</span>
                  ) : (
                    <span className="text-lg font-bold text-gray-400">
                      {rank}
                    </span>
                  )}
                </div>

                <div className="flex-shrink-0">
                {entry.photoURL ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={entry.photoURL}
                    alt={entry.displayName}
                    className="w-10 h-10 rounded-full"
                  />
                ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                      {entry.displayName.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 dark:text-gray-100 truncate">
                    {entry.displayName}
                    {isCurrentUser && (
                      <span className="ml-2 text-xs text-blue-600 dark:text-blue-400">
                        (You)
                      </span>
                    )}
                  </p>
                </div>

                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{entry.completedWeeks}/10</span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                    <Clock className="w-4 h-4" />
                    <span>{formatTime(entry.totalTimeSpent)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
