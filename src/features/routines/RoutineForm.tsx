/**
 * RoutineForm.tsx
 *
 * Form for creating/editing routine items
 * ADHD-friendly: simple, clear fields, minimal options
 */

"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import type { RoutineItem, RoutineCategory, Frequency } from "@/lib/types";

const formSchema = z.object({
  title: z.string().min(3, "Título deve ter pelo menos 3 caracteres"),
  category: z.enum([
    "Manhã",
    "Durante o Dia",
    "Noite",
    "Rotina Semanal",
    "Propósito e Direção",
    "Manutenção",
  ]),
  frequency: z.enum(["daily", "weekly", "monthly", "every3days"]),
  active: z.boolean(),
});

type FormValues = z.infer<typeof formSchema>;

interface RoutineFormProps {
  routine?: RoutineItem;
  onSubmit: (data: FormValues) => void;
  onDelete?: () => void;
}

const categoryDescriptions: Record<RoutineCategory, string> = {
  Manhã: "Primeiras atividades do dia",
  "Durante o Dia": "Tarefas ao longo do dia",
  Noite: "Rotina antes de dormir",
  "Rotina Semanal": "Atividades semanais",
  "Propósito e Direção": "Reflexão e planejamento",
  Manutenção: "Cuidados e organização",
};

const frequencyLabels: Record<Frequency, string> = {
  daily: "Diário",
  weekly: "Semanal (domingo)",
  monthly: "Mensal (dia 1)",
  every3days: "A cada 3 dias",
};

export function RoutineForm({ routine, onSubmit, onDelete }: RoutineFormProps) {
  const isEditing = !!routine;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: routine?.title || "",
      category: routine?.category || "Manhã",
      frequency: routine?.frequency || "daily",
      active: routine?.active ?? true,
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Título da Rotina</FormLabel>
              <FormControl>
                <Input
                  placeholder="Ex: Arrumar a cama"
                  {...field}
                  className="text-base"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Categoria</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {Object.entries(categoryDescriptions).map(([key, desc]) => (
                    <SelectItem key={key} value={key}>
                      <div className="flex flex-col items-start">
                        <span className="font-medium">{key}</span>
                        <span className="text-xs text-muted-foreground">
                          {desc}
                        </span>
                      </div>
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
          name="frequency"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Frequência</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {Object.entries(frequencyLabels).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                Quando esta rotina deve aparecer
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="active"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Ativa</FormLabel>
                <FormDescription>
                  Desative temporariamente para ocultar esta rotina
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="flex gap-2 pt-4">
          <Button type="submit" className="flex-1">
            {isEditing ? "Atualizar Rotina" : "Criar Rotina"}
          </Button>
          {isEditing && onDelete && (
            <Button type="button" variant="destructive" onClick={onDelete}>
              Excluir
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
}
