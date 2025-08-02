// Placeholder toast component
import * as React from "react"

export const toast = ({ children, ...props }: any) => (
  <div {...props}>{children}</div>
)

export default toast
