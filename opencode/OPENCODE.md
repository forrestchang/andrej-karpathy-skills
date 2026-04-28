# OpenCode

This repo includes an OpenCode plugin under [`opencode/`](./).

## Install

Once published to npm:

```text
oc-plugin-karpathy-guidelines@latest
```

Or in OpenCode config:

```json
{
  "$schema": "https://opencode.ai/config.json",
  "plugin": ["oc-plugin-karpathy-guidelines@latest"]
}
```

For local development without npm publication:

```json
{
  "$schema": "https://opencode.ai/config.json",
  "plugin": ["/absolute/path/to/andrej-karpathy-skills/opencode/plugin/server.js"]
}
```

## Verify

```bash
opencode debug config
```

You should see the plugin path or package in the resolved `plugin` list.

## Uninstall

Remove the plugin entry from the `plugin` array in your OpenCode config.

## Publish

```bash
npm login
npm publish
```
