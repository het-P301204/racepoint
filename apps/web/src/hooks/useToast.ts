import { useAppStore } from '../store/appStore'

export function useToast() {
  const addNotification = useAppStore((s) => s.addNotification)

  return {
    success: (message: string) => { addNotification({ type: 'success', message }) },
    warning: (message: string) => { addNotification({ type: 'warning', message }) },
    error: (message: string) => { addNotification({ type: 'error', message }) },
    info: (message: string) => { addNotification({ type: 'info', message }) },
  }
}
