#!/bin/bash

VERSION="1.0.1"
PACKAGE_NAME="bnochat"
ARCH="amd64"

# Create directory structure
mkdir -p deb-package/DEBIAN
mkdir -p deb-package/usr/local/bin
mkdir -p deb-package/usr/share/applications
mkdir -p deb-package/usr/share/doc/bnochat

# Copy binary
cp bin/bnochat-linux deb-package/usr/local/bin/bnochat
chmod +x deb-package/usr/local/bin/bnochat

# Create control file
cat > deb-package/DEBIAN/control << EOF
Package: ${PACKAGE_NAME}
Version: ${VERSION}
Section: net
Priority: optional
Architecture: ${ARCH}
Maintainer: Your Name <your@email.com>
Description: Terminal chat application
 A cross-platform terminal chat application
 for real-time messaging.
EOF

# Create postinst script (runs after install)
cat > deb-package/DEBIAN/postinst << EOF
#!/bin/bash
echo "bnochat installed successfully!"
echo "Run 'bnochat --help' to get started."
EOF
chmod +x deb-package/DEBIAN/postinst

# Create doc
cp README.md deb-package/usr/share/doc/bnochat/

# Build .deb
dpkg-deb --build deb-package
mv deb-package.deb "bnochat_${VERSION}_${ARCH}.deb"

# Cleanup
rm -rf deb-package

echo "Created: bnochat_${VERSION}_${ARCH}.deb"
