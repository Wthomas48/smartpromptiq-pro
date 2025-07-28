import React from "react"

interface SelectProps {
  children: React.ReactNode
  value?: string
  onValueChange?: (value: string) => void
  [key: string]: any
}

interface SelectItemProps {
  children: React.ReactNode
  value: string
  [key: string]: any
}

export const Select = ({ children, value, onValueChange, ...props }: SelectProps) => {
  return (
    <div className="relative" {...props}>
      {children}
    </div>
  )
}

export const SelectTrigger = ({ children, className, ...props }: any) => {
  return (
    <button 
      className={`flex h-10 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className || ''}`}
      {...props}
    >
      {children}
      <svg className="h-4 w-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </button>
  )
}

export const SelectContent = ({ children, ...props }: any) => {
  return (
    <div 
      className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto"
      {...props}
    >
      {children}
    </div>
  )
}

export const SelectItem = ({ children, value, ...props }: SelectItemProps) => {
  return (
    <div 
      className="relative flex cursor-pointer select-none items-center rounded-sm py-2 px-3 text-sm hover:bg-gray-100 focus:bg-gray-100"
      data-value={value}
      {...props}
    >
      {children}
    </div>
  )
}

export const SelectValue = ({ placeholder, ...props }: any) => {
  return <span className="text-gray-500" {...props}>{placeholder}</span>
}

export const SelectGroup = ({ children, ...props }: any) => {
  return <div {...props}>{children}</div>
}

export const SelectLabel = ({ children, ...props }: any) => {
  return <div className="py-1.5 px-3 text-sm font-semibold text-gray-900" {...props}>{children}</div>
}

export const SelectSeparator = (props: any) => {
  return <hr className="my-1 border-gray-200" {...props} />
}