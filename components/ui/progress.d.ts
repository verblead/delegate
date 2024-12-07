import * as React from "react"

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number
  className?: string
  indicatorClassName?: string
}

export interface Progress extends React.FC<ProgressProps> {} 