#!/bin/bash

# Switch Railway Management System to use PHP Backend

echo "🚀 Switching to PHP Backend..."

# Update search.html
sed -i.bak 's/src="js\/search.js"/src="js\/search-backend.js"/g' search.html
echo "✅ Updated search.html"

# Update booking.html
sed -i.bak 's/src="js\/booking.js"/src="js\/booking-backend.js"/g' booking.html
echo "✅ Updated booking.html"

# Update bookings.html
sed -i.bak 's/src="js\/bookings.js"/src="js\/bookings-backend.js"/g' bookings.html
echo "✅ Updated bookings.html"

# Update admin.html
sed -i.bak 's/src="js\/admin.js"/src="js\/admin-backend.js"/g' admin.html
echo "✅ Updated admin.html"

echo ""
echo "🎉 Successfully switched to PHP Backend!"
echo "📝 Backup files created with .bak extension"
echo ""
echo "Next steps:"
echo "1. Make sure XAMPP Apache and MySQL are running"
echo "2. Import database/railway_db.sql to phpMyAdmin"
echo "3. Open http://localhost/railway/ in your browser"
echo ""
echo "Happy coding! 🚄"

