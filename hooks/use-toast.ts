'use client'

import * as React from 'react'

type ToastVariant = 'default' | 'destructive'

interface Toast {
  id: string
  title?: string
  description?: string
  variant?: ToastVariant
}

interface ToastState {
  toasts: Toast[]
}

type ToastAction =
  | { type: 'ADD'; toast: Toast }
  | { type: 'REMOVE'; id: string }

function reducer(state: ToastState, action: ToastAction): ToastState {
  switch (action.type) {
    case 'ADD':
      return { toasts: [...state.toasts, action.toast] }
    case 'REMOVE':
      return { toasts: state.toasts.filter(t => t.id !== action.id) }
  }
}

const listeners: Array<React.Dispatch<ToastAction>> = []

function toast({ title, description, variant = 'default' }: Omit<Toast, 'id'>) {
  const id = Math.random().toString(36).slice(2)
  listeners.forEach(l => l({ type: 'ADD', toast: { id, title, description, variant } }))
  setTimeout(() => {
    listeners.forEach(l => l({ type: 'REMOVE', id }))
  }, 3000)
}

function useToast() {
  const [state, localDispatch] = React.useReducer(reducer, { toasts: [] })
  React.useEffect(() => {
    listeners.push(localDispatch)
    return () => {
      const index = listeners.indexOf(localDispatch)
      if (index > -1) listeners.splice(index, 1)
    }
  }, [])
  return { toasts: state.toasts, toast }
}

export { useToast, toast }
