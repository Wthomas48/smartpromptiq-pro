import * as React from "react"

let count = 0
function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER
  return count.toString()
}

const listeners: Array<(state: any) => void> = []
let memoryState: any = { toasts: [] }

function dispatch(action: any) {
  memoryState = { ...memoryState, toasts: [...memoryState.toasts, action.toast] }
  listeners.forEach((listener) => {
    listener(memoryState)
  })
}

function toast({ ...props }: any) {
  const id = genId()
  
  dispatch({
    type: "ADD_TOAST",
    toast: {
      ...props,
      id,
      open: true,
    },
  })

  return { id }
}

function useToast() {
  const [state, setState] = React.useState(memoryState)

  React.useEffect(() => {
    listeners.push(setState)
    return () => {
      const index = listeners.indexOf(setState)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }, [state])

  return {
    ...state,
    toast,
  }
}

export { useToast, toast }
