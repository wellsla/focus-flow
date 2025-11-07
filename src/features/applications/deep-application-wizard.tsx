"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import {
  AlertCircle,
  CheckCircle2,
  Info,
  Sparkles,
  Users,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import type { DeepApplicationWorkflow, JobApplication } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";

const step1Schema = z.object({
  jobUrl: z.string().url({ message: "Please enter a valid job URL" }),
  source: z.enum([
    "LinkedIn",
    "Indeed",
    "Company Website",
    "Referral",
    "Other",
  ]),
});

const step2Schema = z.object({
  keyRequirements: z
    .string()
    .min(10, { message: "Please list key requirements" }),
  dealbreakers: z.string().optional(),
  notes: z.string().min(10, { message: "Add some notes about the job" }),
});

const step3Schema = z.object({
  whatTheyDo: z.string().min(20, { message: "Describe what the company does" }),
  whyThisRole: z.string().min(20, { message: "Explain why this role exists" }),
});

const step4Schema = z.object({
  whyGoodFit: z.string().min(30, {
    message: "Explain why you're a good fit (minimum 30 characters)",
  }),
});

const step5Schema = z.object({
  appliedDate: z.date(),
});

const step6Schema = z.object({
  contactedPerson: z.string().optional(),
  contactMethod: z.enum(["LinkedIn", "Email", "Phone", "Other"]).optional(),
  followUpPlan: z.string().optional(),
});

interface DeepApplicationWizardProps {
  application: JobApplication;
  onUpdate: (application: JobApplication) => void;
}

