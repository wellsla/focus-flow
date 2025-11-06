/**
 * FocusGate.tsx
 *
 * Immersive full-screen overlay for deep focus
 * Minimal UI, large timer, breathing indicator, exit confirmation
 */

"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Focus, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface FocusGateProps {
  isActive: boolean;
  elapsedMinutes: number;
  targetMinutes?: number;
  onExit: () => void;
}

/**
 * Format minutes as HH:MM
 */
function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours > 0) {
    return `${hours}h ${mins.toString().padStart(2, "0")}m`;
  }
  return `${mins}m`;
}

/**
 * Breathing animation indicator
 */
function BreathingIndicator() {
  return (
    <div className="relative flex items-center justify-center">
      <div className="absolute w-24 h-24 rounded-full bg-primary/20 animate-ping" />
      <div className="absolute w-20 h-20 rounded-full bg-primary/30 animate-pulse" />
      <div className="w-16 h-16 rounded-full bg-primary/50 flex items-center justify-center">
        <Focus className="h-8 w-8 text-primary-foreground" />
      </div>
    </div>
  );
}

export function FocusGate({
  isActive,
  elapsedMinutes,
  targetMinutes,
  onExit,
}: FocusGateProps) {
  const [showExitDialog, setShowExitDialog] = useState(false);

  if (!isActive) return null;

  const progress = targetMinutes
    ? Math.min((elapsedMinutes / targetMinutes) * 100, 100)
    : 0;

  const isComplete = targetMinutes ? elapsedMinutes >= targetMinutes : false;

  return (
    <>
      {/* Full-screen overlay */}
      <div className="fixed inset-0 z-50 bg-background flex flex-col items-center justify-center p-8">
        {/* Exit button (top-right) */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4"
          onClick={() => setShowExitDialog(true)}
        >
          <X className="h-5 w-5" />
        </Button>

        {/* Main content */}
        <div className="flex flex-col items-center space-y-12 max-w-2xl w-full">
          {/* Breathing indicator */}
          <BreathingIndicator />

          {/* Timer display */}
          <div className="text-center space-y-4">
            <h1 className="text-7xl font-bold tabular-nums tracking-tight">
              {formatDuration(elapsedMinutes)}
            </h1>
            {targetMinutes && (
              <p className="text-2xl text-muted-foreground">
                de {formatDuration(targetMinutes)}
              </p>
            )}
          </div>

          {/* Progress bar (if target set) */}
          {targetMinutes && (
            <div className="w-full max-w-md">
              <div className="h-3 bg-muted rounded-full overflow-hidden">
                <div
                  className={cn(
                    "h-full transition-all duration-1000 ease-linear",
                    isComplete ? "bg-green-500" : "bg-primary"
                  )}
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-center text-sm text-muted-foreground mt-2">
                {Math.round(progress)}% completo
              </p>
            </div>
          )}

          {/* Completion message */}
          {isComplete && (
            <Card className="border-green-500/50 bg-green-50 dark:bg-green-950">
              <CardContent className="pt-6 text-center">
                <p className="text-lg font-semibold text-green-700 dark:text-green-300">
                  🎉 Meta alcançada! Continue ou finalize quando quiser.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Motivational message */}
          <div className="text-center space-y-2">
            <p className="text-lg text-muted-foreground">
              Mantenha o foco. Respire fundo.
            </p>
            <p className="text-sm text-muted-foreground">
              Você está fazendo um ótimo trabalho.
            </p>
          </div>
        </div>

        {/* Footer hint */}
        <div className="absolute bottom-8 text-center">
          <p className="text-xs text-muted-foreground">
            Pressione ESC ou clique no ✕ para sair
          </p>
        </div>
      </div>

      {/* Exit confirmation dialog */}
      <AlertDialog open={showExitDialog} onOpenChange={setShowExitDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sair do modo foco?</AlertDialogTitle>
            <AlertDialogDescription>
              Você esteve focado por {formatDuration(elapsedMinutes)}.
              {!isComplete && targetMinutes && (
                <span className="block mt-2">
                  Faltam {formatDuration(targetMinutes - elapsedMinutes)} para
                  sua meta.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Continuar Focado</AlertDialogCancel>
            <AlertDialogAction onClick={onExit}>
              Finalizar Sessão
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
