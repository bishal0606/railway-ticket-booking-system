#!/bin/bash

# Railway Management System - Automated Installer for macOS
# Run with: sudo ./install.sh

echo "=================================="
echo "Railway Management System Installer"
echo "=================================="
echo ""

# Check if running with sudo
if [ "$EUID" -ne 0 ]; then 
   echo "❌ Please run with sudo:"
   echo "   sudo ./install.sh"
   exit 1
fi

# Check if XAMPP is installed
if [ ! -d "/Applications/XAMPP" ]; then
    echo "❌ XAMPP not found!"
    echo "📥 Please install XAMPP first:"
    echo "   https://www.apachefriends.org/download.html"
    exit 1
fi

echo "✅ XAMPP found"

# Copy project to htdocs
echo ""
echo "📁 Copying project to XAMPP htdocs..."

if [ -d "/Applications/XAMPP/htdocs/railway" ]; then
    echo "⚠️  Railway folder already exists in htdocs"
    read -p "Do you want to overwrite it? (y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ Installation cancelled"
        exit 1
    fi
    rm -rf /Applications/XAMPP/htdocs/railway
fi

cp -R "$(dirname "$0")" /Applications/XAMPP/htdocs/railway

if [ $? -eq 0 ]; then
    echo "✅ Project copied successfully"
else
    echo "❌ Failed to copy project"
    exit 1
fi

# Set permissions
echo ""
echo "🔐 Setting permissions..."
chmod -R 755 /Applications/XAMPP/htdocs/railway
chown -R daemon:daemon /Applications/XAMPP/htdocs/railway
echo "✅ Permissions set"

echo ""
echo "=================================="
echo "✅ Installation Complete!"
echo "=================================="
echo ""
echo "Next steps:"
echo ""
echo "1. Start XAMPP services:"
echo "   - Open: /Applications/XAMPP/manager-osx.app"
echo "   - Start MySQL Database"
echo "   - Start Apache Web Server"
echo ""
echo "2. Import database:"
echo "   - Open: http://localhost/phpmyadmin/"
echo "   - Click 'SQL' tab"
echo "   - Copy contents from: database/railway_db.sql"
echo "   - Paste and click 'Go'"
echo ""
echo "3. Access your application:"
echo "   - Open: http://localhost/railway/"
echo ""
echo "📚 For detailed instructions, read:"
echo "   - QUICK_START.md"
echo "   - INSTALLATION_GUIDE.md"
echo ""
echo "🎉 Happy coding!"
echo ""

