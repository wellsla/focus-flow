"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { ClipboardCopy } from "lucide-react";

export type MarkdownModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  content: string;
  className?: string;
};

export function MarkdownModal({
  open,
  onOpenChange,
  title = "AI Result",
  description,
  content,
  className,
}: MarkdownModalProps) {
  const [copied, setCopied] = React.useState(false);

  async function handleCopyAll() {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      const timeout = setTimeout(() => setCopied(false), 2000);
      return () => clearTimeout(timeout);
    } catch {
      // no-op; optional toast could be wired here
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn("max-w-3xl sm:rounded-lg", className)}>
        <DialogHeader>
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <DialogTitle className="truncate">{title}</DialogTitle>
              {description ? (
                <DialogDescription className="mt-1">
                  {description}
                </DialogDescription>
              ) : null}
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="shrink-0"
              onClick={handleCopyAll}
              aria-label={copied ? "Copied" : "Copy all"}
              title={copied ? "Copied" : "Copy all"}
            >
              <ClipboardCopy className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>
        <div className="max-h-[70vh] overflow-auto rounded-md border bg-card p-3">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            className="prose prose-sm max-w-none dark:prose-invert select-text whitespace-pre-wrap"
          >
            {content}
          </ReactMarkdown>
        </div>
      </DialogContent>
    </Dialog>
  );
}
