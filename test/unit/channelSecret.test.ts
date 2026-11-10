import { describe, expect, it } from "vite-plus/test";

import { attachChannelSecret, CHANNEL_SECRET_HASH_KEY, withChannelSecret } from "../../src";

// node-safe subset: the DOM-dependent helpers (consumeChannelSecretFromHash,
// readChannelSecret, clearChannelSecret) are covered by the consumer repos'
// browser test suites (e.g. base-controllers), since they need window/sessionStorage.

describe("unit/channelSecret.test.ts", () => {
  describe("attachChannelSecret", () => {
    it("should append a 32-byte hex secret as a hash fragment", () => {
      const url = new URL("https://wallet.example/start?state=abc");
      const secret = attachChannelSecret(url);
      expect(secret).toMatch(/^[0-9a-f]{64}$/);
      expect(url.hash).toBe(`#${CHANNEL_SECRET_HASH_KEY}=${secret}`);
      expect(url.search).toBe("?state=abc");
    });

    it("should preserve existing fragments verbatim (no URLSearchParams re-serialization)", () => {
      const url = new URL("https://wallet.example/start#/route/path?keep=%2Fvalue");
      attachChannelSecret(url);
      expect(url.hash).toMatch(/^#\/route\/path\?keep=%2Fvalue&csec=[0-9a-f]{64}$/);
    });

    it("should replace a stale csec entry instead of duplicating it", () => {
      const url = new URL(`https://wallet.example/start#${CHANNEL_SECRET_HASH_KEY}=${"c".repeat(64)}`);
      const secret = attachChannelSecret(url);
      const entries = url.hash
        .replace(/^#/, "")
        .split("&")
        .filter((part) => part.startsWith(`${CHANNEL_SECRET_HASH_KEY}=`));
      expect(entries).toHaveLength(1);
      expect(secret).not.toBe("c".repeat(64));
    });
  });

  describe("withChannelSecret", () => {
    it("should merge the secret into options without mutating the input", () => {
      const options = { type: "server" as const, webWorkerSupport: false };
      const merged = withChannelSecret(options, "a".repeat(64));
      expect(merged.server).toEqual({ channel_secret: "a".repeat(64) });
      expect(options).not.toHaveProperty("server");
    });

    it("should pass options through unchanged when no secret is given", () => {
      const options = { type: "server" as const, server: { allowed_origin: "https://dapp.example" } };
      const legacy = withChannelSecret(options);
      expect(legacy).toEqual(options);
      expect(legacy).not.toBe(options);
    });
  });
});
