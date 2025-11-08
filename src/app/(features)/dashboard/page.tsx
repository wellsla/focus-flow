"use client";
import { useState } from "react";
import { ApplicationStatusChart } from "../../../features/application-status-chart";
import { RecentApplications } from "../../../features/recent-applications";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PlusCircle, ListChecks } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { format } from "date-fns";
import { PomodoroWidget } from "@/features/pomodoro/PomodoroWidget";
import { QuickActions } from "@/features/dashboard/QuickActions";
import { RecentAchievementsCompact } from "@/features/rewards/RecentAchievementsCompact";
import { RoutineChecklist } from "@/features/routines/RoutineChecklist";
import { useRoutinesWithChecks } from "@/hooks/use-routines-db";
import { RewardsSection } from "@/features/rewards/RewardsSection";
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
import { DashboardCardForm } from "../../../features/dashboard-card-form";
import { DynamicDashboardCard } from "../../../features/dynamic-dashboard-card";
import { BenefitsCountdownCard } from "../../../features/benefits-countdown-card";
import {
  useDashboardCards,
  useCreateDashboardCard,
  useUpdateDashboardCard,
  useDeleteDashboardCard,
} from "@/hooks/use-dashboard-db";
import { Skeleton } from "@/components/ui/skeleton";

// Default values for localStorage-based state
const initialTasks: Task[] = [];
const initialTimeEntries: TimeTrackingEntry[] = [];
const initialGoals: Goal[] = [];
const initialIncomeSettings: IncomeSettings = {
  status: "Unemployed",
  amount: 0,
  frequency: "monthly",
  currency: "R$",
};

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

  // Database hooks for dashboard cards
  const { cards: dashboardCards, isLoading: loadingCards } =
    useDashboardCards();
  const createCard = useCreateDashboardCard();
  const updateCard = useUpdateDashboardCard();
  const deleteCard = useDeleteDashboardCard();

  const [timeTrackingEntries, ____, loadingTime] = useLocalStorage<
    TimeTrackingEntry[]
  >("timeTrackingEntries", initialTimeEntries);
  const [financialAccounts, _____, loadingFinancials] = useLocalStorage<
    FinancialAccount[]
  >("financialAccounts", []);
  const [incomeSettings, ______, loadingIncome] =
    useLocalStorage<IncomeSettings>("incomeSettings", initialIncomeSettings);
  const [dailyLogs] = useLocalStorage<DailyLog[]>("dailyLogs", []);

  const {
    routines,
    checkmarks,
    toggleCheck,
    isLoading: loadingRoutines,
  } = useRoutinesWithChecks();

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
      // Update existing card
      updateCard.mutateAsync({
        id: selectedCard.id,
        title: fullCardData.title,
        subtext: fullCardData.subtext,
        icon: fullCardData.icon,
        visualization: fullCardData.visualization,
        config: fullCardData.config,
        position: dashboardCards.findIndex((c) => c.id === selectedCard.id),
      });
    } else {
      // Create new card
      createCard.mutateAsync({
        title: fullCardData.title,
        subtext: fullCardData.subtext,
        icon: fullCardData.icon,
        visualization: fullCardData.visualization,
        config: fullCardData.config,
        position: dashboardCards.length,
      });
    }

    setIsFormOpen(false);
    setSelectedCard(null);
  }

  function handleCardDelete(cardId: string) {
    deleteCard.mutateAsync({ id: cardId });
    setIsFormOpen(false);
    setSelectedCard(null);
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
    loadingIncome ||
    loadingRoutines;

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
    <div className="grid auto-rows-max items-start gap-6 md:gap-8 lg:col-span-2">
      {/* Top summary strip */}
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
        <QuickActions />
        <RecentAchievementsCompact />
        <Card className="hidden xl:block">
          <CardHeader className="py-4">
            <CardTitle className="text-base">Day & Date</CardTitle>
            <CardDescription>
              {format(new Date(), "EEEE, MMM d")}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground space-y-1">
            <p>Your window of execution. Protect it.</p>
            <p>Eliminate one distraction right now.</p>
          </CardContent>
        </Card>
        <Card className="hidden xl:block">
          <CardHeader className="py-4">
            <CardTitle className="text-base">Incomplete Tasks</CardTitle>
            <CardDescription>
              {incompleteTasks.length} remaining
            </CardDescription>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground space-y-1">
            <p>Prioritize: pick one high priority and finish it.</p>
          </CardContent>
        </Card>
      </div>
      {/* Existing customizable cards */}
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
        {/* History dialog removed; centralized at /feedback */}
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
      {/* Core sections */}
      <div className="grid gap-6 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
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
        <div className="grid auto-rows-max gap-6 md:gap-8">
          <ApplicationStatusChart applications={jobApplications} />
          <PomodoroWidget />
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ListChecks className="h-5 w-5" />
                Today&apos;s Routines
              </CardTitle>
              <CardDescription>
                Recurring habits to build consistency
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <RoutineChecklist
                routines={routines}
                checkmarks={checkmarks}
                onToggleCheck={toggleCheck}
                limit={5}
              />
              <div className="text-center">
                <Button asChild variant="outline" size="sm">
                  <Link href="/routines">
                    View All <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
          <RewardsSection variant="compact" />
        </div>
      </div>
    </div>
  );
}
