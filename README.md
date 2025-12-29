<p align="center">
  <img src="https://bnochat.cc/favicon.ico" width="80" alt="bnochat logo">
</p>

<h1 align="center">bno-cli</h1>

<p align="center">
  Chat from your terminal. Fast, simple, cross-platform.
</p>

<p align="center">
  <a href="https://bnochat.cc">Website</a> •
  <a href="https://github.com/bnochat/cli/releases">Download</a> •
  <a href="#installation">Installation</a> •
  <a href="#usage">Usage</a>
</p>

---

## Installation

### npm (Requires Node.js)

```bash
npm install -g bno-cli
```

#### macOS Setup

```bash
# Download (Apple Silicon)
curl -L -o bno https://github.com/bnochat/cli/releases/latest/download/bno-macos-arm64

# Make executable & remove quarantine
chmod +x bno && xattr -d com.apple.quarantine bno

# Move to PATH
sudo mv bno /usr/local/bin/
```

#### Linux Setup

```bash
# One-line install
curl -fsSL https://raw.githubusercontent.com/bnochat/cli/main/scripts/install.sh | bash

# Or manual
curl -L -o bno https://github.com/bnochat/cli/releases/latest/download/bno-linux
chmod +x bno && sudo mv bno /usr/local/bin/
```

#### Homebrew (macOS)

```bash
brew tap bnochat/cli && brew install bnochat
```

### Download Binary (Recommended)

No dependencies required. Download and run.

| Platform | Download | Notes |
|----------|----------|-------|
| **Windows** | [`bno.exe`](https://github.com/bnochat/cli/releases/latest/download/bno.exe) | Run directly |
| **macOS (Intel)** | [`bno-macos-x64`](https://github.com/bnochat/cli/releases/latest/download/bno-macos-x64) | See setup below |
| **macOS (Apple Silicon)** | [`bno-macos-arm64`](https://github.com/bnochat/cli/releases/latest/download/bno-macos-arm64) | See setup below |
| **Linux** | [`bno-linux`](https://github.com/bnochat/cli/releases/latest/download/bno-linux) | See setup below |





---

## Usage

### Quick Start

```bash
# 1. Login (opens browser)
bno -a

# 2. Join a room
bno -j ROOM_CODE
```

### Commands

| Flag | Description |
|------|-------------|
| `-a, --auth` | Login via browser |
| `-j, --join [code]` | Join a chat room |
| `-l, --logout` | Logout |
| `-c, --check` | Check for updates |
| `-u, --update` | Update to latest version |
| `-v, --version` | Show version |
| `-h, --help` | Show help |

### Chat Commands

While in a room:

| Command | Action |
|---------|--------|
| `/q` `/quit` `/exit` | Leave room |

---

## Update

```bash
# Check for updates
bno -c

# Update to latest
bno -u

# Update for npm
npm update -g bno-cli
```

---

## Links

- 🌐 **Website**: [bnochat.cc](https://bnochat.cc)
- 📦 **Releases**: [GitHub Releases](https://github.com/bnochat/cli/releases)
- 🐛 **Issues**: [Report a bug](https://github.com/bnochat/cli/issues)

---

## License

MIT © [bnochat](https://bnochat.cc)
