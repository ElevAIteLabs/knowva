<?php
/**
 * Saved Tools API for KNOWva
 * Handles bookmarking/saving AI tools for users
 */

// --- CORS HEADERS ---
require_once 'config.php';

try {

    // Create table if not exists
    $createTable = "CREATE TABLE IF NOT EXISTS saved_tools (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        tool_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY user_tool (user_id, tool_id)
    )";
    $conn->exec($createTable);

} catch (PDOException $e) {
    echo json_encode(["status" => "error", "message" => "Connection failure: " . $e->getMessage()]);
    exit();
}

$method = $_SERVER['REQUEST_METHOD'];

// --- ROUTES ---

// 1. GET USER'S SAVED TOOLS
if ($method === 'GET') {
    $user_id = $_GET['user_id'] ?? null;
    if (!$user_id) {
        echo json_encode(["status" => "error", "message" => "User ID required"]);
        exit();
    }

    try {
        $stmt = $conn->prepare("
            SELECT t.* 
            FROM tools t
            JOIN saved_tools s ON t.id = s.tool_id
            WHERE s.user_id = ?
            ORDER BY s.created_at DESC
        ");
        $stmt->execute([$user_id]);
        $tools = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode(["status" => "success", "data" => $tools]);
    } catch (Exception $e) {
        echo json_encode(["status" => "error", "message" => $e->getMessage()]);
    }
}

// 2. POST (SAVE/UNSAVE)
else if ($method === 'POST') {
    $data = json_decode(file_get_contents("php://input"));
    $action = $data->action ?? '';
    $user_id = $data->user_id ?? null;
    $tool_id = $data->tool_id ?? null;

    if (!$user_id || !$tool_id) {
        echo json_encode(["status" => "error", "message" => "User ID and Tool ID required"]);
        exit();
    }

    try {
        if ($action === 'save') {
            $stmt = $conn->prepare("INSERT IGNORE INTO saved_tools (user_id, tool_id) VALUES (?, ?)");
            $stmt->execute([$user_id, $tool_id]);
            echo json_encode(["status" => "success", "message" => "Tool saved"]);
        } else if ($action === 'unsave') {
            $stmt = $conn->prepare("DELETE FROM saved_tools WHERE user_id = ? AND tool_id = ?");
            $stmt->execute([$user_id, $tool_id]);
            echo json_encode(["status" => "success", "message" => "Tool removed from saved"]);
        } else if ($action === 'check') {
            $stmt = $conn->prepare("SELECT id FROM saved_tools WHERE user_id = ? AND tool_id = ?");
            $stmt->execute([$user_id, $tool_id]);
            $is_saved = $stmt->fetch() ? true : false;
            echo json_encode(["status" => "success", "saved" => $is_saved]);
        } else {
            echo json_encode(["status" => "error", "message" => "Invalid action"]);
        }
    } catch (Exception $e) {
        echo json_encode(["status" => "error", "message" => $e->getMessage()]);
    }
}
?>
