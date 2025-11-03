
'use client';

import { DragEvent, SetStateAction, Dispatch, useState } from 'react';
import { JobApplication, ApplicationStatus } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { KanbanCard } from './kanban-card';

type KanbanColumnProps = {
    status: ApplicationStatus;
    applications: JobApplication[];
    setApplications: Dispatch<SetStateAction<JobApplication[]>>;
    onCardSelect: (application: JobApplication) => void;
};

export const KanbanColumn = ({ status, applications, setApplications, onCardSelect }: KanbanColumnProps) => {
    const [draggedOver, setDraggedOver] = useState(false);
    
    const getApplicationsByStatus = (status: ApplicationStatus) => {
        return applications.filter(app => app.status === status);
    };

    const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setDraggedOver(true);
    };
    
    const handleDragLeave = () => {
        setDraggedOver(false);
    }
    
    const handleDrop = (e: DragEvent<HTMLDivElement>, newStatus: ApplicationStatus) => {
        e.preventDefault();
        const applicationId = e.dataTransfer.getData("applicationId");
        setApplications(prev =>
            prev.map(app =>
                app.id === applicationId ? { ...app, status: newStatus } : app
            )
        );
        setDraggedOver(false);
    };

    const columnApplications = getApplicationsByStatus(status);

    return (
        <Card 
            className={cn("bg-secondary/50 transition-colors", draggedOver && "bg-primary/20")}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, status)}
        >
            <CardHeader className="p-4">
                <CardTitle className="text-base font-semibold flex justify-between items-center">
                   <span>{status}</span>
                   <Badge variant="secondary">{columnApplications.length}</Badge>
                </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 min-h-[200px]">
                {columnApplications.length > 0 ? (
                    columnApplications.map(app => (
                        <KanbanCard key={app.id} application={app} onSelect={onCardSelect} />
                    ))
                ) : (
                    <div className="flex items-center justify-center h-full min-h-[100px]">
                        <p className="text-xs text-muted-foreground text-center pt-4">Drop a card here or create one.</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};
