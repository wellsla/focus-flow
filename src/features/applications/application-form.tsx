"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  ApplicationStatus,
  JobApplication,
  ApplicationPriority,
  ApplicationComment,
} from "@/lib/types";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { ApplicationComments } from "./application-comments";
import { Separator } from "@/components/ui/separator";
import { DeepApplicationWizard } from "./deep-application-wizard";
import { Badge } from "@/components/ui/badge";

const formSchema = z.object({
  role: z.string().min(2, { message: "Role must be at least 2 characters." }),
  company: z
    .string()
    .min(2, { message: "Company must be at least 2 characters." }),
  url: z.string().url({ message: "Please enter a valid URL." }),
  status: z.enum(["Applied", "Interviewing", "Offer", "Rejected", "Wishlist"], {
    required_error: "Status is required.",
  }),
  dateApplied: z.date({
    required_error: "A date is required.",
  }),
  priority: z.enum(["High", "Common", "Uninterested"], {
    required_error: "Priority is required.",
  }),
  description: z.string().optional(),
});

type ApplicationFormProps = {
  application?: JobApplication | null;
  onSubmitSuccess: (data: JobApplication) => void;
  onDelete?: (id: string) => void;
};

export function ApplicationForm({
  application,
  onSubmitSuccess,
  onDelete,
}: ApplicationFormProps) {
  const { toast } = useToast();
  const [comments, setComments] = useState<ApplicationComment[]>(
    application?.comments || []
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      role: application?.role || "",
      company: application?.company || "",
      url: application?.url || "",
      status: application?.status || "Applied",
      dateApplied: application?.dateApplied
        ? new Date(application.dateApplied)
        : new Date(),
      priority: application?.priority || "Common",
      description: application?.description || "",
    },
  });

  useEffect(() => {
    // Update comments when application changes
    setComments(application?.comments || []);
    // Only reset form when application ID changes (edit mode initialization)
    form.reset({
      role: application?.role || "",
      company: application?.company || "",
      url: application?.url || "",
      status: application?.status || "Applied",
      dateApplied: application?.dateApplied
        ? new Date(application.dateApplied)
        : new Date(),
      priority: application?.priority || "Common",
      description: application?.description || "",
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [application?.id]); // Only depend on application ID to avoid loops

  const handleAddComment = (text: string) => {
    const newComment: ApplicationComment = {
      id:
        typeof crypto !== "undefined" &&
        typeof (crypto as { randomUUID?: () => string }).randomUUID ===
          "function"
          ? (crypto as { randomUUID: () => string }).randomUUID()
          : new Date().toISOString(),
      text,
      createdAt: new Date().toISOString(),
    };
    const updatedComments = [...comments, newComment];
    setComments(updatedComments);

    // If editing existing application, update it immediately
    if (application) {
      const updatedApplication: JobApplication = {
        ...application,
        comments: updatedComments,
      };
      onSubmitSuccess(updatedApplication);
      toast({
        title: "Comment Added",
        description: "Your comment has been added to the timeline.",
      });
    }
  };

  const handleDeleteComment = (commentId: string) => {
    const updatedComments = comments.filter((c) => c.id !== commentId);
    setComments(updatedComments);

    // If editing existing application, update it immediately
    if (application) {
      const updatedApplication: JobApplication = {
        ...application,
        comments: updatedComments,
      };
      onSubmitSuccess(updatedApplication);
      toast({
        title: "Comment Deleted",
        variant: "destructive",
        description: "Comment has been removed from the timeline.",
      });
    }
  };

  function onSubmit(values: z.infer<typeof formSchema>) {
    const applicationData: JobApplication = {
      ...values,
      id:
        application?.id ||
        (typeof crypto !== "undefined" &&
        typeof (crypto as { randomUUID?: () => string }).randomUUID ===
          "function"
          ? (crypto as { randomUUID: () => string }).randomUUID()
          : new Date().toISOString()),
      dateApplied: format(values.dateApplied, "yyyy-MM-dd"),
      comments: comments,
    };

    onSubmitSuccess(applicationData);

    toast({
      title: application ? "Application Updated" : "Application Added",
      description: `Successfully tracked application for ${values.role} at ${values.company}.`,
    });
  }

  const handleDelete = () => {
    if (application && onDelete) {
      onDelete(application.id);
      toast({
        title: "Application Deleted",
        variant: "destructive",
        description: `Removed application for ${application.role} at ${application.company}.`,
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Job Role</FormLabel>
              <FormControl>
                <Input placeholder="Senior Frontend Developer" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="company"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Company</FormLabel>
              <FormControl>
                <Input placeholder="TechCorp" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Application URL</FormLabel>
              <FormControl>
                <Input
                  placeholder="https://linkedin.com/jobs/view/..."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select application status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {(
                    Object.keys(
                      formSchema.shape.status.Values
                    ) as ApplicationStatus[]
                  ).map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="dateApplied"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Date Applied</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(field.value, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) =>
                      date > new Date() || date < new Date("1900-01-01")
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="priority"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Priority</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a priority" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {(
                    Object.keys(
                      formSchema.shape.priority.Values
                    ) as ApplicationPriority[]
                  ).map((priority) => (
                    <SelectItem key={priority} value={priority}>
                      {priority}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Add notes about the job, requirements, or interview details..."
                  className="resize-none"
                  rows={4}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-between">
          <Button type="submit" className="flex-grow">
            {application ? "Update Application" : "Add Application"}
          </Button>
          {application && onDelete && (
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              className="ml-2"
            >
              Delete
            </Button>
          )}
        </div>

        {/* Deep Application Workflow - Only show for existing applications */}
        {application && (
          <>
            <Separator className="my-6" />
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Application Quality</h3>
                  <p className="text-sm text-muted-foreground">
                    Follow the 6-step deep application process
                  </p>
                </div>
                {application.applicationDepthScore !== undefined && (
                  <Badge
                    variant={
                      application.applicationDepthScore >= 80
                        ? "default"
                        : application.applicationDepthScore >= 50
                        ? "secondary"
                        : "outline"
                    }
                    className="text-lg px-3 py-1"
                  >
                    {application.applicationDepthScore}/100
                  </Badge>
                )}
              </div>
              <DeepApplicationWizard
                application={application}
                onUpdate={(updated) => {
                  onSubmitSuccess(updated);
                }}
              />
            </div>
          </>
        )}

        {/* Comments Timeline Section - Only show for existing applications */}
        {application && (
          <>
            <Separator className="my-6" />
            <ApplicationComments
              comments={comments}
              onAddComment={handleAddComment}
              onDeleteComment={handleDeleteComment}
            />
          </>
        )}
      </form>
    </Form>
  );
}
