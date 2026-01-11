import * as React from "react"
import * as ToastPrimitives from "@radix-ui/react-toast"
import { cva, type VariantProps } from "class-variance-authority"
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"

const ToastProvider = ToastPrimitives.Provider

const ToastViewport = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Viewport>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Viewport>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Viewport
    ref={ref}
    className={cn(
      // ENHANCED: Centered at top with very high z-index
      "fixed top-4 left-1/2 -translate-x-1/2 z-[99999] flex max-h-screen w-full max-w-md flex-col gap-2 p-4",
      // Ensure it's always on top of everything
      "pointer-events-none [&>*]:pointer-events-auto",
      className
    )}
    {...props}
  />
))
ToastViewport.displayName = ToastPrimitives.Viewport.displayName

const toastVariants = cva(
  // Base styles - ENHANCED visibility
  cn(
    "group relative flex w-full items-center gap-3 overflow-hidden rounded-xl border-2 p-4 pr-10 shadow-2xl",
    // Animation
    "transition-all duration-300 ease-out",
    "data-[swipe=cancel]:translate-x-0",
    "data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)]",
    "data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)]",
    "data-[swipe=move]:transition-none",
    "data-[state=open]:animate-in data-[state=closed]:animate-out",
    "data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-top-full",
    "data-[state=open]:slide-in-from-top-full data-[state=open]:fade-in-0",
  ),
  {
    variants: {
      variant: {
        default: cn(
          "bg-gradient-to-r from-slate-900 to-slate-800 border-slate-600",
          "text-white shadow-slate-900/50"
        ),
        success: cn(
          "bg-gradient-to-r from-green-900 to-emerald-800 border-green-500",
          "text-white shadow-green-900/50"
        ),
        destructive: cn(
          "bg-gradient-to-r from-red-900 to-rose-800 border-red-500",
          "text-white shadow-red-900/50"
        ),
        warning: cn(
          "bg-gradient-to-r from-amber-900 to-yellow-800 border-amber-500",
          "text-white shadow-amber-900/50"
        ),
        info: cn(
          "bg-gradient-to-r from-blue-900 to-cyan-800 border-blue-500",
          "text-white shadow-blue-900/50"
        ),
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const Toast = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Root> &
    VariantProps<typeof toastVariants>
>(({ className, variant, ...props }, ref) => {
  return (
    <ToastPrimitives.Root
      ref={ref}
      className={cn(toastVariants({ variant }), className)}
      {...props}
    />
  )
})
Toast.displayName = ToastPrimitives.Root.displayName

// Icon component for toast
const ToastIcon: React.FC<{ variant?: string }> = ({ variant }) => {
  const iconClass = "w-6 h-6 flex-shrink-0"

  switch (variant) {
    case "success":
      return <CheckCircle className={cn(iconClass, "text-green-400")} />
    case "destructive":
      return <AlertCircle className={cn(iconClass, "text-red-400")} />
    case "warning":
      return <AlertTriangle className={cn(iconClass, "text-amber-400")} />
    case "info":
      return <Info className={cn(iconClass, "text-blue-400")} />
    default:
      return <Info className={cn(iconClass, "text-slate-400")} />
  }
}

const ToastAction = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Action>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Action>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Action
    ref={ref}
    className={cn(
      "inline-flex h-8 shrink-0 items-center justify-center rounded-md border border-white/20 bg-white/10 px-3 text-sm font-medium",
      "transition-colors hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/30",
      "disabled:pointer-events-none disabled:opacity-50",
      className
    )}
    {...props}
  />
))
ToastAction.displayName = ToastPrimitives.Action.displayName

const ToastClose = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Close>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Close>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Close
    ref={ref}
    className={cn(
      "absolute right-2 top-2 rounded-full p-1.5 opacity-70 transition-all",
      "hover:opacity-100 hover:bg-white/10",
      "focus:outline-none focus:ring-2 focus:ring-white/30",
      className
    )}
    toast-close=""
    {...props}
  >
    <X className="h-4 w-4" />
  </ToastPrimitives.Close>
))
ToastClose.displayName = ToastPrimitives.Close.displayName

const ToastTitle = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Title>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Title>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Title
    ref={ref}
    className={cn("text-base font-bold tracking-tight", className)}
    {...props}
  />
))
ToastTitle.displayName = ToastPrimitives.Title.displayName

const ToastDescription = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Description>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Description>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Description
    ref={ref}
    className={cn("text-sm opacity-90", className)}
    {...props}
  />
))
ToastDescription.displayName = ToastPrimitives.Description.displayName

type ToastProps = React.ComponentPropsWithoutRef<typeof Toast>

type ToastActionElement = React.ReactElement<typeof ToastAction>

export {
  type ToastProps,
  type ToastActionElement,
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastAction,
  ToastIcon,
}
