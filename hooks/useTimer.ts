'use client';

import { useState, useEffect } from 'react';

export function useSessionTimer(startedAt: string | null, durationMinutes: number) {
  const [remaining, setRemaining] = useState<number>(0);

  useEffect(() => {
    if (!startedAt) return;

    const endTime = new Date(startedAt).getTime() + durationMinutes * 60 * 1000;

    const update = () => {
      const left = endTime - Date.now();
      setRemaining(Math.max(0, left));
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [startedAt, durationMinutes]);

  const minutes = Math.floor(remaining / 60000);
  const seconds = Math.floor((remaining % 60000) / 1000);
  const isExpired = remaining <= 0 && !!startedAt;
  const isWarning = remaining > 0 && remaining <= 5 * 60 * 1000;

  return {
    remaining,
    minutes,
    seconds,
    isExpired,
    isWarning,
    formatted: `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`,
  };
}
