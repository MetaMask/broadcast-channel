---
"@toruslabs/broadcast-channel": major
---

Security fix for the `server` method: the channel's encryption/signing key was derived directly from the
channel name, so anyone who learned the channel name could decrypt retained messages and forge validly
signed replacements. The key is now derived from an optional `server.channel_secret` (32-byte hex,
generate with `generateChannelSecret()`); the server room name becomes the secret's public key, which is
unguessable without the secret. Channels without a secret keep the legacy name-derived keys and log a
deprecation warning — migrate by generating a secret on the initiating side and sharing it with the
receiving side out-of-band (e.g. popup URL fragment). Internal message tokens now use CSPRNG instead of
`Math.random`.
