"use client";

import React from 'react';
import Link from 'next/link';
import { ExternalLink } from 'lucide-react';

export function IntegrationButton() {
  return (
    <Link
      href="/zalo-accounts"
      className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      <ExternalLink className="mr-2 h-4 w-4" /> Tích hợp kênh
    </Link>
  );
}
