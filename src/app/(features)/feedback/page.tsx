"use client";

import { useState, useMemo } from "react";
import { useFeedbackRecords, useGenerateFeedback } from "@/hooks/use-feedback";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { format } from "date-fns";
import {
  CalendarIcon,
  Download,
  BrainCircuit,
  Loader2,
  Filter,
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import * as XLSX from "xlsx";

const ALL_TYPES = [
  "application",
  "goal",
  "task",
  "pomodoro",
  "timeTracking",
  "finance",
  "journal",
] as const;

type RecordType = (typeof ALL_TYPES)[number];

export default function FeedbackPage() {
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [selectedTypes, setSelectedTypes] = useState<RecordType[]>([
    ...ALL_TYPES,
  ]);
  const [markdownOpen, setMarkdownOpen] = useState(false);
  const [generatedMarkdown, setGeneratedMarkdown] = useState(
    "\n_Gere recomendações para ver o feedback aqui._"
  );

  const filters = useMemo(
    () => ({
      startDate: startDate ? format(startDate, "yyyy-MM-dd") : undefined,
      endDate: endDate ? format(endDate, "yyyy-MM-dd") : undefined,
      types: selectedTypes,
    }),
    [startDate, endDate, selectedTypes]
  );

  const { data: records, isLoading } = useFeedbackRecords(filters);
  const generate = useGenerateFeedback();

  function toggleType(t: RecordType) {
    setSelectedTypes((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]
    );
  }

  function exportXLSX() {
    if (!records || records.length === 0) return;
    const worksheetData = records.map((r) => ({
      ID: r.id,
      Tipo: r.type,
      Data: r.date,
      Título: r.title,
      Detalhes: r.details || "",
    }));
    const ws = XLSX.utils.json_to_sheet(worksheetData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Feedback");
    XLSX.writeFile(wb, `feedback_registros_${Date.now()}.xlsx`);
  }

  async function handleGenerate() {
    if (!records || records.length === 0) return;
    const res = await generate.mutateAsync({
      filters: filters,
      focusIds: records.slice(0, 120).map((r) => r.id),
    });
    setGeneratedMarkdown(res.markdown);
    setMarkdownOpen(true);
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold font-headline tracking-tight">
            Feedback Centralizado
          </h1>
          <p className="text-muted-foreground max-w-lg">
            Consolidação de atividades (aplicações, metas, tarefas, foco,
            finanças e mais) para gerar análise cética e recomendações
            priorizadas.
          </p>
        </div>
        <div className="flex gap-2 items-center">
          <Button
            variant="outline"
            onClick={exportXLSX}
            disabled={!records || records.length === 0}
          >
            <Download className="mr-2 h-4 w-4" /> Exportar XLSX
          </Button>
          <Button
            onClick={handleGenerate}
            disabled={generate.isLoading || !records || records.length === 0}
          >
            {generate.isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Gerando...
              </>
            ) : (
              <>
                <BrainCircuit className="mr-2 h-4 w-4" /> Gerar Feedback AI
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Filter className="h-4 w-4" /> Filtros
          </CardTitle>
          <CardDescription>
            Refine o intervalo de tempo e tipos de registro.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-4 items-end">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-[170px] justify-between">
                  {startDate ? format(startDate, "dd/MM/yyyy") : "Data Inicial"}
                  <CalendarIcon className="ml-2 h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="p-2" align="start">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={setStartDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-[170px] justify-between">
                  {endDate ? format(endDate, "dd/MM/yyyy") : "Data Final"}
                  <CalendarIcon className="ml-2 h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="p-2" align="start">
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={setEndDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <div className="flex flex-wrap gap-3">
              {ALL_TYPES.map((t) => (
                <label key={t} className="flex items-center gap-2 text-xs">
                  <Checkbox
                    checked={selectedTypes.includes(t)}
                    onCheckedChange={() => toggleType(t)}
                  />
                  <span className="capitalize">{t}</span>
                </label>
              ))}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                setSelectedTypes(
                  selectedTypes.length === ALL_TYPES.length
                    ? []
                    : [...ALL_TYPES]
                )
              }
            >
              {selectedTypes.length === ALL_TYPES.length
                ? "Limpar"
                : "Selecionar Tudo"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Records Table */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">
            Registros ({records?.length || 0})
          </CardTitle>
          <CardDescription>
            Painel consolidado. Ordenado por data desc.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Carregando...</p>
          ) : !records || records.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nenhum registro encontrado para os filtros.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left border-b">
                    <th className="py-2 pr-4">Data</th>
                    <th className="py-2 pr-4">Tipo</th>
                    <th className="py-2 pr-4">Título</th>
                    <th className="py-2 pr-4">Detalhes</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((r) => (
                    <tr key={r.id} className="border-b hover:bg-muted/50">
                      <td className="py-1 pr-4 whitespace-nowrap">
                        {format(new Date(r.date), "dd/MM/yyyy")}
                      </td>
                      <td className="py-1 pr-4 capitalize">{r.type}</td>
                      <td
                        className="py-1 pr-4 font-medium max-w-[280px] truncate"
                        title={r.title}
                      >
                        {r.title}
                      </td>
                      <td
                        className="py-1 pr-4 text-muted-foreground max-w-[320px] truncate"
                        title={r.details || ""}
                      >
                        {r.details}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={markdownOpen} onOpenChange={setMarkdownOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Feedback Gerado</DialogTitle>
          </DialogHeader>
          <div className="prose prose-sm dark:prose-invert max-h-[60vh] overflow-y-auto">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {generatedMarkdown}
            </ReactMarkdown>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
