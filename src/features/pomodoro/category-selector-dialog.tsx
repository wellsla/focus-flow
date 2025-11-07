"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Brain,
  Code,
  Briefcase,
  BookOpen,
  Smartphone,
  Tv,
  HelpCircle,
  Info,
} from "lucide-react";
import type { PomodoroCategory } from "@/lib/types";

interface CategorySelectorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (category: PomodoroCategory) => void;
}

const CATEGORY_OPTIONS: {
  value: PomodoroCategory;
  label: string;
  description: string;
  icon: typeof Brain;
  type: "productive" | "semi-productive" | "wasted";
}[] = [
  {
    value: "deep-learning",
    label: "Deep Learning",
    description:
      "Studying new concepts, reading documentation, learning theory",
    icon: Brain,
    type: "productive",
  },
  {
    value: "active-coding",
    label: "Active Coding",
    description: "Building features, solving problems, writing original code",
    icon: Code,
    type: "productive",
  },
  {
    value: "job-search",
    label: "Job Search",
    description: "Researching companies, applying, networking, interview prep",
    icon: Briefcase,
    type: "productive",
  },
  {
    value: "tutorial-following",
    label: "Tutorial Following",
    description: "Coding along tutorials, copy-pasting examples",
    icon: BookOpen,
    type: "semi-productive",
  },
  {
    value: "social-media",
    label: "Social Media",
    description: "Browsing feeds, scrolling, casual content",
    icon: Smartphone,
    type: "wasted",
  },
  {
    value: "streaming",
    label: "Streaming/Entertainment",
    description: "Watching videos, Netflix, gaming, entertainment",
    icon: Tv,
    type: "wasted",
  },
  {
    value: "other",
    label: "Other",
    description: "Something else not listed here",
    icon: HelpCircle,
    type: "productive",
  },
];

export function CategorySelectorDialog({
  open,
  onOpenChange,
  onSelect,
}: CategorySelectorDialogProps) {
  const [selectedCategory, setSelectedCategory] =
    useState<PomodoroCategory | null>(null);

  const handleStart = () => {
    if (selectedCategory) {
      onSelect(selectedCategory);
      onOpenChange(false);
      setSelectedCategory(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            What will you focus on?
          </DialogTitle>
          <DialogDescription>
            Choose your activity type. This helps track where your deep work
            time goes.
          </DialogDescription>
        </DialogHeader>

        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            You&apos;ll validate if the time was truly productive after the
            session.
          </AlertDescription>
        </Alert>

        <RadioGroup
          value={selectedCategory || undefined}
          onValueChange={(value) =>
            setSelectedCategory(value as PomodoroCategory)
          }
          className="space-y-3"
        >
          {CATEGORY_OPTIONS.map((option) => {
            const Icon = option.icon;
            return (
              <div
                key={option.value}
                className="flex items-start space-x-3 p-4 rounded-lg border hover:bg-accent/50 cursor-pointer"
                onClick={() => setSelectedCategory(option.value)}
              >
                <RadioGroupItem value={option.value} id={option.value} />
                <div className="flex-1">
                  <Label
                    htmlFor={option.value}
                    className="flex items-center gap-2 cursor-pointer font-medium"
                  >
                    <Icon className="h-4 w-4" />
                    {option.label}
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    {option.description}
                  </p>
                </div>
              </div>
            );
          })}
        </RadioGroup>

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleStart} disabled={!selectedCategory}>
            Start Session
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
