<?php
/**
 * Upvotes API for KNOWva
 * Handles upvotes for tools and forum threads
 * Table: upvotes
 */

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$host     = 'localhost';
$db_name  = 'u674592973_knowva';
$username = 'u674592973_knowva_admin';
$password = 'Knowva@2026';

try {
    $conn = new PDO("mysql:host=$host;dbname=$db_name", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    echo json_encode(["status" => "error", "message" => "Connection failure: " . $e->getMessage()]);
    exit();
}

// --- AUTO-CREATE TABLE ---
$conn->exec("CREATE TABLE IF NOT EXISTS upvotes (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    user_id     INT           NOT NULL,
    target_id   VARCHAR(255)  NOT NULL, -- Can be tool_slug or thread_id
    target_type ENUM('tool', 'thread') NOT NULL,
    created_at  DATETIME      DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_upvote (user_id, target_id, target_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");

$method = $_SERVER['REQUEST_METHOD'];

// ── GET: Fetch upvote counts or user upvote status ───────────────────────────
if ($method === 'GET') {
    $target_id   = isset($_GET['target_id']) ? $_GET['target_id'] : '';
    $target_type = isset($_GET['target_type']) ? $_GET['target_type'] : '';
    $user_id     = isset($_GET['user_id']) ? (int)$_GET['user_id'] : 0;

    if (!$target_id || !$target_type) {
        echo json_encode(["status" => "error", "message" => "Missing target data."]);
        exit();
    }

    try {
        // Get total count
        $stmt = $conn->prepare("SELECT COUNT(*) as total FROM upvotes WHERE target_id = ? AND target_type = ?");
        $stmt->execute([$target_id, $target_type]);
        $count = $stmt->fetch(PDO::FETCH_ASSOC)['total'];

        // Check if current user upvoted
        $has_upvoted = false;
        if ($user_id > 0) {
            $stmt = $conn->prepare("SELECT id FROM upvotes WHERE user_id = ? AND target_id = ? AND target_type = ?");
            $stmt->execute([$user_id, $target_id, $target_type]);
            $has_upvoted = $stmt->rowCount() > 0;
        }

        echo json_encode([
            "status" => "success",
            "count" => (int)$count,
            "has_upvoted" => $has_upvoted
        ]);
    } catch (Exception $e) {
        echo json_encode(["status" => "error", "message" => $e->getMessage()]);
    }
}

// ── POST: Toggle Upvote ──────────────────────────────────────────────────────
else if ($method === 'POST') {
    $data = json_decode(file_get_contents("php://input"));
    if (!$data || !isset($data->user_id) || !isset($data->target_id) || !isset($data->target_type)) {
        echo json_encode(["status" => "error", "message" => "Missing required fields."]);
        exit();
    }

    $user_id     = (int)$data->user_id;
    $target_id   = $data->target_id;
    $target_type = $data->target_type;

    try {
        // Toggle logic: If exists, delete. Else, insert.
        $stmt = $conn->prepare("SELECT id FROM upvotes WHERE user_id = ? AND target_id = ? AND target_type = ?");
        $stmt->execute([$user_id, $target_id, $target_type]);
        
        if ($stmt->rowCount() > 0) {
            // Already upvoted, just return success
            $action = 'already_voted';
        } else {
            // Insert
            $ins = $conn->prepare("INSERT INTO upvotes (user_id, target_id, target_type) VALUES (?, ?, ?)");
            $ins->execute([$user_id, $target_id, $target_type]);
            $action = 'added';
        }

        // Get new count
        $stmt = $conn->prepare("SELECT COUNT(*) as total FROM upvotes WHERE target_id = ? AND target_type = ?");
        $stmt->execute([$target_id, $target_type]);
        $count = (int)$stmt->fetch(PDO::FETCH_ASSOC)['total'];

        echo json_encode([
            "status" => "success",
            "action" => $action,
            "new_count" => $count
        ]);
    } catch (Exception $e) {
        echo json_encode(["status" => "error", "message" => $e->getMessage()]);
    }
}
?>
