"use client";
"use no memo";

import { useState } from "react";
import { useForm, type UseFormReturn } from "react-hook-form";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, Brain, Code, Briefcase, DollarSign } from "lucide-react";
import type { RoutineReflection } from "@/lib/types";

interface RoutineReflectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  routineTitle: string;
  routineType?: "study" | "code" | "job-search" | "finances" | "general";
  routineId: string;
  onComplete: (reflection: RoutineReflection) => void;
}

// Study routine questions
const studySchema = z.object({
  q1: z.enum(["yes", "no"], { required_error: "Required" }),
  q2: z.enum(["yes", "no"], { required_error: "Required" }),
  q3: z.string().min(10, "At least 10 characters"),
});

// Code routine questions
const codeSchema = z.object({
  q1: z.enum(["yes", "no"], { required_error: "Required" }),
  q2: z.enum(["yes", "no"], { required_error: "Required" }),
  q3: z.enum(["yes", "no"], { required_error: "Required" }),
  q4: z.string().min(10, "At least 10 characters"),
});

// Job search routine questions
const jobSearchSchema = z.object({
  q1: z.enum(["yes", "no"], { required_error: "Required" }),
  q2: z.enum(["yes", "no"], { required_error: "Required" }),
  q3: z.string().min(20, "At least 20 characters"),
  q4: z.enum(["yes", "no"], { required_error: "Required" }),
});

// Finances routine questions
const financesSchema = z.object({
  q1: z.enum(["yes", "no"], { required_error: "Required" }),
  q2: z.string().min(15, "At least 15 characters"),
  q3: z.enum(["yes", "no"], { required_error: "Required" }),
});

// General routine questions
const generalSchema = z.object({
  q1: z.enum(["yes", "no"], { required_error: "Required" }),
  q2: z.enum(["yes", "no"], { required_error: "Required" }),
  q3: z.string().min(10, "At least 10 characters"),
});

