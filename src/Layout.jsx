import React from 'react';

/**
 * Main application layout wrapper.
 * Provides a full-screen flex container with a consistent background.
 */
export function Layout({ children }) {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 text-gray-900">
      {children}
    </div>
  );
}
