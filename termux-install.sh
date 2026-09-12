#!/bin/bash
# ==============================================================================
# AURA — Autonomous AI Developer Platform
# One-Step Installer for Termux (Android)
# Repository: https://github.com/zero-creation2008/Aura
# ==============================================================================

set -e

echo -e "\033[1;36m"
echo "  █████╗ ██╗   ██╗██████╗  █████╗ "
echo " ██╔══██╗██║   ██║██╔══██╗██╔══██╗"
echo " ███████║██║   ██║██████╔╝███████║"
echo " ██╔══██║██║   ██║██╔══██╗██╔══██║"
echo " ██║  ██║╚██████╔╝██║  ██║██║  ██║"
echo " ╚═╝  ╚═╝ ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝"
echo -e "\033[0m"
echo -e "\033[1;32mSetting up AURA Autonomous AI Developer in Termux...\033[0m"
echo ""

# 1. Check if running inside Termux or standard Linux
if [ -n "$PREFIX" ] && [ -d "$PREFIX/bin" ]; then
  echo -e "\033[33m[1/4] Termux environment detected at $PREFIX\033[0m"
  
  # Check if node is installed
  if ! command -v node >/dev/null 2>&1; then
    echo "Installing Node.js in Termux..."
    pkg update -y
    pkg install nodejs -y
  fi
  
  # Check if git is installed
  if ! command -v git >/dev/null 2>&1; then
    echo "Installing git in Termux..."
    pkg install git -y
  fi
else
  echo -e "\033[33m[1/4] Linux / POSIX environment detected\033[0m"
fi

# 2. Make CLI executable
echo -e "\033[33m[2/4] Configuring CLI permissions...\033[0m"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
chmod +x "$SCRIPT_DIR/bin/aura.js"

# 3. Create global symlink or alias so 'aura' is available globally in Termux
echo -e "\033[33m[3/4] Registering global 'aura' command...\033[0m"
if [ -n "$PREFIX" ] && [ -d "$PREFIX/bin" ]; then
  ln -sf "$SCRIPT_DIR/bin/aura.js" "$PREFIX/bin/aura"
  echo "✓ Symlinked to $PREFIX/bin/aura"
elif [ -w "/usr/local/bin" ]; then
  ln -sf "$SCRIPT_DIR/bin/aura.js" /usr/local/bin/aura
  echo "✓ Symlinked to /usr/local/bin/aura"
else
  # Add alias to ~/.bashrc
  if ! grep -q "alias aura=" ~/.bashrc 2>/dev/null; then
    echo "alias aura=\"$SCRIPT_DIR/bin/aura.js\"" >> ~/.bashrc
    echo "✓ Added alias aura to ~/.bashrc"
  fi
fi

# 4. Install dependencies if node_modules is missing
echo -e "\033[33m[4/4] Verifying dependencies...\033[0m"
if [ ! -d "$SCRIPT_DIR/node_modules" ]; then
  echo "Installing Node packages..."
  npm install --omit=dev
fi

echo ""
echo -e "\033[1;32m========================================================\033[0m"
echo -e "\033[1;36m AURA is ready to use in Termux!\033[0m"
echo -e "\033[1;32m========================================================\033[0m"
echo ""
echo "Try running:"
echo -e "  \033[1;33maura ask \"Hello AURA!\"\033[0m"
echo -e "  \033[1;33maura agent list\033[0m"
echo -e "  \033[1;33maura agent create SecBot \"Scans code for issues\" SecurityAgent\033[0m"
echo -e "  \033[1;33maura goal \"Build a lightweight REST API\"\033[0m"
echo -e "  \033[1;33maura debug\033[0m"
echo -e "  \033[1;33maura\033[0m (interactive shell)"
echo ""
echo "Repository: https://github.com/zero-creation2008/Aura"
echo "GitHub Pages: https://zero-creation2008.github.io/Aura/"
echo ""
