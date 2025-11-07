"use client";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  Briefcase,
  CalendarCheck,
  Target,
  Flame,
  Trophy,
  Gauge,
  CheckCircle2,
} from "lucide-react";
import { motion } from "framer-motion";
import { motivationalPhrases } from "@/lib/motivational-phrases";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRewardSystem } from "@/hooks/use-reward-system";
import { usePerformanceMetrics } from "@/hooks/use-performance-metrics";
import { computeDomainScores } from "@/lib/performance-metrics";
import useLocalStorage from "@/hooks/use-local-storage";
import { Badge } from "@/components/ui/badge";
import type { Task } from "@/lib/types";

function QuickLinkCard({
  title,
  description,
  icon: Icon,
  href,
}: {
  title: string;
  description: string;
  icon: React.ElementType;
  href: string;
}) {
  return (
    <Link href={href} className="block hover:no-underline">
      <Card className="h-full hover:shadow-lg hover:-translate-y-1 transition-transform">
        <CardHeader>
          <div className="flex items-center gap-4">
            <Icon className="h-8 w-8 text-primary" />
            <div>
              <CardTitle>{title}</CardTitle>
              <CardDescription>{description}</CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>
    </Link>
  );
}

export default function HomeClient({ userName }: { userName: string }) {
  // Avoid hydration mismatch: deterministic first value, randomize after mount.
  const [quote, setQuote] = useState(() => motivationalPhrases[0]);
  useEffect(() => {
    const id = setTimeout(() => {
      setQuote(
        motivationalPhrases[
          Math.floor(Math.random() * motivationalPhrases.length)
        ]
      );
    }, 0);
    return () => clearTimeout(id);
  }, []);

  const { achievements } = useRewardSystem();
  const performance = usePerformanceMetrics();
  const [tasks] = useLocalStorage<Task[]>("tasks", []);
  const highPriority = tasks
    .filter((t: Task) => t.priority === "high" && t.status !== "done")
    .slice(0, 5);
  const unlocked = achievements.filter(
    (a) => a.isUnlocked && !a.isRevoked
  ).length;
  const scores = computeDomainScores();
  const domainEntries = [
    { label: "Tasks", value: scores.tasks },
    { label: "Routines", value: scores.routines },
    { label: "Applications", value: scores.applications },
    { label: "Finances", value: scores.finances },
    { label: "Time", value: scores.time },
  ].sort((a, b) => a.value - b.value);
  const weakest = domainEntries[0];

  return (
    <div className="flex flex-col items-center justify-start py-12 text-center">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-4xl"
      >
        <h1 className="text-4xl md:text-5xl font-bold font-headline tracking-tight">
          Welcome back, {userName}.
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Let&apos;s get to work.
        </p>

        <Card className="mt-8 text-left bg-card/50">
          <CardContent className="p-6">
            <blockquote className="border-l-4 border-primary pl-4 italic">
              <p className="text-lg">&ldquo;{quote.quote}&rdquo;</p>
              <footer className="mt-2 text-sm text-primary font-semibold">
                — {quote.author}
              </footer>
            </blockquote>
          </CardContent>
        </Card>

        {/* Interactive Focus Row */}
        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          <QuickLinkCard
            title="Tackle Your Routine"
            description="View and manage your daily tasks."
            icon={CalendarCheck}
            href="/routine"
          />
          <QuickLinkCard
            title="Chase Your Goals"
            description="Define and track your objectives."
            icon={Target}
            href="/goals"
          />
          <QuickLinkCard
            title="Track Applications"
            description="Manage your job search pipeline."
            icon={Briefcase}
            href="/applications"
          />
        </div>

        {/* Today Focus & Snapshot */}
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          <Card className="bg-card/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Flame className="h-5 w-5 text-accent" /> Today Focus
              </CardTitle>
              <CardDescription>Lowest domain needs attention</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-left text-sm">
              <p>
                <span className="font-medium">{weakest.label}</span> is
                currently your weakest area ({Math.round(weakest.value)}%).
              </p>
              <p>
                Action: schedule one deliberate block to improve{" "}
                {weakest.label.toLowerCase()} right now.
              </p>
              <p className="text-xs text-muted-foreground">
                Improving the weakest domain boosts overall consistency.
              </p>
            </CardContent>
          </Card>
          <Card className="bg-card/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gauge className="h-5 w-5 text-primary" /> Performance Snapshot
              </CardTitle>
              <CardDescription>Unified score & achievements</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4 text-sm">
              <div className="space-y-1">
                <div className="text-muted-foreground">Overall</div>
                <div className="text-2xl font-bold">
                  {Math.round(performance.scorePct)}%
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-muted-foreground">Achievements</div>
                <div className="text-2xl font-bold">{unlocked}</div>
              </div>
              <div className="col-span-2 text-xs text-muted-foreground">
                Keep pushing above {performance.scorePct > 90 ? "90%" : "80%"}{" "}
                to unlock harder challenges.
              </div>
            </CardContent>
          </Card>
        </div>

        {/* High Priority Tasks & Recent Achievements */}
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" /> High Priority Tasks
              </CardTitle>
              <CardDescription>Finish these to build momentum</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-left text-sm">
              {highPriority.length === 0 && (
                <p className="text-muted-foreground">
                  No high priority tasks pending.
                </p>
              )}
              {highPriority.map((t) => (
                <div key={t.id} className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                  <span className="truncate">{t.title}</span>
                </div>
              ))}
              <Link
                href="/tasks"
                className="text-xs text-primary hover:underline"
              >
                Go to tasks →
              </Link>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5" /> Recent Achievements
              </CardTitle>
              <CardDescription>Latest progress rewards</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-left text-sm">
              {achievements
                .filter((a) => a.isUnlocked && !a.isRevoked)
                .slice(-3)
                .reverse()
                .map((a) => (
                  <div key={a.id} className="flex items-start gap-2">
                    <Badge variant="outline" className="shrink-0">
                      {a.icon}
                    </Badge>
                    <div>
                      <div className="font-medium leading-tight">{a.title}</div>
                      <div className="text-xs text-muted-foreground">
                        +{a.gemReward} gems
                      </div>
                    </div>
                  </div>
                ))}
              {achievements.filter((a) => a.isUnlocked && !a.isRevoked)
                .length === 0 && (
                <p className="text-muted-foreground">
                  No achievements yet. Stay consistent.
                </p>
              )}
              <Link
                href="/achievements"
                className="text-xs text-primary hover:underline"
              >
                View all achievements →
              </Link>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </div>
  );
}
