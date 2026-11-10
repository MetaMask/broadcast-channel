import { hexToBytes, keccak256Bytes, utf8ToBytes } from "@toruslabs/metadata-helpers";
import { describe, expect, it } from "vite-plus/test";

import { getChannelEncPrivKey, getChannelRoomName, storageKey } from "../../src/methods/server";
import { generateChannelSecret, validateChannelSecret } from "../../src/util";

const CHANNEL_NAME = "auth_test-instance-1_test-window-1";
const SECRET_A = generateChannelSecret();
const SECRET_B = generateChannelSecret();

describe("unit/server.method.test.ts", () => {
  describe("generateChannelSecret", () => {
    it("should generate a 32-byte hex secret", () => {
      expect(SECRET_A).toMatch(/^[0-9a-f]{64}$/);
      expect(SECRET_B).toMatch(/^[0-9a-f]{64}$/);
    });

    it("should generate unique secrets", () => {
      expect(SECRET_A).not.toBe(SECRET_B);
    });

    it("should throw without WebCrypto", () => {
      const originalCrypto = globalThis.crypto;
      // oxlint-disable-next-line no-global-assign
      Object.defineProperty(globalThis, "crypto", { value: undefined, configurable: true });
      try {
        expect(() => generateChannelSecret()).toThrow("WebCrypto");
      } finally {
        Object.defineProperty(globalThis, "crypto", { value: originalCrypto, configurable: true });
      }
    });
  });

  describe("validateChannelSecret", () => {
    it("should accept valid 32-byte hex secrets", () => {
      expect(() => validateChannelSecret(SECRET_A)).not.toThrow();
      expect(() => validateChannelSecret(SECRET_A.toUpperCase())).not.toThrow();
    });

    it("should reject non-hex, wrong-length secrets", () => {
      expect(() => validateChannelSecret("")).toThrow("channel_secret");
      expect(() => validateChannelSecret("abcd")).toThrow("channel_secret");
      expect(() => validateChannelSecret(`${"g".repeat(64)}`)).toThrow("channel_secret");
      expect(() => validateChannelSecret(`${"a".repeat(63)}`)).toThrow("channel_secret");
      expect(() => validateChannelSecret(`${"a".repeat(65)}`)).toThrow("channel_secret");
    });
  });

  describe("getChannelEncPrivKey / getChannelRoomName", () => {
    const stateWith = (channelSecret?: string) => ({ channelName: CHANNEL_NAME, server: { channel_secret: channelSecret } });

    it("legacy mode (no secret) should derive from the channel name", () => {
      const privKey = getChannelEncPrivKey(stateWith());
      expect(privKey).toEqual(keccak256Bytes(utf8ToBytes(storageKey(CHANNEL_NAME))));
      // room name is the corresponding public key (65-byte uncompressed -> 130 hex chars)
      expect(getChannelRoomName(stateWith())).toMatch(/^[0-9a-f]{130}$/);
    });

    it("secret mode should derive from the secret, not the channel name", () => {
      const privKeyA = getChannelEncPrivKey(stateWith(SECRET_A));
      expect(privKeyA).toEqual(keccak256Bytes(hexToBytes(SECRET_A)));
      expect(privKeyA).not.toEqual(getChannelEncPrivKey(stateWith()));
    });

    it("same secret should derive the same key; different secrets should differ", () => {
      expect(getChannelEncPrivKey(stateWith(SECRET_A))).toEqual(getChannelEncPrivKey(stateWith(SECRET_A)));
      expect(getChannelEncPrivKey(stateWith(SECRET_A))).not.toEqual(getChannelEncPrivKey(stateWith(SECRET_B)));
      expect(getChannelRoomName(stateWith(SECRET_A))).not.toEqual(getChannelRoomName(stateWith(SECRET_B)));
    });

    it("secret-mode room name should be a valid 130-char hex room id", () => {
      expect(getChannelRoomName(stateWith(SECRET_A))).toMatch(/^[0-9a-f]{130}$/);
    });

    it("knowing only the channel name should not reveal the secret-mode room", () => {
      // legacy room (derivable from name) must differ from secret-mode room
      expect(getChannelRoomName(stateWith())).not.toEqual(getChannelRoomName(stateWith(SECRET_A)));
    });
  });
});
