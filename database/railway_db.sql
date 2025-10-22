-- Railway Management System Database Schema
-- Created: October 21, 2025
-- Database: railway_management

-- Drop database if exists and create new
DROP DATABASE IF EXISTS railway_management;
CREATE DATABASE railway_management CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE railway_management;

-- ============================================================================
-- TRAINS TABLE
-- ============================================================================
CREATE TABLE trains (
    train_id INT AUTO_INCREMENT PRIMARY KEY,
    train_name VARCHAR(100) NOT NULL,
    train_number VARCHAR(20) NOT NULL UNIQUE,
    source_station VARCHAR(100) NOT NULL,
    destination_station VARCHAR(100) NOT NULL,
    departure_time TIME NOT NULL,
    arrival_time TIME NOT NULL,
    duration VARCHAR(20) NOT NULL,
    train_class ENUM('Sleeper', 'AC 3 Tier', 'AC 2 Tier', 'AC 1 Tier') NOT NULL,
    total_seats INT NOT NULL,
    available_seats INT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    status ENUM('Active', 'Inactive') DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_source (source_station),
    INDEX idx_destination (destination_station),
    INDEX idx_train_number (train_number),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================================
-- PASSENGERS TABLE
-- ============================================================================
CREATE TABLE passengers (
    passenger_id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    age INT NOT NULL CHECK (age > 0 AND age <= 120),
    gender ENUM('Male', 'Female', 'Other') NOT NULL,
    berth_preference VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_name (full_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================================
-- BOOKINGS TABLE
-- ============================================================================
CREATE TABLE bookings (
    booking_id INT AUTO_INCREMENT PRIMARY KEY,
    pnr_number VARCHAR(20) NOT NULL UNIQUE,
    train_id INT NOT NULL,
    journey_date DATE NOT NULL,
    total_passengers INT NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    contact_email VARCHAR(100) NOT NULL,
    contact_phone VARCHAR(15) NOT NULL,
    booking_status ENUM('Confirmed', 'Cancelled', 'Completed') DEFAULT 'Confirmed',
    booking_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    cancelled_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (train_id) REFERENCES trains(train_id) ON DELETE CASCADE,
    INDEX idx_pnr (pnr_number),
    INDEX idx_train (train_id),
    INDEX idx_journey_date (journey_date),
    INDEX idx_status (booking_status),
    INDEX idx_booking_date (booking_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================================
-- BOOKING_PASSENGERS TABLE (Junction table)
-- ============================================================================
CREATE TABLE booking_passengers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    booking_id INT NOT NULL,
    passenger_id INT NOT NULL,
    seat_number VARCHAR(10),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES bookings(booking_id) ON DELETE CASCADE,
    FOREIGN KEY (passenger_id) REFERENCES passengers(passenger_id) ON DELETE CASCADE,
    INDEX idx_booking (booking_id),
    INDEX idx_passenger (passenger_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================================
-- STATIONS TABLE
-- ============================================================================
CREATE TABLE stations (
    station_id INT AUTO_INCREMENT PRIMARY KEY,
    station_name VARCHAR(100) NOT NULL UNIQUE,
    station_code VARCHAR(10) NOT NULL UNIQUE,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_station_name (station_name),
    INDEX idx_station_code (station_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================================
-- ADMIN_USERS TABLE
-- ============================================================================
CREATE TABLE admin_users (
    admin_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    full_name VARCHAR(100) NOT NULL,
    role ENUM('super_admin', 'admin') DEFAULT 'admin',
    status ENUM('Active', 'Inactive') DEFAULT 'Active',
    last_login TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_username (username),
    INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================================
-- SYSTEM_LOGS TABLE (for audit trail)
-- ============================================================================
CREATE TABLE system_logs (
    log_id INT AUTO_INCREMENT PRIMARY KEY,
    log_type ENUM('train_added', 'train_updated', 'train_deleted', 'booking_created', 'booking_cancelled') NOT NULL,
    description TEXT,
    admin_id INT NULL,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (admin_id) REFERENCES admin_users(admin_id) ON DELETE SET NULL,
    INDEX idx_log_type (log_type),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================================
-- INSERT INITIAL STATIONS DATA
-- ============================================================================
INSERT INTO stations (station_name, station_code, city, state) VALUES
('New Delhi Railway Station', 'NDLS', 'Delhi', 'Delhi'),
('Mumbai Central', 'MMCT', 'Mumbai', 'Maharashtra'),
('Chennai Central', 'MAS', 'Chennai', 'Tamil Nadu'),
('Howrah Junction', 'HWH', 'Kolkata', 'West Bengal'),
('Bangalore City Junction', 'SBC', 'Bangalore', 'Karnataka'),
('Secunderabad Junction', 'SC', 'Hyderabad', 'Telangana'),
('Pune Junction', 'PUNE', 'Pune', 'Maharashtra'),
('Ahmedabad Junction', 'ADI', 'Ahmedabad', 'Gujarat'),
('Jaipur Junction', 'JP', 'Jaipur', 'Rajasthan'),
('Lucknow Charbagh', 'LKO', 'Lucknow', 'Uttar Pradesh');

-- ============================================================================
-- INSERT INITIAL TRAINS DATA (12 trains from your existing system)
-- ============================================================================
INSERT INTO trains (train_name, train_number, source_station, destination_station, departure_time, arrival_time, duration, train_class, total_seats, available_seats, price) VALUES
('Rajdhani Express', '12301', 'Delhi', 'Mumbai', '16:55:00', '08:35:00', '15h 40m', 'AC 2 Tier', 100, 45, 1850.00),
('Shatabdi Express', '12002', 'Delhi', 'Jaipur', '06:05:00', '10:30:00', '4h 25m', 'AC 1 Tier', 80, 32, 780.00),
('Duronto Express', '12259', 'Mumbai', 'Delhi', '22:25:00', '12:40:00', '14h 15m', 'AC 3 Tier', 120, 58, 1650.00),
('Chennai Express', '12163', 'Chennai', 'Bangalore', '07:00:00', '12:30:00', '5h 30m', 'Sleeper', 150, 40, 650.00),
('Howrah Mail', '12321', 'Kolkata', 'Delhi', '14:35:00', '10:15:00', '19h 40m', 'AC 2 Tier', 100, 25, 1420.00),
('Bangalore Rajdhani', '12430', 'Delhi', 'Bangalore', '20:00:00', '06:10:00', '34h 10m', 'AC 1 Tier', 90, 52, 2450.00),
('Gujarat Express', '12901', 'Delhi', 'Ahmedabad', '09:40:00', '21:15:00', '11h 35m', 'AC 3 Tier', 110, 38, 980.00),
('Deccan Queen', '12123', 'Mumbai', 'Pune', '17:10:00', '20:25:00', '3h 15m', 'Sleeper', 200, 62, 420.00),
('Hyderabad Express', '12759', 'Hyderabad', 'Chennai', '18:55:00', '06:30:00', '11h 35m', 'AC 2 Tier', 95, 44, 890.00),
('Lucknow Mail', '12229', 'Delhi', 'Lucknow', '23:00:00', '07:15:00', '8h 15m', 'Sleeper', 180, 36, 740.00),
('Mumbai Duronto', '12263', 'Mumbai', 'Bangalore', '11:45:00', '11:50:00', '24h 5m', 'AC 3 Tier', 115, 48, 1880.00),
('Chennai Rajdhani', '12433', 'Delhi', 'Chennai', '15:55:00', '09:00:00', '28h 5m', 'AC 2 Tier', 105, 29, 2180.00);

-- ============================================================================
-- INSERT DEFAULT ADMIN USER
-- Password: admin123 (hashed using PASSWORD function - should be bcrypt in production)
-- ============================================================================
INSERT INTO admin_users (username, password, email, full_name, role) VALUES
('admin', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin@railway.com', 'System Administrator', 'super_admin');
-- Default password: admin123

-- ============================================================================
-- CREATE VIEWS FOR REPORTING
-- ============================================================================

-- View: Active Trains Summary
CREATE VIEW vw_active_trains AS
SELECT 
    train_id,
    train_name,
    train_number,
    source_station,
    destination_station,
    departure_time,
    arrival_time,
    duration,
    train_class,
    available_seats,
    total_seats,
    price,
    ROUND((available_seats / total_seats * 100), 2) AS availability_percentage
FROM trains
WHERE status = 'Active';

-- View: Booking Statistics
CREATE VIEW vw_booking_stats AS
SELECT 
    DATE(booking_date) AS booking_date,
    COUNT(*) AS total_bookings,
    SUM(CASE WHEN booking_status = 'Confirmed' THEN 1 ELSE 0 END) AS confirmed_bookings,
    SUM(CASE WHEN booking_status = 'Cancelled' THEN 1 ELSE 0 END) AS cancelled_bookings,
    SUM(total_amount) AS total_revenue,
    SUM(CASE WHEN booking_status = 'Confirmed' THEN total_amount ELSE 0 END) AS confirmed_revenue
FROM bookings
GROUP BY DATE(booking_date);

-- View: Train Revenue Report
CREATE VIEW vw_train_revenue AS
SELECT 
    t.train_id,
    t.train_name,
    t.train_number,
    COUNT(b.booking_id) AS total_bookings,
    SUM(b.total_passengers) AS total_passengers,
    SUM(CASE WHEN b.booking_status = 'Confirmed' THEN b.total_amount ELSE 0 END) AS total_revenue
FROM trains t
LEFT JOIN bookings b ON t.train_id = b.train_id
GROUP BY t.train_id, t.train_name, t.train_number;

-- ============================================================================
-- CREATE STORED PROCEDURES
-- ============================================================================

-- Procedure: Generate unique PNR
DELIMITER //
CREATE PROCEDURE generate_pnr(OUT new_pnr VARCHAR(20))
BEGIN
    DECLARE pnr_exists INT DEFAULT 1;
    DECLARE temp_pnr VARCHAR(20);
    
    WHILE pnr_exists > 0 DO
        SET temp_pnr = CONCAT('PNR', UNIX_TIMESTAMP(), FLOOR(RAND() * 1000));
        SELECT COUNT(*) INTO pnr_exists FROM bookings WHERE pnr_number = temp_pnr;
    END WHILE;
    
    SET new_pnr = temp_pnr;
END //
DELIMITER ;

-- Procedure: Check seat availability
DELIMITER //
CREATE PROCEDURE check_seat_availability(
    IN p_train_id INT,
    IN p_journey_date DATE,
    IN p_required_seats INT,
    OUT p_available BOOLEAN
)
BEGIN
    DECLARE available_count INT;
    
    -- Get current available seats for the train
    SELECT available_seats INTO available_count
    FROM trains
    WHERE train_id = p_train_id;
    
    -- Check if enough seats available
    IF available_count >= p_required_seats THEN
        SET p_available = TRUE;
    ELSE
        SET p_available = FALSE;
    END IF;
END //
DELIMITER ;

-- Procedure: Update seat availability after booking
DELIMITER //
CREATE PROCEDURE update_seat_availability(
    IN p_train_id INT,
    IN p_seats_count INT,
    IN p_operation VARCHAR(10)
)
BEGIN
    IF p_operation = 'BOOK' THEN
        UPDATE trains 
        SET available_seats = available_seats - p_seats_count
        WHERE train_id = p_train_id;
    ELSEIF p_operation = 'CANCEL' THEN
        UPDATE trains 
        SET available_seats = available_seats + p_seats_count
        WHERE train_id = p_train_id;
    END IF;
END //
DELIMITER ;

-- ============================================================================
-- CREATE TRIGGERS
-- ============================================================================

-- Trigger: Log train additions
DELIMITER //
CREATE TRIGGER after_train_insert
AFTER INSERT ON trains
FOR EACH ROW
BEGIN
    INSERT INTO system_logs (log_type, description)
    VALUES ('train_added', CONCAT('Train added: ', NEW.train_name, ' (', NEW.train_number, ')'));
END //
DELIMITER ;

-- Trigger: Log train deletions
DELIMITER //
CREATE TRIGGER after_train_delete
AFTER DELETE ON trains
FOR EACH ROW
BEGIN
    INSERT INTO system_logs (log_type, description)
    VALUES ('train_deleted', CONCAT('Train deleted: ', OLD.train_name, ' (', OLD.train_number, ')'));
END //
DELIMITER ;

-- Trigger: Log booking cancellations
DELIMITER //
CREATE TRIGGER after_booking_cancel
AFTER UPDATE ON bookings
FOR EACH ROW
BEGIN
    IF NEW.booking_status = 'Cancelled' AND OLD.booking_status != 'Cancelled' THEN
        INSERT INTO system_logs (log_type, description)
        VALUES ('booking_cancelled', CONCAT('Booking cancelled: PNR ', NEW.pnr_number));
    END IF;
END //
DELIMITER ;

-- ============================================================================
-- GRANT PRIVILEGES (Adjust according to your setup)
-- ============================================================================
-- CREATE USER 'railway_user'@'localhost' IDENTIFIED BY 'railway_pass_2024';
-- GRANT ALL PRIVILEGES ON railway_management.* TO 'railway_user'@'localhost';
-- FLUSH PRIVILEGES;

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================
-- Already created inline with table definitions

-- ============================================================================
-- DATABASE SETUP COMPLETE
-- ============================================================================
SELECT 'Database railway_management created successfully!' AS Status;
SELECT COUNT(*) AS 'Total Trains' FROM trains;
SELECT COUNT(*) AS 'Total Stations' FROM stations;

