import React from 'react';

export function TablePlaceholder() {
  return (
    <div className="w-full h-48 bg-gray-100 animate-pulse rounded-lg flex items-center justify-center border border-gray-200">
      <span className="text-gray-400">Loading data...</span>
    </div>
  );
}
