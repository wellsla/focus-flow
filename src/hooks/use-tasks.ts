/**
 * use-tasks.ts
 *
 * Hook for managing one-time tasks (not recurring routines)
 * Local-first persistence with localStorage
 */

"use client";

import { useState, useEffect } from "react";
import type { Task } from "@/lib/types";

const STORAGE_KEY = "focus-flow:v1:tasks";

/**
 * Load tasks from localStorage
 */
function loadTasks(): Task[] {
  if (typeof window === "undefined") return [];

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];

    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error("[use-tasks] Failed to load tasks:", error);
    return [];
  }
}

/**
 * Save tasks to localStorage
 */
function saveTasks(tasks: Task[]): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch (error) {
    console.error("[use-tasks] Failed to save tasks:", error);
  }
}

/**
 * Hook for task management
 */
export function useTasks() {
  const [tasks, setTasksState] = useState<Task[]>(loadTasks);

  // Save whenever tasks change
  useEffect(() => {
    saveTasks(tasks);
  }, [tasks]);

  /**
   * Update tasks state and persist
   */
  const setTasks = (newTasks: Task[] | ((prev: Task[]) => Task[])) => {
    setTasksState(newTasks);
  };

  /**
   * Add a new task
   */
  const addTask = (taskData: Omit<Task, "id" | "createdAt">) => {
    const newTask: Task = {
      ...taskData,
      id: `task-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    setTasks((prev) => [...prev, newTask]);
    return newTask;
  };

  /**
   * Update an existing task
   */
  const updateTask = (id: string, updates: Partial<Task>) => {
    setTasks((prev) =>
      prev.map((task) => (task.id === id ? { ...task, ...updates } : task))
    );
  };

  /**
   * Delete a task
   */
  const deleteTask = (id: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== id));
  };

  /**
   * Toggle task status (todo <-> done)
   */
  const toggleTaskStatus = (id: string) => {
    setTasks((prev) =>
      prev.map((task) => {
        if (task.id !== id) return task;

        const newStatus = task.status === "done" ? "todo" : "done";
        const completedDate =
          newStatus === "done"
            ? new Date().toISOString().split("T")[0]
            : undefined;

        return {
          ...task,
          status: newStatus,
          completedDate,
        };
      })
    );
  };

  /**
   * Get tasks by status
   */
  const getTasksByStatus = (status: Task["status"]) => {
    return tasks.filter((task) => task.status === status);
  };

  /**
   * Get overdue tasks
   */
  const getOverdueTasks = () => {
    const today = new Date().toISOString().split("T")[0];
    return tasks.filter(
      (task) =>
        task.status !== "done" &&
        task.status !== "cancelled" &&
        task.dueDate &&
        task.dueDate < today
    );
  };

  /**
   * Get tasks due today
   */
  const getTasksDueToday = () => {
    const today = new Date().toISOString().split("T")[0];
    return tasks.filter(
      (task) =>
        task.status !== "done" &&
        task.status !== "cancelled" &&
        task.dueDate === today
    );
  };

  return {
    tasks,
    setTasks,
    addTask,
    updateTask,
    deleteTask,
    toggleTaskStatus,
    getTasksByStatus,
    getOverdueTasks,
    getTasksDueToday,
  };
}
