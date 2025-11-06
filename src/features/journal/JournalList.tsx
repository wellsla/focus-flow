/**
 * JournalList.tsx
 *
 * Display journal entries with date grouping
 * Shows mood, lines, and tags in card format
 */

"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { JournalEntry } from "@/lib/types";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Smile, Meh, Frown, Edit, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface JournalListProps {
  entries: JournalEntry[];
  onEdit?: (entry: JournalEntry) => void;
  onDelete?: (id: string) => void;
}

const moodConfig = {
  low: {
    icon: Frown,
    label: "Difícil",
    color: "text-red-500",
    bg: "bg-red-50 dark:bg-red-950",
  },
  ok: {
    icon: Meh,
    label: "Neutro",
    color: "text-yellow-500",
    bg: "bg-yellow-50 dark:bg-yellow-950",
  },
  high: {
    icon: Smile,
    label: "Ótimo",
    color: "text-green-500",
    bg: "bg-green-50 dark:bg-green-950",
  },
};

export function JournalList({ entries, onEdit, onDelete }: JournalListProps) {
  if (entries.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <p className="text-lg font-medium mb-2">Nenhum registro ainda</p>
          <p className="text-sm text-muted-foreground text-center max-w-md">
            Comece seu diário refletindo sobre como você está se sentindo hoje.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Sort entries by date (newest first)
  const sortedEntries = [...entries].sort((a, b) =>
    b.dateISO.localeCompare(a.dateISO)
  );

  return (
    <div className="space-y-4">
      {sortedEntries.map((entry) => {
        const mood = entry.mood ? moodConfig[entry.mood] : null;
        const MoodIcon = mood?.icon;

        return (
          <Card key={entry.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <CardTitle className="text-lg">
                    {format(parseISO(entry.dateISO), "EEEE, d 'de' MMMM", {
                      locale: ptBR,
                    })}
                  </CardTitle>
                  {mood && MoodIcon && (
                    <div
                      className={cn(
                        "flex items-center gap-1.5 px-2 py-1 rounded-md text-sm",
                        mood.bg
                      )}
                    >
                      <MoodIcon className={cn("h-4 w-4", mood.color)} />
                      <span className="text-xs font-medium">{mood.label}</span>
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  {onEdit && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(entry)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  )}
                  {onDelete && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(entry.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-semibold text-muted-foreground mb-1">
                    Como estou me sentindo:
                  </p>
                  <p className="text-base leading-relaxed">{entry.lines[0]}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-muted-foreground mb-1">
                    Como quero me sentir:
                  </p>
                  <p className="text-base leading-relaxed">{entry.lines[1]}</p>
                </div>
                <div className="p-4 bg-accent/30 rounded-lg border-l-4 border-primary">
                  <p className="text-sm font-semibold text-muted-foreground mb-1">
                    Frase-âncora:
                  </p>
                  <p className="text-base font-medium leading-relaxed">
                    {entry.lines[2]}
                  </p>
                </div>
              </div>

              {entry.tags && entry.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {entry.tags.map((tag, i) => (
                    <Badge key={i} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
