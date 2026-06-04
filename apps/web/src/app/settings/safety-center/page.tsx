import React from 'react';
import { SafetyCenterClient } from './SafetyCenterClient';

export const metadata = {
  title: 'Trung tâm an toàn | EduOS',
  description: 'Connector readiness and safety dashboard',
};

export default function SafetyCenterPage() {
  return (
    <div className="max-w-6xl mx-auto py-6">
      <SafetyCenterClient />
    </div>
  );
}
