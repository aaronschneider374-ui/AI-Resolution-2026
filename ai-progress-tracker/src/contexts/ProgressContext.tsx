'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import {
  collection,
  doc,
  setDoc,
  getDocs,
  query,
  where,
  onSnapshot,
  Firestore,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject, FirebaseStorage } from 'firebase/storage';
import { db as firebaseDb, storage as firebaseStorage } from '@/lib/firebase';
import { WeekProgress, Attachment, WEEKS_DATA, LeaderboardEntry } from '@/types';
import { useAuth } from './AuthContext';
import { v4 as uuidv4 } from 'uuid';

interface ProgressContextType {
  progress: WeekProgress[];
  loading: boolean;
  updateProgress: (weekId: number, data: Partial<WeekProgress>) => Promise<void>;
  toggleComplete: (weekId: number) => Promise<void>;
  updateNotes: (weekId: number, notes: string) => Promise<void>;
  startTimer: (weekId: number) => Promise<void>;
  stopTimer: (weekId: number) => Promise<void>;
  addManualTime: (weekId: number, seconds: number) => Promise<void>;
  uploadAttachment: (weekId: number, file: File) => Promise<void>;
  addLinkAttachment: (weekId: number, url: string, name: string) => Promise<void>;
  removeAttachment: (weekId: number, attachmentId: string) => Promise<void>;
  getNextIncompleteWeek: () => number | null;
  getCompletedCount: () => number;
  getTotalTimeSpent: () => number;
  leaderboard: LeaderboardEntry[];
}

const ProgressContext = createContext<ProgressContextType | undefined>(undefined);

