"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/Button";

export default function SettingsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Settings Error Boundary caught:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
      <h2 className="text-xl font-bold text-red-600">Something went wrong in Settings!</h2>
      <p className="text-sm text-slate-500 font-mono bg-slate-100 p-4 rounded-lg max-w-2xl overflow-auto">
        {error.message || "Unknown error"}
        {error.stack && (
          <span className="block mt-2 whitespace-pre-wrap text-xs text-slate-400">
            {error.stack}
          </span>
        )}
      </p>
      <Button onClick={() => reset()}>Try again</Button>
    </div>
  );
}
