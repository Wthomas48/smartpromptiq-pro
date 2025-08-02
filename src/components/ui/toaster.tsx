// Placeholder toaster component
import * as React from "react"

export const toaster = ({ children, ...props }: any) => (
  <div {...props}>{children}</div>
)

export default toaster
