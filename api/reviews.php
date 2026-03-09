<?php
/**
 * Reviews API for KNOWva
 * Handles user reviews on AI tools
 * Table: tool_reviews (auto-created if missing)
 */

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// --- DB CONFIG ---
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

// --- AUTO-CREATE TABLE IF MISSING ---
$conn->exec("CREATE TABLE IF NOT EXISTS tool_reviews (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    tool_slug   VARCHAR(255)  NOT NULL,
    user_id     INT           NOT NULL,
    user_name   VARCHAR(255)  NOT NULL,
    rating      TINYINT       NOT NULL CHECK (rating BETWEEN 1 AND 5),
    review_text TEXT          NOT NULL,
    created_at  DATETIME      DEFAULT CURRENT_TIMESTAMP,
    INDEX (tool_slug),
    INDEX (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");

$method = $_SERVER['REQUEST_METHOD'];

// ── GET: Fetch reviews for a tool ─────────────────────────────────────────────
if ($method === 'GET') {
    $slug = isset($_GET['tool_slug']) ? trim($_GET['tool_slug']) : '';
    if (!$slug) {
        echo json_encode(["status" => "error", "message" => "tool_slug is required"]);
        exit();
    }
    try {
        $stmt = $conn->prepare(
            "SELECT id, user_id, user_name, rating, review_text, created_at
             FROM tool_reviews
             WHERE tool_slug = ?
             ORDER BY created_at DESC"
        );
        $stmt->execute([$slug]);
        $reviews = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode(["status" => "success", "data" => $reviews]);
    } catch (Exception $e) {
        echo json_encode(["status" => "error", "message" => $e->getMessage()]);
    }
}

// ── POST: Submit a review ──────────────────────────────────────────────────────
else if ($method === 'POST') {
    $data = json_decode(file_get_contents("php://input"));

    if (!$data ||
        !isset($data->tool_slug) ||
        !isset($data->user_id)   ||
        !isset($data->user_name) ||
        !isset($data->rating)    ||
        !isset($data->review_text)
    ) {
        echo json_encode(["status" => "error", "message" => "Missing required fields."]);
        exit();
    }

    $tool_slug   = trim($data->tool_slug);
    $user_id     = (int) $data->user_id;
    $user_name   = strip_tags(trim($data->user_name));
    $rating      = max(1, min(5, (int) $data->rating));
    $review_text = strip_tags(trim($data->review_text));

    if (empty($review_text)) {
        echo json_encode(["status" => "error", "message" => "Review text cannot be empty."]);
        exit();
    }

    try {
        // Prevent duplicate reviews by same user on same tool
        $check = $conn->prepare(
            "SELECT id FROM tool_reviews WHERE tool_slug = ? AND user_id = ?"
        );
        $check->execute([$tool_slug, $user_id]);
        if ($check->rowCount() > 0) {
            // Update existing review instead
            $upd = $conn->prepare(
                "UPDATE tool_reviews SET rating = ?, review_text = ?, created_at = NOW()
                 WHERE tool_slug = ? AND user_id = ?"
            );
            $upd->execute([$rating, $review_text, $tool_slug, $user_id]);
            echo json_encode(["status" => "success", "message" => "Review updated successfully."]);
        } else {
            $stmt = $conn->prepare(
                "INSERT INTO tool_reviews (tool_slug, user_id, user_name, rating, review_text)
                 VALUES (?, ?, ?, ?, ?)"
            );
            $stmt->execute([$tool_slug, $user_id, $user_name, $rating, $review_text]);
            echo json_encode(["status" => "success", "message" => "Review submitted successfully."]);
        }
    } catch (Exception $e) {
        echo json_encode(["status" => "error", "message" => $e->getMessage()]);
    }
}

else {
    echo json_encode(["status" => "error", "message" => "Method not allowed."]);
}
?>
