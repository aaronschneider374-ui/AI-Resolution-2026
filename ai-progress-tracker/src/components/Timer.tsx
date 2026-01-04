'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Play, Pause, Plus, Clock } from 'lucide-react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Modal } from './ui/Modal';

interface TimerProps {
  timeSpent: number;
  timerStartedAt: number | null;
  onStart: () => void;
  onStop: () => void;
  onAddManualTime: (seconds: number) => void;
}

export function Timer({
  timeSpent,
  timerStartedAt,
  onStart,
  onStop,
  onAddManualTime,
}: TimerProps) {
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [manualHours, setManualHours] = useState('');
  const [manualMinutes, setManualMinutes] = useState('');
  const [tick, setTick] = useState(0);

  const isRunning = timerStartedAt !== null;

  // Use effect only for the interval, not for setting state based on props
  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setTick((t) => t + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning]);

  // Compute display time from props and current time
  const displayTime = useMemo(() => {
    if (!isRunning || timerStartedAt === null) {
      return timeSpent;
    }
    const elapsed = Math.floor((Date.now() - timerStartedAt) / 1000);
    return timeSpent + elapsed;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeSpent, timerStartedAt, isRunning, tick]);

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    }
    return `${secs}s`;
  };

  const handleManualAdd = () => {
    const hours = parseInt(manualHours) || 0;
    const minutes = parseInt(manualMinutes) || 0;
    const totalSeconds = hours * 3600 + minutes * 60;
    
    if (totalSeconds > 0) {
      onAddManualTime(totalSeconds);
      setManualHours('');
      setManualMinutes('');
      setShowManualEntry(false);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
      <div className="flex items-center gap-2">
        <Clock className="w-5 h-5 text-gray-500 dark:text-gray-400" />
        <span className="text-lg font-mono font-semibold text-gray-900 dark:text-gray-100">
          {formatTime(displayTime)}
        </span>
      </div>

      <div className="flex items-center gap-2">
        {isRunning ? (
          <Button onClick={onStop} variant="secondary" size="sm">
            <Pause className="w-4 h-4 mr-1" />
            Stop
          </Button>
        ) : (
          <Button onClick={onStart} variant="primary" size="sm">
            <Play className="w-4 h-4 mr-1" />
            Start
          </Button>
        )}

        <Button
          onClick={() => setShowManualEntry(true)}
          variant="outline"
          size="sm"
        >
          <Plus className="w-4 h-4 mr-1" />
          Add Time
        </Button>
      </div>

      <Modal
        isOpen={showManualEntry}
        onClose={() => setShowManualEntry(false)}
        title="Add Manual Time"
        size="sm"
      >
        <div className="space-y-4">
          <div className="flex gap-4">
            <Input
              label="Hours"
              type="number"
              min="0"
              value={manualHours}
              onChange={(e) => setManualHours(e.target.value)}
              placeholder="0"
            />
            <Input
              label="Minutes"
              type="number"
              min="0"
              max="59"
              value={manualMinutes}
              onChange={(e) => setManualMinutes(e.target.value)}
              placeholder="0"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setShowManualEntry(false)}>
              Cancel
            </Button>
            <Button onClick={handleManualAdd}>Add Time</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
