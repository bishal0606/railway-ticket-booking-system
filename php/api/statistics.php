<?php


require_once '../config.php';

$database = new Database();
$db = $database->getConnection();

try {
    $stmt = $db->query("SELECT COUNT(*) as total FROM trains WHERE status = 'Active'");
    $total_trains = $stmt->fetch()['total'];
    
    $stmt = $db->query("SELECT COUNT(*) as total FROM bookings");
    $total_bookings = $stmt->fetch()['total'];
    
    $stmt = $db->query("SELECT COUNT(*) as total FROM bookings WHERE booking_status = 'Confirmed'");
    $confirmed_bookings = $stmt->fetch()['total'];
    
    $stmt = $db->query("SELECT COUNT(*) as total FROM bookings WHERE booking_status = 'Cancelled'");
    $cancelled_bookings = $stmt->fetch()['total'];
    
    $stmt = $db->query("SELECT SUM(total_amount) as revenue FROM bookings WHERE booking_status = 'Confirmed'");
    $total_revenue = $stmt->fetch()['revenue'] ?? 0;
    
    $stmt = $db->query("SELECT SUM(total_passengers) as total FROM bookings WHERE booking_status = 'Confirmed'");
    $total_passengers = $stmt->fetch()['total'] ?? 0;
    
    $stmt = $db->query("
        SELECT b.pnr_number, b.booking_date, b.total_amount, b.booking_status, 
               t.train_name, t.train_number
        FROM bookings b
        LEFT JOIN trains t ON b.train_id = t.train_id
        ORDER BY b.booking_date DESC
        LIMIT 5
    ");
    $recent_bookings = $stmt->fetchAll();
    
    $stmt = $db->query("
        SELECT t.train_name, t.train_number, COUNT(b.booking_id) as bookings_count
        FROM trains t
        LEFT JOIN bookings b ON t.train_id = b.train_id AND b.booking_status = 'Confirmed'
        GROUP BY t.train_id
        ORDER BY bookings_count DESC
        LIMIT 5
    ");
    $popular_trains = $stmt->fetchAll();
    
    sendResponse(true, [
        'summary' => [
            'total_trains' => (int)$total_trains,
            'total_bookings' => (int)$total_bookings,
            'confirmed_bookings' => (int)$confirmed_bookings,
            'cancelled_bookings' => (int)$cancelled_bookings,
            'total_revenue' => (float)$total_revenue,
            'total_passengers' => (int)$total_passengers
        ],
        'recent_bookings' => $recent_bookings,
        'popular_trains' => $popular_trains
    ], 'Statistics retrieved successfully');
    
} catch(PDOException $e) {
    sendResponse(false, null, 'Failed to retrieve statistics: ' . $e->getMessage(), 500);
}

?>

