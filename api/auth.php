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

// --- DATABASE CONFIGURATION ---
$host = 'localhost'; // Usually localhost on Hostinger
$db_name = 'u674592973_knowva'; // Updated with your DB name
$username = 'u674592973_knowva_admin'; // Updated with your DB username
$password = 'Knowva@2026'; // Updated with your DB password

try {
    $conn = new PDO("mysql:host=" . $host . ";dbname=" . $db_name, $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $exception) {
    echo json_encode(["status" => "error", "message" => "Connection failure: " . $exception->getMessage()]);
    exit();
}

// --- AUTO-CREATE/UPDATE TABLES ---
try {
    // Check if role column exists
    $stmt = $conn->query("SHOW COLUMNS FROM users LIKE 'role'");
    if (!$stmt->fetch()) {
        $conn->exec("ALTER TABLE users ADD COLUMN role VARCHAR(50) DEFAULT 'user'");
    }
    
    // Check if linkedin_url column exists
    $stmt = $conn->query("SHOW COLUMNS FROM users LIKE 'linkedin_url'");
    if (!$stmt->fetch()) {
        $conn->exec("ALTER TABLE users ADD COLUMN linkedin_url VARCHAR(255) DEFAULT ''");
    }
} catch (Exception $e) {
    // Ignore error
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
        $stmt = $conn->prepare("SELECT id, fullName, email, mobile, password, role, linkedin_url FROM users WHERE email = ?");
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
    if (!isset($data->fullName) || !isset($data->email) || !isset($data->password) || !isset($data->mobile)) {
        echo json_encode(["status" => "error", "message" => "Missing required fields."]);
        exit();
    }

    $fullName = strip_tags($data->fullName);
    $email = filter_var($data->email, FILTER_SANITIZE_EMAIL);
    $mobile = strip_tags($data->mobile);
    $password = password_hash($data->password, PASSWORD_BCRYPT);
    $role = 'user'; // Default role

    try {
        // Check if email already exists
        $check = $conn->prepare("SELECT id FROM users WHERE email = ?");
        $check->execute([$email]);
        
        if ($check->rowCount() > 0) {
            echo json_encode(["status" => "error", "message" => "Email already registered."]);
            exit();
        }

        // Insert new user
        $stmt = $conn->prepare("INSERT INTO users (fullName, email, mobile, password, role) VALUES (?, ?, ?, ?, ?)");
        if ($stmt->execute([$fullName, $email, $mobile, $password, $role])) {
            echo json_encode(["status" => "success", "message" => "User created successfully."]);
        } else {
            echo json_encode(["status" => "error", "message" => "Could not register user."]);
        }
    } catch (Exception $e) {
        echo json_encode(["status" => "error", "message" => "Registration error: " . $e->getMessage()]);
    }
}

// --- GOOGLE SYNC ACTION ---
else if ($action === 'google_sync') {
    if (!isset($data->email) || !isset($data->fullName)) {
        echo json_encode(["status" => "error", "message" => "Email and name required."]);
        exit();
    }

    $email = filter_var($data->email, FILTER_SANITIZE_EMAIL);
    $fullName = strip_tags($data->fullName);
    $role = 'user';

    try {
        $stmt = $conn->prepare("SELECT id, fullName, email, mobile, role, linkedin_url FROM users WHERE email = ?");
        $stmt->execute([$email]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($user) {
            // User exists, return them
            echo json_encode([
                "status" => "success",
                "message" => "Google sync successful",
                "user" => $user
            ]);
        } else {
            // Create new user for this Google account
            $dummyPass = password_hash(bin2hex(random_bytes(16)), PASSWORD_BCRYPT);
            $stmt = $conn->prepare("INSERT INTO users (fullName, email, password, role, mobile) VALUES (?, ?, ?, ?, '')");
            $stmt->execute([$fullName, $email, $dummyPass, $role]);
            
            $newId = $conn->lastInsertId();
            $stmt = $conn->prepare("SELECT id, fullName, email, mobile, role, linkedin_url FROM users WHERE id = ?");
            $stmt->execute([$newId]);
            $newUser = $stmt->fetch(PDO::FETCH_ASSOC);

            echo json_encode([
                "status" => "success",
                "message" => "New user created via Google",
                "user" => $newUser
            ]);
        }
    } catch (Exception $e) {
        echo json_encode(["status" => "error", "message" => "Sync error: " . $e->getMessage()]);
    }
}

else if ($action === 'update_profile') {
    if (!isset($data->id) || !isset($data->fullName) || !isset($data->email) || !isset($data->mobile)) {
        echo json_encode(["status" => "error", "message" => "Missing required fields."]);
        exit();
    }

    $id = $data->id;
    $fullName = strip_tags($data->fullName);
    $email = filter_var($data->email, FILTER_SANITIZE_EMAIL);
    $mobile = strip_tags($data->mobile);
    $linkedin_url = isset($data->linkedin_url) ? strip_tags($data->linkedin_url) : '';

    try {
        // Check if email already exists for a DIFFERENT user
        $check = $conn->prepare("SELECT id FROM users WHERE email = ? AND id != ?");
        $check->execute([$email, $id]);
        
        if ($check->rowCount() > 0) {
            echo json_encode(["status" => "error", "message" => "Email already registered to another account."]);
            exit();
        }

        if (isset($data->password) && !empty(trim($data->password))) {
            // Update with password
            $password = password_hash($data->password, PASSWORD_BCRYPT);
            $stmt = $conn->prepare("UPDATE users SET fullName = ?, email = ?, mobile = ?, linkedin_url = ?, password = ? WHERE id = ?");
            $success = $stmt->execute([$fullName, $email, $mobile, $linkedin_url, $password, $id]);
        } else {
            // Update without password
            $stmt = $conn->prepare("UPDATE users SET fullName = ?, email = ?, mobile = ?, linkedin_url = ? WHERE id = ?");
            $success = $stmt->execute([$fullName, $email, $mobile, $linkedin_url, $id]);
        }

        if ($success) {
            // Fetch updated user to return
            $stmt = $conn->prepare("SELECT id, fullName, email, mobile, role, linkedin_url FROM users WHERE id = ?");
            $stmt->execute([$id]);
            $updatedUser = $stmt->fetch(PDO::FETCH_ASSOC);

            echo json_encode([
                "status" => "success", 
                "message" => "Profile updated successfully.",
                "user" => $updatedUser
            ]);
        } else {
            echo json_encode(["status" => "error", "message" => "Could not update profile."]);
        }
    } catch (Exception $e) {
        echo json_encode(["status" => "error", "message" => "Update error: " . $e->getMessage()]);
    }
}

else {
    echo json_encode(["status" => "error", "message" => "Action not recognized."]);
}
?>
