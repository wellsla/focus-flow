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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PlusCircle, Gamepad2, Smartphone } from "lucide-react";
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
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FormDialog } from "@/components/form-dialog";
import useLocalStorage from "@/hooks/use-local-storage";
import { TimeTrackingEntry } from "@/lib/types";
import { format, startOfWeek, endOfWeek, isWithinInterval } from "date-fns";
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";

const timeEntrySchema = z.object({
  activityType: z.enum(["game", "app"]),
  name: z.string().min(1, "Name is required."),
  hours: z.coerce.number().min(0, "Hours cannot be negative."),
  date: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), { message: "Invalid date" }),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
});

type TimeEntryFormValues = z.infer<typeof timeEntrySchema>;

const TimeEntryForm = ({
  entry,
  onSubmit,
  onDelete,
}: {
  entry?: TimeTrackingEntry | null;
  onSubmit: (data: TimeTrackingEntry) => void;
  onDelete?: (id: string) => void;
}) => {
  const isEditing = !!entry;
  const form = useForm<TimeEntryFormValues>({
    resolver: zodResolver(timeEntrySchema),
    defaultValues: {
      activityType: entry?.activityType || "game",
      name: entry?.name || "",
      hours: entry?.hours || 0,
      date: entry?.date || new Date().toISOString().split("T")[0],
      startTime: entry?.startTime || "",
      endTime: entry?.endTime || "",
    },
  });

  const startTime = form.watch("startTime");
  const endTime = form.watch("endTime");

  // Auto-calculate hours from time interval
  useEffect(() => {
    if (startTime && endTime) {
      const [startHour, startMin] = startTime.split(":").map(Number);
      const [endHour, endMin] = endTime.split(":").map(Number);
      const startMinutes = startHour * 60 + startMin;
      let endMinutes = endHour * 60 + endMin;

      // Handle overnight sessions
      if (endMinutes < startMinutes) {
        endMinutes += 24 * 60;
      }

      const totalMinutes = endMinutes - startMinutes;
      const calculatedHours = totalMinutes / 60;

      if (calculatedHours > 0) {
        form.setValue("hours", Number(calculatedHours.toFixed(2)));
      }
    }
  }, [startTime, endTime, form]);

  // CRITICAL FIX: Only reset form when entry ID changes, not on every form change
  useEffect(() => {
    form.reset({
      activityType: entry?.activityType || "game",
      name: entry?.name || "",
      hours: entry?.hours || 0,
      date: entry?.date || new Date().toISOString().split("T")[0],
      startTime: entry?.startTime || "",
      endTime: entry?.endTime || "",
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entry?.id]); // Only depend on entry ID to prevent loops

  const handleSubmit = (values: TimeEntryFormValues) => {
    onSubmit({
      ...values,
      id: entry?.id || crypto.randomUUID(),
    });
  };

  const handleDelete = () => {
    if (entry && onDelete) {
      onDelete(entry.id);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="activityType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Activity Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="game">Game</SelectItem>
                  <SelectItem value="app">App/Social Media</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Name (e.g., Baldur&apos;s Gate 3, Instagram)
              </FormLabel>
              <FormControl>
                <Input placeholder="Enter name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Date</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
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
          name="hours"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Hours Spent</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.01"
                  {...field}
                  placeholder={
                    startTime && endTime ? "Auto-calculated" : "Enter manually"
                  }
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-between">
          <Button type="submit" className="flex-grow">
            {isEditing ? "Update Entry" : "Add Entry"}
          </Button>
          {isEditing && onDelete && (
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

export default function TimeManagementPage() {
  const [entries, setEntries, loading] = useLocalStorage<TimeTrackingEntry[]>(
    "timeTrackingEntries",
    []
  );
  const [selectedEntry, setSelectedEntry] = useState<TimeTrackingEntry | null>(
    null
  );
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { toast } = useToast();

  function handleEntrySelect(entry: TimeTrackingEntry) {
    setSelectedEntry(entry);
    setIsFormOpen(true);
  }

  function handleFormSubmit(entryData: TimeTrackingEntry) {
    const exists = entries.some((e) => e.id === entryData.id);
    if (exists) {
      setEntries((prev) =>
        prev.map((e) => (e.id === entryData.id ? entryData : e))
      );
      toast({ title: "Entry Updated" });
    } else {
      setEntries((prev) => [...prev, entryData]);
      toast({ title: "Entry Added" });
    }
    setIsFormOpen(false);
    setSelectedEntry(null);
  }

  function handleDelete(entryId: string) {
    setEntries((prev) => prev.filter((e) => e.id !== entryId));
    toast({ title: "Entry Deleted", variant: "destructive" });
    setIsFormOpen(false);
    setSelectedEntry(null);
  }

  const weeklyData = (() => {
    const today = new Date();
    const start = startOfWeek(today, { weekStartsOn: 0 });
    const end = endOfWeek(today, { weekStartsOn: 0 });

    const weeklyEntries = entries.filter((entry) => {
      const entryDate = new Date(entry.date);
      return isWithinInterval(entryDate, { start, end });
    });

    const totalGameHours = weeklyEntries
      .filter((e) => e.activityType === "game")
      .reduce((acc, e) => acc + e.hours, 0);
    const totalAppHours = weeklyEntries
      .filter((e) => e.activityType === "app")
      .reduce((acc, e) => acc + e.hours, 0);

    const activityHours = weeklyEntries.reduce((acc, entry) => {
      if (!acc[entry.name]) {
        acc[entry.name] = { game: 0, app: 0 };
      }
      acc[entry.name][entry.activityType] += entry.hours;
      return acc;
    }, {} as Record<string, { game: number; app: number }>);

    const chartData = Object.keys(activityHours)
      .map((name) => ({
        name,
        Gaming: activityHours[name].game,
        Apps: activityHours[name].app,
      }))
      .sort((a, b) => b.Gaming + b.Apps - (a.Gaming + a.Apps));

    // Prepare pie chart data
    const pieData = Object.keys(activityHours)
      .map((name) => ({
        name,
        value: activityHours[name].game + activityHours[name].app,
        gaming: activityHours[name].game,
        apps: activityHours[name].app,
      }))
      .sort((a, b) => b.value - a.value);

    return { totalGameHours, totalAppHours, chartData, pieData };
  })();

  // Calculate peak usage hours
  const hourlyData = (() => {
    const hourCounts: Record<
      number,
      { game: number; app: number; count: number }
    > = {};

    entries.forEach((entry) => {
      if (entry.startTime && entry.endTime) {
        const [startHour, startMin] = entry.startTime.split(":").map(Number);
        const [endHour, endMin] = entry.endTime.split(":").map(Number);

        let currentHour = startHour;
        const startMinutes = startHour * 60 + startMin;
        let endMinutes = endHour * 60 + endMin;

        // Handle overnight
        if (endMinutes < startMinutes) {
          endMinutes += 24 * 60;
        }

        const totalMinutes = endMinutes - startMinutes;

        // Distribute time across hours
        let remainingMinutes = totalMinutes;
        while (remainingMinutes > 0) {
          const hour = currentHour % 24;
          if (!hourCounts[hour]) {
            hourCounts[hour] = { game: 0, app: 0, count: 0 };
          }

          const minutesInThisHour = Math.min(remainingMinutes, 60);
          const hoursInThisSlot = minutesInThisHour / 60;

          if (entry.activityType === "game") {
            hourCounts[hour].game += hoursInThisSlot;
          } else {
            hourCounts[hour].app += hoursInThisSlot;
          }
          hourCounts[hour].count += 1;

          remainingMinutes -= minutesInThisHour;
          currentHour++;
        }
      }
    });

    const hourlyChartData = Array.from({ length: 24 }, (_, i) => {
      const data = hourCounts[i] || { game: 0, app: 0, count: 0 };
      return {
        hour: `${i.toString().padStart(2, "0")}:00`,
        Gaming: Number(data.game.toFixed(2)),
        Apps: Number(data.app.toFixed(2)),
      };
    });

    return hourlyChartData;
  })();

  const sortedEntries = [...entries].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
        <Skeleton className="h-96 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-headline tracking-tight">
          Time Management
        </h1>
        <p className="text-muted-foreground">
          Track your time spent on games and apps. Be honest with yourself.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="bg-secondary/30">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Weekly Gaming Hours
            </CardTitle>
            <Gamepad2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {weeklyData.totalGameHours.toFixed(1)}
            </div>
            <p className="text-xs text-muted-foreground">
              Time spent on games this week
            </p>
          </CardContent>
        </Card>
        <Card className="bg-secondary/30">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Weekly App/Social Media Hours
            </CardTitle>
            <Smartphone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {weeklyData.totalAppHours.toFixed(1)}
            </div>
            <p className="text-xs text-muted-foreground">
              Scrolling, scrolling, scrolling...
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>This Week&apos;s Time Wasters</CardTitle>
              <CardDescription>
                A breakdown of where your time has gone in the last 7 days.
              </CardDescription>
            </div>
            {weeklyData.pieData.length > 0 && (
              <div className="text-right">
                <div className="text-3xl font-bold">
                  {(
                    weeklyData.totalGameHours + weeklyData.totalAppHours
                  ).toFixed(1)}
                  h
                </div>
                <p className="text-xs text-muted-foreground">Total this week</p>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {weeklyData.pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={400}>
              <PieChart>
                <Pie
                  data={weeklyData.pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  label={({ name, value }: any) =>
                    `${name}: ${value.toFixed(1)}h`
                  }
                  outerRadius={120}
                  fill="hsl(var(--primary))"
                  dataKey="value"
                >
                  {weeklyData.pieData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={`hsl(var(--chart-${(index % 5) + 1}))`}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--background))",
                    borderColor: "hsl(var(--border))",
                  }}
                  formatter={(value: number, name, props) => {
                    const entry = props.payload;
                    return [
                      `${value.toFixed(1)}h (Gaming: ${entry.gaming.toFixed(
                        1
                      )}h, Apps: ${entry.apps.toFixed(1)}h)`,
                      name,
                    ];
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center text-muted-foreground py-12">
              No time logged this week. Keep it up!
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Peak Usage Times</CardTitle>
          <CardDescription>
            Average hours spent by time of day across all entries. Identify your
            most vulnerable hours.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {hourlyData.some((d) => d.Gaming > 0 || d.Apps > 0) ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={hourlyData}
                margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="hour"
                  tick={{ fontSize: 10 }}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis
                  label={{ value: "Hours", angle: -90, position: "insideLeft" }}
                />
                <Tooltip
                  cursor={{ fill: "hsl(var(--muted))" }}
                  contentStyle={{
                    backgroundColor: "hsl(var(--background))",
                    borderColor: "hsl(var(--border))",
                  }}
                />
                <Legend />
                <Bar dataKey="Gaming" fill="hsl(var(--chart-2))" stackId="a" />
                <Bar dataKey="Apps" fill="hsl(var(--chart-4))" stackId="a" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center text-muted-foreground py-12">
              No time entries with start/end times yet. Add entries with
              specific times to see your peak usage patterns.
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>All Logged Time Entries</CardTitle>
            <CardDescription>
              A complete history of your logged time-sinks.
            </CardDescription>
          </div>
          <FormDialog
            isOpen={isFormOpen}
            setIsOpen={setIsFormOpen}
            title={selectedEntry ? "Edit Entry" : "Log New Time Entry"}
            description={
              selectedEntry
                ? "Update your time tracking entry."
                : "Log time spent on a game or app."
            }
            triggerButton={
              <Button
                onClick={() => {
                  setSelectedEntry(null);
                  setIsFormOpen(true);
                }}
              >
                <PlusCircle className="mr-2 h-4 w-4" /> Add Entry
              </Button>
            }
            onCloseAutoFocus={() => setSelectedEntry(null)}
          >
            <TimeEntryForm
              entry={selectedEntry}
              onSubmit={handleFormSubmit}
              onDelete={handleDelete}
            />
          </FormDialog>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Activity</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Time</TableHead>
                <TableHead className="text-right">Hours</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedEntries.map((entry) => (
                <TableRow
                  key={entry.id}
                  onClick={() => handleEntrySelect(entry)}
                  className="cursor-pointer hover:bg-muted/50"
                >
                  <TableCell className="font-medium">{entry.name}</TableCell>
                  <TableCell>
                    <span className="flex items-center gap-2">
                      {entry.activityType === "game" ? (
                        <Gamepad2 className="h-4 w-4" />
                      ) : (
                        <Smartphone className="h-4 w-4" />
                      )}
                      {entry.activityType === "game" ? "Game" : "App"}
                    </span>
                  </TableCell>
                  <TableCell>{format(new Date(entry.date), "PPP")}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {entry.startTime && entry.endTime
                      ? `${entry.startTime} - ${entry.endTime}`
                      : "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    {entry.hours.toFixed(1)}
                  </TableCell>
                </TableRow>
              ))}
              {entries.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center text-muted-foreground h-24"
                  >
                    No time entries logged yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
