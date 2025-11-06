"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Goal, GoalTimeframe, GoalStatus, DailyLog } from "@/lib/types";
import { PlusCircle, Target, History } from "lucide-react";
import { cn } from "@/lib/utils";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { format, parseISO } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FormDialog } from "@/components/form-dialog";
import useLocalStorage from "@/hooks/use-local-storage";
import { Skeleton } from "@/components/ui/skeleton";
import { HistoryDialog } from "../../../features/history-dialog";
import {
  goals as initialGoals,
  dailyLogs as initialDailyLogs,
} from "@/lib/data";

const statusConfig: Record<GoalStatus, { label: string; color: string }> = {
  "Not Started": {
    label: "Not Started",
    color: "bg-muted text-muted-foreground",
  },
  "In Progress": { label: "In Progress", color: "bg-blue-200 text-blue-800" },
  Achieved: { label: "Achieved", color: "bg-green-200 text-green-800" },
};

const renderGoalLog = (log: DailyLog) => (
  <div className="space-y-4">
    {log.goals.length > 0 ? (
      log.goals.map((goalLog) => (
        <Card key={goalLog.status}>
          <CardHeader className="p-4">
            <CardTitle className="text-base flex justify-between items-center">
              <span>{goalLog.status}</span>
              <Badge variant="secondary">{goalLog.count}</Badge>
            </CardTitle>
          </CardHeader>
        </Card>
      ))
    ) : (
      <p className="text-muted-foreground text-center">
        No goal data logged for this day.
      </p>
    )}
  </div>
);

const GoalCard = ({
  goal,
  onSelect,
}: {
  goal: Goal;
  onSelect: (goal: Goal) => void;
}) => {
  return (
    <Card
      className="cursor-pointer hover:shadow-lg transition-shadow"
      onClick={() => onSelect(goal)}
    >
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{goal.title}</CardTitle>
          <Badge
            variant="outline"
            className={cn(
              "text-xs font-normal",
              statusConfig[goal.status].color
            )}
          >
            {statusConfig[goal.status].label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">{goal.description}</p>
        {goal.targetDate && (
          <p className="text-xs text-muted-foreground">
            Target: {format(parseISO(goal.targetDate), "PPP")}
          </p>
        )}
      </CardContent>
    </Card>
  );
};

const formSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters."),
  description: z.string().min(5, "Description must be at least 5 characters."),
  status: z
    .enum(["Not Started", "In Progress", "Achieved"])
    .default("Not Started"),
  timeframe: z.enum(["Short-Term", "Mid-Term", "Long-Term"]),
  targetDate: z.date().optional(),
});

type GoalFormValues = z.input<typeof formSchema>;

