/**
 * CommandPalette.tsx
 *
 * Global command palette for quick navigation and actions
 * Triggered by Ctrl+K / Cmd+K (ADHD-friendly quick access)
 */

"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Timer,
  ListChecks,
  BookOpen,
  Target,
  Settings,
  LayoutDashboard,
  Trophy,
} from "lucide-react";

interface Command {
  label: string;
  icon: React.ReactNode;
  action: () => void;
  group: string;
}

export function CommandPalette() {
  const [open, setOpen] = React.useState(false);
  const router = useRouter();

  // Listen for Ctrl+K / Cmd+K
  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const commands: Command[] = [
    // Navigation
    {
      label: "Dashboard",
      icon: <LayoutDashboard className="mr-2 h-4 w-4" />,
      action: () => {
        router.push("/dashboard");
        setOpen(false);
      },
      group: "Navigation",
    },
    {
      label: "Pomodoro",
      icon: <Timer className="mr-2 h-4 w-4" />,
      action: () => {
        router.push("/pomodoro");
        setOpen(false);
      },
      group: "Navigation",
    },
    {
      label: "Routines",
      icon: <ListChecks className="mr-2 h-4 w-4" />,
      action: () => {
        router.push("/routine");
        setOpen(false);
      },
      group: "Navigation",
    },
    {
      label: "Journal",
      icon: <BookOpen className="mr-2 h-4 w-4" />,
      action: () => {
        router.push("/journal");
        setOpen(false);
      },
      group: "Navigation",
    },
    {
      label: "Rewards",
      icon: <Trophy className="mr-2 h-4 w-4" />,
      action: () => {
        router.push("/rewards");
        setOpen(false);
      },
      group: "Navigation",
    },
    {
      label: "Goals",
      icon: <Target className="mr-2 h-4 w-4" />,
      action: () => {
        router.push("/goals");
        setOpen(false);
      },
      group: "Navigation",
    },
    {
      label: "Settings",
      icon: <Settings className="mr-2 h-4 w-4" />,
      action: () => {
        router.push("/settings");
        setOpen(false);
      },
      group: "Navigation",
    },
  ];

  // Group commands by category
  const grouped = commands.reduce((acc, cmd) => {
    if (!acc[cmd.group]) {
      acc[cmd.group] = [];
    }
    acc[cmd.group].push(cmd);
    return acc;
  }, {} as Record<string, Command[]>);

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        {Object.entries(grouped).map(([group, items]) => (
          <CommandGroup key={group} heading={group}>
            {items.map((cmd) => (
              <CommandItem key={cmd.label} onSelect={cmd.action}>
                {cmd.icon}
                <span>{cmd.label}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        ))}
      </CommandList>
    </CommandDialog>
  );
}
