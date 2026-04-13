<?php
/**
 * Feedback API for KNOWva
 * Handles getting and posting user feedback
 */

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$host = 'localhost';
$db_name = 'u674592973_knowva';
$username = 'u674592973_knowva_admin';
$password = 'Knowva@2026';

try {
    $conn = new PDO("mysql:host=" . $host . ";dbname=" . $db_name, $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Create table if not exists
    $conn->exec("
        CREATE TABLE IF NOT EXISTS feedback (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NULL,
            user_name VARCHAR(255) NOT NULL,
            user_email VARCHAR(255) NOT NULL,
            message TEXT NOT NULL,
            status VARCHAR(50) DEFAULT 'pending',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ");

    $method = $_SERVER['REQUEST_METHOD'];

    if ($method === 'POST') {
        $data = json_decode(file_get_contents("php://input"));
        
        if (isset($data->message) && !empty(trim($data->message))) {
            $userId = isset($data->user_id) ? $data->user_id : null;
            $userName = isset($data->user_name) ? $data->user_name : 'Anonymous';
            $userEmail = isset($data->user_email) ? $data->user_email : 'N/A';
            $message = trim($data->message);
            
            $stmt = $conn->prepare("INSERT INTO feedback (user_id, user_name, user_email, message) VALUES (?, ?, ?, ?)");
            $stmt->execute([$userId, $userName, $userEmail, $message]);
            
            echo json_encode(["status" => "success", "message" => "Feedback submitted successfully."]);
        } else {
             echo json_encode(["status" => "error", "message" => "Message is required."]);
        }
    } elseif ($method === 'GET') {
        $stmt = $conn->query("SELECT * FROM feedback ORDER BY created_at DESC");
        $feedback = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode(["status" => "success", "data" => $feedback]);
    } else {
         echo json_encode(["status" => "error", "message" => "Invalid request method."]);
    }

} catch(PDOException $e) {
    echo json_encode(["status" => "error", "message" => "Connection failed: " . $e->getMessage()]);
}
?>
