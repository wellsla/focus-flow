"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import React, { ElementType, useEffect, useState } from "react";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DashboardCard,
  DashboardCardVisualStyle,
  DashboardCardFeature,
  ApplicationStatus,
  RoutinePeriod,
  GoalStatus,
  GoalTimeframe,
} from "@/lib/types";
import { Textarea } from "@/components/ui/textarea";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import {
  AlertCircle,
  Briefcase,
  CalendarCheck,
  Check,
  Clock,
  DollarSign,
  Euro,
  FileText,
  Flag,
  ShieldAlert,
  Target,
  TrendingUp,
  Wallet,
  XCircle,
  ChevronsUpDown,
} from "lucide-react";

type DashboardCardFormProps = {
  card?: DashboardCard | null;
  onSubmit: (data: Omit<DashboardCard, "id" | "value">) => void;
  onDelete?: (id: string) => void;
};

const featureOptions: { value: DashboardCardFeature; label: string }[] = [
  { value: "applications", label: "Applications" },
  { value: "goals", label: "Goals" },
  { value: "routine", label: "Routine" },
  { value: "finances", label: "Finances" },
  { value: "time", label: "Time Management" },
];

const metricOptionsMap = {
  applications: [
    { value: "total", label: "Total Applications" },
    { value: "status", label: "By Status" },
  ],
  goals: [
    { value: "total", label: "Total Goals" },
    { value: "status", label: "By Status" },
    { value: "timeframe", label: "By Timeframe" },
  ],
  routine: [
    { value: "total_incomplete", label: "Total Incomplete Tasks" },
    { value: "period_incomplete", label: "Incomplete by Period" },
  ],
  finances: [
    { value: "net_monthly", label: "Net Monthly" },
    { value: "total_debt", label: "Total Debt" },
    { value: "total_expenses", label: "Total Expenses" },
  ],
  time: [
    { value: "total_gaming", label: "Total Gaming Hours (Weekly)" },
    { value: "total_apps", label: "Total App Hours (Weekly)" },
  ],
};

const visualizationOptions: {
  value: DashboardCardVisualStyle;
  label: string;
}[] = [
  { value: "default", label: "Default" },
  { value: "warning", label: "Warning" },
  { value: "critical", label: "Critical" },
];

const iconComponents: { [key: string]: ElementType } = {
  Briefcase,
  TrendingUp,
  ShieldAlert,
  Clock,
  CalendarCheck,
  XCircle,
  AlertCircle,
  Wallet,
  DollarSign,
  Euro,
  FileText,
  Target,
  Flag,
};
const iconOptions = Object.keys(iconComponents).map((name) => ({
  value: name,
  label: name,
  icon: iconComponents[name],
}));

const applicationStatusOptions: ApplicationStatus[] = [
  "Applied",
  "Interviewing",
  "Offer",
  "Rejected",
  "Wishlist",
];
const routinePeriodOptions: RoutinePeriod[] = [
  "morning",
  "afternoon",
  "evening",
];
const goalStatusOptions: GoalStatus[] = [
  "Not Started",
  "In Progress",
  "Achieved",
];
const goalTimeframeOptions: GoalTimeframe[] = [
  "Short-Term",
  "Mid-Term",
  "Long-Term",
];

const formSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters."),
  subtext: z.string().optional(),
  icon: z.string().min(1, { message: "An icon is required." }),
  visualization: z.enum(["default", "warning", "critical"]),
  feature: z.enum(["applications", "routine", "finances", "time", "goals"]),
  metric: z.string(),
  applicationStatus: z
    .enum(["Applied", "Interviewing", "Offer", "Rejected", "Wishlist"])
    .optional(),
  routinePeriod: z.enum(["morning", "afternoon", "evening"]).optional(),
  goalStatus: z.enum(["Not Started", "In Progress", "Achieved"]).optional(),
  goalTimeframe: z.enum(["Short-Term", "Mid-Term", "Long-Term"]).optional(),
});

