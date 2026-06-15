import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'
import debounce from '../src/utils/debounce'

describe('debounce util', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })
  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('debounces multiple calls into one', () => {
    const fn = vi.fn()
    const deb = debounce(fn, 100)
    deb()
    deb()
    expect(fn).not.toHaveBeenCalled()
    vi.advanceTimersByTime(100)
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('forwards arguments and preserves context', () => {
    const spy = vi.fn(function(a, b){ return this && a + b })
    const deb = debounce(spy, 50)
    const ctx = { name: 'ctx' }
    deb.call(ctx, 2, 3)
    vi.advanceTimersByTime(50)
    expect(spy).toHaveBeenCalledWith(2, 3)
  })

  it('cancel prevents the call', () => {
    const fn = vi.fn()
    const deb = debounce(fn, 100)
    deb()
    deb.cancel()
    vi.advanceTimersByTime(200)
    expect(fn).not.toHaveBeenCalled()
  })

  it('flush forces immediate call', () => {
    const fn = vi.fn()
    const deb = debounce(fn, 100)
    deb(1, 2)
    deb.flush()
    expect(fn).toHaveBeenCalledTimes(1)
    expect(fn).toHaveBeenCalledWith(1, 2)
    // ensure it does not call again after original wait
    vi.advanceTimersByTime(200)
    expect(fn).toHaveBeenCalledTimes(1)
  })
})
