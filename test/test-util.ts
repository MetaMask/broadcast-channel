/**
 * Test utilities
 */

/**
 * Generate a random string of specified length using Web Crypto API
 */
export function randomString(length: number): string {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const randomValues = new Uint8Array(length);
  crypto.getRandomValues(randomValues);
  return Array.from(randomValues, (v) => chars[v % chars.length]).join("");
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