export function DeepApplicationWizard({
  application,
  onUpdate,
}: DeepApplicationWizardProps) {
  const [open, setOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const { toast } = useToast();

  const [workflow, setWorkflow] = useState<DeepApplicationWorkflow>(
    application.deepWorkflow || {
      step1_found: {
        jobUrl: application.url || "",
        foundDate: new Date().toISOString(),
        source: "Other",
      },
      step2_readDescription: {
        completed: false,
        keyRequirements: "",
        notes: "",
      },
      step3_companyResearch: {
        completed: false,
        whatTheyDo: "",
        whyThisRole: "",
      },
      step4_writeInformation: {
        completed: false,
        whyGoodFit: "",
      },
      step5_apply: {
        completed: false,
      },
      step6_contact: {
        completed: false,
      },
    }
  );

  const form1 = useForm({
    resolver: zodResolver(step1Schema),
    defaultValues: {
      jobUrl: workflow.step1_found.jobUrl,
      source: workflow.step1_found.source as any,
    },
  });

  const form2 = useForm({
    resolver: zodResolver(step2Schema),
    defaultValues: {
      keyRequirements: workflow.step2_readDescription.keyRequirements,
      dealbreakers: workflow.step2_readDescription.dealbreakers || "",
      notes: workflow.step2_readDescription.notes,
    },
  });

  const form3 = useForm({
    resolver: zodResolver(step3Schema),
    defaultValues: {
      whatTheyDo: workflow.step3_companyResearch.whatTheyDo,
      whyThisRole: workflow.step3_companyResearch.whyThisRole,
    },
  });

  const form4 = useForm({
    resolver: zodResolver(step4Schema),
    defaultValues: {
      whyGoodFit: workflow.step4_writeInformation.whyGoodFit,
    },
  });

  const form5 = useForm({
    resolver: zodResolver(step5Schema),
    defaultValues: {
      appliedDate: workflow.step5_apply.appliedDate
        ? new Date(workflow.step5_apply.appliedDate)
        : new Date(),
    },
  });

  const form6 = useForm({
    resolver: zodResolver(step6Schema),
    defaultValues: {
      contactedPerson: workflow.step6_contact.contactedPerson || "",
      contactMethod: workflow.step6_contact.contactMethod,
      followUpPlan: workflow.step6_contact.followUpPlan || "",
    },
  });

  const calculateDepthScore = (wf: DeepApplicationWorkflow): number => {
    let score = 0;
    if (wf.step1_found.jobUrl) score += 10;
    if (wf.step2_readDescription.completed) score += 20;
    if (wf.step3_companyResearch.completed) score += 20;
    if (wf.step4_writeInformation.completed) score += 20;
    if (wf.step5_apply.completed) score += 15;
    if (wf.step6_contact.completed) score += 15;
    return score;
  };

  const handleStep1Next = form1.handleSubmit((values) => {
    const updated = {
      ...workflow,
      step1_found: {
        ...workflow.step1_found,
        jobUrl: values.jobUrl,
        source: values.source,
      },
    };
    setWorkflow(updated);
    setCurrentStep(2);
  });

  const handleStep2Next = form2.handleSubmit((values) => {
    const updated = {
      ...workflow,
      step2_readDescription: {
        completed: true,
        keyRequirements: values.keyRequirements,
        dealbreakers: values.dealbreakers,
        notes: values.notes,
      },
    };
    setWorkflow(updated);
    setCurrentStep(3);
  });

  const handleStep3Next = form3.handleSubmit((values) => {
    const updated = {
      ...workflow,
      step3_companyResearch: {
        completed: true,
        whatTheyDo: values.whatTheyDo,
        whyThisRole: values.whyThisRole,
      },
    };
    setWorkflow(updated);
    setCurrentStep(4);
  });

  const handleStep4Next = form4.handleSubmit((values) => {
    const updated = {
      ...workflow,
      step4_writeInformation: {
        completed: true,
        whyGoodFit: values.whyGoodFit,
      },
    };
    setWorkflow(updated);
    setCurrentStep(5);
  });

  const handleStep5Next = form5.handleSubmit((values) => {
    const updated = {
      ...workflow,
      step5_apply: {
        completed: true,
        appliedDate: format(values.appliedDate, "yyyy-MM-dd"),
      },
    };
    setWorkflow(updated);
    setCurrentStep(6);
  });

  const handleComplete = form6.handleSubmit((values) => {
    const finalWorkflow = {
      ...workflow,
      step6_contact: {
        completed: !!values.contactedPerson,
        contactedPerson: values.contactedPerson,
        contactMethod: values.contactMethod,
        followUpPlan: values.followUpPlan,
      },
    };

    const depthScore = calculateDepthScore(finalWorkflow);

    const updatedApplication: JobApplication = {
      ...application,
      deepWorkflow: finalWorkflow,
      applicationDepthScore: depthScore,
      status: "Applied",
      dateApplied:
        finalWorkflow.step5_apply.appliedDate ||
        format(new Date(), "yyyy-MM-dd"),
    };

    onUpdate(updatedApplication);
    setOpen(false);
    toast({
      title: "Deep Application Completed! 🎯",
      description: `Quality Score: ${depthScore}/100 - ${
        depthScore >= 80
          ? "Excellent!"
          : depthScore >= 50
          ? "Good effort"
          : "Try to complete all steps"
      }`,
    });
  });

  const progress = (currentStep / 6) * 100;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          <Sparkles className="mr-2 h-4 w-4" />
          Start Deep Application Process
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Deep Application Workflow</DialogTitle>
          <DialogDescription>
            Follow the 6-step process for meaningful applications
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Progress Indicator */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Step {currentStep} of 6</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} />
            <div className="flex justify-between gap-2">
              {[1, 2, 3, 4, 5, 6].map((step) => (
                <div
                  key={step}
                  className={cn(
                    "flex items-center justify-center w-8 h-8 rounded-full text-xs font-semibold transition-colors",
                    currentStep >= step
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {step}
                </div>
              ))}
            </div>
          </div>

          {/* Step 1: Find the Job */}
          {currentStep === 1 && (
            <Form {...form1}>
              <form onSubmit={handleStep1Next} className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">
                    Step 1: Find the Job Opportunity
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Where did you find this opportunity?
                  </p>
                </div>

                <FormField
                  control={form1.control}
                  name="jobUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Job Posting URL *</FormLabel>
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
                  control={form1.control}
                  name="source"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Where did you find it? *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="LinkedIn">LinkedIn</SelectItem>
                          <SelectItem value="Indeed">Indeed</SelectItem>
                          <SelectItem value="Company Website">
                            Company Website
                          </SelectItem>
                          <SelectItem value="Referral">Referral</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end">
                  <Button type="submit">
                    Next <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </form>
            </Form>
          )}

          {/* Step 2: Read Description */}
          {currentStep === 2 && (
            <Form {...form2}>
              <form onSubmit={handleStep2Next} className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">
                    Step 2: Read the Description Carefully
                  </h3>
                  <Alert>
                    <CheckCircle2 className="h-4 w-4" />
                    <AlertTitle>Take your time!</AlertTitle>
                    <AlertDescription>
                      Read every requirement. Identify deal-breakers. Understand
                      what they really want.
                    </AlertDescription>
                  </Alert>
                </div>

                <FormField
                  control={form2.control}
                  name="keyRequirements"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Key Requirements *</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="- 3+ years React experience&#10;- TypeScript proficiency&#10;- CI/CD knowledge"
                          rows={4}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form2.control}
                  name="dealbreakers"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Deal-breakers (if any)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="- Requires on-site 5 days&#10;- Needs security clearance"
                          rows={2}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form2.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>General Notes *</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Interesting aspects, concerns, questions..."
                          rows={3}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-between">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setCurrentStep(1)}
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" /> Previous
                  </Button>
                  <Button type="submit">
                    Next <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </form>
            </Form>
          )}

          {/* Step 3: Research Company */}
          {currentStep === 3 && (
            <Form {...form3}>
              <form onSubmit={handleStep3Next} className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">
                    Step 3: Research the Company
                  </h3>
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertTitle>Deep Understanding</AlertTitle>
                    <AlertDescription>
                      What do they build? What problems do they solve? Why this
                      role?
                    </AlertDescription>
                  </Alert>
                </div>

                <FormField
                  control={form3.control}
                  name="whatTheyDo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        What does this company ACTUALLY do? *
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="They build a SaaS platform for... Their main product is..."
                          rows={3}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form3.control}
                  name="whyThisRole"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Why do they need THIS role NOW? *</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="They're expanding to... They need help with..."
                          rows={3}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-between">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setCurrentStep(2)}
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" /> Previous
                  </Button>
                  <Button type="submit">
                    Next <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </form>
            </Form>
          )}

          {/* Step 4: Write Information */}
          {currentStep === 4 && (
            <Form {...form4}>
              <form onSubmit={handleStep4Next} className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">
                    Step 4: Write Tailored Information
                  </h3>
                  <Alert>
                    <Sparkles className="h-4 w-4" />
                    <AlertTitle>Be Specific!</AlertTitle>
                    <AlertDescription>
                      Mention specific products/projects. Show you did research!
                    </AlertDescription>
                  </Alert>
                </div>

                <FormField
                  control={form4.control}
                  name="whyGoodFit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Why are YOU a good fit for THIS company? *
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Based on my experience with X and their focus on Y, I can contribute by..."
                          rows={5}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-between">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setCurrentStep(3)}
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" /> Previous
                  </Button>
                  <Button type="submit">
                    Next <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </form>
            </Form>
          )}

          {/* Step 5: Apply */}
          {currentStep === 5 && (
            <Form {...form5}>
              <form onSubmit={handleStep5Next} className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Step 5: Apply</h3>
                  <Alert>
                    <CheckCircle2 className="h-4 w-4" />
                    <AlertTitle>Ready to submit!</AlertTitle>
                    <AlertDescription>
                      You&apos;ve done the research. Now submit your
                      application.
                    </AlertDescription>
                  </Alert>
                </div>

                <FormField
                  control={form5.control}
                  name="appliedDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Application Date *</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          value={format(field.value, "yyyy-MM-dd")}
                          onChange={(e) =>
                            field.onChange(new Date(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-between">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setCurrentStep(4)}
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" /> Previous
                  </Button>
                  <Button type="submit">
                    Next <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </form>
            </Form>
          )}

          {/* Step 6: Contact & Network */}
          {currentStep === 6 && (
            <Form {...form6}>
              <form onSubmit={handleComplete} className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">
                    Step 6: Contact & Network
                  </h3>
                  <Alert>
                    <Users className="h-4 w-4" />
                    <AlertTitle>Be Different!</AlertTitle>
                    <AlertDescription>
                      Most candidates don&apos;t reach out. You will. This is
                      your competitive advantage.
                    </AlertDescription>
                  </Alert>
                </div>

                <FormField
                  control={form6.control}
                  name="contactedPerson"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Who will you contact? (Recruiter, Hiring Manager,
                        Employee)
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Jane Doe - Engineering Manager"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form6.control}
                  name="contactMethod"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Method</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select method" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="LinkedIn">
                            LinkedIn Message
                          </SelectItem>
                          <SelectItem value="Email">Email</SelectItem>
                          <SelectItem value="Phone">Phone Call</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form6.control}
                  name="followUpPlan"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Follow-up Plan</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="When and how will you follow up?"
                          rows={2}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Almost Done!</AlertTitle>
                  <AlertDescription>
                    Your application quality score will be calculated based on
                    completed steps.
                  </AlertDescription>
                </Alert>

                <div className="flex justify-between">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setCurrentStep(5)}
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" /> Previous
                  </Button>
                  <Button
                    type="submit"
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Complete & Save
                  </Button>
                </div>
              </form>
            </Form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
