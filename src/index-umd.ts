/* eslint-disable @typescript-eslint/no-explicit-any */
import { BroadcastChannel } from "./broadcast-channel";
import { RedundantAdaptiveBroadcastChannel } from "./redundant-adaptive-broadcast-channel";

declare global {
  interface Window {
    broadcastChannelLib: any;
  }
}

if (typeof window !== "undefined") {
  window.broadcastChannelLib = {};
  window.broadcastChannelLib.BroadcastChannel = BroadcastChannel;
  window.broadcastChannelLib.RedundantAdaptiveBroadcastChannel = RedundantAdaptiveBroadcastChannel;
}
