"use client";

import { useState, useEffect } from "react";
import { X, Lightbulb } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import type { FlashReminder } from "@/lib/types";

interface FlashBarProps {
  reminder: FlashReminder;
  onDismiss: () => void;
}

/**
 * FlashBar: Discrete, dismissible reminder that appears at the top
 * Follows ADHD-friendly design: clear, brief, easy to dismiss
 */
export function FlashBar({ reminder, onDismiss }: FlashBarProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Fade in after mount
    const showTimer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(showTimer);
  }, []);

  const handleDismiss = () => {
    setIsExiting(true);
    setTimeout(() => {
      onDismiss();
    }, 300); // Match animation duration
  };

  return (
    <div
      className={`
        fixed top-4 left-1/2 -translate-x-1/2 z-40 w-full max-w-2xl px-4
        transition-all duration-300 ease-in-out
        ${
          isVisible && !isExiting
            ? "opacity-100 translate-y-0"
            : "opacity-0 -translate-y-4"
        }
      `}
    >
      <Alert className="border-amber-500/50 bg-amber-50 dark:bg-amber-950/20 shadow-lg">
        <Lightbulb className="h-5 w-5 text-amber-600 dark:text-amber-500" />
        <AlertDescription className="ml-2 flex items-center justify-between gap-4">
          <p className="text-base font-medium text-foreground flex-1">
            {reminder.text}
          </p>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className="h-8 w-8 p-0 hover:bg-amber-100 dark:hover:bg-amber-900"
            aria-label="Dismiss reminder"
          >
            <X className="h-4 w-4" />
          </Button>
        </AlertDescription>
      </Alert>
    </div>
  );
}
