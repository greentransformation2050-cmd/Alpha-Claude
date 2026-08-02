# FluidVoice — Installation & Setup Guide

[FluidVoice](https://github.com/altic-dev/FluidVoice) is an open-source voice-to-text dictation app for macOS with on-device AI enhancement. Press a hotkey anywhere on your Mac, speak, and it types for you.

> **Note:** FluidVoice is **macOS-only** (macOS 15 Sequoia or later). It cannot be installed on Linux, Windows, or in a cloud environment — run the steps below on your Mac.

## Option A — One-command setup (recommended)

Open **Terminal** on your Mac and paste:

```bash
curl -fsSL https://raw.githubusercontent.com/greentransformation2050-cmd/Alpha-Claude/claude/fluidvoice-setup-f3augg/fluidvoice-setup.sh | bash
```

The script checks your macOS version and disk space, installs Homebrew if missing, installs FluidVoice, launches it, and prints the remaining in-app steps.

## Option B — Manual install

1. **With Homebrew:**
   ```bash
   brew install --cask fluidvoice
   ```
   **Or without Homebrew:** download from the [latest release page](https://github.com/altic-dev/FluidVoice/releases/latest), open the file, and drag FluidVoice into Applications.
2. Open FluidVoice from Applications (click **Open** if macOS warns about a downloaded app).

## Finish setup in the app (~2 minutes)

1. **Grant Microphone access** when prompted — needed to hear you.
2. **Grant Accessibility access** — needed to type text into other apps:
   System Settings → Privacy & Security → Accessibility → enable FluidVoice.
3. **Set a global hotkey** in onboarding (e.g. `Fn` or `⌥ Space`).
4. **Pick a speech model** (~1 GB download). Apple Silicon gets the full experience; Intel Macs use Whisper models.
5. **Optional — Fluid Intelligence:** on-device AI that cleans up grammar and punctuation (~3.5 GB extra, fully local). Cloud AI providers can be connected instead.

## Requirements

| Requirement | Detail |
|---|---|
| macOS | 15.0 (Sequoia) or later |
| Mac | Apple Silicon (Intel supported via Whisper) |
| Disk | ~1 GB for voice models, +3.5 GB for Fluid Intelligence |
| Permissions | Microphone + Accessibility |

## Troubleshooting

- **"FluidVoice can't be opened"** — right-click the app → Open → Open, or allow it under System Settings → Privacy & Security.
- **Nothing types when I dictate** — re-check the Accessibility permission; toggle it off and on, then restart the app.
- **Hotkey doesn't respond** — make sure no other app uses the same shortcut, and that FluidVoice is running (menu bar icon).
- **macOS too old** — update via System Settings → General → Software Update.
