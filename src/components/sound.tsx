"use client";

import { useImperativeHandle, useRef, forwardRef, useEffect } from "react";

// A simple, short, and royalty-free sound from a public source.
const ALERT_SOUND_URL = "https://www.soundjay.com/buttons/sounds/button-16.mp3";

export interface SoundHandles {
  playSound: () => void;
}

export const Sound = forwardRef<SoundHandles, {}>((props, ref) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio element on the client after mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!audioRef.current) {
      const audio = new Audio(ALERT_SOUND_URL);
      audio.preload = "auto";
      audioRef.current = audio;
    }
    return () => {
      if (audioRef.current) {
        try {
          audioRef.current.pause();
        } catch {
          // ignore
        }
        audioRef.current = null;
      }
    };
  }, []);

  useImperativeHandle(ref, () => ({
    playSound() {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch((error) => {
          // Autoplay can be blocked by the browser, log error for debugging
          console.error("Audio play failed:", error);
        });
      }
    },
  }));

  // This component does not render anything to the DOM
  return null;
});

Sound.displayName = "Sound";
