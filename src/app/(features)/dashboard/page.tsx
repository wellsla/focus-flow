"use client";
import { useState } from "react";
import { ApplicationStatusChart } from "../components/application-status-chart";
import { HistoryDialog } from "../components/history-dialog";
import { RecentApplications } from "../components/recent-applications";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CalendarCheck, PlusCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { format } from "date-fns";
import {
  JobApplication,
  Task,
  DashboardCard,
  TimeTrackingEntry,
  FinancialAccount,
  IncomeSettings,
  Goal,
  DailyLog,
} from "@/lib/types";
import useLocalStorage from "@/hooks/use-local-storage";
import { FormDialog } from "@/components/form-dialog";
import { DashboardCardForm } from "../components/dashboard-card-form";
import { DynamicDashboardCard } from "../components/dynamic-dashboard-card";
import { BenefitsCountdownCard } from "../components/benefits-countdown-card";
import {
  dashboardCards as initialDashboardCards,
  incomeSettings as initialIncomeSettings,
  tasks as initialTasks,
  timeTrackingEntries as initialTimeEntries,
  goals as initialGoals,
} from "@/lib/data";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardPage() {
  const [jobApplications, _, loadingApps] = useLocalStorage<JobApplication[]>(
    "jobApplications",
    []
  );
  const [tasks, __, loadingTasks] = useLocalStorage<Task[]>(
    "tasks",
    initialTasks
  );
  const [goals, ___, loadingGoals] = useLocalStorage<Goal[]>(
    "goals",
    initialGoals
  );
  const [dashboardCards, setDashboardCards, loadingCards] = useLocalStorage<
    DashboardCard[]
  >("dashboardCards", initialDashboardCards);
  const [timeTrackingEntries, ____, loadingTime] = useLocalStorage<
    TimeTrackingEntry[]
  >("timeTrackingEntries", initialTimeEntries);
  const [financialAccounts, _____, loadingFinancials] = useLocalStorage<
    FinancialAccount[]
  >("financialAccounts", []);
  const [incomeSettings, ______, loadingIncome] =
    useLocalStorage<IncomeSettings>("incomeSettings", initialIncomeSettings);
  const [dailyLogs] = useLocalStorage<DailyLog[]>("dailyLogs", []);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState<DashboardCard | null>(null);

  const incompleteTasks = tasks.filter((task) => task.status !== "done");

  const allData = {
    jobApplications,
    tasks,
    timeTrackingEntries,
    financialAccounts,
    incomeSettings,
    goals,
  };

  const benefitsCard = dashboardCards.find(
    (card) => card.config.specialCard === "benefits-countdown"
  );

  const regularCards = dashboardCards.filter(
    (card) => !card.config.specialCard
  );

  function handleCardSubmit(cardData: Omit<DashboardCard, "id" | "value">) {
    const fullCardData: DashboardCard = {
      ...cardData,
      id: selectedCard?.id || new Date().toISOString(),
      value: "...",
    };

    if (selectedCard) {
      setDashboardCards((prev) =>
        prev.map((c) => (c.id === selectedCard.id ? fullCardData : c))
      );
    } else {
      setDashboardCards((prev) => [...prev, fullCardData]);
    }
  }

  function handleCardDelete(cardId: string) {
    setDashboardCards((prev) => prev.filter((c) => c.id !== cardId));
  }

  function handleCardSelect(card: DashboardCard) {
    setSelectedCard(card);
    setIsFormOpen(true);
  }

  const isLoading =
    loadingApps ||
    loadingTasks ||
    loadingGoals ||
    loadingCards ||
    loadingTime ||
    loadingFinancials ||
    loadingIncome;

  if (isLoading) {
    return (
      <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-2">
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
        </div>
        <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
          <Card className="xl:col-span-2">
            <CardHeader>
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-64" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            </CardContent>
          </Card>
          <div className="space-y-4 md:gap-8">
            <Skeleton className="h-72" />
            <Skeleton className="h-72" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-2">
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
        {benefitsCard && incomeSettings.benefitsEndDate && (
          <BenefitsCountdownCard endDate={incomeSettings.benefitsEndDate} />
        )}
        {regularCards.map((card) => (
          <DynamicDashboardCard
            key={card.id}
            card={card}
            allData={allData}
            onClick={() => handleCardSelect(card)}
          />
        ))}
        <HistoryDialog
          title="Progress History"
          description="Daily snapshots of applications, goals, and tasks."
          logs={dailyLogs}
          getLogDate={(log) => new Date(log.date)}
          renderLog={(log) => (
            <div className="grid gap-2 text-sm">
              <div>
                <span className="font-medium">Applications:</span>
                <span className="ml-2 text-muted-foreground">
                  {log.applications
                    .map((s) => `${s.status}: ${s.count}`)
                    .join(", ")}
                </span>
              </div>
              <div>
                <span className="font-medium">Goals:</span>
                <span className="ml-2 text-muted-foreground">
                  {log.goals.map((s) => `${s.status}: ${s.count}`).join(", ")}
                </span>
              </div>
              <div>
                <span className="font-medium">Tasks:</span>
                <span className="ml-2 text-muted-foreground">
                  {log.tasks.map((s) => `${s.status}: ${s.count}`).join(", ")}
                </span>
              </div>
            </div>
          )}
          triggerButton={
            <Button
              variant="outline"
              className="h-full flex flex-col justify-center items-center py-4"
            >
              <CalendarCheck className="h-6 w-6" />
              <span className="text-xs mt-2">History</span>
            </Button>
          }
        />
        <FormDialog
          isOpen={isFormOpen}
          setIsOpen={setIsFormOpen}
          title={selectedCard ? "Edit Card" : "Add New Card"}
          description="Customize your dashboard by adding a new card."
          triggerButton={
            <Button
              variant="outline"
              className="h-full flex flex-col justify-center items-center py-4"
              onClick={() => {
                setSelectedCard(null);
                setIsFormOpen(true);
              }}
            >
              <PlusCircle className="h-6 w-6" />
              <span className="text-xs mt-2">Add New Card</span>
            </Button>
          }
          onCloseAutoFocus={() => setSelectedCard(null)}
        >
          <DashboardCardForm
            card={selectedCard}
            onSubmit={handleCardSubmit}
            onDelete={handleCardDelete}
          />
        </FormDialog>
      </div>
      <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Recent Applications</CardTitle>
            {jobApplications.length > 0 && (
              <CardDescription>
                You&apos;ve sent {jobApplications.length} applications. Keep up
                the momentum.
              </CardDescription>
            )}
          </CardHeader>
          <CardContent>
            <RecentApplications applications={jobApplications.slice(0, 5)} />
          </CardContent>
        </Card>
        <div className="grid auto-rows-max gap-4 md:gap-8">
          <ApplicationStatusChart applications={jobApplications} />
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarCheck className="h-5 w-5" />
                Today&apos;s Routine
              </CardTitle>
              {tasks.length > 0 && (
                <CardDescription>
                  You have {incompleteTasks.length} incomplete tasks. Focus on
                  what&apos;s next.
                </CardDescription>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              {incompleteTasks.length > 0 ? (
                <ul className="space-y-3">
                  {incompleteTasks.slice(0, 4).map((task) => (
                    <li
                      key={task.id}
                      className="flex justify-between items-center"
                    >
                      <div>
                        <p className="font-medium">{task.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {task.period
                            ? `For the ${task.period}`
                            : task.dueDate
                            ? `Due: ${format(new Date(task.dueDate), "PPP")}`
                            : ""}
                        </p>
                      </div>
                      <Badge
                        variant={
                          task.status === "in-progress"
                            ? "secondary"
                            : "outline"
                        }
                      >
                        {task.status}
                      </Badge>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground text-center">
                  No incomplete tasks. Great job!
                </p>
              )}
              <div className="text-center">
                <Button asChild variant="outline" size="sm">
                  <Link href="/routine">
                    View Full Routine <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
