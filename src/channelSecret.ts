import { generateChannelSecret } from "./util";

/**
 * Key used in the URL hash (`#csec=...`) to hand the channel secret to a popup window.
 * Fragments are never sent to any server, OAuth provider, or proxy — they stay in the browser.
 */
export const CHANNEL_SECRET_HASH_KEY = "csec";

/**
 * sessionStorage key used to persist the channel secret across navigations within
 * the same tab (e.g. the login popup navigating /start, then the OAuth provider,
 * then /end). sessionStorage survives cross-origin navigations per tab, which is
 * how the existing `window_id` mechanism already works.
 */
export const CHANNEL_SECRET_STORAGE_KEY = "bc_channel_secret";

/**
 * Sender side: generates a fresh channel secret and attaches it to the popup URL
 * as a hash fragment (`#csec=...`). The URL object is mutated in place so that
 * every consumer of it (window.open, StreamWindow relay, redirects) carries the
 * fragment. The secret must be shared with the receiving side ONLY via this
 * fragment — never in query params, request bodies, or logs.
 *
 * @returns the generated 32-byte hex secret; also pass it to the local BroadcastChannel
 * via `withChannelSecret`.
 */
/**
 * Removes every `key=value` pair for `key` from a raw (no leading `#`) hash
 * string, preserving the original encoding of all remaining parts. Returns an
 * empty string when nothing remains. Used to add/remove the channel secret
 * without a URLSearchParams round-trip, which would re-encode (and thereby
 * mangle) fragments that are not in key=value form.
 */
function removeHashParamByKeyPrefix(rawHash: string, key: string): string {
  return rawHash
    .split("&")
    .filter((part) => part && !part.startsWith(`${key}=`))
    .join("&");
}

export function attachChannelSecret(url: URL): string {
  const channelSecret = generateChannelSecret();
  // Split/filter/join instead of URLSearchParams: re-serializing the hash would
  // mangle fragments that are not in key=value form (e.g. `#section` or
  // `#/route/path`). Every other byte of the hash is preserved verbatim.
  const withoutSecret = removeHashParamByKeyPrefix(url.hash.replace(/^#/, ""), CHANNEL_SECRET_HASH_KEY);
  url.hash = withoutSecret ? `#${withoutSecret}&${CHANNEL_SECRET_HASH_KEY}=${channelSecret}` : `#${CHANNEL_SECRET_HASH_KEY}=${channelSecret}`;
  return channelSecret;
}

/**
 * Receiver side: reads `#csec=...` from `window.location.hash` if present,
 * persists it to sessionStorage (so later channel constructions in this tab and
 * post-redirect pages like /end can reuse it), and strips it from the visible URL.
 *
 * @returns the secret, or undefined when absent (legacy opener — the channel
 * falls back to name-derived keys and logs a deprecation warning).
 */
export function consumeChannelSecretFromHash(): string | undefined {
  const rawHash = window.location.hash.replace(/^#/, "");
  const secret = new URLSearchParams(rawHash).get(CHANNEL_SECRET_HASH_KEY);
  if (secret) {
    try {
      sessionStorage.setItem(CHANNEL_SECRET_STORAGE_KEY, secret);
    } catch (error) {
      // sessionStorage may be unavailable (e.g. storage disabled); the channel
      // still works for this page load, but post-redirect pages won't inherit it.
      // eslint-disable-next-line no-console
      console.warn("BroadcastChannel: could not persist channel secret", error);
    }
    // Remove only the csec pair from the raw hash; all other params keep their
    // original encoding (no URLSearchParams round-trip).
    const remaining = removeHashParamByKeyPrefix(rawHash, CHANNEL_SECRET_HASH_KEY);
    const newUrl = `${window.location.pathname}${window.location.search}${remaining ? `#${remaining}` : ""}`;
    window.history.replaceState(window.history.state, "", newUrl);
    return secret;
  }
  return undefined;
}

/**
 * Receiver side: resolves the channel secret for this tab. Checks the URL hash
 * first (attaching consumers persist it), then sessionStorage.
 *
 * @returns the secret, or undefined when absent (legacy fallback).
 */
export function readChannelSecret(): string | undefined {
  const fromHash = consumeChannelSecretFromHash();
  if (fromHash) return fromHash;
  try {
    return sessionStorage.getItem(CHANNEL_SECRET_STORAGE_KEY) ?? undefined;
  } catch {
    return undefined;
  }
}

/**
 * Removes the persisted channel secret for this tab. Call it once the secret's
 * purpose is served (e.g. a one-shot handoff like the login credentials post) so
 * a stale value cannot be silently reused by a later fragment-less channel in
 * the same window — which would break the legacy fallback.
 */
export function clearChannelSecret(): void {
  try {
    sessionStorage.removeItem(CHANNEL_SECRET_STORAGE_KEY);
  } catch {
    // storage unavailable — nothing to clear
  }
}

/**
 * Merges a channel secret into broadcast-channel options. Passing `undefined`
 * keeps legacy name-derived key derivation (with a deprecation warning logged
 * by the library).
 */
export function withChannelSecret<T extends object>(options: T, channelSecret?: string): T & { server?: Record<string, unknown> } {
  if (!channelSecret) return { ...options };
  const existing = (options as { server?: Record<string, unknown> }).server;
  return { ...options, server: { ...existing, channel_secret: channelSecret } };
}
