# bno-cli

Terminal chat application for Ubuntu, Windows, and macOS.

## Installation

### Option 1: Download Binary (No dependencies)

Download from [Releases](https://github.com/bnochat/cli/releases):

| OS | File |
|----|------|
| Windows | `bno.exe` |
| macOS (Intel) | `bno-macos-x64` |
| macOS (M1/M2/M3) | `bno-macos-arm64` |
| Linux | `bno-linux` |

### macOS

```bash
# Homebrew
brew tap bnochat/cli && brew install bnochat

# Or manual (replace VERSION with latest)
curl -L -o bno https://github.com/bnochat/cli/releases/latest/download/bno-macos-arm64
chmod +x bno && xattr -d com.apple.quarantine bno
sudo mv bno /usr/local/bin/
```

### Linux

```bash
# Auto install
curl -fsSL https://raw.githubusercontent.com/bnochat/cli/main/scripts/install.sh | bash

# Or .deb (check latest version at releases page)
curl -L -o bnochat.deb https://github.com/bnochat/cli/releases/latest/download/bnochat_1.0.1_amd64.deb
sudo dpkg -i bnochat.deb
```

### Option 2: npm (Requires Node.js)

```bash
npm install -g bno-cli
```

## Usage

```bash
bno -h, --help         #display help for command
bno -a, --auth         #Login via browser
bno -j, --join [code]  #Join a chat room
bno -v, --version      #output the version number
bno -c, --check        #Check for updates
bno -u, --update       #Update to latest version
bno -l, --logout       #Logout
```

## Chat Commands

| Command | Action |
|---------|--------|
| `/q` | Leave room |
| `/quit` | Leave room |
| `/exit` | Leave room |

## Development

```bash
npm install
npm run dev -- -j    # Test client
npm run package      # Build binaries
```

## License

MIT
