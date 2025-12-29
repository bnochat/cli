#!/bin/bash

# Auto install script for Linux

set -e

VERSION="1.0.10"
INSTALL_DIR="/usr/local/bin"
REPO="bnochat/cli"

# Detect architecture
ARCH=$(uname -m)
case $ARCH in
    x86_64)
        BINARY="bnochat-linux"
        ;;
    aarch64|arm64)
        BINARY="bnochat-linux-arm64"
        ;;
    *)
        echo "Unsupported architecture: $ARCH"
        exit 1
        ;;
esac

echo "Installing bnochat v${VERSION} for ${ARCH}..."

# Download binary
curl -L -o /tmp/bnochat "https://github.com/${REPO}/releases/download/v${VERSION}/${BINARY}"

# Set permissions
chmod +x /tmp/bnochat

# Install to system (requires sudo)
if [ -w "$INSTALL_DIR" ]; then
    mv /tmp/bnochat "$INSTALL_DIR/bnochat"
else
    sudo mv /tmp/bnochat "$INSTALL_DIR/bnochat"
fi

echo ""
echo "✓ bnochat installed successfully!"
echo ""
echo "Usage:"
echo "  bnochat --help     Show help"
echo "  bnochat login      Login to server"
echo "  bnochat chat       Start chatting"
