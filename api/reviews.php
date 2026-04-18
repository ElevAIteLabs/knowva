<?php
/**
 * Reviews API for KNOWva
 * Handles user reviews on AI tools
 * Table: tool_reviews (auto-created if missing)
 */

require_once 'config.php';

// --- AUTO-CREATE TABLE IF MISSING ---
$conn->exec("CREATE TABLE IF NOT EXISTS tool_reviews (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    tool_slug   VARCHAR(255)  NOT NULL,
    user_id     INT           NOT NULL,
    user_name   VARCHAR(255)  NOT NULL,
    rating      TINYINT       NOT NULL CHECK (rating BETWEEN 1 AND 5),
    review_text TEXT          NOT NULL,
    is_verified BOOLEAN       DEFAULT FALSE,
    is_hidden   BOOLEAN       DEFAULT FALSE,
    created_at  DATETIME      DEFAULT CURRENT_TIMESTAMP,
    INDEX (tool_slug),
    INDEX (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");

// Migration for existing table
try {
    $conn->exec("ALTER TABLE tool_reviews ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE");
    $conn->exec("ALTER TABLE tool_reviews ADD COLUMN IF NOT EXISTS is_hidden BOOLEAN DEFAULT FALSE");
} catch (Exception $e) {}

$method = $_SERVER['REQUEST_METHOD'];

// Helper to check admin role
function isAdmin($conn, $user_id) {
    if (!$user_id) return false;
    $stmt = $conn->prepare("SELECT role FROM users WHERE id = ?");
    $stmt->execute([$user_id]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    return ($user && $user['role'] === 'admin');
}

// ── GET: Fetch reviews for a tool ─────────────────────────────────────────────
if ($method === 'GET') {
    // If user_id is provided, we might want to show 'My Reviews'
    $user_id_filter = isset($_GET['user_id']) ? (int)$_GET['user_id'] : 0;
    $slug = isset($_GET['tool_slug']) ? trim($_GET['tool_slug']) : '';
    
    try {
        if ($user_id_filter > 0 && !$slug) {
            // Fetch ALL reviews by a specific user (for Profile page)
            $stmt = $conn->prepare(
                "SELECT id, tool_slug, rating, review_text, is_verified, created_at
                 FROM tool_reviews
                 WHERE user_id = ?
                 ORDER BY created_at DESC"
            );
            $stmt->execute([$user_id_filter]);
        } else if ($slug) {
            // Fetch reviews for a specific tool
            // Note: Normal users shouldn't see hidden reviews
            $stmt = $conn->prepare(
                "SELECT id, user_id, user_name, rating, review_text, is_verified, created_at
                 FROM tool_reviews
                 WHERE tool_slug = ? AND is_hidden = 0
                 ORDER BY created_at DESC"
            );
            $stmt->execute([$slug]);
        } else {
            echo json_encode(["status" => "error", "message" => "tool_slug or user_id is required"]);
            exit();
        }
        
        $reviews = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode(["status" => "success", "data" => $reviews]);
    } catch (Exception $e) {
        echo json_encode(["status" => "error", "message" => $e->getMessage()]);
    }
}

// ── POST: Submit, Verify, or Hide Review ──────────────────────────────────────────
else if ($method === 'POST') {
    $data = json_decode(file_get_contents("php://input"));

    if (!$data || !isset($data->action)) {
        // Legacy support/Default submit
        $action = 'submit';
    } else {
        $action = $data->action;
    }

    // 1. SUBMIT REVIEW
    if ($action === 'submit') {
        if (!isset($data->tool_slug) || !isset($data->user_id) || !isset($data->user_name) || !isset($data->rating) || !isset($data->review_text)) {
            echo json_encode(["status" => "error", "message" => "Missing required fields."]);
            exit();
        }

        $tool_slug   = trim($data->tool_slug);
        $user_id     = (int) $data->user_id;
        $user_name   = strip_tags(trim($data->user_name));
        $rating      = max(1, min(5, (int) $data->rating));
        $review_text = strip_tags(trim($data->review_text));

        try {
            $check = $conn->prepare("SELECT id FROM tool_reviews WHERE tool_slug = ? AND user_id = ?");
            $check->execute([$tool_slug, $user_id]);
            if ($check->rowCount() > 0) {
                $upd = $conn->prepare("UPDATE tool_reviews SET rating = ?, review_text = ?, created_at = NOW() WHERE tool_slug = ? AND user_id = ?");
                $upd->execute([$rating, $review_text, $tool_slug, $user_id]);
                echo json_encode(["status" => "success", "message" => "Review updated."]);
            } else {
                $stmt = $conn->prepare("INSERT INTO tool_reviews (tool_slug, user_id, user_name, rating, review_text) VALUES (?, ?, ?, ?, ?)");
                $stmt->execute([$tool_slug, $user_id, $user_name, $rating, $review_text]);
                echo json_encode(["status" => "success", "message" => "Review submitted."]);
            }
        } catch (Exception $e) {
            echo json_encode(["status" => "error", "message" => $e->getMessage()]);
        }
    }

    // 2. VERIFY REVIEW (Admin Only)
    else if ($action === 'verify') {
        $admin_id = (int)$data->admin_id;
        $review_id = (int)$data->review_id;
        $status = (bool)$data->status;

        if (isAdmin($conn, $admin_id)) {
            $stmt = $conn->prepare("UPDATE tool_reviews SET is_verified = ? WHERE id = ?");
            $stmt->execute([$status, $review_id]);
            echo json_encode(["status" => "success", "message" => "Review verification updated."]);
        } else {
            echo json_encode(["status" => "error", "message" => "Unauthorized."]);
        }
    }

    // 3. HIDE REVIEW (Admin Only)
    else if ($action === 'hide') {
        $admin_id = (int)$data->admin_id;
        $review_id = (int)$data->review_id;
        $status = (bool)$data->status;

        if (isAdmin($conn, $admin_id)) {
            $stmt = $conn->prepare("UPDATE tool_reviews SET is_hidden = ? WHERE id = ?");
            $stmt->execute([$status, $review_id]);
            echo json_encode(["status" => "success", "message" => "Review visibility updated."]);
        } else {
            echo json_encode(["status" => "error", "message" => "Unauthorized."]);
        }
    }
}
?>
