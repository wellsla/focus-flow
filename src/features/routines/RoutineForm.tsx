/**
 * RoutineForm.tsx
 *
 * Form for creating/editing routine items
 * ADHD-friendly: simple, clear fields, minimal options
 */

"use client";

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
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import type { RoutineItem, RoutineCategory, Frequency } from "@/lib/types";

const formSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  category: z.enum([
    "Morning",
    "During the Day",
    "Evening",
    "Weekly Routine",
    "Purpose and Direction",
    "Maintenance",
  ]),
  frequency: z.enum(["daily", "weekly", "monthly", "every3days"]),
  active: z.boolean(),
});

type FormValues = z.infer<typeof formSchema>;

interface RoutineFormProps {
  routine?: RoutineItem;
  onSubmit: (data: FormValues) => void;
  onDelete?: () => void;
}

const categoryDescriptions: Record<RoutineCategory, string> = {
  Morning: "First activities of the day",
  "During the Day": "Tasks throughout the day",
  Evening: "Routine before bed",
  "Weekly Routine": "Weekly activities",
  "Purpose and Direction": "Reflection and planning",
  Maintenance: "Care and organization",
};

const frequencyLabels: Record<Frequency, string> = {
  daily: "Daily",
  weekly: "Weekly (Sunday)",
  monthly: "Monthly (1st day)",
  every3days: "Every 3 days",
};

export function RoutineForm({ routine, onSubmit, onDelete }: RoutineFormProps) {
  const isEditing = !!routine;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: routine?.title || "",
      category: routine?.category || "Morning",
      frequency: routine?.frequency || "daily",
      active: routine?.active ?? true,
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Routine Title</FormLabel>
              <FormControl>
                <Input
                  placeholder="Ex: Make the bed"
                  {...field}
                  className="text-base"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {Object.entries(categoryDescriptions).map(([key, desc]) => (
                    <SelectItem key={key} value={key}>
                      <div className="flex flex-col items-start">
                        <span className="font-medium">{key}</span>
                        <span className="text-xs text-muted-foreground">
                          {desc}
                        </span>
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
          name="frequency"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Frequency</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {Object.entries(frequencyLabels).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>When this routine should appear</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="active"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Active</FormLabel>
                <FormDescription>
                  Temporarily disable to hide this routine
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="flex gap-2 pt-4">
          <Button type="submit" className="flex-1">
            {isEditing ? "Update Routine" : "Create Routine"}
          </Button>
          {isEditing && onDelete && (
            <Button type="button" variant="destructive" onClick={onDelete}>
              Delete
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
}
