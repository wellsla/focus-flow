/**
 * use-sound.ts
 *
 * Hook for playing sound effects
 * Respects user preferences for reduced motion and sound
 */

"use client";

import { useCallback, useRef, useEffect } from "react";

interface UseSoundReturn {
  play: (soundUrl: string, volume?: number) => void;
  stop: () => void;
  canPlay: boolean;
}

export function useSound(): UseSoundReturn {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const canPlay = typeof window !== "undefined" && typeof Audio !== "undefined";

  // Check for prefers-reduced-motion
  const prefersReducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const play = useCallback(
    (soundUrl: string, volume = 0.5) => {
      if (!canPlay || prefersReducedMotion) {
        return;
      }

      try {
        // Stop previous sound if playing
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
        }

        const audio = new Audio(soundUrl);
        audio.volume = Math.max(0, Math.min(1, volume));
        audioRef.current = audio;

        audio.play().catch((error) => {
          console.warn("[sound] Failed to play audio:", error);
        });
      } catch (error) {
        console.error("[sound] Error creating audio:", error);
      }
    },
    [canPlay, prefersReducedMotion]
  );

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, []);

  return {
    play,
    stop,
    canPlay: canPlay && !prefersReducedMotion,
  };
}
