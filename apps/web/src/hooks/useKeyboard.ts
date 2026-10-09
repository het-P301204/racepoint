import { useEffect } from 'react'

type ModKey = 'ctrl' | 'meta' | 'alt' | 'shift'

interface KeyBinding {
  key: string
  modifiers?: ModKey[]
  handler: (e: KeyboardEvent) => void
}

export function useKeyboard(bindings: KeyBinding[]) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      for (const binding of bindings) {
        const mods = binding.modifiers ?? []
        const modMatch = mods.every((mod) => {
          if (mod === 'ctrl') return e.ctrlKey
          if (mod === 'meta') return e.metaKey
          if (mod === 'alt') return e.altKey
          if (mod === 'shift') return e.shiftKey
          return false
        })
        if (modMatch && e.key.toLowerCase() === binding.key.toLowerCase()) {
          e.preventDefault()
          binding.handler(e)
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => { window.removeEventListener('keydown', handleKeyDown) }
  }, [bindings])
}
