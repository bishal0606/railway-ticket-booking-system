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
    case 'DELETE':
        handleDelete($db);
        break;
    default:
        sendResponse(false, null, 'Method not allowed', 405);
}

function handleGet($db) {
    if (isset($_GET['id'])) {
        getTrainById($db, $_GET['id']);
        return;
    }
    
    $source = $_GET['source'] ?? null;
    $destination = $_GET['destination'] ?? null;
    $train_class = $_GET['class'] ?? null;
    
    try {
        $query = "SELECT * FROM trains WHERE status = 'Active'";
        $params = [];
        
        if ($source) {
            $query .= " AND source_station = :source";
            $params[':source'] = $source;
        }
        
        if ($destination) {
            $query .= " AND destination_station = :destination";
            $params[':destination'] = $destination;
        }
        
        if ($train_class && $train_class !== 'All') {
            $query .= " AND train_class = :class";
            $params[':class'] = $train_class;
        }
        
        $query .= " ORDER BY train_name ASC";
        
        $stmt = $db->prepare($query);
        $stmt->execute($params);
        $trains = $stmt->fetchAll();
        
        sendResponse(true, $trains, 'Trains retrieved successfully');
        
    } catch(PDOException $e) {
        sendResponse(false, null, 'Failed to retrieve trains: ' . $e->getMessage(), 500);
    }
}

function getTrainById($db, $id) {
    try {
        $stmt = $db->prepare("SELECT * FROM trains WHERE train_id = :id");
        $stmt->execute([':id' => $id]);
        $train = $stmt->fetch();
        
        if ($train) {
            sendResponse(true, $train, 'Train retrieved successfully');
        } else {
            sendResponse(false, null, 'Train not found', 404);
        }
        
    } catch(PDOException $e) {
        sendResponse(false, null, 'Failed to retrieve train: ' . $e->getMessage(), 500);
    }
}

function handlePost($db) {
    $data = getRequestData();
    
    $required = ['train_name', 'train_number', 'source_station', 'destination_station', 
                 'departure_time', 'arrival_time', 'duration', 'train_class', 
                 'total_seats', 'price'];
    
    $validation = validateRequiredFields($data, $required);
    if ($validation) {
        sendResponse(false, null, $validation['message'], 400);
    }
    
    if ($data['source_station'] === $data['destination_station']) {
        sendResponse(false, null, 'Source and destination cannot be the same', 400);
    }
    
    try {
        $stmt = $db->prepare("SELECT train_id FROM trains WHERE train_number = :train_number");
        $stmt->execute([':train_number' => $data['train_number']]);
        
        if ($stmt->fetch()) {
            sendResponse(false, null, 'Train number already exists', 409);
        }
        
        $stmt = $db->prepare("
            INSERT INTO trains (
                train_name, train_number, source_station, destination_station,
                departure_time, arrival_time, duration, train_class,
                total_seats, available_seats, price, status
            ) VALUES (
                :train_name, :train_number, :source_station, :destination_station,
                :departure_time, :arrival_time, :duration, :train_class,
                :total_seats, :available_seats, :price, 'Active'
            )
        ");
        
        $result = $stmt->execute([
            ':train_name' => sanitizeInput($data['train_name']),
            ':train_number' => sanitizeInput($data['train_number']),
            ':source_station' => sanitizeInput($data['source_station']),
            ':destination_station' => sanitizeInput($data['destination_station']),
            ':departure_time' => $data['departure_time'],
            ':arrival_time' => $data['arrival_time'],
            ':duration' => sanitizeInput($data['duration']),
            ':train_class' => $data['train_class'],
            ':total_seats' => (int)$data['total_seats'],
            ':available_seats' => (int)$data['total_seats'], // Initially all seats available
            ':price' => (float)$data['price']
        ]);
        
        if ($result) {
            $train_id = $db->lastInsertId();
            
            logActivity($db, 'train_added', "Train added: {$data['train_name']} ({$data['train_number']})");
            
            sendResponse(true, ['train_id' => $train_id], 'Train created successfully', 201);
        } else {
            sendResponse(false, null, 'Failed to create train', 500);
        }
        
    } catch(PDOException $e) {
        sendResponse(false, null, 'Database error: ' . $e->getMessage(), 500);
    }
}

function handlePut($db) {
    if (!isset($_GET['id'])) {
        sendResponse(false, null, 'Train ID required', 400);
    }
    
    $train_id = $_GET['id'];
    $data = getRequestData();
    
    try {
        $stmt = $db->prepare("SELECT * FROM trains WHERE train_id = :id");
        $stmt->execute([':id' => $train_id]);
        $existing_train = $stmt->fetch();
        
        if (!$existing_train) {
            sendResponse(false, null, 'Train not found', 404);
        }
        
        $update_fields = [];
        $params = [':id' => $train_id];
        
        $allowed_fields = ['train_name', 'train_number', 'source_station', 'destination_station',
                          'departure_time', 'arrival_time', 'duration', 'train_class',
                          'total_seats', 'available_seats', 'price', 'status'];
        
        foreach ($allowed_fields as $field) {
            if (isset($data[$field])) {
                $update_fields[] = "$field = :$field";
                $params[":$field"] = $data[$field];
            }
        }
        
        if (empty($update_fields)) {
            sendResponse(false, null, 'No fields to update', 400);
        }
        
        $query = "UPDATE trains SET " . implode(', ', $update_fields) . " WHERE train_id = :id";
        $stmt = $db->prepare($query);
        $result = $stmt->execute($params);
        
        if ($result) {
            logActivity($db, 'train_updated', "Train updated: ID {$train_id}");
            sendResponse(true, null, 'Train updated successfully');
        } else {
            sendResponse(false, null, 'Failed to update train', 500);
        }
        
    } catch(PDOException $e) {
        sendResponse(false, null, 'Database error: ' . $e->getMessage(), 500);
    }
}

function handleDelete($db) {
    if (!isset($_GET['id'])) {
        sendResponse(false, null, 'Train ID required', 400);
    }
    
    $train_id = $_GET['id'];
    
    try {
        $stmt = $db->prepare("SELECT COUNT(*) as count FROM bookings WHERE train_id = :id AND booking_status = 'Confirmed'");
        $stmt->execute([':id' => $train_id]);
        $result = $stmt->fetch();
        
        if ($result['count'] > 0) {
            sendResponse(false, null, 'Cannot delete train with confirmed bookings. Please cancel all bookings first.', 409);
        }
        
        $stmt = $db->prepare("DELETE FROM trains WHERE train_id = :id");
        $result = $stmt->execute([':id' => $train_id]);
        
        if ($result && $stmt->rowCount() > 0) {
            logActivity($db, 'train_deleted', "Train deleted: ID {$train_id}");
            sendResponse(true, null, 'Train deleted successfully');
        } else {
            sendResponse(false, null, 'Train not found or already deleted', 404);
        }
        
    } catch(PDOException $e) {
        sendResponse(false, null, 'Database error: ' . $e->getMessage(), 500);
    }
}

?>

