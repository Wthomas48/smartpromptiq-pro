import { useToast } from "@/hooks/use-toast"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"

/**
 * Toaster Component
 * 
 * This component manages and displays all toast notifications in your application.
 * It should be placed at the root level of your app (typically in your main layout).
 * 
 * Features:
 * - Consumes toasts from the useToast hook
 * - Renders multiple toasts with support for title, description, and custom actions
 * - Automatically handles toast positioning via ToastViewport
 * - Provides close functionality for each toast
 * 
 * Usage in your app root (e.g., app/layout.tsx or _app.tsx):
 * ```tsx
 * import { Toaster } from "@/components/ui/toaster"
 * 
 * export default function RootLayout({ children }) {
 *   return (
 *     <html>
 *       <body>
 *         {children}
 *         <Toaster />
 *       </body>
 *     </html>
 *   )
 * }
 * ```
 * 
 * To trigger toasts from any component:
 * ```tsx
 * import { useToast } from "@/hooks/use-toast"
 * 
 * function MyComponent() {
 *   const { toast } = useToast()
 *   
 *   const showToast = () => {
 *     toast({
 *       title: "Success!",
 *       description: "Your action was completed successfully.",
 *     })
 *   }
 * }
 * ```
 */
export function Toaster() {
  // Get the current list of toasts from the toast hook
  const { toasts } = useToast()

  return (
    // ToastProvider wraps all toasts and manages their lifecycle
    <ToastProvider>
      {/* Map through all active toasts and render each one */}
      {toasts.map(function ({ id, title, description, action, ...props }) {
        return (
          // Each toast needs a unique key for React's reconciliation
          <Toast key={id} {...props}>
            {/* Grid layout for consistent spacing between title and description */}
            <div className="grid gap-1">
              {/* Conditionally render title if provided */}
              {title && <ToastTitle>{title}</ToastTitle>}
              
              {/* Conditionally render description if provided */}
              {description && (
                <ToastDescription>{description}</ToastDescription>
              )}
            </div>
            
            {/* Render custom action button if provided (e.g., "Undo" button) */}
            {action}
            
            {/* Close button for dismissing the toast */}
            <ToastClose />
          </Toast>
        )
      })}
      
      {/* ToastViewport handles the positioning of all toasts on screen */}
      <ToastViewport />
    </ToastProvider>
  )
}
