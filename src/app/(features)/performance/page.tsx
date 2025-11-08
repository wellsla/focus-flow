"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TrendingUp } from "lucide-react";

export default function PerformancePage() {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Performance</h1>
        <p className="text-muted-foreground mt-2">
          Track your productivity and progress across all features
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            <CardTitle>Performance Metrics</CardTitle>
          </div>
          <CardDescription>
            Performance tracking is currently being migrated to the database
            system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            This page is under construction. Performance metrics will be
            available once the database-backed analytics system is implemented.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
