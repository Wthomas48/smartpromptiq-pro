"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

// ✅ SAFE MOCK COMPONENTS - NO RECHARTS DEPENDENCY
// These prevent recharts from loading and causing errors

// Format: { THEME_NAME: CSS_SELECTOR }
const THEMES = { light: "", dark: ".dark" } as const

export type ChartConfig = {
  [k in string]: {
    label?: React.ReactNode
    icon?: React.ComponentType
  } & (
    | { color?: string; theme?: never }
    | { color?: never; theme: Record<keyof typeof THEMES, string> }
  )
}

type ChartContextProps = {
  config: ChartConfig
}

const ChartContext = React.createContext<ChartContextProps | null>(null)

function useChart() {
  const context = React.useContext(ChartContext)

  if (!context) {
    throw new Error("useChart must be used within a <ChartContainer />")
  }

  return context
}

// Safe mock ResponsiveContainer
const MockResponsiveContainer = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    width?: string | number
    height?: string | number
  }
>(({ className, children, width, height, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn("w-full h-full", className)}
      style={{ width, height }}
      {...props}
    >
      {children}
    </div>
  )
})
MockResponsiveContainer.displayName = "MockResponsiveContainer"

const ChartContainer = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    config: ChartConfig
    children: React.ComponentProps<typeof MockResponsiveContainer>["children"]
  }
>(({ id, className, children, config, ...props }, ref) => {
  return (
    <ChartContext.Provider value={{ config }}>
      <div
        data-chart={id}
        ref={ref}
        className={cn(
          "flex aspect-video justify-center text-xs [&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-border/50 [&_.recharts-curve.recharts-tooltip-cursor]:stroke-border [&_.recharts-dot[stroke='#fff']]:stroke-transparent [&_.recharts-layer]:outline-none [&_.recharts-polar-grid_[stroke='#ccc']]:stroke-border [&_.recharts-radial-bar-background-sector]:fill-muted [&_.recharts-rectangle.recharts-tooltip-cursor]:fill-muted [&_.recharts-reference-line_[stroke='#ccc']]:stroke-border [&_.recharts-sector[stroke='#fff']]:stroke-transparent [&_.recharts-sector]:outline-none [&_.recharts-surface]:outline-none",
          className
        )}
        {...props}
      >
        <MockResponsiveContainer>
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <div className="text-center">
              <div className="text-lg font-medium">Chart Disabled</div>
              <div className="text-sm">Charts temporarily disabled for stability</div>
            </div>
          </div>
        </MockResponsiveContainer>
      </div>
    </ChartContext.Provider>
  )
})
ChartContainer.displayName = "Chart"

// Safe mock tooltip
const ChartTooltip = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn("rounded-lg border bg-background p-2 shadow-md", className)}
      {...props}
    />
  )
})
ChartTooltip.displayName = "ChartTooltip"

const ChartTooltipContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    active?: boolean
    payload?: any[]
    label?: any
    indicator?: "line" | "dot" | "dashed"
    hideLabel?: boolean
    hideIndicator?: boolean
    labelFormatter?: (value: any, payload: any[]) => React.ReactNode
    labelClassName?: string
    formatter?: (value: any, name: any, item: any, index: number, payload: any[]) => React.ReactNode
    color?: string
    nameKey?: string
    labelKey?: string
  }
>(({ active, payload, label, className, indicator = "dot", ...props }, ref) => {
  if (!active || !payload?.length) {
    return null
  }

  return (
    <ChartTooltip
      ref={ref}
      className={cn("grid min-w-[8rem] items-start gap-1.5 rounded-lg border border-border/50 bg-background px-2.5 py-1.5 text-xs shadow-xl", className)}
      {...props}
    >
      <div className="font-medium">{label}</div>
      {payload.map((item, index) => (
        <div key={index} className="flex items-center gap-1.5">
          <div
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: item.color }}
          />
          <span className="font-medium">{item.name}: {item.value}</span>
        </div>
      ))}
    </ChartTooltip>
  )
})
ChartTooltipContent.displayName = "ChartTooltipContent"

// Safe mock legend
const ChartLegend = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn("flex items-center justify-center space-x-4", className)}
      {...props}
    />
  )
})
ChartLegend.displayName = "ChartLegend"

const ChartLegendContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    payload?: any[]
    verticalAlign?: "top" | "bottom"
    nameKey?: string
  }
>(({ className, payload, nameKey, ...props }, ref) => {
  if (!payload?.length) {
    return null
  }

  return (
    <div
      ref={ref}
      className={cn("flex flex-wrap items-center gap-4", className)}
      {...props}
    >
      {payload.map((item, index) => (
        <div key={index} className="flex items-center gap-1.5">
          <div
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: item.color }}
          />
          <span className="text-xs font-medium">{item.value}</span>
        </div>
      ))}
    </div>
  )
})
ChartLegendContent.displayName = "ChartLegendContent"

export {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  useChart,
}