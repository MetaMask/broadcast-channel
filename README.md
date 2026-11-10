<!--
    This is a different REDME file which will be published to npm
    The one for GitHub is in .github directory.

    @link https://stackoverflow.com/a/65676410/3443137

    The problem was that google indexed the npm-site instead of the github site
-->

<p align="center">
  <a href="https://github.com/pubkey/broadcast-channel">
    <img src="./docs/files/icon.png" width="150px" />
  </a>
</p>

<h1 align="center">BroadcastChannel</h1>
<p align="center">
  <strong>A BroadcastChannel that works in old browsers, new browsers, WebWorkers and NodeJs</strong>
  <br/>
  <span>+ LeaderElection over the channels</span>
</p>

<p align="center">
    <a href="https://twitter.com/pubkeypubkey">
        <img src="https://img.shields.io/twitter/follow/pubkeypubkey.svg?style=social&logo=twitter"
            alt="follow on Twitter"></a>
</p>

![demo.gif](docs/files/demo.gif)

* * *

A BroadcastChannel that allows you to send data between different browser-tabs or nodejs-processes.
And a LeaderElection over the channels.

# [Read the full documentation on github](https://github.com/pubkey/broadcast-channel)

## Security: `server` method (v15+)

When using `type: "server"`, the channel's encryption and signing key is derived from a **channel secret**,
not from the channel name. Generate it with `generateChannelSecret()` on the initiating side and share it
with the receiving side out-of-band — e.g. via the popup URL fragment, which is never sent to any server:

```js
import { BroadcastChannel, generateChannelSecret } from "@toruslabs/broadcast-channel";

const channelSecret = generateChannelSecret(); // 32-byte hex
const bc = new BroadcastChannel(channelName, { type: "server", server: { channel_secret: channelSecret } });
```

The receiving side must construct the channel with the **same** secret. Channels created without a secret
fall back to the legacy name-derived keys, which anyone who learns the channel name can read and write —
a deprecation warning is logged in that mode. Never send the secret to the broadcast server or include it
in any URL query parameter.
