
'use client';

import { DragEvent } from 'react';
import { JobApplication, ApplicationPriority } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { format, parseISO } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const priorityColors: Record<ApplicationPriority, string> = {
    High: 'border-accent text-accent',
    Common: 'border-transparent',
    Uninterested: 'border-muted text-muted-foreground',
};

type KanbanCardProps = {
    application: JobApplication;
    onSelect: (application: JobApplication) => void;
};

export const KanbanCard = ({ application, onSelect }: KanbanCardProps) => {
    const handleDragStart = (e: DragEvent<HTMLDivElement>) => {
        e.dataTransfer.setData("applicationId", application.id);
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
                    {format(parseISO(application.dateApplied), 'MMM d')}
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
                     <Badge variant="outline" className={cn("absolute bottom-2 right-2 text-xs", priorityColors[application.priority] || '')}>
                        {application.priority}
                    </Badge>
                )}
            </CardContent>
        </Card>
    );
};
