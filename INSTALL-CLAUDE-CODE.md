# Installing Claude Code on Windows (winget)

[Claude Code](https://claude.com/claude-code) is Anthropic's CLI for agentic coding. On Windows, the
recommended install path is via the Windows Package Manager (`winget`).

## Prerequisites

- Windows 10 1809+ or Windows 11
- [App Installer](https://apps.microsoft.com/detail/9nblggh4nns1) installed (ships `winget`; preinstalled on most modern Windows builds)
- Node.js 18+ (Claude Code runs on Node)

## Install

```powershell
winget install Anthropic.ClaudeCode
```

## Verify

```powershell
claude --version
```

## Update

```powershell
winget upgrade Anthropic.ClaudeCode
```

## Uninstall

```powershell
winget uninstall Anthropic.ClaudeCode
```

## Other platforms

- **macOS/Linux:** `curl -fsSL https://claude.ai/install.sh | bash`
- **npm (cross-platform):** `npm install -g @anthropic-ai/claude-code`

## First run

After installing, run `claude` in any project directory and follow the prompt to authenticate with your Anthropic account.
