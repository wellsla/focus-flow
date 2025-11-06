/**
 * use-focus-lock.ts
 *
 * Hook for managing focus mode state
 * Blocks navigation, keeps wake lock, tracks focus time
 */

"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import type { FocusBlock } from "@/lib/types";
import { loadFocusBlocks, saveFocusBlocks } from "@/lib/storage";

interface UseFocusLockOptions {
  onComplete?: () => void;
  allowedRoutes?: string[];
}

export function useFocusLock(options: UseFocusLockOptions = {}) {
  const { onComplete, allowedRoutes = ["/focus"] } = options;
  const router = useRouter();
  const [isLocked, setIsLocked] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);

  /**
   * Request wake lock to keep screen active
   */
  const requestWakeLock = async () => {
    if ("wakeLock" in navigator) {
      try {
        const wakeLock = await navigator.wakeLock.request("screen");
        wakeLockRef.current = wakeLock;
        console.info("[focus] Wake lock acquired");

        wakeLock.addEventListener("release", () => {
          console.info("[focus] Wake lock released");
        });
      } catch (error) {
        console.error("[focus] Failed to acquire wake lock:", error);
      }
    }
  };

  /**
   * Release wake lock
   */
  const releaseWakeLock = async () => {
    if (wakeLockRef.current) {
      try {
        await wakeLockRef.current.release();
        wakeLockRef.current = null;
      } catch (error) {
        console.error("[focus] Failed to release wake lock:", error);
      }
    }
  };

  /**
   * Start focus mode
   */
  const startFocus = useCallback(async () => {
    setIsLocked(true);
    setStartTime(new Date());
    await requestWakeLock();

    console.info("[focus] Focus mode started");
  }, []);

  /**
   * End focus mode and save session
   */
  const endFocus = useCallback(async () => {
    if (!startTime) return;

    const endTime = new Date();
    const durationMinutes = Math.round(
      (endTime.getTime() - startTime.getTime()) / 60000
    );

    // Save focus block
    const block: FocusBlock = {
      id: `focus-${Date.now()}`,
      startedAt: startTime.toISOString(),
      endedAt: endTime.toISOString(),
      plannedMin: durationMinutes,
      whitelistRoutes: allowedRoutes,
      strict: false,
      completed: true,
    };

    const blocks = loadFocusBlocks();
    blocks.push(block);
    saveFocusBlocks(blocks);

    setIsLocked(false);
    setStartTime(null);
    await releaseWakeLock();

    console.info(`[focus] Focus session ended: ${durationMinutes} minutes`);

    onComplete?.();
  }, [startTime, allowedRoutes, onComplete]);

  /**
   * Handle route changes - block if not in whitelist
   */
  useEffect(() => {
    if (!isLocked) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
      return "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isLocked]);

  /**
   * Re-acquire wake lock on visibility change
   */
  useEffect(() => {
    if (!isLocked) return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && !wakeLockRef.current) {
        requestWakeLock();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [isLocked]);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      if (wakeLockRef.current) {
        releaseWakeLock();
      }
    };
  }, []);

  const [elapsedMinutes, setElapsedMinutes] = useState(0);

  // Update elapsed time every minute
  useEffect(() => {
    if (!isLocked || !startTime) return;

    const updateElapsed = () => {
      const elapsed = Math.floor((Date.now() - startTime.getTime()) / 60000);
      setElapsedMinutes(elapsed);
    };

    updateElapsed();
    const interval = setInterval(updateElapsed, 60000);

    return () => clearInterval(interval);
  }, [isLocked, startTime]);

  return {
    isLocked,
    startFocus,
    endFocus,
    elapsedMinutes,
    startTime,
  };
}
