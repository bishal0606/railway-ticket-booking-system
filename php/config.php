<?php

error_reporting(E_ALL);
ini_set('display_errors', 1);

define('DB_HOST', 'localhost');
define('DB_USER', 'root');
define('DB_PASS', 'Bishal@1234');
define('DB_NAME', 'railway_management');
define('DB_CHARSET', 'utf8mb4');

define('APP_NAME', 'Railway Management System');
define('APP_VERSION', '2.0');
define('TIMEZONE', 'Asia/Kolkata');

date_default_timezone_set(TIMEZONE);

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json; charset=UTF-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

class Database {
    private $host = DB_HOST;
    private $db_name = DB_NAME;
    private $username = DB_USER;
    private $password = DB_PASS;
    private $charset = DB_CHARSET;
    public $conn;

    public function getConnection() {
        $this->conn = null;

        try {
            $dsn = "mysql:host=" . $this->host . ";dbname=" . $this->db_name . ";charset=" . $this->charset;
            $options = [
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES   => false,
            ];
            
            $this->conn = new PDO($dsn, $this->username, $this->password, $options);
        } catch(PDOException $e) {
            echo json_encode([
                'success' => false,
                'message' => 'Database connection failed: ' . $e->getMessage()
            ]);
            exit();
        }

        return $this->conn;
    }
}

function sendResponse($success, $data = null, $message = '', $code = 200) {
    http_response_code($code);
    echo json_encode([
        'success' => $success,
        'data' => $data,
        'message' => $message,
        'timestamp' => date('Y-m-d H:i:s')
    ]);
    exit();
}

function sanitizeInput($data) {
    $data = trim($data);
    $data = stripslashes($data);
    $data = htmlspecialchars($data);
    return $data;
}

function validateEmail($email) {
    return filter_var($email, FILTER_VALIDATE_EMAIL);
}

function validatePhone($phone) {
    return preg_match('/^[0-9]{10}$/', $phone);
}

function generatePNR() {
    return 'PNR' . time() . rand(100, 999);
}

function logActivity($conn, $log_type, $description, $admin_id = null) {
    try {
        $ip_address = $_SERVER['REMOTE_ADDR'] ?? 'Unknown';
        
        $stmt = $conn->prepare("
            INSERT INTO system_logs (log_type, description, admin_id, ip_address) 
            VALUES (:log_type, :description, :admin_id, :ip_address)
        ");
        
        $stmt->execute([
            ':log_type' => $log_type,
            ':description' => $description,
            ':admin_id' => $admin_id,
            ':ip_address' => $ip_address
        ]);
    } catch(PDOException $e) {
        error_log("Failed to log activity: " . $e->getMessage());
    }
}

function getRequestData() {
    $data = json_decode(file_get_contents("php://input"), true);
    return $data ?? [];
}

function validateRequiredFields($data, $required_fields) {
    $missing_fields = [];
    
    foreach ($required_fields as $field) {
        if (!isset($data[$field])) {
            $missing_fields[] = $field;
        } else {
            if (is_array($data[$field])) {
                if (empty($data[$field])) {
                    $missing_fields[] = $field;
                }
            } else {
                if (empty(trim($data[$field]))) {
                    $missing_fields[] = $field;
                }
            }
        }
    }
    
    if (!empty($missing_fields)) {
        return [
            'success' => false,
            'message' => 'Missing required fields: ' . implode(', ', $missing_fields),
            'missing_fields' => $missing_fields
        ];
    }
    
    return null;
}

?>

