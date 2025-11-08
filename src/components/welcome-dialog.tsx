"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Sparkles, CheckCircle2 } from "lucide-react";

const WELCOME_SHOWN_KEY = "focus-flow:v1:welcome-shown";

/**
 * Welcome dialog shown to first-time users
 * Explains the app philosophy and key features
 */
export function WelcomeDialog() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const hasShownWelcome = localStorage.getItem(WELCOME_SHOWN_KEY);
    if (!hasShownWelcome) {
      // Show welcome dialog after a brief delay
      const timer = setTimeout(() => setIsOpen(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    localStorage.setItem(WELCOME_SHOWN_KEY, "true");
    setIsOpen(false);
  };

  const features = [
    {
      title: "Distraction-Free Focus",
      description:
        "Pomodoro timer, daily routines, and deep focus mode with Wake Lock API",
    },
    {
      title: "Visible Progress",
      description:
        "Points system, badges, and streaks for sustainable motivation",
    },
    {
      title: "Daily Reflection",
      description: "3-line journal with PDF export for review",
    },
    {
      title: "Private Data",
      description:
        "Everything stored locally in your browser. Zero external servers.",
    },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-6 w-6 text-primary" />
            <DialogTitle className="text-2xl">
              Welcome to Focus Flow
            </DialogTitle>
          </div>
          <DialogDescription className="text-base space-y-4 pt-4">
            <p>
              An ADHD-friendly system for career transition, built on the
              principle of{" "}
              <span className="font-semibold text-foreground">
                ritual &gt; gamification
              </span>
              .
            </p>

            <div className="space-y-3 py-4">
              {features.map((feature, index) => (
                <div key={index} className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-foreground">
                      {feature.title}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-muted rounded-lg p-4 mt-4">
              <p className="text-sm">
                <span className="font-semibold text-foreground">
                  We&apos;ve loaded:
                </span>
              </p>
              <ul className="text-sm text-muted-foreground mt-2 space-y-1 ml-4">
                <li>• 20 default routines organized by category</li>
                <li>• ADHD-optimized settings</li>
              </ul>
              <p className="text-sm text-muted-foreground mt-2">
                Customize everything in Routines and Settings pages.
              </p>
            </div>

            <p className="text-sm italic text-muted-foreground mt-4">
              &quot;Be kind to yourself. 1% progress per day is all you
              need.&quot;
            </p>
          </DialogDescription>
        </DialogHeader>

        <div className="flex justify-end gap-2 mt-4">
          <Button onClick={handleClose} size="lg" className="w-full sm:w-auto">
            Start Journey
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