const GoalForm = ({
  goal,
  onGoalSubmit,
  onGoalDelete,
}: {
  goal?: Goal | null;
  onGoalSubmit: (goal: Goal) => void;
  onGoalDelete?: (id: string) => void;
}) => {
  const isEditing = !!goal;
  const form = useForm<GoalFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: goal?.title || "",
      description: goal?.description || "",
      status: goal?.status || "Not Started",
      timeframe: goal?.timeframe || "Short-Term",
      targetDate: goal?.targetDate ? new Date(goal.targetDate) : undefined,
    },
  });

  // CRITICAL FIX: Only reset form when goal ID changes, not on every form change
  useEffect(() => {
    form.reset({
      title: goal?.title || "",
      description: goal?.description || "",
      status: goal?.status || "Not Started",
      timeframe: goal?.timeframe || "Short-Term",
      targetDate: goal?.targetDate ? new Date(goal.targetDate) : undefined,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [goal?.id]); // Only depend on goal ID to prevent loops

  function onSubmit(values: GoalFormValues) {
    const newGoal: Goal = {
      id:
        goal?.id ||
        (typeof crypto !== "undefined" && "randomUUID" in crypto
          ? (crypto as any).randomUUID()
          : new Date().toISOString()),
      title: values.title,
      description: values.description,
      status: values.status ?? "Not Started",
      timeframe: values.timeframe,
      targetDate: values.targetDate
        ? format(values.targetDate, "yyyy-MM-dd")
        : undefined,
    };
    onGoalSubmit(newGoal);
    form.reset();
  }

  const handleDelete = () => {
    if (goal && onGoalDelete) {
      onGoalDelete(goal.id);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Goal Title</FormLabel>
              <FormControl>
                <Input
                  placeholder="E.g., Land a Frontend Developer Job"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea placeholder="Describe your goal..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {Object.entries(statusConfig).map(([key, value]) => (
                    <SelectItem key={key} value={key}>
                      {value.label}
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
          name="timeframe"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Timeframe</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a timeframe" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Short-Term">
                    Short-Term (1-3 months)
                  </SelectItem>
                  <SelectItem value="Mid-Term">
                    Mid-Term (3-12 months)
                  </SelectItem>
                  <SelectItem value="Long-Term">Long-Term (1+ year)</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="targetDate"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Target Date (Optional)</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(field.value, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}{" "}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-between">
          <Button type="submit" className="flex-grow">
            {isEditing ? "Update Goal" : "Add Goal"}
          </Button>
          {isEditing && onGoalDelete && (
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              className="ml-2"
            >
              Delete
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
};

export default function GoalsPage() {
  const [goals, setGoals, loadingGoals] = useLocalStorage<Goal[]>(
    "goals",
    initialGoals
  );
  const [dailyLogs, setDailyLogs, loadingLogs] = useLocalStorage<DailyLog[]>(
    "dailyLogs",
    initialDailyLogs
  );
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { toast } = useToast();

  const handleGoalSelect = (goal: Goal) => {
    setSelectedGoal(goal);
    setIsFormOpen(true);
  };

  const handleGoalSubmit = (goal: Goal) => {
    setGoals((prev) => {
      const exists = prev.some((g) => g.id === goal.id);
      return exists
        ? prev.map((g) => (g.id === goal.id ? goal : g))
        : [...prev, goal];
    });
    setIsFormOpen(false);
    setSelectedGoal(null);
    toast({
      title: "Goal Saved",
      description: `Your goal "${goal.title}" has been saved.`,
    });
  };

  const handleGoalDelete = (goalId: string) => {
    const goalToDelete = goals.find((g) => g.id === goalId);
    setGoals((prev) => prev.filter((g) => g.id !== goalId));
    toast({
      title: "Goal Deleted",
      variant: "destructive",
      description: `Goal "${goalToDelete?.title}" has been removed.`,
    });
  };

  const loading = loadingGoals || loadingLogs;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid md:grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          <div className="space-y-4">
            <Skeleton className="h-8 w-40" />
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-8 w-40" />
            <Skeleton className="h-40 w-full" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-8 w-40" />
          </div>
        </div>
      </div>
    );
  }

  const goalsByTimeframe = (timeframe: GoalTimeframe) =>
    goals.filter((g) => g.timeframe === timeframe);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold font-headline tracking-tight">
            Your Goals
          </h1>
          <p className="text-muted-foreground">
            Define your short, mid, and long-term goals to stay focused on your
            purpose.
          </p>
        </div>
        <div className="flex gap-2">
          <HistoryDialog
            triggerButton={
              <Button variant="outline">
                <History className="mr-2 h-4 w-4" /> View History
              </Button>
            }
            title="Daily Goal Summary"
            description="Review your goal status counts for any given day in the past."
            logs={dailyLogs}
            getLogDate={(log) => parseISO(log.date)}
            renderLog={renderGoalLog}
          />
          <FormDialog
            isOpen={isFormOpen}
            setIsOpen={setIsFormOpen}
            title={selectedGoal ? "Edit Goal" : "Add a New Goal"}
            description={
              selectedGoal
                ? "Update your goal details."
                : "Define a new goal to work towards."
            }
            triggerButton={
              <Button
                onClick={() => {
                  setSelectedGoal(null);
                  setIsFormOpen(true);
                }}
              >
                <PlusCircle className="mr-2 h-4 w-4" /> Add Goal
              </Button>
            }
            onCloseAutoFocus={() => setSelectedGoal(null)}
          >
            <GoalForm
              goal={selectedGoal}
              onGoalSubmit={handleGoalSubmit}
              onGoalDelete={handleGoalDelete}
            />
          </FormDialog>
        </div>
      </div>

      <div className="grid md:grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {(["Short-Term", "Mid-Term", "Long-Term"] as GoalTimeframe[]).map(
          (timeframe) => (
            <div key={timeframe} className="space-y-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" /> {timeframe}
              </h2>
              <div className="space-y-4">
                {goalsByTimeframe(timeframe).length > 0 ? (
                  goalsByTimeframe(timeframe).map((goal) => (
                    <GoalCard
                      key={goal.id}
                      goal={goal}
                      onSelect={handleGoalSelect}
                    />
                  ))
                ) : (
                  <p className="text-muted-foreground p-4 text-center bg-card rounded-lg">
                    No {timeframe.toLowerCase()} goals yet.
                  </p>
                )}
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}
