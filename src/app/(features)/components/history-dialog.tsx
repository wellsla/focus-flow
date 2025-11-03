"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

type HistoryDialogProps<T> = {
  triggerButton: React.ReactNode;
  title: string;
  description: string;
  logs: T[];
  renderLog: (log: T, index: number) => React.ReactNode;
  getLogDate: (log: T) => Date;
};

export function HistoryDialog<T>({
  triggerButton,
  title,
  description,
  logs,
  renderLog,
  getLogDate,
}: HistoryDialogProps<T>) {
  const [isOpen, setIsOpen] = useState(false);

  // Sort logs by date descending (most recent first)
  const sortedLogs = [...logs].sort((a, b) => {
    return getLogDate(b).getTime() - getLogDate(a).getTime();
  });

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{triggerButton}</DialogTrigger>
      <DialogContent className="max-w-4xl h-[85vh] p-0 flex flex-col overflow-hidden">
        <div className="p-6 pb-4 shrink-0">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-2">
              {title}
              <Badge variant="secondary" className="text-xs">
                {sortedLogs.length}{" "}
                {sortedLogs.length === 1 ? "entry" : "entries"}
              </Badge>
            </DialogTitle>
            <DialogDescription className="text-base">
              {description}
            </DialogDescription>
          </DialogHeader>
          <Separator className="mt-4" />
        </div>

        <ScrollArea className="flex-1 px-6 pb-6">
          {sortedLogs.length > 0 ? (
            <div className="space-y-4 pr-4">
              {sortedLogs.map((log, index) => (
                <div
                  key={index}
                  className="rounded-lg border bg-card p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="font-mono text-xs">
                        #{sortedLogs.length - index}
                      </Badge>
                      <span className="text-sm font-semibold text-muted-foreground">
                        {format(getLogDate(log), "EEEE, MMMM d, yyyy")}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {format(getLogDate(log), "h:mm a")}
                    </span>
                  </div>
                  <Separator className="mb-3" />
                  <div>{renderLog(log, index)}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center pr-4">
              <div className="rounded-full bg-muted p-6 mb-4">
                <svg
                  className="h-12 w-12 text-muted-foreground"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">No history found</h3>
              <p className="text-sm text-muted-foreground max-w-sm">
                There are no recorded logs yet. Start using the feature to see
                your history here.
              </p>
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
