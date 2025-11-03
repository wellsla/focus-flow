
'use client';

import { useState, useEffect } from 'react';
import { differenceInSeconds } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

type BenefitsCountdownCardProps = {
  endDate: string;
};

const calculateRemainingTime = (endDate: string) => {
  const now = new Date();
  const end = new Date(endDate);
  const totalSeconds = differenceInSeconds(end, now);

  if (totalSeconds <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, totalSeconds: 0 };
  }

  const days = Math.floor(totalSeconds / (3600 * 24));
  const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);

  return { days, hours, minutes, seconds, totalSeconds };
};

export function BenefitsCountdownCard({ endDate }: BenefitsCountdownCardProps) {
  const [remainingTime, setRemainingTime] = useState(() => calculateRemainingTime(endDate));
  
  useEffect(() => {
    const interval = setInterval(() => {
        setRemainingTime(calculateRemainingTime(endDate));
    }, 1000);

    return () => clearInterval(interval);
  }, [endDate]);

  const getUrgencyStyle = () => {
    const daysLeft = remainingTime.days;
    if (daysLeft <= 30) return 'critical';
    if (daysLeft <= 60) return 'warning';
    return 'default';
  };

  const urgency = getUrgencyStyle();
  
  const cardStyles = {
    default: {
        card: "bg-green-100/50 dark:bg-green-900/30 border-green-300 dark:border-green-700",
        title: "text-green-800 dark:text-green-300",
        icon: "text-green-700 dark:text-green-400",
        value: "text-green-900 dark:text-green-200",
    },
    warning: {
        card: "bg-amber-100/50 dark:bg-amber-900/30 border-amber-300 dark:border-amber-700",
        title: "text-amber-800 dark:text-amber-300",
        icon: "text-amber-700 dark:text-amber-400",
        value: "text-amber-900 darktext-amber-200",
    },
    critical: {
        card: "bg-red-100/50 dark:bg-red-900/30 border-accent dark:border-accent",
        title: "text-red-800 dark:text-red-300",
        icon: "text-accent",
        value: "text-accent",
    },
  };

  const styles = cardStyles[urgency];

  return (
    <Card className={cn("transition-colors", styles.card)}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className={cn("text-sm font-medium", styles.title)}>
                Benefits Countdown
            </CardTitle>
            <CalendarCheck className={cn("h-4 w-4", styles.icon)} />
        </CardHeader>
        <CardContent>
            {remainingTime.totalSeconds > 0 ? (
                <div className={cn("text-2xl font-bold", styles.value, {"animate-pulse": urgency === 'critical'})}>
                    {remainingTime.days}d {remainingTime.hours}h {remainingTime.minutes}m {remainingTime.seconds}s
                </div>
            ) : (
                <div className={cn("text-2xl font-bold", styles.value)}>
                    Benefit period has ended.
                </div>
            )}
            <p className="text-xs text-muted-foreground">
                Time remaining until your benefits end.
            </p>
        </CardContent>
    </Card>
  );
}
