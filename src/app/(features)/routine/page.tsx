"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Priority,
  TaskStatus,
  DailyLog,
  RoadmapNode,
  RoadmapNodeStatus,
} from "@/lib/types";
import { RoutinePeriod } from "@/lib/schedule";
import { PlusCircle, Tag, Clock, CircleDot, Bell, History } from "lucide-react";
import { cn } from "@/lib/utils";
import { useForm, useWatch } from "react-hook-form";
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
import {
  format,
  isWithinInterval,
  parse,
  parseISO,
  differenceInMinutes,
  isBefore,
  addDays,
  isToday,
  subDays,
} from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FormDialog } from "@/components/form-dialog";
import useLocalStorage from "@/hooks/use-local-storage";
import { Sound, SoundHandles } from "@/components/sound";
import {
  legacyTasks as initialTasks,
  roadmap as initialRoadmap,
  LegacyTask,
  LegacyTaskStatus,
} from "@/lib/legacy-data";
import { Skeleton } from "@/components/ui/skeleton";
import { HistoryDialog } from "../../../features/history-dialog";

const priorityColors: Record<Priority, string> = {
  low: "text-blue-500",
  medium: "text-yellow-500",
  high: "text-red-500",
};

const statusConfig: Record<LegacyTaskStatus, { label: string; color: string }> =
  {
    todo: { label: "To Do", color: "bg-muted text-muted-foreground" },
    "in-progress": { label: "In Progress", color: "bg-blue-200 text-blue-800" },
    done: { label: "Done", color: "bg-green-200 text-green-800" },
    skipped: { label: "Skipped", color: "bg-stone-200 text-stone-800" },
  };

const renderTaskLog = (log: DailyLog) => (
  <div className="space-y-4">
    {log.tasks.length > 0 ? (
      log.tasks.map((taskLog) => (
        <Card key={taskLog.status}>
          <CardHeader className="p-4">
            <CardTitle className="text-base flex justify-between items-center">
              <span>
                {statusConfig[taskLog.status as LegacyTaskStatus]?.label ||
                  taskLog.status}
              </span>
              <Badge variant="secondary">{taskLog.count}</Badge>
            </CardTitle>
          </CardHeader>
        </Card>
      ))
    ) : (
      <p className="text-muted-foreground text-center">
        No task data logged for this day.
      </p>
    )}
  </div>
);

const isTimeInRange = (
  startTime: string,
  endTime: string,
  now: Date
): boolean => {
  if (!startTime || !endTime) return false;

  const today = new Date(now);
  today.setSeconds(0, 0);

  const start = parse(startTime, "HH:mm", today);
  let end = parse(endTime, "HH:mm", today);

  if (isBefore(end, start)) {
    if (now >= start) {
      end = addDays(end, 1);
    } else {
      const previousDayStart = subDays(start, 1);
      return isWithinInterval(now, { start: previousDayStart, end: end });
    }
  }

  return isWithinInterval(now, { start, end });
};

const isUpcoming = (startTime: string, now: Date): boolean => {
  if (!startTime) return false;
  const start = parse(startTime, "HH:mm", new Date());
  start.setFullYear(now.getFullYear(), now.getMonth(), now.getDate());
  const diff = differenceInMinutes(start, now);
  return diff > 0 && diff <= 60;
};

