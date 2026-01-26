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
}
