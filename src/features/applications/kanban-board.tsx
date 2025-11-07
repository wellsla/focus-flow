"use client";
import { Dispatch, SetStateAction, useState } from "react";
import { JobApplication, ApplicationStatus, DailyLog } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { PlusCircle, History } from "lucide-react";
import { FormDialog } from "@/components/form-dialog";
import { ApplicationSummary } from "./application-summary";
import { KanbanColumn } from "./kanban-column";
import { ApplicationForm } from "./application-form";
import { HistoryDialog } from "../history-dialog";
import { parseISO } from "date-fns";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const statusColumns: ApplicationStatus[] = [
  "Wishlist",
  "Applied",
  "Interviewing",
  "Offer",
  "Rejected",
];

const renderApplicationLog = (log: DailyLog) => (
  <div className="space-y-4">
    {log.applications.length > 0 ? (
      log.applications.map((appLog) => (
        <Card key={appLog.status}>
          <CardHeader className="p-4">
            <CardTitle className="text-base flex justify-between items-center">
              <span>{appLog.status}</span>
              <Badge variant="secondary">{appLog.count}</Badge>
            </CardTitle>
          </CardHeader>
        </Card>
      ))
    ) : (
      <p className="text-muted-foreground text-center">
        No application data logged for this day.
      </p>
    )}
  </div>
);

export function KanbanBoard({
  dailyLogs,
  applications,
  setApplications,
}: {
  dailyLogs: DailyLog[];
  applications: JobApplication[];
  setApplications: Dispatch<SetStateAction<JobApplication[]>>;
}) {
  const [selectedApplication, setSelectedApplication] =
    useState<JobApplication | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const handleFormSubmit = (applicationData: JobApplication) => {
    setApplications((prev) => {
      const exists = prev.some((app) => app.id === applicationData.id);
      return exists
        ? prev.map((app) =>
            app.id === applicationData.id
              ? { ...app, ...applicationData, id: app.id }
              : app
          )
        : [...prev, applicationData];
    });
    setIsFormOpen(false);
    setSelectedApplication(null);
  };

  const handleDelete = (applicationId: string) => {
    setApplications((prev) => prev.filter((app) => app.id !== applicationId));
  };

  const onCardSelect = (application: JobApplication) => {
    setSelectedApplication(application);
    setIsFormOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold font-headline tracking-tight">
            Job Application Tracker
          </h1>
          <p className="text-muted-foreground">
            Organize your job search with a drag-and-drop Kanban board.
          </p>
        </div>
        <div className="flex gap-2">
          <HistoryDialog
            triggerButton={
              <Button variant="outline">
                <History className="mr-2 h-4 w-4" /> View History
              </Button>
            }
            title="Daily Application Summary"
            description="Review your application status counts for any given day in the past."
            logs={dailyLogs}
            getLogDate={(log) => parseISO(log.date)}
            renderLog={renderApplicationLog}
          />
          <Button
            onClick={() => {
              setSelectedApplication(null);
              setIsFormOpen(true);
            }}
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Application
          </Button>
        </div>
      </div>

      <ApplicationSummary applications={applications} />

      <FormDialog
        isOpen={isFormOpen}
        setIsOpen={setIsFormOpen}
        title={selectedApplication ? "Edit Application" : "Add New Application"}
        description={
          selectedApplication
            ? "Update the details of your job application."
            : "Track a new job application. Fill in the details below."
        }
        triggerButton={null}
        onCloseAutoFocus={() => setSelectedApplication(null)}
      >
        <ApplicationForm
          application={selectedApplication}
          onSubmitSuccess={handleFormSubmit}
          onDelete={handleDelete}
        />
      </FormDialog>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-start">
        {statusColumns.map((status) => (
          <KanbanColumn
            key={status}
            status={status}
            applications={applications}
            setApplications={setApplications}
            onCardSelect={onCardSelect}
          />
        ))}
      </div>
    </div>
  );
}
