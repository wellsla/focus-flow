"use client";

import { useRewardSystem } from "@/hooks/use-reward-system";
import { AchievementCard } from "./AchievementCard";
import { Input } from "@/components/ui/input";
import { useState, useMemo } from "react";

export function AchievementGallery() {
  const { achievements } = useRewardSystem();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<string>("all");

  const filtered = useMemo(() => {
    return achievements.filter((a) => {
      if (filter !== "all" && a.category !== filter) return false;
      if (query && !a.title.toLowerCase().includes(query.toLowerCase())) {
        return false;
      }
      return true;
    });
  }, [achievements, query, filter]);

  const categories = Array.from(new Set(achievements.map((a) => a.category)));

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-3 md:items-center">
        <Input
          placeholder="Search achievements..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="md:w-72"
        />
        <div className="flex flex-wrap gap-2 items-center text-xs">
          <button
            onClick={() => setFilter("all")}
            className={`px-3 py-1 rounded-md border transition-colors ${
              filter === "all"
                ? "bg-primary text-primary-foreground"
                : "bg-background hover:bg-muted"
            }`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-3 py-1 rounded-md border capitalize transition-colors ${
                filter === cat
                  ? "bg-primary text-primary-foreground"
                  : "bg-background hover:bg-muted"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map((a) => (
          <AchievementCard key={a.id} achievement={a} />
        ))}
        {filtered.length === 0 && (
          <p className="text-sm text-muted-foreground col-span-full">
            No achievements match your filters.
          </p>
        )}
      </div>
    </div>
  );
}
