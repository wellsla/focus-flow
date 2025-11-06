"use client";

import { useEffect, useRef } from "react";
import confetti from "canvas-confetti";

/**
 * Hook for triggering confetti effects
 * Follows "ritual > gamification" - subtle, joyful celebration
 */
export function useConfetti() {
  const hasTriggeredRef = useRef<Set<string>>(new Set());

  const triggerConfetti = (badgeId?: string) => {
    // Prevent duplicate confetti for same badge in one session
    if (badgeId && hasTriggeredRef.current.has(badgeId)) {
      return;
    }

    if (badgeId) {
      hasTriggeredRef.current.add(badgeId);
    }

    // Subtle confetti from center
    const duration = 1500;
    const animationEnd = Date.now() + duration;
    const defaults = {
      startVelocity: 30,
      spread: 360,
      ticks: 60,
      zIndex: 0,
    };

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min;
    }

    const interval = window.setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        clearInterval(interval);
        return;
      }

      const particleCount = 50 * (timeLeft / duration);

      // Confetti from center
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.3, 0.7), y: Math.random() - 0.2 },
      });
    }, 250);
  };

  const resetSession = () => {
    hasTriggeredRef.current.clear();
  };

  return { triggerConfetti, resetSession };
}
