<?php

require_once '../config.php';

$database = new Database();
$db = $database->getConnection();

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        handleGet($db);
        break;
    case 'POST':
        handlePost($db);
        break;
    case 'PUT':
        handlePut($db);
        break;
    default:
        sendResponse(false, null, 'Method not allowed', 405);
}

function handleGet($db) {
    if (isset($_GET['pnr'])) {
        getBookingByPNR($db, $_GET['pnr']);
        return;
    }
    
    if (isset($_GET['id'])) {
        getBookingById($db, $_GET['id']);
        return;
    }
    
    try {
        $query = "
            SELECT 
                b.*,
                t.train_name,
                t.train_number,
                t.source_station,
                t.destination_station,
                t.departure_time,
                t.arrival_time,
                t.duration,
                t.train_class
            FROM bookings b
            LEFT JOIN trains t ON b.train_id = t.train_id
            ORDER BY b.booking_date DESC
        ";
        
        $stmt = $db->prepare($query);
        $stmt->execute();
        $bookings = $stmt->fetchAll();
        
        foreach ($bookings as &$booking) {
            $booking['passengers'] = getBookingPassengers($db, $booking['booking_id']);
        }
        
        sendResponse(true, $bookings, 'Bookings retrieved successfully');
        
    } catch(PDOException $e) {
        sendResponse(false, null, 'Failed to retrieve bookings: ' . $e->getMessage(), 500);
    }
}

