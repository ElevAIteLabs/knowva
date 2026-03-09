<?php
/**
 * Auth API for KNOWva
 * Handles login and registration
 */

// --- CORS HEADERS (Crucial for React/Vite to work) ---
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// --- DATABASE CONFIGURATION (Update these with your Hostinger details) ---
$host = 'localhost'; // Usually localhost on Hostinger
$db_name = 'u674592973_knowva'; // Replace with your DB name
$username = 'u674592973_knowva_admin'; // Replace with your DB username
$password = 'Knowva@2026'; // Replace with your DB password

try {
    $conn = new PDO("mysql:host=" . $host . ";dbname=" . $db_name, $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $exception) {
    echo json_encode(["status" => "error", "message" => "Connection failure: " . $exception->getMessage()]);
    exit();
}

// --- MAIN LOGIC ---

// Get JSON input
$data = json_decode(file_get_contents("php://input"));

if (!$data || !isset($data->action)) {
    echo json_encode(["status" => "error", "message" => "Invalid request. Action required."]);
    exit();
}

$action = $data->action;

// --- LOGIN ACTION ---
if ($action === 'login') {
    if (!isset($data->email) || !isset($data->password)) {
        echo json_encode(["status" => "error", "message" => "Email and password required."]);
        exit();
    }

    $email = filter_var($data->email, FILTER_SANITIZE_EMAIL);
    $password = $data->password;

    try {
        $stmt = $conn->prepare("SELECT id, fullName, email, password FROM users WHERE email = ?");
        $stmt->execute([$email]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($user && password_verify($password, $user['password'])) {
            // Success - Don't return the hashed password
            unset($user['password']);
            echo json_encode([
                "status" => "success",
                "message" => "Login successful",
                "user" => $user
            ]);
        } else {
            http_response_code(401);
            echo json_encode(["status" => "error", "message" => "Invalid email or password."]);
        }
    } catch (Exception $e) {
        echo json_encode(["status" => "error", "message" => "Login failed: " . $e->getMessage()]);
    }
}

// --- SIGNUP ACTION ---
else if ($action === 'signup') {
    if (!isset($data->fullName) || !isset($data->email) || !isset($data->password)) {
        echo json_encode(["status" => "error", "message" => "Missing required fields."]);
        exit();
    }

    $fullName = strip_tags($data->fullName);
    $email = filter_var($data->email, FILTER_SANITIZE_EMAIL);
    $password = password_hash($data->password, PASSWORD_BCRYPT);

    try {
        // Check if email already exists
        $check = $conn->prepare("SELECT id FROM users WHERE email = ?");
        $check->execute([$email]);
        
        if ($check->rowCount() > 0) {
            echo json_encode(["status" => "error", "message" => "Email already registered."]);
            exit();
        }

        // Insert new user
        $stmt = $conn->prepare("INSERT INTO users (fullName, email, password) VALUES (?, ?, ?)");
        if ($stmt->execute([$fullName, $email, $password])) {
            echo json_encode(["status" => "success", "message" => "User created successfully."]);
        } else {
            echo json_encode(["status" => "error", "message" => "Could not register user."]);
        }
    } catch (Exception $e) {
        echo json_encode(["status" => "error", "message" => "Registration error: " . $e->getMessage()]);
    }
}

else {
    echo json_encode(["status" => "error", "message" => "Action not recognized."]);
}
?>
