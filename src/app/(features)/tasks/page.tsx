/**
 * /tasks page
 *
 * Task management interface for one-time todos
 * Separate from Routines (recurring habits)
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
import { PlusCircle, CheckCircle2, Circle, AlertCircle } from "lucide-react";
import { useTasks } from "@/hooks/use-tasks";
import { FormDialog } from "@/components/form-dialog";
import type { Task, Priority, TaskStatus } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { TaskForm } from "../../../features/tasks/TaskForm";
import { TaskList } from "../../../features/tasks/TaskList";

export default function TasksPage() {
  const {
    tasks,
    addTask,
    updateTask,
    deleteTask,
    toggleTaskStatus,
    getTasksByStatus,
    getOverdueTasks,
    getTasksDueToday,
  } = useTasks();

  const { toast } = useToast();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // Stats
  const todoTasks = getTasksByStatus("todo");
  const inProgressTasks = getTasksByStatus("in-progress");
  const doneTasks = getTasksByStatus("done");
  const overdueTasks = getOverdueTasks();
  const dueTodayTasks = getTasksDueToday();

  /**
   * Handle form submission for create/update
   */
  const handleSubmit = (data: Omit<Task, "id" | "createdAt">) => {
    if (selectedTask) {
      // Update existing
      updateTask(selectedTask.id, data);
      toast({
        title: "Task updated",
        description: `"${data.title}" was successfully updated.`,
      });
    } else {
      // Create new
      addTask(data);
      toast({
        title: "Task created",
        description: `"${data.title}" was added to your tasks.`,
      });
    }
    setIsFormOpen(false);
    setSelectedTask(null);
  };

  /**
   * Handle task deletion
   */
  const handleDelete = () => {
    if (selectedTask) {
      deleteTask(selectedTask.id);
      toast({
        title: "Task deleted",
        description: `"${selectedTask.title}" was removed.`,
        variant: "destructive",
      });
      setIsFormOpen(false);
      setSelectedTask(null);
    }
  };

  /**
   * Handle task selection for editing
   */
  const handleEdit = (task: Task) => {
    setSelectedTask(task);
    setIsFormOpen(true);
  };

  /**
   * Handle quick status toggle
   */
  const handleToggle = (task: Task) => {
    toggleTaskStatus(task.id);
  };

  const activeTasks = tasks.filter(
    (t) => t.status !== "done" && t.status !== "cancelled"
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tasks</h1>
          <p className="text-muted-foreground mt-1">
            Manage your one-time todos and action items
          </p>
        </div>
        <FormDialog
          isOpen={isFormOpen}
          setIsOpen={setIsFormOpen}
          title={selectedTask ? "Edit Task" : "New Task"}
          description={
            selectedTask
              ? "Update your task details"
              : "Add a new task to your list"
          }
          triggerButton={
            <Button
              size="lg"
              onClick={() => {
                setSelectedTask(null);
                setIsFormOpen(true);
              }}
            >
              <PlusCircle className="mr-2 h-5 w-5" />
              New Task
            </Button>
          }
          onCloseAutoFocus={() => setSelectedTask(null)}
        >
          <TaskForm
            task={selectedTask || undefined}
            onSubmit={handleSubmit}
            onDelete={selectedTask ? handleDelete : undefined}
          />
        </FormDialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Tasks</CardTitle>
            <Circle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeTasks.length}</div>
            <p className="text-xs text-muted-foreground">
              {doneTasks.length} completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Due Today</CardTitle>
            <AlertCircle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dueTodayTasks.length}</div>
            <p className="text-xs text-muted-foreground">
              Tasks due by end of day
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <AlertCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {overdueTasks.length}
            </div>
            <p className="text-xs text-muted-foreground">Tasks past due date</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inProgressTasks.length}</div>
            <p className="text-xs text-muted-foreground">
              Currently working on
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="active" className="space-y-4">
        <TabsList>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="all">All Tasks</TabsTrigger>
        </TabsList>

        {/* Active Tab */}
        <TabsContent value="active" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Active Tasks</CardTitle>
              <CardDescription>
                Tasks in progress or pending completion
              </CardDescription>
            </CardHeader>
            <CardContent>
              {activeTasks.length > 0 ? (
                <TaskList
                  tasks={activeTasks}
                  onToggle={handleToggle}
                  onEdit={handleEdit}
                />
              ) : (
                <div className="text-center py-12">
                  <CheckCircle2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    No active tasks! Great job! 🎉
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Add a new task to get started
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Completed Tab */}
        <TabsContent value="completed" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Completed Tasks</CardTitle>
              <CardDescription>
                Tasks you&apos;ve successfully finished
              </CardDescription>
            </CardHeader>
            <CardContent>
              {doneTasks.length > 0 ? (
                <TaskList
                  tasks={doneTasks}
                  onToggle={handleToggle}
                  onEdit={handleEdit}
                />
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">
                    No completed tasks yet
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Complete your first task to see it here
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* All Tasks Tab */}
        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All Tasks</CardTitle>
              <CardDescription>Complete list of all your tasks</CardDescription>
            </CardHeader>
            <CardContent>
              {tasks.length > 0 ? (
                <TaskList
                  tasks={tasks}
                  onToggle={handleToggle}
                  onEdit={handleEdit}
                />
              ) : (
                <div className="text-center py-12">
                  <Circle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-lg font-medium mb-2">
                    No tasks created yet
                  </p>
                  <p className="text-sm text-muted-foreground mb-6 text-center max-w-md mx-auto">
                    Start by creating your first task. Tasks are one-time items
                    to complete.
                  </p>
                  <Button
                    onClick={() => {
                      setSelectedTask(null);
                      setIsFormOpen(true);
                    }}
                  >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Create First Task
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
