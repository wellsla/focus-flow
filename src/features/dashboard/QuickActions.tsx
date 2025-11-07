"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Play,
  Plus,
  Briefcase,
  Wallet,
  CalendarCheck,
  Gauge,
} from "lucide-react";

export function QuickActions() {
  return (
    <Card>
      <CardHeader className="py-4">
        <CardTitle className="text-base">Quick Actions</CardTitle>
        <CardDescription>Jump to key features</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-2">
        <Button asChild variant="outline" size="sm">
          <Link href="/time-management">
            <Play className="mr-2 h-4 w-4" /> Start Pomodoro
          </Link>
        </Button>
        <Button asChild variant="outline" size="sm">
          <Link href="/tasks">
            <Plus className="mr-2 h-4 w-4" /> Add Task
          </Link>
        </Button>
        <Button asChild variant="outline" size="sm">
          <Link href="/applications">
            <Briefcase className="mr-2 h-4 w-4" /> New Application
          </Link>
        </Button>
        <Button asChild variant="outline" size="sm">
          <Link href="/finances">
            <Wallet className="mr-2 h-4 w-4" /> Open Finances
          </Link>
        </Button>
        <Button asChild variant="outline" size="sm">
          <Link href="/routines">
            <CalendarCheck className="mr-2 h-4 w-4" /> Today’s Routines
          </Link>
        </Button>
        <Button asChild variant="outline" size="sm">
          <Link href="/performance">
            <Gauge className="mr-2 h-4 w-4" /> Performance
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