export function DashboardCardForm({
  card,
  onSubmit,
  onDelete,
}: DashboardCardFormProps) {
  const [open, setOpen] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      subtext: "",
      icon: "Briefcase",
      visualization: "default",
      feature: "applications",
      metric: "total",
    },
  });

  const feature = form.watch("feature");
  const metric = form.watch("metric");
  const [isEditMode] = useState(() => !!card);

  useEffect(() => {
    // Only reset form when card ID changes (edit mode initialization)
    form.reset({
      title: card?.title || "",
      subtext: card?.subtext || "",
      icon: card?.icon || "Briefcase",
      visualization: card?.visualization || "default",
      feature: card?.config.feature || "applications",
      metric: card?.config.metric || "total",
      applicationStatus: card?.config.applicationStatus,
      routinePeriod: card?.config.routinePeriod,
      goalStatus: card?.config.goalStatus,
      goalTimeframe: card?.config.goalTimeframe,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [card?.id]); // Only depend on card ID to avoid loops

  useEffect(() => {
    // Reset conditional fields when feature changes
    const currentMetricOptions = metricOptionsMap[feature];
    const currentMetric = form.getValues("metric");

    // Only update if current metric is not valid for the new feature
    if (!currentMetricOptions.some((m) => m.value === currentMetric)) {
      form.setValue("metric", currentMetricOptions[0].value);
    }

    form.setValue("applicationStatus", undefined);
    form.setValue("routinePeriod", undefined);
    form.setValue("goalStatus", undefined);
    form.setValue("goalTimeframe", undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [feature]); // Remove 'form' from dependencies

  useEffect(() => {
    // Auto-generate title and subtext when metric changes, only for new cards
    if (!isEditMode) {
      const selectedMetric = metricOptionsMap[feature].find(
        (m) => m.value === metric
      );
      if (selectedMetric) {
        form.setValue("title", selectedMetric.label);
        form.setValue(
          "subtext",
          `Dynamic card showing: ${selectedMetric.label}`
        );
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [feature, metric, isEditMode]); // Remove 'card' and 'form' from dependencies

  function handleSubmit(values: z.infer<typeof formSchema>) {
    const {
      title,
      subtext,
      icon,
      visualization,
      feature,
      metric,
      applicationStatus,
      routinePeriod,
      goalStatus,
      goalTimeframe,
    } = values;
    onSubmit({
      title,
      subtext: subtext || "",
      icon,
      visualization,
      config: {
        feature,
        metric,
        applicationStatus,
        routinePeriod,
        goalStatus,
        goalTimeframe,
      },
    });
    // form.reset(); // This is handled by the dialog closing
  }

  const handleDelete = () => {
    if (card && onDelete) {
      onDelete(card.id);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Card Title</FormLabel>
              <FormControl>
                <Input placeholder="E.g., Apps Sent" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="subtext"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="A short description for the card."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="feature"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Feature</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a feature" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {featureOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
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
          name="metric"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Metric</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a metric" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {metricOptionsMap[feature].map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {feature === "applications" && metric === "status" && (
          <FormField
            control={form.control}
            name="applicationStatus"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Application Status</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {applicationStatusOptions.map((status) => (
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
        )}

        {feature === "routine" && metric === "period_incomplete" && (
          <FormField
            control={form.control}
            name="routinePeriod"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Routine Period</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a period" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {routinePeriodOptions.map((period) => (
                      <SelectItem
                        key={period}
                        value={period}
                        className="capitalize"
                      >
                        {period}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {feature === "goals" && metric === "status" && (
          <FormField
            control={form.control}
            name="goalStatus"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Goal Status</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {goalStatusOptions.map((status) => (
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
        )}

        {feature === "goals" && metric === "timeframe" && (
          <FormField
            control={form.control}
            name="goalTimeframe"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Goal Timeframe</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a timeframe" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {goalTimeframeOptions.map((timeframe) => (
                      <SelectItem key={timeframe} value={timeframe}>
                        {timeframe}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="icon"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Icon</FormLabel>
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={open}
                      className="w-full justify-between"
                    >
                      {field.value ? (
                        <div className="flex items-center gap-2">
                          {React.createElement(
                            iconComponents[field.value] || AlertCircle,
                            { className: "h-4 w-4" }
                          )}
                          {
                            iconOptions.find(
                              (icon) => icon.value === field.value
                            )?.label
                          }
                        </div>
                      ) : (
                        "Select icon"
                      )}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                  <Command>
                    <CommandInput placeholder="Search icon..." />
                    <CommandList>
                      <CommandEmpty>No icon found.</CommandEmpty>
                      <CommandGroup>
                        {iconOptions.map((icon) => (
                          <CommandItem
                            value={icon.label}
                            key={icon.value}
                            onSelect={() => {
                              form.setValue("icon", icon.value);
                              setOpen(false);
                            }}
                          >
                            <div className="flex items-center gap-2">
                              <icon.icon className="h-4 w-4" />
                              {icon.label}
                            </div>
                            <Check
                              className={cn(
                                "ml-auto h-4 w-4",
                                field.value === icon.value
                                  ? "opacity-100"
                                  : "opacity-0"
                              )}
                            />
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="visualization"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Visual Style</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a style" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {visualizationOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-between">
          <Button type="submit" className="flex-grow">
            {card ? "Update Card" : "Add Card"}
          </Button>
          {card && onDelete && (
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
      </form>
    </Form>
  );
}
