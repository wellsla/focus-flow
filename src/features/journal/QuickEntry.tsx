/**
 * QuickEntry.tsx
 *
 * Fast 3-line journal entry (ADHD-friendly)
 * Simple form, minimal friction, focused reflection
 */

"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { JournalEntry } from "@/lib/types";
import { Smile, Meh, Frown } from "lucide-react";

const formSchema = z.object({
  mood: z.enum(["low", "ok", "high"]).optional(),
  line1: z.string().min(1, "How are you feeling?").max(500),
  line2: z.string().min(1, "What do you want to feel?").max(500),
  line3: z.string().min(1, "What is your anchor phrase?").max(500),
  tags: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface QuickEntryProps {
  onSubmit: (entry: Omit<JournalEntry, "id" | "dateISO">) => void;
  entry?: JournalEntry;
}

const moodIcons = {
  low: <Frown className="h-4 w-4" />,
  ok: <Meh className="h-4 w-4" />,
  high: <Smile className="h-4 w-4" />,
};

const moodLabels = {
  low: "Difficult",
  ok: "Neutral",
  high: "Great",
};

export function QuickEntry({ onSubmit, entry }: QuickEntryProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      mood: entry?.mood || undefined,
      line1: entry?.lines[0] || "",
      line2: entry?.lines[1] || "",
      line3: entry?.lines[2] || "",
      tags: entry?.tags?.join(", ") || "",
    },
  });

  const handleSubmit = async (values: FormValues) => {
    setIsSubmitting(true);

    const journalEntry: Omit<JournalEntry, "id" | "dateISO"> = {
      mood: values.mood,
      lines: [values.line1, values.line2, values.line3],
      tags: values.tags
        ? values.tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean)
        : undefined,
    };

    onSubmit(journalEntry);

    if (!entry) {
      form.reset();
    }

    setIsSubmitting(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {entry ? "Edit Entry" : "Quick Entry"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
          >
            <FormField
              control={form.control}
              name="mood"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>How is your day? (optional)</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your mood" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(moodLabels).map(([key, label]) => (
                        <SelectItem key={key} value={key}>
                          <div className="flex items-center gap-2">
                            {moodIcons[key as keyof typeof moodIcons]}
                            <span>{label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="line1"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-semibold">
                    1. How am I feeling right now?
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Ex: I'm anxious about the future, but hopeful..."
                      className="min-h-[100px] text-base resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="line2"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-semibold">
                    2. How do I want to feel?
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Ex: I want to feel confident and calm..."
                      className="min-h-[100px] text-base resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="line3"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-semibold">
                    3. My anchor phrase for today
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Ex: I am doing my best, and that is enough."
                      className="min-h-[100px] text-base resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="tags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tags (optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Ex: anxiety, work, self-care (comma separated)"
                      className="min-h-[60px] resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              size="lg"
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? "Saving..."
                : entry
                ? "Update Entry"
                : "Save Entry"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
