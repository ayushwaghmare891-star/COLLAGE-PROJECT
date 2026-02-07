/**
 * Global error handler to suppress message-passing errors from extensions
 * These are benign errors that don't affect the app's functionality
 */

export function initializeErrorHandler() {
  // Suppress "message channel closed" errors from browser extensions
  window.addEventListener('error', (event) => {
    if (
      event.message &&
      event.message.includes('message channel closed') &&
      event.message.includes('asynchronous response')
    ) {
      event.preventDefault()
      console.warn(
        '[Browser Extension]: Message channel error (suppressed)',
        event.message
      )
      return true
    }
  })

  // Handle unhandled promise rejections from extensions
  window.addEventListener('unhandledrejection', (event) => {
    if (
      event.reason &&
      typeof event.reason === 'string' &&
      event.reason.includes('message channel closed')
    ) {
      event.preventDefault()
      console.warn(
        '[Browser Extension]: Unhandled rejection (suppressed)',
        event.reason
      )
    }
  })

  // Suppress chrome.runtime.lastError messages from browser extensions
  // This handles "Unchecked runtime.lastError" warnings
  if (typeof chrome !== 'undefined' && chrome.runtime) {
    const originalError = Object.getOwnPropertyDescriptor(
      chrome.runtime,
      'lastError'
    )

    Object.defineProperty(chrome.runtime, 'lastError', {
      get() {
        return originalError?.get?.() || null
      },
      set() {
        // Do nothing - suppress the error
      },
      configurable: true,
    })

    // Override console.error to suppress runtime.lastError messages
    const originalConsoleError = console.error
    console.error = function (...args: any[]) {
      const message = args[0]?.toString() || ''
      if (
        message.includes('Unchecked runtime.lastError') ||
        message.includes('A listener indicated an asynchronous response')
      ) {
        // Silently suppress these extension errors
        return
      }
      originalConsoleError.apply(console, args)
    }
  }
}
