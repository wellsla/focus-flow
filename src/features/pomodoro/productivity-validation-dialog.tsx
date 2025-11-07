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
import { CheckCircle2, XCircle, AlertTriangle } from "lucide-react";
import type { PomodoroCategory } from "@/lib/types";

interface ProductivityValidationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category: PomodoroCategory;
  onValidate: (wasTrulyProductive: boolean) => void;
}

const CATEGORY_LABELS: Record<PomodoroCategory, string> = {
  "deep-learning": "Deep Learning",
  "active-coding": "Active Coding",
  "job-search": "Job Search",
  "tutorial-following": "Tutorial Following",
  "social-media": "Social Media",
  streaming: "Streaming",
  other: "Other",
};

export function ProductivityValidationDialog({
  open,
  onOpenChange,
  category,
  onValidate,
}: ProductivityValidationDialogProps) {
  const [validation, setValidation] = useState<"yes" | "no" | null>(null);

  const handleSubmit = () => {
    if (validation) {
      onValidate(validation === "yes");
      onOpenChange(false);
      setValidation(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            Honest Check-In
          </DialogTitle>
          <DialogDescription>
            You classified this session as{" "}
            <strong>{CATEGORY_LABELS[category]}</strong>.
          </DialogDescription>
        </DialogHeader>

        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Be brutally honest:</strong> Did you ACTUALLY do deep,
            focused work? Or did you get distracted, procrastinate, or just go
            through the motions?
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            This helps you see where your time REALLY goes. No judgment, just
            data.
          </p>

          <RadioGroup
            value={validation || undefined}
            onValueChange={(value) => setValidation(value as "yes" | "no")}
            className="space-y-3"
          >
            <div
              className="flex items-center space-x-3 p-4 rounded-lg border hover:bg-accent/50 cursor-pointer"
              onClick={() => setValidation("yes")}
            >
              <RadioGroupItem value="yes" id="productive-yes" />
              <div className="flex-1">
                <Label
                  htmlFor="productive-yes"
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span className="font-medium">Yes, I was productive</span>
                </Label>
                <p className="text-xs text-muted-foreground mt-1">
                  I accomplished what I intended and stayed focused
                </p>
              </div>
            </div>

            <div
              className="flex items-center space-x-3 p-4 rounded-lg border hover:bg-accent/50 cursor-pointer"
              onClick={() => setValidation("no")}
            >
              <RadioGroupItem value="no" id="productive-no" />
              <div className="flex-1">
                <Label
                  htmlFor="productive-no"
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <XCircle className="h-4 w-4 text-red-600" />
                  <span className="font-medium">No, I got distracted</span>
                </Label>
                <p className="text-xs text-muted-foreground mt-1">
                  I wasted time, lost focus, or didn&apos;t make real progress
                </p>
              </div>
            </div>
          </RadioGroup>
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Skip
          </Button>
          <Button onClick={handleSubmit} disabled={!validation}>
            Submit
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
