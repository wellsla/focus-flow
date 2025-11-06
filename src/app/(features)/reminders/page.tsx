"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { loadReminders, saveReminders } from "@/lib/storage";
import type { FlashReminder, FlashReminderTrigger } from "@/lib/types";
import { Plus, Trash2, Clock, Zap, AppWindow } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function RemindersPage() {
  const [reminders, setReminders] = useState<FlashReminder[]>(() =>
    loadReminders()
  );
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleSave = () => {
    saveReminders(reminders);
    setEditingId(null);
  };

  const handleToggle = (id: string) => {
    setReminders((prev) =>
      prev.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r))
    );
    saveReminders(
      reminders.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r))
    );
  };

  const handleDelete = (id: string) => {
    const updated = reminders.filter((r) => r.id !== id);
    setReminders(updated);
    saveReminders(updated);
  };

  const handleAdd = () => {
    const newReminder: FlashReminder = {
      id: `reminder-${Date.now()}`,
      text: "Novo lembrete",
      trigger: "time",
      timeOfDay: "09:00",
      enabled: true,
    };
    setReminders((prev) => [...prev, newReminder]);
    setEditingId(newReminder.id);
  };

  const handleUpdate = (id: string, updates: Partial<FlashReminder>) => {
    setReminders((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...updates } : r))
    );
  };

  const getTriggerIcon = (trigger: FlashReminderTrigger) => {
    switch (trigger) {
      case "time":
        return <Clock className="h-4 w-4" />;
      case "app-open":
        return <AppWindow className="h-4 w-4" />;
      case "pomodoro-start":
        return <Zap className="h-4 w-4" />;
    }
  };

  const getTriggerLabel = (trigger: FlashReminderTrigger) => {
    switch (trigger) {
      case "time":
        return "Horário";
      case "app-open":
        return "Ao Abrir App";
      case "pomodoro-start":
        return "Início Pomodoro";
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold mb-2">Flash Reminders</h1>
          <p className="text-muted-foreground text-lg">
            Lembretes discretos para mantê-lo no caminho
          </p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Lembrete
        </Button>
      </div>

      <div className="space-y-4">
        {reminders.map((reminder) => (
          <Card key={reminder.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {getTriggerIcon(reminder.trigger)}
                    <Badge variant="secondary">
                      {getTriggerLabel(reminder.trigger)}
                    </Badge>
                    {reminder.trigger === "time" && reminder.timeOfDay && (
                      <Badge variant="outline">{reminder.timeOfDay}</Badge>
                    )}
                  </div>
                  {editingId === reminder.id ? (
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor={`text-${reminder.id}`}>
                          Texto do Lembrete
                        </Label>
                        <Textarea
                          id={`text-${reminder.id}`}
                          value={reminder.text}
                          onChange={(e) =>
                            handleUpdate(reminder.id, { text: e.target.value })
                          }
                          className="mt-2"
                          rows={2}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor={`trigger-${reminder.id}`}>
                            Gatilho
                          </Label>
                          <Select
                            value={reminder.trigger}
                            onValueChange={(value) =>
                              handleUpdate(reminder.id, {
                                trigger: value as FlashReminderTrigger,
                              })
                            }
                          >
                            <SelectTrigger
                              id={`trigger-${reminder.id}`}
                              className="mt-2"
                            >
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="time">Horário</SelectItem>
                              <SelectItem value="app-open">
                                Ao Abrir App
                              </SelectItem>
                              <SelectItem value="pomodoro-start">
                                Início Pomodoro
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        {reminder.trigger === "time" && (
                          <div>
                            <Label htmlFor={`time-${reminder.id}`}>
                              Horário (HH:MM)
                            </Label>
                            <Input
                              id={`time-${reminder.id}`}
                              type="time"
                              value={reminder.timeOfDay || "09:00"}
                              onChange={(e) =>
                                handleUpdate(reminder.id, {
                                  timeOfDay: e.target.value,
                                })
                              }
                              className="mt-2"
                            />
                          </div>
                        )}
                      </div>
                      {reminder.trigger === "pomodoro-start" && (
                        <div className="flex items-center space-x-2">
                          <Switch
                            id={`focus-${reminder.id}`}
                            checked={reminder.allowInFocus || false}
                            onCheckedChange={(checked) =>
                              handleUpdate(reminder.id, {
                                allowInFocus: checked,
                              })
                            }
                          />
                          <Label htmlFor={`focus-${reminder.id}`}>
                            Permitir durante Modo Foco
                          </Label>
                        </div>
                      )}
                      <div className="flex gap-2">
                        <Button onClick={handleSave} size="sm">
                          Salvar
                        </Button>
                        <Button
                          onClick={() => setEditingId(null)}
                          variant="outline"
                          size="sm"
                        >
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <CardTitle className="text-lg">{reminder.text}</CardTitle>
                      <CardDescription className="mt-1">
                        {reminder.trigger === "app-open" &&
                          "Exibido ao abrir o aplicativo"}
                        {reminder.trigger === "pomodoro-start" &&
                          "Exibido ao iniciar um pomodoro"}
                        {reminder.trigger === "time" &&
                          `Exibido todos os dias às ${reminder.timeOfDay}`}
                      </CardDescription>
                    </>
                  )}
                </div>
                {editingId !== reminder.id && (
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={reminder.enabled}
                      onCheckedChange={() => handleToggle(reminder.id)}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingId(reminder.id)}
                    >
                      Editar
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(reminder.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
          </Card>
        ))}

        {reminders.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground mb-4">
                Nenhum lembrete configurado ainda
              </p>
              <Button onClick={handleAdd}>
                <Plus className="h-4 w-4 mr-2" />
                Criar Primeiro Lembrete
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