function getBookingById($db, $id) {
    try {
        $stmt = $db->prepare("
            SELECT 
                b.*,
                t.train_name,
                t.train_number,
                t.source_station,
                t.destination_station,
                t.departure_time,
                t.arrival_time,
                t.duration,
                t.train_class
            FROM bookings b
            LEFT JOIN trains t ON b.train_id = t.train_id
            WHERE b.booking_id = :id
        ");
        $stmt->execute([':id' => $id]);
        $booking = $stmt->fetch();
        
        if ($booking) {
            $booking['passengers'] = getBookingPassengers($db, $booking['booking_id']);
            sendResponse(true, $booking, 'Booking retrieved successfully');
        } else {
            sendResponse(false, null, 'Booking not found', 404);
        }
        
    } catch(PDOException $e) {
        sendResponse(false, null, 'Failed to retrieve booking: ' . $e->getMessage(), 500);
    }
}

function getBookingByPNR($db, $pnr) {
    try {
        $stmt = $db->prepare("
            SELECT 
                b.*,
                t.train_name,
                t.train_number,
                t.source_station,
                t.destination_station,
                t.departure_time,
                t.arrival_time,
                t.duration,
                t.train_class
            FROM bookings b
            LEFT JOIN trains t ON b.train_id = t.train_id
            WHERE b.pnr_number = :pnr
        ");
        $stmt->execute([':pnr' => $pnr]);
        $booking = $stmt->fetch();
        
        if ($booking) {
            $booking['passengers'] = getBookingPassengers($db, $booking['booking_id']);
            sendResponse(true, $booking, 'Booking retrieved successfully');
        } else {
            sendResponse(false, null, 'Booking not found', 404);
        }
        
    } catch(PDOException $e) {
        sendResponse(false, null, 'Failed to retrieve booking: ' . $e->getMessage(), 500);
    }
}

function getBookingPassengers($db, $booking_id) {
    $stmt = $db->prepare("
        SELECT p.*, bp.seat_number
        FROM booking_passengers bp
        JOIN passengers p ON bp.passenger_id = p.passenger_id
        WHERE bp.booking_id = :booking_id
    ");
    $stmt->execute([':booking_id' => $booking_id]);
    return $stmt->fetchAll();
}

function handlePost($db) {
    $data = getRequestData();
    
    $required = ['train_id', 'journey_date', 'passengers', 'contact_email', 'contact_phone'];
    $validation = validateRequiredFields($data, $required);
    if ($validation) {
        sendResponse(false, null, $validation['message'], 400);
    }
    
    if (!validateEmail($data['contact_email'])) {
        sendResponse(false, null, 'Invalid email address', 400);
    }
    
    if (!validatePhone($data['contact_phone'])) {
        sendResponse(false, null, 'Invalid phone number (must be 10 digits)', 400);
    }
    
    if (!is_array($data['passengers']) || empty($data['passengers'])) {
        sendResponse(false, null, 'At least one passenger required', 400);
    }
    
    if (count($data['passengers']) > 4) {
        sendResponse(false, null, 'Maximum 4 passengers allowed per booking', 400);
    }
    
    try {
        $db->beginTransaction();
        
        $stmt = $db->prepare("SELECT * FROM trains WHERE train_id = :id AND status = 'Active'");
        $stmt->execute([':id' => $data['train_id']]);
        $train = $stmt->fetch();
        
        if (!$train) {
            $db->rollBack();
            sendResponse(false, null, 'Train not found or inactive', 404);
        }
        
        $passenger_count = count($data['passengers']);
        
        if ($train['available_seats'] < $passenger_count) {
            $db->rollBack();
            sendResponse(false, null, "Not enough seats available. Only {$train['available_seats']} seats remaining", 400);
        }
        
        $total_amount = $train['price'] * $passenger_count;
        $pnr = generatePNR();
        
        $stmt = $db->prepare("
            INSERT INTO bookings (
                pnr_number, train_id, journey_date, total_passengers,
                total_amount, contact_email, contact_phone, booking_status
            ) VALUES (
                :pnr, :train_id, :journey_date, :total_passengers,
                :total_amount, :contact_email, :contact_phone, 'Confirmed'
            )
        ");
        
        $stmt->execute([
            ':pnr' => $pnr,
            ':train_id' => $data['train_id'],
            ':journey_date' => $data['journey_date'],
            ':total_passengers' => $passenger_count,
            ':total_amount' => $total_amount,
            ':contact_email' => sanitizeInput($data['contact_email']),
            ':contact_phone' => sanitizeInput($data['contact_phone'])
        ]);
        
        $booking_id = $db->lastInsertId();
        
        foreach ($data['passengers'] as $passenger) {
            $stmt = $db->prepare("
                INSERT INTO passengers (full_name, age, gender, berth_preference)
                VALUES (:name, :age, :gender, :berth)
            ");
            
            $stmt->execute([
                ':name' => sanitizeInput($passenger['name']),
                ':age' => (int)$passenger['age'],
                ':gender' => $passenger['gender'],
                ':berth' => $passenger['berth'] ?? 'No Preference'
            ]);
            
            $passenger_id = $db->lastInsertId();
            
            $stmt = $db->prepare("
                INSERT INTO booking_passengers (booking_id, passenger_id)
                VALUES (:booking_id, :passenger_id)
            ");
            
            $stmt->execute([
                ':booking_id' => $booking_id,
                ':passenger_id' => $passenger_id
            ]);
        }
        
        $stmt = $db->prepare("
            UPDATE trains 
            SET available_seats = available_seats - :count
            WHERE train_id = :id
        ");
        
        $stmt->execute([
            ':count' => $passenger_count,
            ':id' => $data['train_id']
        ]);
        
        $db->commit();
        
        logActivity($db, 'booking_created', "Booking created: PNR {$pnr}");
        
        sendResponse(true, [
            'booking_id' => $booking_id,
            'pnr_number' => $pnr,
            'total_amount' => $total_amount,
            'status' => 'Confirmed'
        ], 'Booking created successfully', 201);
        
    } catch(PDOException $e) {
        $db->rollBack();
        sendResponse(false, null, 'Booking failed: ' . $e->getMessage(), 500);
    }
}

function handlePut($db) {
    if (!isset($_GET['id'])) {
        sendResponse(false, null, 'Booking ID required', 400);
    }
    
    $booking_id = $_GET['id'];
    $data = getRequestData();
    
    if (!isset($data['status']) || $data['status'] !== 'Cancelled') {
        sendResponse(false, null, 'Only cancellation is allowed', 400);
    }
    
    try {
        $db->beginTransaction();
        
        $stmt = $db->prepare("SELECT * FROM bookings WHERE booking_id = :id");
        $stmt->execute([':id' => $booking_id]);
        $booking = $stmt->fetch();
        
        if (!$booking) {
            $db->rollBack();
            sendResponse(false, null, 'Booking not found', 404);
        }
        
        if ($booking['booking_status'] === 'Cancelled') {
            $db->rollBack();
            sendResponse(false, null, 'Booking already cancelled', 400);
        }
        
        $stmt = $db->prepare("
            UPDATE bookings 
            SET booking_status = 'Cancelled', cancelled_at = NOW()
            WHERE booking_id = :id
        ");
        
        $stmt->execute([':id' => $booking_id]);
        
        $stmt = $db->prepare("
            UPDATE trains 
            SET available_seats = available_seats + :count
            WHERE train_id = :id
        ");
        
        $stmt->execute([
            ':count' => $booking['total_passengers'],
            ':id' => $booking['train_id']
        ]);
        
        $db->commit();
        
        logActivity($db, 'booking_cancelled', "Booking cancelled: PNR {$booking['pnr_number']}");
        
        sendResponse(true, null, 'Booking cancelled successfully');
        
    } catch(PDOException $e) {
        $db->rollBack();
        sendResponse(false, null, 'Cancellation failed: ' . $e->getMessage(), 500);
    }
}

?>

