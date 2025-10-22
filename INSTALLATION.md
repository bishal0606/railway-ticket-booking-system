# 🚄 Railway Management System - Complete Installation Guide

Complete step-by-step installation guide for Mac and Windows.

---

## 📋 Table of Contents
- [Prerequisites](#prerequisites)
- [Mac Installation](#mac-installation)
- [Windows Installation](#windows-installation)
- [Database Setup](#database-setup)
- [Running the Project](#running-the-project)
- [Troubleshooting](#troubleshooting)

---

## 🔧 Prerequisites

### What You Need:
- PHP 7.4 or higher
- MySQL 8.0 or higher
- A web browser (Chrome, Firefox, Safari, or Edge)
- Terminal/Command Prompt access

---

## 🍎 Mac Installation

### Step 1: Install Homebrew (if not installed)

Open Terminal and run:
```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

### Step 2: Install PHP

```bash
brew install php
```

Verify installation:
```bash
php -v
```
You should see PHP version 7.4 or higher.

### Step 3: Install MySQL

```bash
brew install mysql
```

Start MySQL service:
```bash
brew services start mysql
```

Secure MySQL installation:
```bash
mysql_secure_installation
```
- Set root password: `Bishal@1234` (or your preferred password)
- Answer Y to all security questions

### Step 4: Get the Project Files

Navigate to where you want the project:
```bash
cd ~/Desktop
```

If you have the project as a zip file, extract it. Otherwise, navigate to the project folder:
```bash
cd railway
```

### Step 5: Configure Database Credentials

Open the config file:
```bash
nano php/config.php
```

Find this line and update if needed:
```php
define('DB_PASS', 'Bishal@1234');
```
Press `Ctrl+X`, then `Y`, then `Enter` to save.

### Step 6: Create Database and Import Schema

Login to MySQL:
```bash
mysql -u root -p
```
Enter your password: `Bishal@1234`

Create the database:
```sql
CREATE DATABASE railway_management CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
exit;
```

Import the database schema:
```bash
mysql -u root -p railway_management < database/railway_db.sql
```
Enter password when prompted.

Verify the import:
```bash
mysql -u root -p railway_management -e "SHOW TABLES;"
```

You should see 7 tables listed:
- admin_users
- booking_passengers
- bookings
- passengers
- stations
- system_logs
- trains

### Step 7: Start the PHP Server

From the project directory:
```bash
cd ~/Desktop/railway
php -S localhost:8000
```

### Step 8: Open in Browser

Open your browser and go to:
```
http://localhost:8000
```

---

## 🪟 Windows Installation

### Step 1: Install XAMPP

1. Download XAMPP from: https://www.apachefriends.org/
2. Run the installer
3. Select these components:
   - Apache
   - MySQL
   - PHP
   - phpMyAdmin
4. Install to default location: `C:\xampp`

### Step 2: Start XAMPP Services

1. Open XAMPP Control Panel
2. Click "Start" next to **Apache**
3. Click "Start" next to **MySQL**
4. Both should show green "Running" status

### Step 3: Copy Project Files

Copy your `railway` folder to:
```
C:\xampp\htdocs\railway
```

### Step 4: Configure Database Credentials

1. Open `C:\xampp\htdocs\railway\php\config.php` in Notepad
2. Find this line:
```php
define('DB_PASS', 'Bishal@1234');
```
3. If your MySQL password is different, update it
4. Save the file

### Step 5: Open Command Prompt

Press `Win + R`, type `cmd`, press Enter

Navigate to XAMPP MySQL bin:
```cmd
cd C:\xampp\mysql\bin
```

### Step 6: Create Database and Import Schema

Login to MySQL:
```cmd
mysql.exe -u root -p
```
Enter your password (default is empty, or `Bishal@1234` if you set one)

Create the database:
```sql
CREATE DATABASE railway_management CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
exit;
```

Import the database schema:
```cmd
mysql.exe -u root -p railway_management < C:\xampp\htdocs\railway\database\railway_db.sql
```

Verify the import:
```cmd
mysql.exe -u root -p railway_management -e "SHOW TABLES;"
```

You should see 7 tables listed.

### Step 7: Open in Browser

Open your browser and go to:
```
http://localhost/railway/
```

---

## 🗄️ Database Setup (Detailed)

### What Gets Created:

#### Tables (7 tables):
1. **trains** - Train information (12 sample trains)
2. **passengers** - Passenger details
3. **bookings** - Booking records
4. **booking_passengers** - Links bookings to passengers
5. **stations** - Railway stations (10 stations)
6. **admin_users** - Admin login (1 default admin)
7. **system_logs** - Activity logs

#### Sample Data Included:
- **12 Trains** covering major routes
- **10 Railway Stations** across India
- **1 Admin User**: 
  - Username: `admin`
  - Password: `admin123`

### Manual Database Setup (Alternative Method)

If automatic import doesn't work, you can use phpMyAdmin:

#### For Mac:
1. Install phpMyAdmin:
```bash
brew install phpmyadmin
```

2. Open: http://localhost/phpmyadmin
3. Login with root credentials
4. Click "Import" tab
5. Choose file: `database/railway_db.sql`
6. Click "Go"

#### For Windows:
1. Open: http://localhost/phpmyadmin
2. Login (username: `root`, password: empty or your password)
3. Click "Import" tab
4. Choose file: `C:\xampp\htdocs\railway\database\railway_db.sql`
5. Click "Go"

---

## 🚀 Running the Project

### Mac Users:

#### Option 1: Using PHP Built-in Server (Recommended)
```bash
cd ~/Desktop/railway
php -S localhost:8000
```
Access at: http://localhost:8000

#### Option 2: Using MAMP
1. Install MAMP
2. Place project in `/Applications/MAMP/htdocs/railway`
3. Start MAMP servers
4. Access at: http://localhost:8888/railway

### Windows Users:

#### Using XAMPP (Recommended)
1. Project should be in `C:\xampp\htdocs\railway`
2. Start Apache and MySQL in XAMPP Control Panel
3. Access at: http://localhost/railway

### Testing the Installation:

#### 1. Test Home Page
Navigate to home page - should load without errors

#### 2. Test Database Connection
Go to: http://localhost:8000/search.html (Mac) or http://localhost/railway/search.html (Windows)
- Search for trains: Delhi → Mumbai
- You should see 2 trains (Rajdhani and Duronto)

#### 3. Test Booking System
1. Click "Book Now" on any train
2. Fill passenger details
3. Click "Confirm Booking"
4. Should redirect to success page with PNR

#### 4. Test Admin Panel
Go to admin page
- Username: `admin`
- Password: `admin123`
- Should show dashboard with statistics

---

## 🔍 Verification Commands

### Check PHP Version:
```bash
php -v
```

### Check MySQL Status:

**Mac:**
```bash
brew services list | grep mysql
```

**Windows (from C:\xampp\mysql\bin):**
```cmd
mysql.exe -V
```

### Check Database:

**Mac:**
```bash
mysql -u root -p -e "USE railway_management; SHOW TABLES;"
```

**Windows:**
```cmd
cd C:\xampp\mysql\bin
mysql.exe -u root -p -e "USE railway_management; SHOW TABLES;"
```

### Verify Sample Data:

Check trains count:
```sql
mysql -u root -p railway_management -e "SELECT COUNT(*) FROM trains;"
```
Should return: 12

Check stations count:
```sql
mysql -u root -p railway_management -e "SELECT COUNT(*) FROM stations;"
```
Should return: 10

---

## ❗ Troubleshooting

### Issue 1: "Command not found: php"

**Mac:**
```bash
brew install php
```

**Windows:**
Add PHP to PATH:
1. Open System Properties → Environment Variables
2. Add to PATH: `C:\xampp\php`
3. Restart Command Prompt

### Issue 2: "Access denied for user 'root'"

**Solution:**
1. Reset MySQL password
2. Update `php/config.php` with correct password

**Mac:**
```bash
mysql -u root
ALTER USER 'root'@'localhost' IDENTIFIED BY 'Bishal@1234';
FLUSH PRIVILEGES;
```

**Windows:**
```cmd
cd C:\xampp\mysql\bin
mysql.exe -u root
ALTER USER 'root'@'localhost' IDENTIFIED BY 'Bishal@1234';
FLUSH PRIVILEGES;
```

### Issue 3: "Database does not exist"

**Solution:** Create database manually
```sql
mysql -u root -p
CREATE DATABASE railway_management;
```
Then import SQL file again.

### Issue 4: Port 8000 already in use (Mac)

**Solution:** Use different port
```bash
php -S localhost:8080
```
Access at: http://localhost:8080

### Issue 5: Port 80 already in use (Windows)

**Solution:**
1. Open XAMPP Control Panel
2. Click "Config" next to Apache
3. Change port from 80 to 8080
4. Restart Apache
5. Access at: http://localhost:8080/railway

### Issue 6: "Failed to connect to server"

**Mac Solution:**
```bash
brew services restart mysql
php -S localhost:8000
```

**Windows Solution:**
1. Stop Apache and MySQL in XAMPP
2. Start them again
3. Check if ports 80 and 3306 are not blocked

### Issue 7: Blank page or 500 error

**Check PHP errors:**

Edit `php/config.php` (temporarily):
```php
error_reporting(E_ALL);
ini_set('display_errors', 1);
```

Check error logs:
- Mac: Check Terminal output
- Windows: Check `C:\xampp\apache\logs\error.log`

### Issue 8: Tables not showing in phpMyAdmin

**Solution:** Re-import database
```bash
mysql -u root -p railway_management < database/railway_db.sql
```

---

## 📊 Post-Installation Checklist

After installation, verify:

- [ ] PHP server is running
- [ ] MySQL service is running
- [ ] Database `railway_management` exists
- [ ] 7 tables are created
- [ ] 12 trains are loaded
- [ ] 10 stations are loaded
- [ ] Can access home page
- [ ] Can search trains
- [ ] Can make a booking
- [ ] Booking shows in "My Bookings"
- [ ] Admin panel works (admin/admin123)

---

## 🎯 Quick Start Commands

### Mac (Quick Setup):
```bash
cd ~/Desktop/railway
mysql -u root -p railway_management < database/railway_db.sql
php -S localhost:8000
```
Open: http://localhost:8000

### Windows (Quick Setup):
```cmd
cd C:\xampp\htdocs\railway
C:\xampp\mysql\bin\mysql.exe -u root -p railway_management < database\railway_db.sql
```
Then start Apache in XAMPP and open: http://localhost/railway

---

## 📞 Support

If you encounter issues:

1. Check [Troubleshooting](#troubleshooting) section
2. Verify all prerequisites are installed
3. Ensure MySQL is running
4. Check `php/config.php` has correct password
5. Try re-importing database

---

## 🎓 Success!

If you can:
- ✅ Access the home page
- ✅ Search for trains
- ✅ Make a booking
- ✅ See booking in My Bookings

**Congratulations! Your Railway Management System is ready to use!** 🎉

Access the system at:
- **Mac:** http://localhost:8000
- **Windows:** http://localhost/railway

**Admin Access:**
- Username: `admin`
- Password: `admin123`

---

*Last Updated: October 2025*
*Railway Management System v2.0*

