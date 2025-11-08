"use client";
import { useState } from "react";
import { JobApplication, ApplicationStatus, DailyLog } from "@/lib/types";
import {
  useCreateApplication,
  useUpdateApplication,
  useDeleteApplication,
} from "@/hooks/use-applications-db";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { FormDialog } from "@/components/form-dialog";
import { ApplicationSummary } from "./application-summary";
import { KanbanColumn } from "./kanban-column";
import { ApplicationForm } from "./application-form";

const statusColumns: ApplicationStatus[] = [
  "Wishlist",
  "Applied",
  "Interviewing",
  "Offer",
  "Rejected",
];

// legacy history UI removed - centralized at /feedback

export function KanbanBoard({
  dailyLogs,
  applications,
}: {
  dailyLogs: DailyLog[];
  applications: JobApplication[];
}) {
  const [selectedApplication, setSelectedApplication] =
    useState<JobApplication | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const createApplication = useCreateApplication();
  const updateApplication = useUpdateApplication();
  const deleteApplication = useDeleteApplication();

  const handleFormSubmit = async (applicationData: JobApplication) => {
    try {
      const exists = applications.some((app) => app.id === applicationData.id);

      if (exists) {
        const { id, ...updateData } = applicationData;
        await updateApplication.mutateAsync({
          id,
          ...updateData,
        });
      } else {
        await createApplication.mutateAsync(applicationData);
      }

      setIsFormOpen(false);
      setSelectedApplication(null);
    } catch (error) {
      console.error("Failed to save application:", error);
    }
  };

  const handleDelete = async (applicationId: string) => {
    try {
      await deleteApplication.mutateAsync({ id: applicationId });
    } catch (error) {
      console.error("Failed to delete application:", error);
    }
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
            onCardSelect={onCardSelect}
          />
        ))}
      </div>
    </div>
  );
}
