/**
 * Vitest global setup — runs before each test file.
 *
 * - Registers `@testing-library/jest-dom` matchers (`toBeInTheDocument`, …).
 * - Unmounts React trees after every test so RTL renders don't leak.
 */
import '@testing-library/jest-dom/vitest'
import { afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'

afterEach(() => {
  cleanup()
})
