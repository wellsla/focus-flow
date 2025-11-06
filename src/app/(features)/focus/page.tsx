/**
 * /focus page
 *
 * Start focus mode sessions with customizable duration
 * Immersive overlay, wake lock, session tracking
 */

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Focus, Timer, Trophy } from "lucide-react";
import { FocusGate } from "@/features/focus/FocusGate";
import { useFocusLock } from "@/hooks/use-focus-lock";
import { useToast } from "@/hooks/use-toast";
import { loadFocusBlocks } from "@/lib/storage";

const PRESET_DURATIONS = [
  { label: "15 min", minutes: 15 },
  { label: "25 min (Pomodoro)", minutes: 25 },
  { label: "45 min", minutes: 45 },
  { label: "60 min", minutes: 60 },
  { label: "90 min", minutes: 90 },
];

export default function FocusPage() {
  const [targetMinutes, setTargetMinutes] = useState<number>(25);
  const [customMinutes, setCustomMinutes] = useState<string>("25");
  const { toast } = useToast();

  const { isLocked, startFocus, endFocus, elapsedMinutes } = useFocusLock({
    onComplete: () => {
      toast({
        title: "Sessão de foco finalizada! 🎯",
        description: `Você focou por ${elapsedMinutes} minutos. Ótimo trabalho!`,
      });
    },
  });

  // Load stats
  const blocks = loadFocusBlocks();
  const totalSessions = blocks.length;
  const totalMinutes = blocks.reduce((sum, b) => {
    if (!b.endedAt) return sum;
    const duration = Math.round(
      (new Date(b.endedAt).getTime() - new Date(b.startedAt).getTime()) / 60000
    );
    return sum + duration;
  }, 0);
  const avgDuration =
    totalSessions > 0 ? Math.round(totalMinutes / totalSessions) : 0;

  /**
   * Start focus session
   */
  const handleStart = () => {
    startFocus();
  };

  /**
   * Handle preset selection
   */
  const handlePresetSelect = (minutes: number) => {
    setTargetMinutes(minutes);
    setCustomMinutes(minutes.toString());
  };

  /**
   * Handle custom duration input
   */
  const handleCustomChange = (value: string) => {
    setCustomMinutes(value);
    const parsed = parseInt(value);
    if (!isNaN(parsed) && parsed > 0) {
      setTargetMinutes(parsed);
    }
  };

  if (isLocked) {
    return (
      <FocusGate
        isActive={isLocked}
        elapsedMinutes={elapsedMinutes}
        targetMinutes={targetMinutes}
        onExit={endFocus}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Modo Foco</h1>
        <p className="text-muted-foreground mt-1">
          Entre em foco profundo com um ambiente livre de distrações
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Sessões Totais
            </CardTitle>
            <Focus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSessions}</div>
            <p className="text-xs text-muted-foreground">
              Sessões de foco realizadas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tempo Total</CardTitle>
            <Timer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.floor(totalMinutes / 60)}h {totalMinutes % 60}m
            </div>
            <p className="text-xs text-muted-foreground">
              De foco profundo acumulado
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Duração Média</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgDuration} min</div>
            <p className="text-xs text-muted-foreground">Por sessão de foco</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Setup Card */}
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Focus className="h-5 w-5" />
            Iniciar Nova Sessão
          </CardTitle>
          <CardDescription>
            Escolha a duração e entre em modo foco imersivo
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Preset durations */}
          <div className="space-y-3">
            <Label>Durações Rápidas</Label>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              {PRESET_DURATIONS.map((preset) => (
                <Button
                  key={preset.minutes}
                  variant={
                    targetMinutes === preset.minutes ? "default" : "outline"
                  }
                  onClick={() => handlePresetSelect(preset.minutes)}
                >
                  {preset.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Custom duration */}
          <div className="space-y-2">
            <Label htmlFor="custom-duration">Duração Personalizada</Label>
            <div className="flex gap-2">
              <Input
                id="custom-duration"
                type="number"
                min="1"
                max="240"
                value={customMinutes}
                onChange={(e) => handleCustomChange(e.target.value)}
                placeholder="Minutos"
              />
              <span className="flex items-center text-sm text-muted-foreground">
                minutos
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Máximo: 240 minutos (4 horas)
            </p>
          </div>

          {/* Start button */}
          <Button
            size="lg"
            className="w-full"
            onClick={handleStart}
            disabled={!targetMinutes || targetMinutes <= 0}
          >
            <Focus className="mr-2 h-5 w-5" />
            Iniciar Foco ({targetMinutes} min)
          </Button>

          {/* Instructions */}
          <Card className="bg-muted/50">
            <CardContent className="pt-6 space-y-2">
              <p className="text-sm font-medium">Durante o modo foco:</p>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>A tela permanecerá ativa (wake lock)</li>
                <li>Um overlay imersivo cobrirá toda a tela</li>
                <li>Você verá apenas o timer e indicador de progresso</li>
                <li>
                  Pressione ESC ou clique no ✕ para sair a qualquer momento
                </li>
              </ul>
            </CardContent>
          </Card>
        </CardContent>
      </Card>

      {/* Recent Sessions */}
      {blocks.length > 0 && (
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Sessões Recentes</CardTitle>
            <CardDescription>Suas últimas 5 sessões de foco</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {blocks
                .slice(-5)
                .reverse()
                .map((block) => {
                  const date = new Date(block.startedAt);
                  const duration = block.endedAt
                    ? Math.round(
                        (new Date(block.endedAt).getTime() -
                          new Date(block.startedAt).getTime()) /
                          60000
                      )
                    : block.plannedMin;
                  return (
                    <div
                      key={block.id}
                      className="flex items-center justify-between p-3 rounded-lg border"
                    >
                      <div>
                        <p className="font-medium">{duration} minutos</p>
                        <p className="text-xs text-muted-foreground">
                          {date.toLocaleDateString("pt-BR")} às{" "}
                          {date.toLocaleTimeString("pt-BR", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                      <Focus className="h-4 w-4 text-primary" />
                    </div>
                  );
                })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
