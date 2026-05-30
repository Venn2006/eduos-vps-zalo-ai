import React from 'react';

export function EmptyState({ message }: { message: string }) {
  return (
    <div className="text-center p-10 border-2 border-dashed border-gray-300 rounded-lg">
      <p className="text-gray-500">{message}</p>
    </div>
  );
}
