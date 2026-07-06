# Installing Claude Code

[Claude Code](https://claude.com/claude-code) is Anthropic's CLI for agentic coding.

---

## macOS / Linux

### Prerequisites

- macOS 12+ or a modern Linux distribution
- Node.js 18+
- `curl` (preinstalled on macOS and most Linux distros)

### Install

```bash
curl -fsSL https://claude.ai/install.sh | bash
```

### Verify

```bash
claude --version
```

### Update

Re-run the install command — the script upgrades an existing installation automatically.

### Uninstall

```bash
npm uninstall -g @anthropic-ai/claude-code
```

---

## Windows (winget)

### Prerequisites

- Windows 10 1809+ or Windows 11
- [App Installer](https://apps.microsoft.com/detail/9nblggh4nns1) installed (ships `winget`; preinstalled on most modern Windows builds)
- Node.js 18+

### Install

```powershell
winget install Anthropic.ClaudeCode
```

### Verify

```powershell
claude --version
```

### Update

```powershell
winget upgrade Anthropic.ClaudeCode
```

### Uninstall

```powershell
winget uninstall Anthropic.ClaudeCode
```

---

## Cross-platform (npm)

Use this method on any OS where Node.js is already installed — including Windows, macOS, and Linux.

### Prerequisites

- Node.js 18+
- npm 7+ (included with Node.js)

### Install

```bash
npm install -g @anthropic-ai/claude-code
```

### Verify

```bash
claude --version
```

### Update

```bash
npm update -g @anthropic-ai/claude-code
```

### Uninstall

```bash
npm uninstall -g @anthropic-ai/claude-code
```

---

## First run

After installing, run `claude` in any project directory and follow the prompt to authenticate with your Anthropic account.
