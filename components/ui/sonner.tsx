"use client"

import {
  CircleCheckIcon,
  CloudCheck,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  ShieldX,
  TriangleAlertIcon,
  XIcon,
} from "lucide-react"
import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"

const TOAST_DURATION_MS = 5000

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      {...props}
      theme={theme as ToasterProps["theme"]}
      offset={{ top: 4, right: 4 }}
      className="toaster group shadow-2xl"
      // How long the toast stays visible (timer bar uses the same time)
      duration={TOAST_DURATION_MS}
      // Shows the X so users can dismiss without waiting
      closeButton
      icons={{
        success: <CloudCheck className="size-4" />,
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error: <ShieldX className="size-4" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
        close: <XIcon className="size-3.5" />,
      }}
      style={
        {
          // Default sonner width is 356px — make toasts wider
          "--width": "40rem",
          // Shared with CSS so the bottom bar shrinks in sync with auto-close
          "--toast-duration": `${TOAST_DURATION_MS}ms`,
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast: "cn-toast",
          closeButton: "cn-toast-close",
          success: "cn-toast-success",
          info: "cn-toast-info",
          warning: "cn-toast-warning",
          error: "cn-toast-error",
        },
      }}
    />
  )
}

export { Toaster }