const TaskItem = ({
  task,
  onSelect,
  onStatusChange,
}: {
  task: LegacyTask;
  onSelect: (task: LegacyTask) => void;
  onStatusChange: (taskId: string, status: TaskStatus) => void;
}) => {
  const [isNow, setIsNow] = useState(false);
  const [isSoon, setIsSoon] = useState(false);

  useEffect(() => {
    const checkTime = () => {
      const now = new Date();
      setIsNow(isTimeInRange(task.startTime!, task.endTime!, now));
      setIsSoon(isUpcoming(task.startTime!, now));
    };
    checkTime();
    const interval = setInterval(checkTime, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [task.startTime, task.endTime]);

  const handleSelectClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div
      className={cn(
        "flex items-start space-x-4 p-4 border-b transition-colors",
        {
          "bg-primary/10": isNow,
        }
      )}
      onClick={() => onSelect(task)}
    >
      <div className="flex-1 cursor-pointer">
        <div className="flex justify-between items-start">
          <div className="pr-4">
            <p
              className={cn(
                "font-medium",
                task.status === "done" && "line-through text-muted-foreground"
              )}
            >
              {task.title}
            </p>
            {task.dueDate && (
              <p className="text-sm text-muted-foreground">
                Due: {format(task.dueDate, "PPP")}
              </p>
            )}
            <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
              {task.startTime && task.endTime && (
                <div className="flex items-center gap-1.5">
                  <Clock className="h-3 w-3" />
                  <span>
                    {task.startTime} - {task.endTime}
                  </span>
                </div>
              )}
              {task.priority && (
                <div className="flex items-center gap-1.5">
                  <Tag
                    className={cn("h-3 w-3", priorityColors[task.priority])}
                  />
                  <span className="capitalize">{task.priority}</span>
                </div>
              )}
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div onClick={handleSelectClick}>
              <Select
                value={task.status}
                onValueChange={(newStatus: TaskStatus) =>
                  onStatusChange(task.id, newStatus)
                }
              >
                <SelectTrigger
                  className={cn(
                    "h-auto w-auto min-w-[110px] justify-between text-xs font-normal border-none focus:ring-0",
                    statusConfig[task.status].color
                  )}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(statusConfig).map(([key, value]) => (
                    <SelectItem key={key} value={key} className="text-xs">
                      {value.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {isNow && (
              <Badge
                variant="default"
                className="bg-accent text-accent-foreground text-xs animate-pulse"
              >
                <CircleDot className="h-3 w-3 mr-1" /> Now
              </Badge>
            )}
            {isSoon && !isNow && (
              <Badge variant="secondary" className="text-xs">
                <Bell className="h-3 w-3 mr-1" /> Upcoming
              </Badge>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const formSchema = z
  .object({
    title: z.string().min(2, "Title must be at least 2 characters."),
    status: z.enum(["todo", "in-progress", "done", "skipped"]).default("todo"),
    isGeneral: z.boolean().default(false),
    period: z.enum(["morning", "afternoon", "evening"]).optional(),
    dueDate: z.date().optional(),
    priority: z.enum(["low", "medium", "high"]).optional(),
    startTime: z.string().optional(),
    endTime: z.string().optional(),
  })
  .refine((data) => (data.isGeneral ? !!data.dueDate : !!data.period), {
    message: "Routine tasks need a period, and general tasks need a due date.",
    path: ["isGeneral"],
  })
  .refine(
    (data) => {
      if (data.startTime && data.endTime) {
        return true;
      }
      return true;
    },
    {
      message: "End time must be after start time.",
      path: ["endTime"],
    }
  );

type TaskFormValues = z.input<typeof formSchema>;

const AddTaskForm = ({
  task,
  onTaskSubmit,
  onTaskDelete,
  isRoadmapTask,
}: {
  task?: LegacyTask | null;
  onTaskSubmit: (task: LegacyTask) => void;
  onTaskDelete?: (id: string) => void;
  isRoadmapTask?: boolean;
}) => {
  const isEditing = !!task;
  const form = useForm<TaskFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: task?.title || "",
      status: task?.status || "todo",
      isGeneral: isRoadmapTask || !!task?.dueDate,
      period: task?.period,
      dueDate: task?.dueDate
        ? new Date(task.dueDate)
        : isRoadmapTask
        ? new Date()
        : undefined,
      priority: task?.priority,
      startTime: task?.startTime || "",
      endTime: task?.endTime || "",
    },
  });

  const isGeneral = useWatch({ control: form.control, name: "isGeneral" });

  // CRITICAL FIX: Only reset form when task ID or roadmap flag changes, not on every form change
  useEffect(() => {
    form.reset({
      title: task?.title || "",
      status: task?.status || "todo",
      isGeneral: isRoadmapTask || !!task?.dueDate,
      period: task?.period,
      dueDate: task?.dueDate
        ? new Date(task.dueDate)
        : isRoadmapTask
        ? new Date()
        : undefined,
      priority: task?.priority,
      startTime: task?.startTime || "",
      endTime: task?.endTime || "",
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [task?.id, isRoadmapTask]); // Only depend on task ID and roadmap flag to prevent loops

  function onSubmit(values: TaskFormValues) {
    const newTask: LegacyTask = {
      id: task?.id || new Date().toISOString(),
      title: values.title,
      status: values.status ?? "todo",
      priority: values.priority,
      startTime: values.startTime,
      endTime: values.endTime,
      ...((values.isGeneral ? true : false)
        ? {
            dueDate: values.dueDate || undefined,
          }
        : { period: values.period }),
    };
    onTaskSubmit(newTask);
  }

  const handleDelete = () => {
    if (task && onTaskDelete) {
      onTaskDelete(task.id);
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
              <FormLabel>Task Title</FormLabel>
              <FormControl>
                <Input placeholder="E.g., Finish report" {...field} />
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
          name="isGeneral"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={!!field.value}
                  onCheckedChange={(v) => field.onChange(!!v)}
                  disabled={isRoadmapTask}
                />
              </FormControl>
              <FormLabel>General Task (no routine)</FormLabel>
            </FormItem>
          )}
        />

        {isGeneral ? (
          <FormField
            control={form.control}
            name="dueDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Due Date</FormLabel>
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
        ) : (
          <FormField
            control={form.control}
            name="period"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Period of Day</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a period" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="morning">Morning</SelectItem>
                    <SelectItem value="afternoon">Afternoon</SelectItem>
                    <SelectItem value="evening">Evening</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="startTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Start Time</FormLabel>
                <FormControl>
                  <Input type="time" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="endTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>End Time</FormLabel>
                <FormControl>
                  <Input type="time" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="priority"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Priority</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-between">
          <Button type="submit" className="flex-grow">
            {isEditing ? "Update Task" : "Add Task"}
          </Button>
          {isEditing && onTaskDelete && (
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
      </form>{" "}
    </Form>
  );
};

const taskStatusToRoadmapStatus: Record<LegacyTaskStatus, RoadmapNodeStatus> = {
  todo: "todo",
  "in-progress": "in_progress",
  done: "done",
  skipped: "skipped",
};

function findAndReplaceNode(
  root: RoadmapNode,
  updatedNode: RoadmapNode
): RoadmapNode {
  if (root.id === updatedNode.id) {
    return updatedNode;
  }
  return {
    ...root,
    children: root.children.map((child) =>
      findAndReplaceNode(child, updatedNode)
    ),
  };
}

function findNodeByTaskTitle(
  root: RoadmapNode,
  taskTitle: string
): RoadmapNode | null {
  const nodeName = taskTitle.replace("Study: ", "");
  function find(node: RoadmapNode): RoadmapNode | null {
    if (node.name === nodeName) return node;
    for (const child of node.children) {
      const found = find(child);
      if (found) return found;
    }
    return null;
  }
  return find(root);
}

function RoutinePageContent() {
  const searchParams = useSearchParams();
  const [tasks, setTasks, loadingTasks] = useLocalStorage<LegacyTask[]>(
    "tasks",
    initialTasks
  );
  const [dailyLogs, setDailyLogs, loadingLogs] = useLocalStorage<DailyLog[]>(
    "dailyLogs",
    []
  );
  const [roadmapData, setRoadmapData] = useLocalStorage<RoadmapNode>(
    "roadmap",
    initialRoadmap
  );
  const [selectedTask, setSelectedTask] = useState<LegacyTask | null>(() => {
    const prefillTaskTitle = searchParams.get("prefillTask");
    const taskId = searchParams.get("taskId");
    const isFromRoadmap = searchParams.get("isRoadmapTask") === "true";
    if (taskId) {
      const task = tasks.find((t) => t.id === taskId);
      if (task) return task;
    }
    if (prefillTaskTitle) {
      const defaultTask: Partial<LegacyTask> = {
        title: decodeURIComponent(prefillTaskTitle),
        status: "todo",
      };
      if (isFromRoadmap) {
        defaultTask.dueDate = new Date();
      }
      return defaultTask as LegacyTask;
    }
    return null;
  });
  const [isFormOpen, setIsFormOpen] = useState<boolean>(() => {
    const prefillTaskTitle = searchParams.get("prefillTask");
    const taskId = searchParams.get("taskId");
    return !!(taskId || prefillTaskTitle);
  });
  const { toast } = useToast();
  const soundRef = useRef<SoundHandles>(null);

  const isRoadmapTask = searchParams.get("isRoadmapTask") === "true";
  const loading = loadingTasks || loadingLogs;

  // CRITICAL FIX: Daily reset logic must run only once per day
  // Remove 'tasks' from dependencies to prevent infinite loops
  useEffect(() => {
    if (loading) return;

    const lastVisitStr = localStorage.getItem("lastRoutineVisit");
    const todayStr = format(new Date(), "yyyy-MM-dd");

    // Only reset if we haven't visited today yet
    if (!lastVisitStr || isBefore(parseISO(lastVisitStr), parseISO(todayStr))) {
      setTasks((currentTasks) => {
        const newDayTasks = currentTasks.map((task) =>
          task.period ? { ...task, status: "todo" as LegacyTaskStatus } : task
        );

        // Only update if there are actual changes
        const hasChanges = currentTasks.some(
          (task, i) => task.status !== newDayTasks[i].status
        );

        if (hasChanges) {
          // Mark as visited AFTER we decide to update
          localStorage.setItem("lastRoutineVisit", todayStr);
          return newDayTasks;
        }

        // No changes needed, but mark as visited anyway
        localStorage.setItem("lastRoutineVisit", todayStr);
        return currentTasks;
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]); // Only depend on loading, not tasks

  // Removed effect that set state synchronously based on query params.

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const currentTime = `${now.getHours().toString().padStart(2, "0")}:${now
        .getMinutes()
        .toString()
        .padStart(2, "0")}`;

      tasks.forEach((task) => {
        if (
          task.status === "todo" &&
          (task.startTime === currentTime || task.endTime === currentTime)
        ) {
          toast({
            title: `Task Reminder: ${task.title}`,
            description:
              task.startTime === currentTime
                ? `It's time to start your task.`
                : `It's time to finish your task.`,
          });
          soundRef.current?.playSound();
        }
      });
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [tasks, toast]);

  const handleTaskSelect = (task: LegacyTask) => {
    setSelectedTask(task);
    setIsFormOpen(true);
  };

  const handleTaskSubmit = (task: LegacyTask) => {
    // Determine edit/create by presence in current task list, not selectedTask state
    const exists = tasks.some((t) => t.id === task.id);
    const newTasks = exists
      ? tasks.map((t) => (t.id === task.id ? task : t))
      : [...tasks, task];
    setTasks(newTasks);

    // Close the form and clear selection to reflect updates immediately
    setIsFormOpen(false);
    setSelectedTask(null);

    // Sync with roadmap
    if (task.title.startsWith("Study: ")) {
      const node = findNodeByTaskTitle(roadmapData, task.title);
      if (node) {
        const roadmapStatus = taskStatusToRoadmapStatus[task.status];
        if (node.status !== roadmapStatus) {
          const updatedNode = { ...node, status: roadmapStatus };
          setRoadmapData((prev) => findAndReplaceNode(prev, updatedNode));
        }
      }
    }

    toast({
      title: exists ? "Task Updated" : "Task Added",
      description: `Task "${task.title}" has been saved.`,
    });
  };

  const handleStatusChange = (taskId: string, newStatus: TaskStatus) => {
    const task = tasks.find((t) => t.id === taskId);
    if (
      task &&
      (newStatus === "todo" ||
        newStatus === "in-progress" ||
        newStatus === "done")
    ) {
      // Only allow valid LegacyTaskStatus values
      handleTaskSubmit({ ...task, status: newStatus as LegacyTaskStatus });
    }
  };

  const handleTaskDelete = (taskId: string) => {
    const taskToDelete = tasks.find((t) => t.id === taskId);
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    toast({
      title: "Task Deleted",
      variant: "destructive",
      description: `Task "${taskToDelete?.title}" has been removed.`,
    });
  };

  const routineTasksByPeriod = (period: RoutinePeriod) =>
    tasks.filter((t) => t.period === period);
  const generalTasks = tasks.filter((t) => !t.period);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <Skeleton className="h-8 w-72 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Skeleton className="h-96 w-full" />
          <Skeleton className="h-96 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Sound ref={soundRef} />
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold font-headline tracking-tight">
            Daily Routine & Tasks
          </h1>
          <p className="text-muted-foreground">
            Organize your day and manage general tasks. Routine tasks reset
            daily.
          </p>
        </div>
        <div className="flex gap-2">
          <HistoryDialog
            triggerButton={
              <Button variant="outline">
                <History className="mr-2 h-4 w-4" /> View History
              </Button>
            }
            title="Daily Task Summary"
            description="Review your task status counts for any given day in the past."
            logs={dailyLogs}
            getLogDate={(log) => parseISO(log.date)}
            renderLog={renderTaskLog}
          />
          <FormDialog
            isOpen={isFormOpen}
            setIsOpen={setIsFormOpen}
            title={selectedTask?.id ? "Edit Task" : "Add a New Task"}
            description={
              selectedTask?.id
                ? "Update your task details."
                : "Add a task to your routine or a general task."
            }
            triggerButton={
              <Button
                onClick={() => {
                  setSelectedTask(null);
                  setIsFormOpen(true);
                }}
              >
                <PlusCircle className="mr-2 h-4 w-4" /> Add Task
              </Button>
            }
            onCloseAutoFocus={() => {
              setSelectedTask(null);
              const newUrl = window.location.pathname;
              window.history.replaceState({}, "", newUrl);
            }}
          >
            <AddTaskForm
              task={selectedTask}
              onTaskSubmit={handleTaskSubmit}
              onTaskDelete={handleTaskDelete}
              isRoadmapTask={isRoadmapTask}
            />
          </FormDialog>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {(["morning", "afternoon", "evening"] as RoutinePeriod[]).map(
          (period) => (
            <Card key={period}>
              <CardHeader>
                <CardTitle className="capitalize">{period} Routine</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {routineTasksByPeriod(period).length > 0 ? (
                  routineTasksByPeriod(period).map((task) => (
                    <TaskItem
                      key={task.id}
                      task={task}
                      onSelect={handleTaskSelect}
                      onStatusChange={handleStatusChange}
                    />
                  ))
                ) : (
                  <p className="text-muted-foreground p-4 text-center">
                    No tasks for this period.
                  </p>
                )}
              </CardContent>
            </Card>
          )
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>General Tasks</CardTitle>
          <CardDescription>Your non-routine to-do list.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {generalTasks.length > 0 ? (
            generalTasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                onSelect={handleTaskSelect}
                onStatusChange={handleStatusChange}
              />
            ))
          ) : (
            <p className="text-muted-foreground p-4 text-center">
              No general tasks. Good job!
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function RoutinePage() {
  return (
    <Suspense fallback={<RoutinePageSkeleton />}>
      <RoutinePageContent />
    </Suspense>
  );
}

function RoutinePageSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <Skeleton className="h-8 w-72 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Skeleton className="h-96 w-full" />
        <Skeleton className="h-96 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
      <Skeleton className="h-64 w-full" />
    </div>
  );
}
