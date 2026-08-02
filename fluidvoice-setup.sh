#!/bin/bash
# FluidVoice one-command setup for macOS
# Usage (in Terminal on your Mac):
#   curl -fsSL https://raw.githubusercontent.com/greentransformation2050-cmd/Alpha-Claude/claude/fluidvoice-setup-f3augg/fluidvoice-setup.sh | bash
# or download this file and run:  bash fluidvoice-setup.sh

set -e

bold() { printf '\033[1m%s\033[0m\n' "$1"; }
ok()   { printf '\033[32m✔ %s\033[0m\n' "$1"; }
warn() { printf '\033[33m⚠ %s\033[0m\n' "$1"; }
fail() { printf '\033[31m✘ %s\033[0m\n' "$1"; exit 1; }

bold "FluidVoice setup"
echo

# 1. Must be macOS
[ "$(uname)" = "Darwin" ] || fail "This script must run on a Mac (FluidVoice is macOS-only)."

# 2. macOS 15 (Sequoia) or later required
macos_major=$(sw_vers -productVersion | cut -d. -f1)
if [ "$macos_major" -lt 15 ]; then
  fail "FluidVoice requires macOS 15 (Sequoia) or later — you have $(sw_vers -productVersion). Update via System Settings → General → Software Update, then re-run this script."
fi
ok "macOS $(sw_vers -productVersion) detected"

# 3. Disk space check (needs ~1 GB for models, ~4.5 GB with Fluid Intelligence)
free_gb=$(df -g / | awk 'NR==2 {print $4}')
if [ "$free_gb" -lt 5 ]; then
  warn "Only ${free_gb} GB free. You need ~1 GB for voice models (+3.5 GB if you enable Fluid Intelligence)."
else
  ok "${free_gb} GB free disk space"
fi

# 4. Homebrew
if ! command -v brew >/dev/null 2>&1; then
  bold "Installing Homebrew (you may be asked for your Mac password)..."
  /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
  # Add brew to PATH for this run (Apple Silicon and Intel locations)
  [ -x /opt/homebrew/bin/brew ] && eval "$(/opt/homebrew/bin/brew shellenv)"
  [ -x /usr/local/bin/brew ]    && eval "$(/usr/local/bin/brew shellenv)"
fi
ok "Homebrew ready"

# 5. Install FluidVoice
if brew list --cask fluidvoice >/dev/null 2>&1; then
  ok "FluidVoice already installed — checking for updates"
  brew upgrade --cask fluidvoice || true
else
  bold "Installing FluidVoice..."
  brew install --cask fluidvoice
fi
ok "FluidVoice installed"

# 6. Launch it
open -a FluidVoice || warn "Could not auto-launch — open FluidVoice from your Applications folder."

echo
bold "Done! Now finish setup in the app (takes ~2 minutes):"
cat <<'EOF'
  1. Grant MICROPHONE access when prompted.
  2. Grant ACCESSIBILITY access:
     System Settings → Privacy & Security → Accessibility → enable FluidVoice.
  3. In onboarding, set your global hotkey (e.g. Fn or ⌥ Space).
  4. Pick a speech model (~1 GB download; Whisper models if on an Intel Mac).
  5. Optional: enable Fluid Intelligence for on-device AI cleanup (~3.5 GB).

Then press your hotkey in any app and start dictating.
EOF