export function ProgressProvider({ children }: { children: ReactNode }) {
  const { user, isDemoMode } = useAuth();
  const [progress, setProgress] = useState<WeekProgress[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  // Get Firebase instances
  const db = firebaseDb.current as Firestore | null;
  const storage = firebaseStorage.current as FirebaseStorage | null;

  // Initialize progress for all weeks
  const initializeProgress = useCallback((): WeekProgress[] => {
    return WEEKS_DATA.map((week) => ({
      id: `${user?.uid}-week-${week.id}`,
      weekId: week.id,
      userId: user?.uid || '',
      completed: false,
      notes: '',
      attachments: [],
      timeSpent: 0,
      timerStartedAt: null,
      completedAt: null,
      updatedAt: Date.now(),
      createdAt: Date.now(),
    }));
  }, [user?.uid]);

  // Load progress from Firebase or localStorage
  useEffect(() => {
    if (!user) {
      setProgress([]);
      setLoading(false);
      return;
    }

    if (isDemoMode) {
      // Demo mode: Load from localStorage
      const saved = localStorage.getItem('demoProgress');
      if (saved) {
        setProgress(JSON.parse(saved));
      } else {
        const initial = initializeProgress();
        setProgress(initial);
        localStorage.setItem('demoProgress', JSON.stringify(initial));
      }
      setLoading(false);
      return;
    }

    if (!db) {
      setLoading(false);
      return;
    }

    // Firebase mode: Subscribe to progress updates
    const progressRef = collection(db, 'progress');
    const q = query(progressRef, where('userId', '==', user.uid));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const existingProgress: WeekProgress[] = [];
      snapshot.forEach((doc) => {
        existingProgress.push(doc.data() as WeekProgress);
      });

      // Merge with initial progress for any missing weeks
      const initialProgress = initializeProgress();
      const mergedProgress = initialProgress.map((init) => {
        const existing = existingProgress.find((p) => p.weekId === init.weekId);
        return existing || init;
      });

      setProgress(mergedProgress);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, isDemoMode, initializeProgress, db]);

  // Load leaderboard
  useEffect(() => {
    if (isDemoMode || !db) {
      setLeaderboard([]);
      return;
    }

    const loadLeaderboard = async () => {
      try {
        const usersRef = collection(db, 'users');
        const usersSnapshot = await getDocs(query(usersRef, where('shareProgress', '==', true)));
        
        const entries: LeaderboardEntry[] = [];
        
        for (const userDoc of usersSnapshot.docs) {
          const userData = userDoc.data();
          const progressRef = collection(db, 'progress');
          const progressSnapshot = await getDocs(
            query(progressRef, where('userId', '==', userDoc.id))
          );
          
          let completedWeeks = 0;
          let totalTimeSpent = 0;
          let lastActivityAt = 0;
          
          progressSnapshot.forEach((doc) => {
            const data = doc.data() as WeekProgress;
            if (data.completed) completedWeeks++;
            totalTimeSpent += data.timeSpent || 0;
            if (data.updatedAt > lastActivityAt) lastActivityAt = data.updatedAt;
          });
          
          entries.push({
            uid: userDoc.id,
            displayName: userData.displayName || 'Anonymous',
            photoURL: userData.photoURL,
            completedWeeks,
            totalTimeSpent,
            lastActivityAt,
          });
        }
        
        // Sort by completed weeks, then by time spent
        entries.sort((a, b) => {
          if (b.completedWeeks !== a.completedWeeks) {
            return b.completedWeeks - a.completedWeeks;
          }
          return b.totalTimeSpent - a.totalTimeSpent;
        });
        
        setLeaderboard(entries);
      } catch (error) {
        console.error('Error loading leaderboard:', error);
      }
    };

    loadLeaderboard();
    const interval = setInterval(loadLeaderboard, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, [isDemoMode, db]);

  const saveProgress = useCallback(async (weekProgress: WeekProgress) => {
    if (isDemoMode) {
      const updatedProgress = progress.map((p) =>
        p.weekId === weekProgress.weekId ? weekProgress : p
      );
      setProgress(updatedProgress);
      localStorage.setItem('demoProgress', JSON.stringify(updatedProgress));
      return;
    }

    if (!db) return;
    await setDoc(doc(db, 'progress', weekProgress.id), weekProgress);
  }, [isDemoMode, progress, db]);

  const updateProgress = useCallback(async (weekId: number, data: Partial<WeekProgress>) => {
    const existingProgress = progress.find((p) => p.weekId === weekId);
    if (!existingProgress) return;

    const updatedProgress: WeekProgress = {
      ...existingProgress,
      ...data,
      updatedAt: Date.now(),
    };

    await saveProgress(updatedProgress);
  }, [progress, saveProgress]);

  const toggleComplete = useCallback(async (weekId: number) => {
    const existingProgress = progress.find((p) => p.weekId === weekId);
    if (!existingProgress) return;

    const isCompleting = !existingProgress.completed;
    await updateProgress(weekId, {
      completed: isCompleting,
      completedAt: isCompleting ? Date.now() : null,
    });
  }, [progress, updateProgress]);

  const updateNotes = useCallback(async (weekId: number, notes: string) => {
    await updateProgress(weekId, { notes });
  }, [updateProgress]);

  const startTimer = useCallback(async (weekId: number) => {
    await updateProgress(weekId, { timerStartedAt: Date.now() });
  }, [updateProgress]);

  const stopTimer = useCallback(async (weekId: number) => {
    const existingProgress = progress.find((p) => p.weekId === weekId);
    if (!existingProgress || !existingProgress.timerStartedAt) return;

    const elapsed = Math.floor((Date.now() - existingProgress.timerStartedAt) / 1000);
    await updateProgress(weekId, {
      timeSpent: existingProgress.timeSpent + elapsed,
      timerStartedAt: null,
    });
  }, [progress, updateProgress]);

  const addManualTime = useCallback(async (weekId: number, seconds: number) => {
    const existingProgress = progress.find((p) => p.weekId === weekId);
    if (!existingProgress) return;

    await updateProgress(weekId, {
      timeSpent: existingProgress.timeSpent + seconds,
    });
  }, [progress, updateProgress]);

  const uploadAttachment = useCallback(async (weekId: number, file: File) => {
    const existingProgress = progress.find((p) => p.weekId === weekId);
    if (!existingProgress || !user) return;

    const attachmentId = uuidv4();
    const isImage = file.type.startsWith('image/');
    
    let url: string;
    
    if (isDemoMode || !storage) {
      // Demo mode: Use data URL
      url = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
    } else {
      // Firebase Storage
      const storageRef = ref(storage, `attachments/${user.uid}/${weekId}/${attachmentId}-${file.name}`);
      await uploadBytes(storageRef, file);
      url = await getDownloadURL(storageRef);
    }

    const attachment: Attachment = {
      id: attachmentId,
      type: isImage ? 'image' : 'file',
      url,
      name: file.name,
      uploadedAt: Date.now(),
    };

    await updateProgress(weekId, {
      attachments: [...existingProgress.attachments, attachment],
    });
  }, [progress, user, isDemoMode, storage, updateProgress]);

  const addLinkAttachment = useCallback(async (weekId: number, url: string, name: string) => {
    const existingProgress = progress.find((p) => p.weekId === weekId);
    if (!existingProgress) return;

    const attachment: Attachment = {
      id: uuidv4(),
      type: 'link',
      url,
      name: name || url,
      uploadedAt: Date.now(),
    };

    await updateProgress(weekId, {
      attachments: [...existingProgress.attachments, attachment],
    });
  }, [progress, updateProgress]);

  const removeAttachment = useCallback(async (weekId: number, attachmentId: string) => {
    const existingProgress = progress.find((p) => p.weekId === weekId);
    if (!existingProgress || !user) return;

    const attachment = existingProgress.attachments.find((a) => a.id === attachmentId);
    
    if (attachment && attachment.type !== 'link' && !isDemoMode && storage && !attachment.url.startsWith('data:')) {
      // Delete from Firebase Storage
      try {
        const storageRef = ref(storage, attachment.url);
        await deleteObject(storageRef);
      } catch (error) {
        console.error('Error deleting attachment from storage:', error);
      }
    }

    await updateProgress(weekId, {
      attachments: existingProgress.attachments.filter((a) => a.id !== attachmentId),
    });
  }, [progress, user, isDemoMode, storage, updateProgress]);

  const getNextIncompleteWeek = useCallback((): number | null => {
    for (let i = 1; i <= 10; i++) {
      const weekProgress = progress.find((p) => p.weekId === i);
      if (!weekProgress || !weekProgress.completed) {
        return i;
      }
    }
    return null; // All weeks completed
  }, [progress]);

  const getCompletedCount = useCallback((): number => {
    return progress.filter((p) => p.completed).length;
  }, [progress]);

  const getTotalTimeSpent = useCallback((): number => {
    return progress.reduce((total, p) => total + (p.timeSpent || 0), 0);
  }, [progress]);

  return (
    <ProgressContext.Provider
      value={{
        progress,
        loading,
        updateProgress,
        toggleComplete,
        updateNotes,
        startTimer,
        stopTimer,
        addManualTime,
        uploadAttachment,
        addLinkAttachment,
        removeAttachment,
        getNextIncompleteWeek,
        getCompletedCount,
        getTotalTimeSpent,
        leaderboard,
      }}
    >
      {children}
    </ProgressContext.Provider>
  );
}

export function useProgress() {
  const context = useContext(ProgressContext);
  if (context === undefined) {
    throw new Error('useProgress must be used within a ProgressProvider');
  }
  return context;
}
