"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FinancialAccount, IncomeSettings, Currency } from "@/lib/types";
import { fetchFinancialSuggestions, fetchInvestmentTips } from "../actions";
import {
  AlertCircle,
  Bot,
  CalendarIcon,
  Loader2,
  PlusCircle,
  Sparkles,
  ClipboardCopy,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { FormDialog } from "@/components/form-dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format, startOfMonth, isSameMonth } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";

const MarkdownRenderer = ({ content }: { content: string }) => {
  // Simple HTML sanitization to prevent XSS
  const sanitize = (str: string): string => {
    return str
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#x27;");
  };

  const formatLine = (line: string): string => {
    // Sanitize input first, then apply formatting
    const sanitized = sanitize(line);
    const formattedLine = sanitized
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>") // Bold
      .replace(/\*(.*?)\*/g, "<em>$1</em>"); // Italics

    if (formattedLine.trim().startsWith("- ")) {
      return `<li>${formattedLine.trim().substring(2)}</li>`;
    }
    if (formattedLine.trim().startsWith("* ")) {
      return `<li>${formattedLine.trim().substring(2)}</li>`;
    }
    if (/^\d+\.\s/.test(formattedLine.trim())) {
      return `<li>${formattedLine
        .trim()
        .substring(formattedLine.indexOf(" ") + 1)}</li>`;
    }

    return `<p>${formattedLine}</p>`;
  };

  const createMarkup = () => {
    const lines = content.split("\n");
    let html = "";
    let inList = false;
    let listType = "";

    lines.forEach((line) => {
      const isListItem =
        line.trim().startsWith("- ") || line.trim().startsWith("* ");
      const isOrderedListItem = /^\d+\.\s/.test(line.trim());

      if ((isListItem || isOrderedListItem) && !inList) {
        listType = isOrderedListItem ? "ol" : "ul";
        inList = true;
        html += `<${listType} class="list-disc pl-5 space-y-1">`;
      } else if (!isListItem && !isOrderedListItem && inList) {
        inList = false;
        html += `</${listType}>`;
      }
      html += formatLine(line);
    });

    if (inList) {
      html += `</${listType}>`;
    }

    return { __html: html };
  };

  return (
    <div
      className="prose prose-sm dark:prose-invert"
      dangerouslySetInnerHTML={createMarkup()}
    />
  );
};

type FinancialsProps = {
  incomeSettings: IncomeSettings;
  financialAccounts: FinancialAccount[];
  onDataUpdate: (
    accounts: FinancialAccount[],
    newIncome?: IncomeSettings
  ) => void;
};

const financialItemFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  amount: z.coerce
    .number()
    .refine((val) => val !== 0, "Amount cannot be zero."),
  type: z.enum(["expense", "debt", "income"]),
  currency: z.enum(["R$", "$", "€"]),
  date: z.date().optional(),
});

type FinancialItemFormValues = z.infer<typeof financialItemFormSchema>;

