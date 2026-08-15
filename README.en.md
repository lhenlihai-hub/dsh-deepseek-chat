# dsh-ask-deepseek

English | [中文](README.md)

A DeepSeek Harness (dsh) Web UI plugin: an **"Ask DeepSeek"** entry on the right edge of the conversation page that opens a clean, standalone chat panel — talk to **DeepSeek-V4-Flash / Pro** through the API key you already configured in dsh, fully independent of the main agent session.

## Features

- 💬 **Right-edge entry + slide-out panel**: a persistent vertical button opens the chat panel
- 🆕 **Fresh, isolated conversations**: panel chats never touch dsh agent sessions; one click starts over
- ⚡ **Flash / Pro switch**: header dropdown, with the default model persisted (localStorage)
- 🔑 **Reuses your dsh API configuration**: the host half streams through `ctx.llm` and the registered `deepseek-official` route — API key, base URL and settings overrides all apply; the plugin never sees or stores any credential
- 🌊 **Streaming**: SSE token-by-token output, reasoning display, cancellable at any time
- ⚙️ **Settings modal**: default model, GitHub feedback link, one-click uninstall (two-step confirm)
- 🌗 **Theme aware**: follows the dsh Web UI light/dark theme

## Install

```bash
# From npm (once published)
dsh plugin --profile web add dsh-ask-deepseek

# Local development
git clone https://github.com/YOUR-NAME/dsh-ask-deepseek.git
cd dsh-ask-deepseek
npm install
npm run build
dsh plugin --profile web add link:$(pwd)
```

Restart `dsh web`, open any session, and the「问 DeepSeek」entry appears on the right edge.

> Prerequisite: configure your DeepSeek API key in dsh **Settings → Models** first — the plugin reuses that configuration and never asks for a key itself.

## Uninstall

In-panel: Settings (⚙) → Uninstall → Confirm, or from a terminal:

```bash
dsh plugin --profile web remove dsh-ask-deepseek
```

Restart `dsh web` to apply.

## Development

```bash
npm install
npm run build      # emits lib/index.js (host half) + lib/client.js (browser half)
npm run watch
npm run typecheck
```

> Note: `file:` / `link:` installs copy rather than link — after changing sources, `remove` + `add` again (or restart dsh) for changes to take effect.

### Layout

```
src/
├── index.ts          # host half: /ask-deepseek/* routes (chat SSE / models / uninstall)
└── client/
    ├── index.ts      # browser half entry: mounts the React root
    ├── app.tsx       # UI: entry button, chat panel, settings modal
    └── styles.ts     # inline CSS (light/dark)
cordis.patch.yml      # bundle patch (auto-mounted into the web profile on install)
```

## License

[MIT](LICENSE)