export function RoutineReflectionDialog({
  open,
  onOpenChange,
  routineTitle,
  routineType = "study",
  routineId,
  onComplete,
}: RoutineReflectionDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Select schema based on routine type
  const getSchema = () => {
    switch (routineType) {
      case "study":
        return studySchema;
      case "code":
        return codeSchema;
      case "job-search":
        return jobSearchSchema;
      case "finances":
        return financesSchema;
      case "general":
        return generalSchema;
      default:
        return generalSchema;
    }
  };

  // Dynamic schema selection (each returns a ZodObject). Keep runtime schema but normalize RHF typing
  const activeSchema = getSchema();
  type RoutineFormValues = {
    q1?: string;
    q2?: string;
    q3?: string;
    q4?: string;
  };
  const form: UseFormReturn<RoutineFormValues> = useForm<RoutineFormValues>({
    defaultValues: {},
  });

  const getIcon = () => {
    switch (routineType) {
      case "study":
        return <Brain className="h-5 w-5" />;
      case "code":
        return <Code className="h-5 w-5" />;
      case "job-search":
        return <Briefcase className="h-5 w-5" />;
      case "finances":
        return <DollarSign className="h-5 w-5" />;
      default:
        return <Brain className="h-5 w-5" />;
    }
  };

  const getTitle = () => {
    switch (routineType) {
      case "study":
        return "Study Reflection";
      case "code":
        return "Coding Reflection";
      case "job-search":
        return "Job Search Reflection";
      case "finances":
        return "Financial Reflection";
      case "general":
        return "Routine Reflection";
      default:
        return "Routine Reflection";
    }
  };

  const handleSubmit = async (data: RoutineFormValues) => {
    setIsSubmitting(true);

    try {
      // Runtime validation using active schema to keep strictness without complex generics
      const parsed = activeSchema.safeParse(data);
      if (!parsed.success) {
        const fieldErrors = parsed.error.formErrors.fieldErrors;
        Object.entries(fieldErrors).forEach(([key, messages]) => {
          if (messages && messages.length) {
            form.setError(key as keyof RoutineFormValues, {
              type: "manual",
              message: messages[0],
            });
          }
        });
        return; // abort submit on validation error
      }
      // Convert form data to reflection format
      const questions: Record<string, string> = {};
      const keys = ["q1", "q2", "q3", "q4"] as const;
      for (const key of keys) {
        const value = data[key];
        if (value != null) {
          questions[key] = String(value);
        }
      }

      const reflection: RoutineReflection = {
        routineId,
        completedAt: new Date().toISOString(),
        questions,
      };

      // Call the completion handler
      onComplete(reflection);

      // Reset form for next use
      form.reset();

      // Close dialog
      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render Study Questions
  const renderStudyQuestions = () => (
    <>
      <FormField
        control={form.control}
        name="q1"
        render={({ field }) => (
          <FormItem className="space-y-3">
            <FormLabel>Can you explain what you learned?</FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                defaultValue={field.value}
                className="flex space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes" id="q1-yes" />
                  <label htmlFor="q1-yes">Yes</label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no" id="q1-no" />
                  <label htmlFor="q1-no">No</label>
                </div>
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="q2"
        render={({ field }) => (
          <FormItem className="space-y-3">
            <FormLabel>Do you know WHY this matters?</FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                defaultValue={field.value}
                className="flex space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes" id="q2-yes" />
                  <label htmlFor="q2-yes">Yes</label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no" id="q2-no" />
                  <label htmlFor="q2-no">No</label>
                </div>
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="q3"
        render={({ field }) => (
          <FormItem>
            <FormLabel>How will you apply this? (Be specific)</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Example: I'll use this pattern in my next React component..."
                className="min-h-[80px]"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );

  // Render Code Questions
  const renderCodeQuestions = () => (
    <>
      <FormField
        control={form.control}
        name="q1"
        render={({ field }) => (
          <FormItem className="space-y-3">
            <FormLabel>Did you learn it or just copy it?</FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                defaultValue={field.value}
                className="flex space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes" id="q1-yes" />
                  <label htmlFor="q1-yes">Learned</label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no" id="q1-no" />
                  <label htmlFor="q1-no">Copied</label>
                </div>
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="q2"
        render={({ field }) => (
          <FormItem className="space-y-3">
            <FormLabel>Can you explain this code to someone?</FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                defaultValue={field.value}
                className="flex space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes" id="q2-yes" />
                  <label htmlFor="q2-yes">Yes</label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no" id="q2-no" />
                  <label htmlFor="q2-no">No</label>
                </div>
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="q3"
        render={({ field }) => (
          <FormItem className="space-y-3">
            <FormLabel>Is this worth committing?</FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                defaultValue={field.value}
                className="flex space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes" id="q3-yes" />
                  <label htmlFor="q3-yes">Yes</label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no" id="q3-no" />
                  <label htmlFor="q3-no">No</label>
                </div>
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="q4"
        render={({ field }) => (
          <FormItem>
            <FormLabel>What did AI help with? What did YOU solve?</FormLabel>
            <FormControl>
              <Textarea
                placeholder="AI: Boilerplate setup. ME: Business logic and architecture decisions..."
                className="min-h-[80px]"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );

  // Render Job Search Questions
  const renderJobSearchQuestions = () => (
    <>
      <FormField
        control={form.control}
        name="q1"
        render={({ field }) => (
          <FormItem className="space-y-3">
            <FormLabel>Did you fully read the job description?</FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                defaultValue={field.value}
                className="flex space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes" id="q1-yes" />
                  <label htmlFor="q1-yes">Yes</label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no" id="q1-no" />
                  <label htmlFor="q1-no">No</label>
                </div>
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="q2"
        render={({ field }) => (
          <FormItem className="space-y-3">
            <FormLabel>Did you research the company?</FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                defaultValue={field.value}
                className="flex space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes" id="q2-yes" />
                  <label htmlFor="q2-yes">Yes</label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no" id="q2-no" />
                  <label htmlFor="q2-no">No</label>
                </div>
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="q3"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Why are you a good fit? (Specific reasons)</FormLabel>
            <FormControl>
              <Textarea
                placeholder="My experience with X matches their need for Y because..."
                className="min-h-[80px]"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="q4"
        render={({ field }) => (
          <FormItem className="space-y-3">
            <FormLabel>Did you customize your application?</FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                defaultValue={field.value}
                className="flex space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes" id="q4-yes" />
                  <label htmlFor="q4-yes">Yes</label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no" id="q4-no" />
                  <label htmlFor="q4-no">No</label>
                </div>
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );

  // Render Finances Questions
  const renderFinancesQuestions = () => (
    <>
      <FormField
        control={form.control}
        name="q1"
        render={({ field }) => (
          <FormItem className="space-y-3">
            <FormLabel>Did you review all transactions?</FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                defaultValue={field.value}
                className="flex space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes" id="q1-yes" />
                  <label htmlFor="q1-yes">Yes</label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no" id="q1-no" />
                  <label htmlFor="q1-no">No</label>
                </div>
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="q2"
        render={({ field }) => (
          <FormItem>
            <FormLabel>What pattern did you notice?</FormLabel>
            <FormControl>
              <Textarea
                placeholder="I spend too much on X, I should cut back on Y..."
                className="min-h-[80px]"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="q3"
        render={({ field }) => (
          <FormItem className="space-y-3">
            <FormLabel>Did you identify one action to improve?</FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                defaultValue={field.value}
                className="flex space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes" id="q3-yes" />
                  <label htmlFor="q3-yes">Yes</label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no" id="q3-no" />
                  <label htmlFor="q3-no">No</label>
                </div>
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );

  // Render General Questions
  const renderGeneralQuestions = () => (
    <>
      <FormField
        control={form.control}
        name="q1"
        render={({ field }) => (
          <FormItem className="space-y-3">
            <FormLabel>Did you complete this task fully?</FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                defaultValue={field.value}
                className="flex space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes" id="q1-yes" />
                  <label htmlFor="q1-yes">Yes</label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no" id="q1-no" />
                  <label htmlFor="q1-no">Partially</label>
                </div>
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="q2"
        render={({ field }) => (
          <FormItem className="space-y-3">
            <FormLabel>Did you do it mindfully or on autopilot?</FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                defaultValue={field.value}
                className="flex space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes" id="q2-yes" />
                  <label htmlFor="q2-yes">Mindfully</label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no" id="q2-no" />
                  <label htmlFor="q2-no">Autopilot</label>
                </div>
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="q3"
        render={({ field }) => (
          <FormItem>
            <FormLabel>What did you notice or learn?</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Any insights, observations, or improvements you noticed..."
                className="min-h-[80px]"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            {getIcon()}
            <DialogTitle>{getTitle()}</DialogTitle>
          </div>
          <DialogDescription>
            Before completing <strong>{routineTitle}</strong>, take a moment to
            reflect on your work.
          </DialogDescription>
        </DialogHeader>

        <Alert>
          <CheckCircle2 className="h-4 w-4" />
          <AlertDescription>
            These questions help prevent auto-pilot mode. Answer honestly to
            maximize learning.
          </AlertDescription>
        </Alert>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
          >
            {routineType === "study" && renderStudyQuestions()}
            {routineType === "code" && renderCodeQuestions()}
            {routineType === "job-search" && renderJobSearchQuestions()}
            {routineType === "finances" && renderFinancesQuestions()}
            {routineType === "general" && renderGeneralQuestions()}

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Complete Routine"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