const FinancialItemForm = ({
  item,
  onSubmit,
  onDelete,
}: {
  item?: FinancialAccount | null;
  onSubmit: (data: FinancialAccount) => void;
  onDelete?: (id: string) => void;
}) => {
  const isEditing = !!item;
  const form = useForm<FinancialItemFormValues>({
    resolver: zodResolver(financialItemFormSchema),
    defaultValues: {
      name: item?.name || "",
      amount: item?.amount ? Math.abs(item.amount) : 0,
      type: item?.type || "expense",
      currency: item?.currency || "R$",
      date: item?.date ? new Date(item.date) : new Date(),
    },
  });

  const type = form.watch("type");

  useEffect(() => {
    form.reset({
      name: item?.name || "",
      amount: item?.amount ? Math.abs(item.amount) : 0,
      type: item?.type || "expense",
      currency: item?.currency || "R$",
      date: item?.date ? new Date(item.date) : new Date(),
    });
  }, [item, form]);

  const handleSubmit = (values: FinancialItemFormValues) => {
    const amount =
      values.type === "income"
        ? Math.abs(values.amount)
        : -Math.abs(values.amount);
    onSubmit({
      ...values,
      id:
        item?.id ||
        (typeof crypto !== "undefined" && "randomUUID" in crypto
          ? (crypto as any).randomUUID()
          : new Date().toISOString()),
      amount,
      type: values.type,
      date:
        values.type === "income"
          ? format(values.date!, "yyyy-MM-dd")
          : undefined,
    });
  };

  const handleDelete = () => {
    if (item && onDelete) {
      onDelete(item.id);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="E.g., Netflix, Freelance Gig" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="income">One-Time Income</SelectItem>
                  <SelectItem value="expense">Recurring Expense</SelectItem>
                  <SelectItem value="debt">Debt</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Amount ({type === "debt" ? "Total" : "Value"})
              </FormLabel>
              <FormControl>
                <Input type="number" step="0.01" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {type === "income" && (
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Date Received</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        <FormField
          control={form.control}
          name="currency"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Currency</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="R$">BRL (R$)</SelectItem>
                  <SelectItem value="$">USD ($)</SelectItem>
                  <SelectItem value="€">EUR (€)</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-between">
          <Button type="submit" className="flex-grow">
            {isEditing ? "Update Item" : "Add Item"}
          </Button>
          {isEditing && onDelete && (
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              className="ml-2"
            >
              Delete
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
};

const incomeFormSchema = z.object({
  status: z.enum(["Unemployed", "Benefited", "Employed"]),
  amount: z.coerce.number().min(0, "Amount must be a positive number."),
  frequency: z.enum(["annually", "monthly", "hourly", "daily"]),
  currency: z.enum(["R$", "$", "€"]),
  benefitsEndDate: z.date().optional(),
});

type IncomeFormValues = z.infer<typeof incomeFormSchema>;

const IncomeForm = ({
  settings,
  onSubmit,
}: {
  settings: IncomeSettings;
  onSubmit: (data: IncomeSettings) => void;
}) => {
  const form = useForm<IncomeFormValues>({
    resolver: zodResolver(incomeFormSchema),
    defaultValues: {
      ...settings,
      benefitsEndDate: settings.benefitsEndDate
        ? new Date(settings.benefitsEndDate)
        : undefined,
    },
  });

  const status = form.watch("status");

  useEffect(() => {
    form.reset({
      ...settings,
      benefitsEndDate: settings.benefitsEndDate
        ? new Date(settings.benefitsEndDate)
        : undefined,
    });
  }, [settings, form]);

  function handleFormSubmit(values: IncomeFormValues) {
    onSubmit({
      ...values,
      benefitsEndDate: values.benefitsEndDate
        ? format(values.benefitsEndDate, "yyyy-MM-dd")
        : undefined,
    });
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleFormSubmit)}
        className="space-y-4"
      >
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Employment Status</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Unemployed">Unemployed</SelectItem>
                  <SelectItem value="Benefited">Benefited</SelectItem>
                  <SelectItem value="Employed">Employed</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        {status === "Benefited" && (
          <FormField
            control={form.control}
            name="benefitsEndDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Benefit End Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      initialFocus
                      showOutsideDays={false}
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Recurring Income Amount</FormLabel>
              <FormControl>
                <Input type="number" step="0.01" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="frequency"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Frequency</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="annually">Annually</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="hourly">Hourly</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="currency"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Currency</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="R$">BRL (R$)</SelectItem>
                  <SelectItem value="$">USD ($)</SelectItem>
                  <SelectItem value="€">EUR (€)</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full">
          Save Income Settings
        </Button>
      </form>
    </Form>
  );
};

const CopyButton = ({ text }: { text: string }) => {
  const [isCopied, setIsCopied] = useState(false);
  const { toast } = useToast();

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text);
      setIsCopied(true);
      toast({ title: "Copied to clipboard!" });
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      toast({ title: "Failed to copy", variant: "destructive" });
    }
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleCopy}
      className="absolute top-2 right-2 h-7 w-7 text-muted-foreground"
    >
      <ClipboardCopy className="h-4 w-4" />
      <span className="sr-only">{isCopied ? "Copied" : "Copy"}</span>
    </Button>
  );
};

export function Financials({
  incomeSettings,
  financialAccounts,
  onDataUpdate,
}: FinancialsProps) {
  const [suggestions, setSuggestions] = useState<string | null>(null);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const [suggestionsError, setSuggestionsError] = useState<string | null>(null);

  const [tips, setTips] = useState<string | null>(null);
  const [tipsLoading, setTipsLoading] = useState(false);
  const [tipsError, setTipsError] = useState<string | null>(null);

  const [isFinancialItemFormOpen, setIsFinancialItemFormOpen] = useState(false);
  const [isIncomeFormOpen, setIsIncomeFormOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<FinancialAccount | null>(
    null
  );
  const { toast } = useToast();
  const [savings, setSavings] = useState(500);

  const debts = financialAccounts.filter((acc) => acc.type === "debt");
  const expenses = financialAccounts.filter((acc) => acc.type === "expense");
  const oneTimeIncomes = financialAccounts.filter(
    (acc) => acc.type === "income"
  );

  const conversionRates: Record<Currency, Record<Currency, number>> = {
    R$: { R$: 1, $: 0.18, "€": 0.17 },
    $: { R$: 5.4, $: 1, "€": 0.92 },
    "€": { R$: 5.85, $: 1.08, "€": 1 },
  };

  function convertCurrency(amount: number, from: Currency, to: Currency) {
    if (from === to) return amount;
    return amount * conversionRates[from][to];
  }

  function getMonthlyIncome(
    settings: IncomeSettings,
    oneTimeIncomes: FinancialAccount[]
  ) {
    const { amount, frequency, currency } = settings;
    let recurringIncome = 0;
    if (frequency === "monthly") recurringIncome = amount;
    if (frequency === "annually") recurringIncome = amount / 12;
    if (frequency === "hourly") recurringIncome = amount * 40 * 4; // Approximation
    if (frequency === "daily") recurringIncome = amount * 22; // Approximation

    const currentMonthStart = startOfMonth(new Date());
    const oneTimeThisMonth = oneTimeIncomes
      .filter(
        (income) => income.date && new Date(income.date) >= currentMonthStart
      )
      .reduce(
        (sum, item) =>
          sum + convertCurrency(item.amount, item.currency, currency),
        0
      );

    return recurringIncome + oneTimeThisMonth;
  }

  const monthlyIncome = getMonthlyIncome(incomeSettings, oneTimeIncomes);

  const unpaidExpensesAndDebts = financialAccounts.filter((item) => {
    if (item.type === "income") return false;
    if (!item.lastPaid) return true; // Always include if never paid
    return !isSameMonth(new Date(item.lastPaid), new Date());
  });

  const monthlyOutgoings = unpaidExpensesAndDebts.reduce(
    (sum, item) =>
      sum +
      convertCurrency(item.amount, item.currency, incomeSettings.currency),
    0
  );
  const netMonthly = monthlyIncome + monthlyOutgoings;

  function handleItemSelect(item: FinancialAccount) {
    setSelectedItem(item);
    setIsFinancialItemFormOpen(true);
  }

  function handleFinancialItemFormSubmit(item: FinancialAccount) {
    const exists = financialAccounts.some((acc) => acc.id === item.id);
    const updatedAccounts = exists
      ? financialAccounts.map((acc) => (acc.id === item.id ? item : acc))
      : [...financialAccounts, item];
    onDataUpdate(updatedAccounts, incomeSettings);
    setIsFinancialItemFormOpen(false);
    setSelectedItem(null);
    toast({
      title: exists ? "Item Updated" : "Item Added",
      description: `Financial item "${item.name}" has been saved.`,
    });
  }

  function handleIncomeFormSubmit(data: IncomeSettings) {
    onDataUpdate(financialAccounts, data);
    setIsIncomeFormOpen(false);
    toast({
      title: "Income Settings Updated",
      description: "Your income information has been saved.",
    });
  }

  function handleDelete(id: string) {
    const updatedAccounts = financialAccounts.filter((acc) => acc.id !== id);
    onDataUpdate(updatedAccounts, incomeSettings);
    toast({
      title: "Item Deleted",
      variant: "destructive",
      description: `Financial item has been removed.`,
    });
  }

  const handleGetSuggestions = async () => {
    setSuggestionsLoading(true);
    setSuggestionsError(null);
    setSuggestions(null);

    const input = {
      income: monthlyIncome,
      debts: debts
        .map((d) => `${d.name}: ${d.currency}${Math.abs(d.amount)}/month`)
        .join(", "),
      expenses: expenses
        .map((e) => `${e.name}: ${e.currency}${Math.abs(e.amount)}/month`)
        .join(", "),
    };

    const result = await fetchFinancialSuggestions(input);
    if (result.success) {
      setSuggestions(result.suggestions!);
    } else {
      setSuggestionsError(result.error!);
    }
    setSuggestionsLoading(false);
  };

  const handleGetTips = async () => {
    setTipsLoading(true);
    setTipsError(null);
    setTips(null);

    const input = {
      income: monthlyIncome,
      savings,
      debts: debts
        .map((d) => `${d.name}: ${d.currency}${Math.abs(d.amount)}/month`)
        .join(", "),
    };

    const result = await fetchInvestmentTips(input);
    if (result.success) {
      setTips(result.tips!);
    } else {
      setTipsError(result.error!);
    }
    setTipsLoading(false);
  };

  const togglePaidStatus = (item: FinancialAccount, isPaid: boolean) => {
    const updatedItem = {
      ...item,
      lastPaid: isPaid ? format(new Date(), "yyyy-MM-dd") : undefined,
    };
    const updatedAccounts = financialAccounts.map((acc) =>
      acc.id === item.id ? updatedItem : acc
    );
    onDataUpdate(updatedAccounts, incomeSettings);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Breakdown</CardTitle>
            <CardDescription>
              Your financial reality based on remaining payments.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid sm:grid-cols-3 gap-4 items-start">
            <div className="p-4 bg-green-100/50 dark:bg-green-900/30 rounded-lg">
              <p className="text-sm text-muted-foreground">Monthly Income</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {incomeSettings.currency} {monthlyIncome.toFixed(2)}
              </p>
            </div>
            <div className="p-4 bg-red-100/50 dark:bg-red-900/30 rounded-lg">
              <p className="text-sm text-muted-foreground">
                Remaining Payments
              </p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                {incomeSettings.currency}{" "}
                {Math.abs(monthlyOutgoings).toFixed(2)}
              </p>
            </div>
            <div
              className={`p-4 rounded-lg ${
                netMonthly >= 0
                  ? "bg-blue-100/50 dark:bg-blue-900/30"
                  : "bg-destructive/10"
              }`}
            >
              <p className="text-sm text-muted-foreground">Net Monthly</p>
              <p
                className={`text-2xl font-bold ${
                  netMonthly >= 0
                    ? "text-blue-600 dark:text-blue-400"
                    : "text-destructive"
                }`}
              >
                {incomeSettings.currency} {netMonthly.toFixed(2)}
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => setIsIncomeFormOpen(true)}>
            Edit Recurring Income
          </Button>
          <Button
            onClick={() => {
              setSelectedItem(null);
              setIsFinancialItemFormOpen(true);
            }}
          >
            <PlusCircle className="mr-2 h-4 w-4" /> Add Financial Item
          </Button>
          <FormDialog
            isOpen={isIncomeFormOpen}
            setIsOpen={setIsIncomeFormOpen}
            title="Recurring Income & Employment"
            description="Update your employment status and recurring income details."
            triggerButton={null}
          >
            <IncomeForm
              settings={incomeSettings}
              onSubmit={handleIncomeFormSubmit}
            />
          </FormDialog>
          <FormDialog
            isOpen={isFinancialItemFormOpen}
            setIsOpen={setIsFinancialItemFormOpen}
            title={selectedItem ? "Edit Item" : "Add New Item"}
            description={
              selectedItem
                ? "Update the details of this financial item."
                : "Add a new one-time income, recurring expense, or debt."
            }
            triggerButton={null}
            onCloseAutoFocus={() => setSelectedItem(null)}
          >
            <FinancialItemForm
              item={selectedItem}
              onSubmit={handleFinancialItemFormSubmit}
              onDelete={handleDelete}
            />
          </FormDialog>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Debts</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">Paid</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {debts.map((item) => {
                    const isPaid = item.lastPaid
                      ? isSameMonth(new Date(item.lastPaid), new Date())
                      : false;
                    return (
                      <TableRow
                        key={item.id}
                        className={cn(isPaid && "bg-muted/30")}
                      >
                        <TableCell>
                          <Checkbox
                            checked={isPaid}
                            onCheckedChange={(checked) =>
                              togglePaidStatus(item, !!checked)
                            }
                          />
                        </TableCell>
                        <TableCell
                          className={cn(
                            "font-medium cursor-pointer",
                            isPaid && "line-through text-muted-foreground"
                          )}
                          onClick={() => handleItemSelect(item)}
                        >
                          {item.name}
                        </TableCell>
                        <TableCell
                          className={cn(
                            "text-right",
                            isPaid && "line-through text-muted-foreground"
                          )}
                        >
                          {item.currency} {Math.abs(item.amount).toFixed(2)}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Recurring Expenses</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">Paid</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {expenses.map((item) => {
                    const isPaid = item.lastPaid
                      ? isSameMonth(new Date(item.lastPaid), new Date())
                      : false;
                    return (
                      <TableRow
                        key={item.id}
                        className={cn(isPaid && "bg-muted/30")}
                      >
                        <TableCell>
                          <Checkbox
                            checked={isPaid}
                            onCheckedChange={(checked) =>
                              togglePaidStatus(item, !!checked)
                            }
                          />
                        </TableCell>
                        <TableCell
                          className={cn(
                            "font-medium cursor-pointer",
                            isPaid && "line-through text-muted-foreground"
                          )}
                          onClick={() => handleItemSelect(item)}
                        >
                          {item.name}
                        </TableCell>
                        <TableCell
                          className={cn(
                            "text-right",
                            isPaid && "line-through text-muted-foreground"
                          )}
                        >
                          {item.currency} {Math.abs(item.amount).toFixed(2)}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>One-Time Income</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {oneTimeIncomes.map((item) => (
                  <TableRow
                    key={item.id}
                    onClick={() => handleItemSelect(item)}
                    className="cursor-pointer hover:bg-muted/50"
                  >
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>
                      {item.date ? format(new Date(item.date), "PPP") : "N/A"}
                    </TableCell>
                    <TableCell className="text-right">
                      {item.currency} {Math.abs(item.amount).toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5" /> AI Financial Suggestions
            </CardTitle>
            <CardDescription>
              Let&apos;s be realistic. Here&apos;s what you can cut to improve
              your situation.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {suggestionsLoading && (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            )}
            {suggestionsError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{suggestionsError}</AlertDescription>
              </Alert>
            )}
            {suggestions && (
              <Alert>
                <Sparkles className="h-4 w-4" />
                <AlertTitle>Hard Truths</AlertTitle>
                <AlertDescription>
                  <MarkdownRenderer content={suggestions} />
                </AlertDescription>
                <CopyButton text={suggestions} />
              </Alert>
            )}
          </CardContent>
          <CardFooter>
            <Button
              onClick={handleGetSuggestions}
              disabled={suggestionsLoading}
              className="w-full"
            >
              {suggestionsLoading ? "Analyzing..." : "Generate Suggestions"}
            </Button>
          </CardFooter>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5" /> AI Investment Tips
            </CardTitle>
            <CardDescription>
              Thinking about investing? Let&apos;s see if that&apos;s even a
              good idea right now.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="savings">
                Total Savings ({incomeSettings.currency})
              </Label>
              <Input
                id="savings"
                type="number"
                value={savings}
                onChange={(e) => setSavings(Number(e.target.value))}
              />
            </div>
            {tipsLoading && (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            )}
            {tipsError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{tipsError}</AlertDescription>
              </Alert>
            )}
            {tips && (
              <Alert>
                <Sparkles className="h-4 w-4" />
                <AlertTitle>Investment Reality</AlertTitle>
                <AlertDescription>
                  <MarkdownRenderer content={tips} />
                </AlertDescription>
                <CopyButton text={tips} />
              </Alert>
            )}
          </CardContent>
          <CardFooter>
            <Button
              onClick={handleGetTips}
              disabled={tipsLoading}
              className="w-full"
            >
              {tipsLoading ? "Thinking..." : "Generate Investment Tips"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
