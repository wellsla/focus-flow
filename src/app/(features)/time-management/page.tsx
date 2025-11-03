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
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";

const timeEntrySchema = z.object({
  activityType: z.enum(["game", "app"]),
  name: z.string().min(1, "Name is required."),
  hours: z.coerce.number().min(0.1, "Hours must be greater than 0."),
  date: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), { message: "Invalid date" }),
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
    },
  });

  useEffect(() => {
    form.reset({
      activityType: entry?.activityType || "game",
      name: entry?.name || "",
      hours: entry?.hours || 0,
      date: entry?.date || new Date().toISOString().split("T")[0],
    });
  }, [entry, form]);

  const handleSubmit = (values: TimeEntryFormValues) => {
    onSubmit({
      ...values,
      id: entry?.id || new Date().toISOString(),
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
          name="hours"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Hours Spent</FormLabel>
              <FormControl>
                <Input type="number" step="0.1" {...field} />
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
    if (selectedEntry && selectedEntry.id) {
      setEntries((prev) =>
        prev.map((e) => (e.id === entryData.id ? entryData : e))
      );
      toast({ title: "Entry Updated" });
    } else {
      setEntries((prev) => [...prev, entryData]);
      toast({ title: "Entry Added" });
    }
  }

  function handleDelete(entryId: string) {
    setEntries((prev) => prev.filter((e) => e.id !== entryId));
    toast({ title: "Entry Deleted", variant: "destructive" });
  }

  const weeklyData = (() => {
    const today = new Date();
    const start = startOfWeek(today, { weekStartsOn: 1 });
    const end = endOfWeek(today, { weekStartsOn: 1 });

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

    return { totalGameHours, totalAppHours, chartData };
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
          <CardTitle>This Week&apos;s Time Wasters</CardTitle>
          <CardDescription>
            A breakdown of where your time has gone in the last 7 days.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {weeklyData.chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={weeklyData.chartData}
                margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis />
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
              No time logged this week. Keep it up!
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
                  <TableCell className="text-right">
                    {entry.hours.toFixed(1)}
                  </TableCell>
                </TableRow>
              ))}
              {entries.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={4}
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
