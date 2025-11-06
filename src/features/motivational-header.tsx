"use client";

import { useState, useEffect } from "react";
import { motivationalPhrases } from "@/lib/motivational-phrases";
import { AnimatePresence, motion } from "framer-motion";

export function MotivationalHeader() {
  const isClient = typeof window !== "undefined";
  const [index, setIndex] = useState(() =>
    // Avoid hydration mismatch by starting from 0 on the server
    isClient ? Math.floor(Math.random() * motivationalPhrases.length) : 0
  );

  useEffect(() => {
    if (!isClient) return;
    const interval = setInterval(() => {
      setIndex((prevIndex) => (prevIndex + 1) % motivationalPhrases.length);
    }, 15000); // Change phrase every 15 seconds
    return () => clearInterval(interval);
  }, [isClient]);

  if (!isClient) return null;

  const phrase = motivationalPhrases[index];

  return (
    <div className="text-center w-full h-full flex items-center justify-center px-4">
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.5 }}
          className="w-full"
        >
          <p className="text-xs text-muted-foreground italic">
            &ldquo;{phrase.quote}&rdquo;
            <span className="font-semibold not-italic"> — {phrase.author}</span>
          </p>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
