"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  usePomodoroSettings,
  useUpsertPomodoroSettings,
} from "@/hooks/use-pomodoro-db";
import type { PomodoroSettings } from "@/lib/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Timer, Accessibility, Bell, Palette, Info } from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import useLocalStorage from "@/hooks/use-local-storage";
import { useQueryClient } from "@tanstack/react-query";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const queryClient = useQueryClient();
  const { settings: pomodoroSettings, isLoading } = usePomodoroSettings();
  const upsertSettings = useUpsertPomodoroSettings();
  const [reducedMotion, setReducedMotion] = useState(
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
  const [focusModeDefault, setFocusModeDefault] = useLocalStorage<boolean>(
    "focusModeDefault",
    false
  );
  const { toast } = useToast();

  const handlePomodoroSave = () => {
    upsertSettings.mutate(pomodoroSettings);
  };

  const handlePomodoroChange = (
    key: keyof PomodoroSettings,
    value: number | boolean
  ) => {
    // Optimistically update the query cache
    queryClient.setQueryData(
      [["pomodoro", "settings", "get"]],
      (old: PomodoroSettings | undefined) => ({
        ...(old || pomodoroSettings),
        [key]: value,
      })
    );
  };

  const handleReducedMotionToggle = (checked: boolean) => {
    setReducedMotion(checked);
    if (checked) {
      document.documentElement.classList.add("reduce-motion");
    } else {
      document.documentElement.classList.remove("reduce-motion");
    }
    toast({
      title: "Accessibility Updated",
      description: checked
        ? "Reduced animations enabled"
        : "Normal animations restored",
    });
  };

  return (
    <div className="container mx-auto py-6 space-y-8">
      <div>
        <h1 className="text-4xl font-bold mb-2">Settings</h1>
        <p className="text-muted-foreground text-lg">
          Customize your Focus Flow experience
        </p>
      </div>

      <Tabs defaultValue="pomodoro" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4 lg:w-auto">
          <TabsTrigger value="pomodoro">
            <Timer className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Pomodoro</span>
          </TabsTrigger>
          <TabsTrigger value="accessibility">
            <Accessibility className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Accessibility</span>
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="general">
            <Palette className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">General</span>
          </TabsTrigger>
        </TabsList>

        {/* Pomodoro Settings */}
        <TabsContent value="pomodoro" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pomodoro Settings</CardTitle>
              <CardDescription>
                Adjust work session and break durations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="work-duration">Work Duration (minutes)</Label>
                  <Input
                    id="work-duration"
                    type="number"
                    min="1"
                    max="60"
                    value={pomodoroSettings.workMin}
                    onChange={(e) =>
                      handlePomodoroChange("workMin", parseInt(e.target.value))
                    }
                  />
                  <p className="text-sm text-muted-foreground">
                    Recomendado: 25 minutos
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="break-duration">
                    Short Break Duration (minutes)
                  </Label>
                  <Input
                    id="break-duration"
                    type="number"
                    min="1"
                    max="30"
                    value={pomodoroSettings.breakMin}
                    onChange={(e) =>
                      handlePomodoroChange("breakMin", parseInt(e.target.value))
                    }
                  />
                  <p className="text-sm text-muted-foreground">
                    Recommended: 5 minutes
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="long-break-duration">
                    Long Break Duration (minutes)
                  </Label>
                  <Input
                    id="long-break-duration"
                    type="number"
                    min="1"
                    max="60"
                    value={pomodoroSettings.longBreakMin}
                    onChange={(e) =>
                      handlePomodoroChange(
                        "longBreakMin",
                        parseInt(e.target.value)
                      )
                    }
                  />
                  <p className="text-sm text-muted-foreground">
                    Recommended: 15 minutes
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cycles">Cycles Until Long Break</Label>
                  <Input
                    id="cycles"
                    type="number"
                    min="2"
                    max="8"
                    value={pomodoroSettings.cyclesUntilLong}
                    onChange={(e) =>
                      handlePomodoroChange(
                        "cyclesUntilLong",
                        parseInt(e.target.value)
                      )
                    }
                  />
                  <p className="text-sm text-muted-foreground">
                    Recommended: 4 cycles
                  </p>
                </div>
              </div>

              <Button onClick={handlePomodoroSave}>
                Save Pomodoro Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Accessibility Settings */}
        <TabsContent value="accessibility" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Accessibility</CardTitle>
              <CardDescription>
                ADHD-friendly and accessibility settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <Label htmlFor="reduced-motion" className="text-base">
                    Reduce Animations
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Minimizes movements and transitions to reduce distractions
                  </p>
                </div>
                <Switch
                  id="reduced-motion"
                  checked={reducedMotion}
                  onCheckedChange={handleReducedMotionToggle}
                />
              </div>

              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <Label htmlFor="high-contrast" className="text-base">
                    High Contrast
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Increases contrast for better readability
                  </p>
                </div>
                <Switch id="high-contrast" />
              </div>

              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <Label htmlFor="focus-indicators" className="text-base">
                    Strong Focus Indicators
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Highlights focused elements for keyboard navigation
                  </p>
                </div>
                <Switch id="focus-indicators" defaultChecked />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Settings */}
        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>
                Manage how you receive alerts and reminders
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <Label htmlFor="sound-enabled" className="text-base">
                    Sound Enabled
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Plays sound when completing pomodoro or break
                  </p>
                </div>
                <Switch
                  id="sound-enabled"
                  checked={pomodoroSettings.sound}
                  onCheckedChange={(checked) =>
                    handlePomodoroChange("sound", checked)
                  }
                />
              </div>

              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <Label htmlFor="desktop-notifications" className="text-base">
                    Desktop Notifications
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Sends system notifications for important events
                  </p>
                </div>
                <Switch
                  id="desktop-notifications"
                  checked={pomodoroSettings.desktopNotifications}
                  onCheckedChange={(checked) =>
                    handlePomodoroChange("desktopNotifications", checked)
                  }
                />
              </div>

              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <Label htmlFor="vibration" className="text-base">
                    Vibration (Mobile)
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Vibrates on mobile devices when completing session
                  </p>
                </div>
                <Switch
                  id="vibration"
                  checked={pomodoroSettings.vibration}
                  onCheckedChange={(checked) =>
                    handlePomodoroChange("vibration", checked)
                  }
                />
              </div>

              <Button onClick={handlePomodoroSave}>
                Save Notification Settings
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Flash Reminders</CardTitle>
              <CardDescription>
                Discreet reminders appear at the top of the screen
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <Label htmlFor="reminders-enabled" className="text-base">
                    Reminders Enabled
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Enable/disable all flash reminders globally
                  </p>
                </div>
                <Switch id="reminders-enabled" defaultChecked />
              </div>

              {/* Reminders page removed from application */}
            </CardContent>
          </Card>
        </TabsContent>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>
                Customize the interface appearance
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="theme">Theme</Label>
                <Select
                  value={theme}
                  onValueChange={(v) => setTheme(v as typeof theme)}
                >
                  <SelectTrigger id="theme">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  Choose between light, dark or automatic theme
                </p>
              </div>

              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <Label htmlFor="focus-default" className="text-base">
                    Enable Focus Mode by default
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Reduces visual noise across the app on load
                  </p>
                </div>
                <Switch
                  id="focus-default"
                  checked={focusModeDefault}
                  onCheckedChange={(checked) => setFocusModeDefault(checked)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="language">Idioma</Label>
                <Select defaultValue="pt-BR">
                  <SelectTrigger id="language">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pt-BR">Portuguese (BR)</SelectItem>
                    <SelectItem value="en-US">English (US)</SelectItem>
                    <SelectItem value="es-ES">Español</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  Idioma da interface (requer recarga)
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Dados e Privacidade</CardTitle>
              <CardDescription>
                Gerencie seus dados e preferências de privacidade
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg border border-amber-500/50 bg-amber-50 dark:bg-amber-950/20 p-4">
                <div className="flex gap-3">
                  <Info className="h-5 w-5 text-amber-600 dark:text-amber-500 flex-shrink-0 mt-0.5" />
                  <div className="space-y-2">
                    <p className="text-sm font-medium">
                      Dados Armazenados Localmente
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Todos os seus dados são armazenados no navegador
                      (localStorage) e nunca são enviados para servidores
                      externos. Você tem total controle sobre suas informações.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Button variant="outline" className="w-full sm:w-auto">
                  Exportar Dados (JSON)
                </Button>
                <p className="text-sm text-muted-foreground">
                  Baixe todos os seus dados em formato JSON
                </p>
              </div>

              <div className="space-y-2">
                <Button variant="outline" className="w-full sm:w-auto">
                  Importar Dados
                </Button>
                <p className="text-sm text-muted-foreground">
                  Restaure dados de um backup anterior
                </p>
              </div>

              <div className="space-y-2 pt-4 border-t">
                <Button variant="destructive" className="w-full sm:w-auto">
                  Limpar Todos os Dados
                </Button>
                <p className="text-sm text-muted-foreground">
                  Remove permanentemente todos os dados do localStorage (não
                  reversível)
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Sobre o Focus Flow</CardTitle>
              <CardDescription>Informações do aplicativo</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Versão:</span>
                <span className="font-mono">1.0.0</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  Última Atualização:
                </span>
                <span>06 de Novembro, 2025</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Desenvolvido por:</span>
                <span>Well</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
