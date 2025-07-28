import React, { createContext, useContext, useState, useEffect, useRef } from "react"

interface SelectContextType {
  value: string
  onValueChange: (value: string) => void
  open: boolean
  setOpen: (open: boolean) => void
  placeholder?: string
}

const SelectContext = createContext<SelectContextType | null>(null)

interface SelectProps {
  children: React.ReactNode
  value?: string
  onValueChange?: (value: string) => void
  defaultValue?: string
  [key: string]: any
}

interface SelectItemProps {
  children: React.ReactNode
  value: string
  [key: string]: any
}

export const Select = ({ children, value, onValueChange, defaultValue, ...props }: SelectProps) => {
  const [internalValue, setInternalValue] = useState(value || defaultValue || "")
  const [open, setOpen] = useState(false)
  
  // Use controlled value if provided, otherwise use internal state
  const currentValue = value !== undefined ? value : internalValue
  
  const handleValueChange = (newValue: string) => {
    if (value === undefined) {
      setInternalValue(newValue)
    }
    onValueChange?.(newValue)
    setOpen(false)
  }

  return (
    <SelectContext.Provider value={{ 
      value: currentValue, 
      onValueChange: handleValueChange, 
      open, 
      setOpen 
    }}>
      <div className="relative" {...props}>
        {children}
      </div>
    </SelectContext.Provider>
  )
}

export const SelectTrigger = ({ children, className, ...props }: any) => {
  const context = useContext(SelectContext)
  const triggerRef = useRef<HTMLButtonElement>(null)
  
  if (!context) {
    throw new Error("SelectTrigger must be used within Select")
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (triggerRef.current && !triggerRef.current.contains(event.target as Node)) {
        context.setOpen(false)
      }
    }

    if (context.open) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [context.open])

  return (
    <button 
      ref={triggerRef}
      className={`flex h-10 w-full items-center justify-between rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className || ''}`}
      onClick={(e) => {
        e.preventDefault()
        context.setOpen(!context.open)
      }}
      type="button"
      {...props}
    >
      {children}
      <svg 
        className={`h-4 w-4 opacity-50 transition-transform ${context.open ? 'rotate-180' : ''}`} 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </button>
  )
}

export const SelectContent = ({ children, ...props }: any) => {
  const context = useContext(SelectContext)
  
  if (!context) {
    throw new Error("SelectContent must be used within Select")
  }

  // Only render when open
  if (!context.open) return null

  return (
    <div 
      className="absolute z-50 w-full mt-1 bg-white dark:bg-slate-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-60 overflow-auto"
      style={{
        // Force background color as backup
        backgroundColor: 'white'
      }}
      {...props}
    >
      <div className="p-1">
        {children}
      </div>
    </div>
  )
}

export const SelectItem = ({ children, value, className, ...props }: SelectItemProps) => {
  const context = useContext(SelectContext)
  
  if (!context) {
    throw new Error("SelectItem must be used within Select")
  }

  const isSelected = context.value === value

  return (
    <div 
      className={`relative flex cursor-pointer select-none items-center rounded-sm py-2 px-3 text-sm text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-slate-700 focus:bg-gray-100 dark:focus:bg-slate-700 ${isSelected ? 'bg-gray-100 dark:bg-slate-700' : ''} ${className || ''}`}
      onClick={() => context.onValueChange(value)}
      data-value={value}
      {...props}
    >
      {children}
      {isSelected && (
        <span className="absolute right-2 flex h-3.5 w-3.5 items-center justify-center">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </span>
      )}
    </div>
  )
}

export const SelectValue = ({ placeholder, ...props }: any) => {
  const context = useContext(SelectContext)
  
  if (!context) {
    throw new Error("SelectValue must be used within Select")
  }

  // Find the selected item's display text
  const displayValue = context.value || placeholder

  return (
    <span 
      className={`${context.value ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`} 
      {...props}
    >
      {displayValue}
    </span>
  )
}

export const SelectGroup = ({ children, ...props }: any) => {
  return <div {...props}>{children}</div>
}

export const SelectLabel = ({ children, ...props }: any) => {
  return (
    <div 
      className="py-1.5 px-3 text-sm font-semibold text-gray-900 dark:text-white" 
      {...props}
    >
      {children}
    </div>
  )
}

export const SelectSeparator = (props: any) => {
  return <hr className="my-1 border-gray-200 dark:border-gray-600" {...props} />
}