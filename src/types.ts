import { BUILD_ENV_TYPE } from "@toruslabs/constants";

export type MethodType = "idb" | "native" | "localstorage" | "simulate" | "server";

export interface ListenerObject {
  time: number;
  fn: (data: unknown) => void;
}

export type AddEventListeners = {
  // addEventListeners
  message: ListenerObject[];
  internal: ListenerObject[];
};

export type EventType = keyof AddEventListeners;

export interface MessageObject {
  time: number;
  type: EventType;
  data: unknown;
}

export interface Method {
  type: MethodType;
  canBeUsed: (options: Options) => boolean;
  microSeconds: () => number;
  create: (name: string, options: Options) => unknown | Promise<unknown>;
  postMessage: (state: unknown, msg: MessageObject) => Promise<unknown>;
  onMessage: (state: unknown, fn: ((msg: MessageObject) => void) | null, time: number) => void;
  close: (state: unknown) => void | Promise<void>;
}

interface IdbOptions {
  ttl?: number;
  fallbackInterval?: number;
  onclose?: () => void;
}

interface LocalStorageOptions {
  removeTimeout?: number;
}

interface ServerOptions {
  build_env?: BUILD_ENV_TYPE;
  api_url?: string;
  socket_url?: string;
  removeTimeout?: number;
  timeout?: number;
  allowed_origin?: string;
  /**
   * 32-byte hex secret used to derive the channel's encryption/signing key.
   * MUST be generated with `generateChannelSecret()` and shared with the receiving
   * side out-of-band (e.g. via the popup URL fragment). When omitted, the method
   * falls back to deriving keys from the channel name, which is readable and
   * writable by anyone who learns the channel name.
   */
  channel_secret?: string;
}

export interface Options {
  type?: MethodType;
  methods?: Method;
  prepareDelay?: number;
  webWorkerSupport?: boolean;
  idb?: IdbOptions;
  localstorage?: LocalStorageOptions;
  server?: ServerOptions;
}

export interface IBroadcastChannel<T> {
  name: string;
  options: Options;
  closed: boolean;

  onmessage: ((data: T) => void) | null;

  postMessage(message: T): Promise<T>;
  addEventListener(type: EventType, listener: (data: T) => void): void;
  removeEventListener(type: EventType, listener: (data: T) => void): void;
  close(): Promise<void>;
}
