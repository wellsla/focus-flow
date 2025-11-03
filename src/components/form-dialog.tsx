"use client";

import { ReactNode, ReactElement, cloneElement, isValidElement } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type FormDialogProps = {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  title: string;
  description: string;
  triggerButton: ReactNode;
  children: ReactNode;
  onCloseAutoFocus?: (event: Event) => void;
};

/**
 * Wraps a form in a dialog. Auto-closes on submit/delete success.
 * Intercepts child form callbacks (onSubmit, onDelete, etc.) to close the dialog.
 */
export function FormDialog({
  isOpen,
  setIsOpen,
  title,
  description,
  triggerButton,
  children,
  onCloseAutoFocus,
}: FormDialogProps) {
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open && onCloseAutoFocus) {
      onCloseAutoFocus(new Event("close"));
    }
  };

  const closeDialog = () => setIsOpen(false);

  const getOriginalProp = (propName: string) => {
    return isValidElement(children)
      ? (children.props as any)[propName]
      : undefined;
  };

  const wrapCallback = (originalHandler?: (data: any) => void) => {
    return (data: any) => {
      if (originalHandler) originalHandler(data);
      closeDialog();
    };
  };

  // Inject success handlers that auto-close the dialog
  const enhancedChildren = isValidElement(children)
    ? cloneElement(children as ReactElement<any>, {
        ...(children.props as any),
        onSubmit: wrapCallback(getOriginalProp("onSubmit")),
        onSubmitSuccess: wrapCallback(getOriginalProp("onSubmitSuccess")),
        onGoalSubmit: wrapCallback(getOriginalProp("onGoalSubmit")),
        onTaskSubmit: wrapCallback(getOriginalProp("onTaskSubmit")),
        onDelete: wrapCallback(getOriginalProp("onDelete")),
        onGoalDelete: wrapCallback(getOriginalProp("onGoalDelete")),
        onTaskDelete: wrapCallback(getOriginalProp("onTaskDelete")),
      })
    : children;

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      {triggerButton && <DialogTrigger asChild>{triggerButton}</DialogTrigger>}
      <DialogContent
        className="sm:max-w-[425px]"
        onCloseAutoFocus={onCloseAutoFocus}
      >
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        {enhancedChildren}
      </DialogContent>
    </Dialog>
  );
}
