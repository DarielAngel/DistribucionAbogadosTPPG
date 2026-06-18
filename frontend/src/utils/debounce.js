export default function debounce(fn, wait = 300) {
  let timeout = null
  let lastArgs = null
  let lastContext = null

  function debounced(...args) {
    lastArgs = args
    lastContext = this
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => {
      timeout = null
      fn.apply(lastContext, lastArgs)
      lastArgs = lastContext = null
    }, wait)
  }

  debounced.cancel = function() {
    if (timeout) {
      clearTimeout(timeout)
      timeout = null
      lastArgs = lastContext = null
    }
  }

  debounced.flush = function() {
    if (timeout) {
      clearTimeout(timeout)
      timeout = null
      const args = lastArgs
      const ctx = lastContext
      lastArgs = lastContext = null
      fn.apply(ctx, args)
    }
  }

  return debounced
}
