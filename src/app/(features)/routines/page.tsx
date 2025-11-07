/**
 * /routines page
 *
 * Complete CRUD interface for routine management
 * Features: category grouping, today's view, all routines, streak display
 */

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlusCircle, CalendarCheck, ListChecks } from "lucide-react";
import { RoutineChecklist } from "@/features/routines/RoutineChecklist";
import { RoutineForm } from "@/features/routines/RoutineForm";
import { useRoutinesWithChecks } from "@/hooks/use-routines";
import { FormDialog } from "@/components/form-dialog";
import type { RoutineItem, Frequency, RoutineCategory } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { isDue } from "@/lib/schedule";
import { useToast } from "@/hooks/use-toast";

/**
 * Group routines by category for organized display
 */
function groupByCategory(
  routines: RoutineItem[]
): Record<RoutineCategory, RoutineItem[]> {
  return routines.reduce((acc, routine) => {
    if (!acc[routine.category]) {
      acc[routine.category] = [];
    }
    acc[routine.category].push(routine);
    return acc;
  }, {} as Record<RoutineCategory, RoutineItem[]>);
}

export default function RoutinesPage() {
  const { routines, setRoutines, checkmarks, toggleCheck } =
    useRoutinesWithChecks();
  const { toast } = useToast();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedRoutine, setSelectedRoutine] = useState<RoutineItem | null>(
    null
  );

  // Stats
  const activeRoutines = routines.filter((r) => r.active);
  const today = new Date();

  const dueToday = activeRoutines.filter((r) => {
    // Find last completion for this routine
    const lastCheck = checkmarks
      .filter((c) => c.routineId === r.id && c.done)
      .sort((a, b) => b.dateISO.localeCompare(a.dateISO))[0];

    return isDue(r, today, lastCheck?.dateISO);
  });

  const completedToday = dueToday.filter((r) => {
    const check = checkmarks.find((c) => c.routineId === r.id);
    return check?.done;
  });

  // Calculate streak from completed daily routines
  const streak = 0; // TODO: Implement proper streak calculation

  const completionRate =
    dueToday.length > 0
      ? Math.round((completedToday.length / dueToday.length) * 100)
      : 0;

  /**
   * Handle form submission for create/update
   */
  const handleSubmit = (data: {
    title: string;
    category: RoutineCategory;
    frequency: Frequency;
    routineType?: "study" | "code" | "job-search" | "finances" | "general";
    requiresReflection: boolean;
    active: boolean;
  }) => {
    if (selectedRoutine) {
      // Update existing
      const updated: RoutineItem = {
        ...selectedRoutine,
        ...data,
      };
      setRoutines(routines.map((r) => (r.id === updated.id ? updated : r)));
      toast({
        title: "Routine updated",
        description: `"${data.title}" was successfully updated.`,
      });
    } else {
      // Create new
      const maxOrder = Math.max(0, ...routines.map((r) => r.order ?? 0));
      const newRoutine: RoutineItem = {
        id: `routine-${Date.now()}`,
        ...data,
        order: maxOrder + 1,
      };
      setRoutines([...routines, newRoutine]);
      toast({
        title: "Routine created",
        description: `"${data.title}" was added to your routines.`,
      });
    }
    setIsFormOpen(false);
    setSelectedRoutine(null);
  };

  /**
   * Handle routine deletion
   */
  const handleDelete = () => {
    if (selectedRoutine) {
      setRoutines(routines.filter((r) => r.id !== selectedRoutine.id));
      toast({
        title: "Routine deleted",
        description: `"${selectedRoutine.title}" was removed.`,
        variant: "destructive",
      });
      setIsFormOpen(false);
      setSelectedRoutine(null);
    }
  };

  /**
   * Handle routine selection for editing
   */
  const handleEdit = (routine: RoutineItem) => {
    setSelectedRoutine(routine);
    setIsFormOpen(true);
  };

  const grouped = groupByCategory(activeRoutines);
  const categories = Object.keys(grouped) as RoutineCategory[];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Routines</h1>
          <p className="text-muted-foreground mt-1">
            Manage your daily routines and build consistent habits
          </p>
        </div>
        <FormDialog
          isOpen={isFormOpen}
          setIsOpen={setIsFormOpen}
          title={selectedRoutine ? "Edit Routine" : "New Routine"}
          description={
            selectedRoutine
              ? "Update your routine details"
              : "Add a new routine to your habits"
          }
          triggerButton={
            <Button
              size="lg"
              onClick={() => {
                setSelectedRoutine(null);
                setIsFormOpen(true);
              }}
            >
              <PlusCircle className="mr-2 h-5 w-5" />
              New Routine
            </Button>
          }
          onCloseAutoFocus={() => setSelectedRoutine(null)}
        >
          <RoutineForm
            routine={selectedRoutine || undefined}
            onSubmit={handleSubmit}
            onDelete={selectedRoutine ? handleDelete : undefined}
          />
        </FormDialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Current Streak
            </CardTitle>
            <CalendarCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{streak} days</div>
            <p className="text-xs text-muted-foreground">
              Keep completing routines daily
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today</CardTitle>
            <ListChecks className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {completedToday.length} / {dueToday.length}
            </div>
            <p className="text-xs text-muted-foreground">
              {completionRate}% complete
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Routines
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeRoutines.length}</div>
            <p className="text-xs text-muted-foreground">
              {routines.length - activeRoutines.length} inactive
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dueToday.length - completedToday.length}
            </div>
            <p className="text-xs text-muted-foreground">
              Routines not yet completed
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="today" className="space-y-4">
        <TabsList>
          <TabsTrigger value="today">Today</TabsTrigger>
          <TabsTrigger value="all">All Routines</TabsTrigger>
        </TabsList>

        {/* Today's Tab */}
        <TabsContent value="today" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Today&apos;s Routines</CardTitle>
              <CardDescription>
                Check off routines as you complete them
              </CardDescription>
            </CardHeader>
            <CardContent>
              {dueToday.length > 0 ? (
                <RoutineChecklist
                  routines={dueToday}
                  checkmarks={checkmarks}
                  onToggleCheck={toggleCheck}
                  showCategory={true}
                />
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">
                    🎉 All today&apos;s routines completed!
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Come back tomorrow to continue your streak
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* All Routines Tab */}
        <TabsContent value="all" className="space-y-4">
          {categories.length > 0 ? (
            categories.map((category) => (
              <Card key={category}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{category}</CardTitle>
                    <Badge variant="secondary">
                      {grouped[category].length} routines
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {grouped[category]
                      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
                      .map((routine) => (
                        <div
                          key={routine.id}
                          className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent/50 cursor-pointer transition-colors"
                          onClick={() => handleEdit(routine)}
                        >
                          <div className="flex-1">
                            <p className="font-medium">{routine.title}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {routine.frequency === "daily" && "Daily"}
                              {routine.frequency === "weekly" && "Weekly"}
                              {routine.frequency === "monthly" && "Monthly"}
                              {routine.frequency === "every3days" &&
                                "Every 3 days"}
                            </p>
                          </div>
                          <Badge
                            variant={routine.active ? "default" : "outline"}
                          >
                            {routine.active ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <ListChecks className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium mb-2">
                  No routines created yet
                </p>
                <p className="text-sm text-muted-foreground mb-6 text-center max-w-md">
                  Start by creating your first routine. Routines help build
                  consistent habits.
                </p>
                <Button
                  onClick={() => {
                    setSelectedRoutine(null);
                    setIsFormOpen(true);
                  }}
                >
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Create First Routine
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
