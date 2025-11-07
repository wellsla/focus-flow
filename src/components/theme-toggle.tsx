"use client";

import { useTheme } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";
import { useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function ThemeToggle() {
  const { resolvedTheme, toggle } = useTheme();
  const [mounted] = useState(() => typeof window !== "undefined");
  // Avoid hydration mismatch: show nothing until mounted
  if (!mounted) return null;
  const isDark = resolvedTheme === "dark";
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            aria-label={
              isDark ? "Switch to light theme" : "Switch to dark theme"
            }
            onClick={toggle}
            className="transition-colors"
          >
            <Sun
              className={`h-5 w-5 ${
                isDark ? "scale-0" : "scale-100"
              } transition-transform`}
            />
            <Moon
              className={`h-5 w-5 absolute ${
                isDark ? "scale-100" : "scale-0"
              } transition-transform`}
            />
            <span className="sr-only">Toggle theme</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <p>{isDark ? "Light mode" : "Dark mode"}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
