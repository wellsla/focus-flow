/**
 * /journal page
 *
 * Complete journal interface with quick entry, history, and PDF export
 * ADHD-friendly: simple form, clear structure, one entry per day
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Download, Calendar } from "lucide-react";
import { QuickEntry } from "@/features/journal/QuickEntry";
import { JournalList } from "@/features/journal/JournalList";
import { useLocalStorageState } from "@/hooks/use-local-storage-state";
import type { JournalEntry } from "@/lib/types";
import { format, startOfDay } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { exportJournalToPDF } from "@/lib/export-pdf";
import { pointsForJournal, getEncouragementMessage } from "@/lib/reward-engine";
import { loadRewards, saveRewards } from "@/lib/storage";

export default function JournalPage() {
  const [entries, setEntries] = useLocalStorageState<JournalEntry[]>(
    "journal-entries",
    []
  );
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState(false);
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null);

  const todayISO = format(startOfDay(new Date()), "yyyy-MM-dd");
  const todayEntry = entries.find((e) => e.dateISO === todayISO);

  // Stats
  const totalEntries = entries.length;
  const entriesThisMonth = entries.filter((e) =>
    e.dateISO.startsWith(format(new Date(), "yyyy-MM"))
  ).length;

  /**
   * Handle new entry submission
   */
  const handleSubmit = (entryData: Omit<JournalEntry, "id" | "dateISO">) => {
    if (editingEntry) {
      // Update existing
      const updated: JournalEntry = {
        ...editingEntry,
        ...entryData,
      };
      setEntries(entries.map((e) => (e.id === updated.id ? updated : e)));
      toast({
        title: "Registro atualizado",
        description: "Seu diário foi atualizado com sucesso.",
      });
      setEditingEntry(null);
    } else if (todayEntry) {
      // Update today's entry
      const updated: JournalEntry = {
        ...todayEntry,
        ...entryData,
      };
      setEntries(entries.map((e) => (e.id === updated.id ? updated : e)));
      toast({
        title: "Registro atualizado",
        description: "Seu registro de hoje foi atualizado.",
      });
    } else {
      // Create new entry for today
      const newEntry: JournalEntry = {
        id: `journal-${Date.now()}`,
        dateISO: todayISO,
        ...entryData,
      };
      setEntries([...entries, newEntry]);

      // Award points
      const rewards = loadRewards();
      const points = pointsForJournal();
      rewards.points += points;
      saveRewards(rewards);

      toast({
        title: "Registro salvo! 🎉",
        description: `${getEncouragementMessage(
          "journal"
        )} (+${points} pontos)`,
      });
    }
  };

  /**
   * Handle entry deletion
   */
  const handleDelete = (id: string) => {
    const entry = entries.find((e) => e.id === id);
    setEntries(entries.filter((e) => e.id !== id));
    toast({
      title: "Registro excluído",
      description: `Registro de ${
        entry ? format(new Date(entry.dateISO), "dd/MM/yyyy") : ""
      } foi removido.`,
      variant: "destructive",
    });
    if (editingEntry?.id === id) {
      setEditingEntry(null);
    }
  };

  /**
   * Handle PDF export
   */
  const handleExport = async () => {
    if (entries.length === 0) {
      toast({
        title: "Nenhum registro",
        description: "Você precisa ter pelo menos um registro para exportar.",
        variant: "destructive",
      });
      return;
    }

    setIsExporting(true);
    try {
      await exportJournalToPDF(entries);
      toast({
        title: "PDF exportado! 📄",
        description: "Seu diário foi salvo como PDF com sucesso.",
      });
    } catch (error) {
      console.error("Export error:", error);
      toast({
        title: "Erro ao exportar",
        description: "Não foi possível exportar o PDF. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Meu Diário</h1>
          <p className="text-muted-foreground mt-1">
            Reflexão diária em 3 linhas simples
          </p>
        </div>
        <Button
          size="lg"
          variant="outline"
          onClick={handleExport}
          disabled={isExporting || entries.length === 0}
        >
          <Download className="mr-2 h-5 w-5" />
          {isExporting ? "Exportando..." : "Exportar PDF"}
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total de Registros
            </CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEntries}</div>
            <p className="text-xs text-muted-foreground">
              Dias de reflexão registrados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Este Mês</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{entriesThisMonth}</div>
            <p className="text-xs text-muted-foreground">
              Registros em {format(new Date(), "MMMM")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pontos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{pointsForJournal()}</div>
            <p className="text-xs text-muted-foreground">
              Por cada registro completo
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="today" className="space-y-4">
        <TabsList>
          <TabsTrigger value="today">Hoje</TabsTrigger>
          <TabsTrigger value="history">Histórico</TabsTrigger>
        </TabsList>

        {/* Today's Entry Tab */}
        <TabsContent value="today" className="space-y-4">
          <QuickEntry
            onSubmit={handleSubmit}
            entry={editingEntry || todayEntry}
          />
          {todayEntry && !editingEntry && (
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground text-center">
                  ✅ You&apos;ve already logged your journal today! You can edit
                  above or visualizar no histórico.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="space-y-4">
          {entries.length > 0 ? (
            <JournalList
              entries={entries}
              onEdit={(entry) => {
                setEditingEntry(entry);
                // Switch to today tab to show form
                const todayTab = document.querySelector(
                  '[value="today"]'
                ) as HTMLButtonElement;
                todayTab?.click();
              }}
              onDelete={handleDelete}
            />
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium mb-2">
                  Nenhum registro ainda
                </p>
                <p className="text-sm text-muted-foreground text-center max-w-md mb-6">
                  Comece seu diário na aba &quot;Hoje&quot; refletindo sobre
                  como você está se sentindo.
                </p>
                <Button
                  onClick={() => {
                    const todayTab = document.querySelector(
                      '[value="today"]'
                    ) as HTMLButtonElement;
                    todayTab?.click();
                  }}
                >
                  Create First Entry
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
