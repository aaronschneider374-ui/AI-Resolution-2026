'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, CheckCircle2, Circle, Sparkles } from 'lucide-react';
import { Card, CardContent } from './ui/Card';
import { Timer } from './Timer';
import { NotesEditor } from './NotesEditor';
import { WeekData, WeekProgress } from '@/types';
import { useProgress } from '@/contexts/ProgressContext';

interface WeekCardProps {
  week: WeekData;
  progress: WeekProgress | undefined;
  isRecommended?: boolean;
}

export function WeekCard({ week, progress, isRecommended }: WeekCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const {
    toggleComplete,
    updateNotes,
    startTimer,
    stopTimer,
    addManualTime,
    uploadAttachment,
    addLinkAttachment,
    removeAttachment,
  } = useProgress();

  const isCompleted = progress?.completed || false;

  const formatTimeShort = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  return (
    <Card
      className={`transition-all duration-300 ${
        isCompleted
          ? 'border-green-500 dark:border-green-400 bg-green-50 dark:bg-green-900/20'
          : isRecommended
          ? 'border-blue-500 dark:border-blue-400 ring-2 ring-blue-500/50'
          : ''
      }`}
    >
      <div
        className="flex items-start gap-4 p-4 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleComplete(week.id);
          }}
          className="mt-1 flex-shrink-0 transition-transform hover:scale-110"
        >
          {isCompleted ? (
            <CheckCircle2 className="w-6 h-6 text-green-500" />
          ) : (
            <Circle className="w-6 h-6 text-gray-400 hover:text-blue-500" />
          )}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3
              className={`text-lg font-semibold ${
                isCompleted
                  ? 'text-green-700 dark:text-green-300'
                  : 'text-gray-900 dark:text-gray-100'
              }`}
            >
              Week {week.id}: {week.title}
            </h3>
            {isRecommended && (
              <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full">
                <Sparkles className="w-3 h-3" />
                Next Up
              </span>
            )}
            {isCompleted && (
              <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-full">
                Completed
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            {week.description}
          </p>
          
          {(progress?.timeSpent || 0) > 0 && (
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-500">
              Time spent: {formatTimeShort(progress?.timeSpent || 0)}
            </p>
          )}
        </div>

        <button className="flex-shrink-0 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-gray-500" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-500" />
          )}
        </button>
      </div>

      {isExpanded && (
        <CardContent className="border-t border-gray-200 dark:border-gray-700">
          <div className="space-y-6">
            {/* Objectives */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Objectives
              </h4>
              <ul className="space-y-2">
                {week.objectives.map((objective, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400"
                  >
                    <span className="text-blue-500 mt-0.5">•</span>
                    {objective}
                  </li>
                ))}
              </ul>
            </div>

            {/* Timer */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Time Tracking
              </h4>
              <Timer
                timeSpent={progress?.timeSpent || 0}
                timerStartedAt={progress?.timerStartedAt || null}
                onStart={() => startTimer(week.id)}
                onStop={() => stopTimer(week.id)}
                onAddManualTime={(seconds) => addManualTime(week.id, seconds)}
              />
            </div>

            {/* Notes & Attachments */}
            <NotesEditor
              notes={progress?.notes || ''}
              attachments={progress?.attachments || []}
              onNotesChange={(notes) => updateNotes(week.id, notes)}
              onUploadFile={(file) => uploadAttachment(week.id, file)}
              onAddLink={(url, name) => addLinkAttachment(week.id, url, name)}
              onRemoveAttachment={(id) => removeAttachment(week.id, id)}
            />
          </div>
        </CardContent>
      )}
    </Card>
  );
}
