'use client';

import React from 'react';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { ProgressProvider } from '@/contexts/ProgressContext';
import { ServiceWorkerProvider } from './ServiceWorkerProvider';
import { AuthForm } from './AuthForm';
import { Dashboard } from './Dashboard';

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthForm />;
  }

  return (
    <ProgressProvider>
      <Dashboard />
    </ProgressProvider>
  );
}

export function ClientApp() {
  return (
    <ServiceWorkerProvider>
      <ThemeProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </ThemeProvider>
    </ServiceWorkerProvider>
  );
}
