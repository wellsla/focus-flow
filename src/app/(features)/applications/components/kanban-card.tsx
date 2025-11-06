"use client";

import { DragEvent, useState } from "react";
import { JobApplication, ApplicationPriority } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { format, parseISO } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

const priorityColors: Record<ApplicationPriority, string> = {
  High: "border-accent text-accent",
  Common: "border-transparent",
  Uninterested: "border-muted text-muted-foreground",
};

type KanbanCardProps = {
  application: JobApplication;
  onSelect: (application: JobApplication) => void;
};

export const KanbanCard = ({ application, onSelect }: KanbanCardProps) => {
  const [isDescriptionOpen, setIsDescriptionOpen] = useState(false);

  const handleDragStart = (e: DragEvent<HTMLDivElement>) => {
    e.dataTransfer.setData("applicationId", application.id);
  };

  const toggleDescription = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevents card click when clicking button
    setIsDescriptionOpen(!isDescriptionOpen);
  };

  return (
    <Card
      className="mb-4 bg-card/80 hover:shadow-md transition-shadow cursor-pointer"
      draggable
      onDragStart={handleDragStart}
      onClick={() => onSelect(application)}
    >
      <CardContent className="p-3 relative">
        <div className="absolute top-2 right-2 text-xs text-muted-foreground">
          {format(parseISO(application.dateApplied), "MMM d")}
        </div>
        <h4 className="font-semibold text-sm pr-12">{application.role}</h4>
        <a
          href={application.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-muted-foreground hover:underline"
          onClick={(e) => e.stopPropagation()} // Prevents card click when clicking link
        >
          {application.company}
        </a>
        {application.priority && (
          <Badge
            variant="outline"
            className={cn(
              "absolute bottom-2 right-2 text-xs",
              priorityColors[application.priority] || ""
            )}
          >
            {application.priority}
          </Badge>
        )}

        {application.description && (
          <div className="mt-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs"
              onClick={toggleDescription}
            >
              {isDescriptionOpen ? (
                <>
                  <ChevronUp className="h-3 w-3 mr-1" />
                  Hide Description
                </>
              ) : (
                <>
                  <ChevronDown className="h-3 w-3 mr-1" />
                  Show Description
                </>
              )}
            </Button>
            {isDescriptionOpen && (
              <p className="text-xs text-muted-foreground mt-2 whitespace-pre-wrap">
                {application.description}
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
