"use client";

import React, { createContext, useContext, useEffect } from "react";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

interface DialogContextValue {
  open: boolean;
  onClose: () => void;
}

const DialogContext = createContext<DialogContextValue | null>(null);

export interface DialogProps {
  isOpen?: boolean;
  open?: boolean;
  onClose?: () => void;
  onOpenChange?: (open: boolean) => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "full";
  className?: string;
}

export function Dialog({
  isOpen,
  open,
  onClose,
  onOpenChange,
  title,
  description,
  children,
  maxWidth = "md",
  className,
}: DialogProps) {
  const isModalOpen = open !== undefined ? open : Boolean(isOpen);
  const handleClose = React.useCallback(() => {
    if (onOpenChange) onOpenChange(false);
    if (onClose) onClose();
  }, [onClose, onOpenChange]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isModalOpen) {
        handleClose();
      }
    };

    if (isModalOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isModalOpen, handleClose]);

  if (!isModalOpen) return null;

  const maxWidthStyles = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
    full: "max-w-4xl",
  };

  // If used with subcomponents DialogContent etc.
  const hasSubcomponents = React.Children.toArray(children).some(
    (child) =>
      React.isValidElement(child) &&
      (child.type === DialogContent ||
        (child.type as { displayName?: string }).displayName === "DialogContent")
  );

  return (
    <DialogContext.Provider value={{ open: isModalOpen, onClose: handleClose }}>
      <div
        role="dialog"
        aria-modal="true"
        className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
      >
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-fade-in"
          onClick={handleClose}
          aria-hidden="true"
        />

        {hasSubcomponents ? (
          children
        ) : (
          <div
            className={cn(
              "relative z-10 w-full overflow-hidden rounded-2xl bg-white shadow-2xl transition-all dark:bg-slate-900 border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-200",
              maxWidthStyles[maxWidth],
              className
            )}
          >
            <div className="flex items-center justify-between border-b border-slate-100 p-5 dark:border-slate-800">
              <div>
                {title && (
                  <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                    {title}
                  </h2>
                )}
                {description && (
                  <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                    {description}
                  </p>
                )}
              </div>
              <button
                onClick={handleClose}
                aria-label="Close dialog"
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-5">{children}</div>
          </div>
        )}
      </div>
    </DialogContext.Provider>
  );
}

export function DialogContent({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ctx = useContext(DialogContext);

  return (
    <div
      className={cn(
        "relative z-10 w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl transition-all dark:bg-slate-900 border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-200 p-6",
        className
      )}
    >
      {ctx && (
        <button
          onClick={ctx.onClose}
          aria-label="Close dialog"
          className="absolute top-4 right-4 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      )}
      {children}
    </div>
  );
}
DialogContent.displayName = "DialogContent";

export function DialogHeader({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn("mb-4 space-y-1.5", className)}>{children}</div>;
}

export function DialogTitle({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <h3 className={cn("text-lg font-bold text-slate-900 dark:text-slate-100", className)}>
      {children}
    </h3>
  );
}

export function DialogDescription({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p className={cn("text-xs text-slate-500 dark:text-slate-400", className)}>
      {children}
    </p>
  );
}

export function DialogFooter({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "mt-6 flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 gap-2",
        className
      )}
    >
      {children}
    </div>
  );
}
