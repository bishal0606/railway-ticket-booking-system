@echo off
REM Switch Railway Management System to use PHP Backend (Windows)

echo Switching to PHP Backend...
echo.

REM Update search.html
powershell -Command "(Get-Content search.html) -replace 'src=\"js/search.js\"', 'src=\"js/search-backend.js\"' | Set-Content search.html"
echo Updated search.html

REM Update booking.html
powershell -Command "(Get-Content booking.html) -replace 'src=\"js/booking.js\"', 'src=\"js/booking-backend.js\"' | Set-Content booking.html"
echo Updated booking.html

REM Update bookings.html
powershell -Command "(Get-Content bookings.html) -replace 'src=\"js/bookings.js\"', 'src=\"js/bookings-backend.js\"' | Set-Content bookings.html"
echo Updated bookings.html

REM Update admin.html
powershell -Command "(Get-Content admin.html) -replace 'src=\"js/admin.js\"', 'src=\"js/admin-backend.js\"' | Set-Content admin.html"
echo Updated admin.html

echo.
echo Successfully switched to PHP Backend!
echo.
echo Next steps:
echo 1. Make sure XAMPP Apache and MySQL are running
echo 2. Import database/railway_db.sql to phpMyAdmin
echo 3. Open http://localhost/railway/ in your browser
echo.
pause

