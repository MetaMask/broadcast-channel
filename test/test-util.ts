/**
 * Test utilities to replace async-test-util
 */

/**
 * Generate a random string of specified length
 */
export function randomString(length: number): string {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Wait for specified milliseconds
 */
export function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Wait until a condition is met
 * @param condition - Function that returns true when condition is met (can be async)
 * @param timeout - Maximum time to wait in ms (default: 10000, 0 means no timeout)
 * @param interval - Check interval in ms (default: 50)
 */
export async function waitUntil(condition: () => boolean | Promise<boolean>, timeout = 10000, interval = 50): Promise<void> {
  const startTime = Date.now();
  while (true) {
    const result = await condition();
    if (result) return;
    if (timeout > 0 && Date.now() - startTime > timeout) {
      throw new Error(`waitUntil timed out after ${timeout}ms`);
    }
    await wait(interval);
  }
}

/**
 * Assert that an async function throws an error
 * @param fn - Function that should throw
 * @param errorType - Expected error type (optional)
 * @param contains - String that should be in error message (optional)
 */
export async function assertThrows(
  fn: () => Promise<unknown> | unknown,
  errorType?: new (...args: unknown[]) => Error,
  contains?: string
): Promise<void> {
  let thrown = false;
  let error: Error | undefined;

  try {
    await fn();
  } catch (e) {
    thrown = true;
    error = e as Error;
  }

  if (!thrown) {
    throw new Error("Expected function to throw, but it did not");
  }

  if (errorType && !(error instanceof errorType)) {
    throw new Error(`Expected error to be instance of ${errorType.name}, but got ${error?.constructor.name}`);
  }

  if (contains && error && !error.message.includes(contains)) {
    throw new Error(`Expected error message to contain "${contains}", but got "${error.message}"`);
  }
}

/**
 * Generate a random number between min and max (inclusive)
 */
export function randomNumber(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Generate a random boolean
 */
export function randomBoolean(): boolean {
  return Math.random() > 0.5;
}

/**
 * Get current time in milliseconds with high precision
 */
export function performanceNow(): number {
  if (typeof performance !== "undefined" && performance.now) {
    return performance.now();
  }
  return Date.now();
}
