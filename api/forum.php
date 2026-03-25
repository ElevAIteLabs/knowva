<?php
/**
 * Forum API for KNOWva
 * Handles community threads, pinning, and locking
 */

error_reporting(0);
ini_set('display_errors', 0);

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
    echo json_encode(["status" => "error", "message" => "Connection failure"]);
    exit();
}

try {
    $conn->exec("ALTER TABLE forum_threads ADD COLUMN image_url VARCHAR(255) NULL");
} catch(Exception $e) {}

try {
    $conn->exec("ALTER TABLE forum_replies ADD COLUMN parent_id INT NULL DEFAULT NULL");
} catch(Exception $e) {}

try {
    $conn->exec("ALTER TABLE forum_threads ADD COLUMN hashtags TEXT NULL");
} catch(Exception $e) {}

// Helper to check admin status
function isAdmin($conn, $user_id) {
    if (!$user_id) return false;
    try {
        $stmt = $conn->prepare("SELECT role FROM users WHERE id = ?");
        $stmt->execute([$user_id]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        return ($user && $user['role'] === 'admin');
    } catch (Exception $e) { return false; }
}

$method = $_SERVER['REQUEST_METHOD'];

// ── GET Logic ───────────────────────────────────────────────────────────────
if ($method === 'GET') {
    $action = isset($_GET['action']) ? $_GET['action'] : '';
    $user_id_filter = isset($_GET['user_id']) ? (int)$_GET['user_id'] : 0;
    $category = isset($_GET['category']) ? trim($_GET['category']) : '';
    $thread_id = isset($_GET['thread_id']) ? (int)$_GET['thread_id'] : 0;
    $uid = isset($_GET['uid']) ? (int)$_GET['uid'] : 0;
    
    $login_uid = ($uid > 0) ? $uid : $user_id_filter;

    try {
        // Admin: Replies management
        if ($action === 'get_all_replies') {
            if (isAdmin($conn, $login_uid)) {
                $stmt = $conn->prepare("SELECT r.*, t.title as thread_title FROM forum_replies r JOIN forum_threads t ON r.thread_id = t.id ORDER BY r.created_at DESC");
                $stmt->execute();
                echo json_encode(["status" => "success", "data" => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
            } else {
                echo json_encode(["status" => "error", "message" => "Unauthorized"]);
            }
            exit();
        }

        // Single Thread Detail
        if ($thread_id > 0) {
            $stmt = $conn->prepare("
                SELECT t.*, 
                (SELECT COUNT(*) FROM upvotes WHERE target_id = t.id AND target_type = 'thread' AND vote_value = 1) as upvotes_count,
                (SELECT COUNT(*) FROM upvotes WHERE target_id = t.id AND target_type = 'thread' AND vote_value = -1) as downvotes_count,
                (SELECT SUM(vote_value) FROM upvotes WHERE target_id = t.id AND target_type = 'thread' AND user_id = ?) as user_vote
                FROM forum_threads t 
                WHERE t.id = ?
            ");
            $stmt->execute([$login_uid, $thread_id]);
            $thread = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$thread) {
                echo json_encode(["status" => "error", "message" => "Thread not found"]);
                exit();
            }

            $stmtRep = $conn->prepare("
                SELECT r.*,
                (SELECT COUNT(*) FROM upvotes WHERE target_id = r.id AND target_type = 'reply' AND vote_value = 1) as upvotes_count,
                (SELECT COUNT(*) FROM upvotes WHERE target_id = r.id AND target_type = 'reply' AND vote_value = -1) as downvotes_count,
                (SELECT SUM(vote_value) FROM upvotes WHERE target_id = r.id AND target_type = 'reply' AND user_id = ?) as user_vote
                FROM forum_replies r 
                WHERE thread_id = ? 
                ORDER BY created_at ASC
            ");
            $stmtRep->execute([$login_uid, $thread_id]);
            $flatReplies = $stmtRep->fetchAll(PDO::FETCH_ASSOC);

            // Recursive function to build the tree
            function buildReplyTree(array &$elements, $parentId = null) {
                $branch = [];
                foreach ($elements as &$element) {
                    if ($element['parent_id'] == $parentId) {
                        $children = buildReplyTree($elements, $element['id']);
                        if ($children) {
                            $element['replies'] = $children;
                        } else {
                            $element['replies'] = [];
                        }
                        $branch[] = $element;
                        unset($element);
                    }
                }
                return $branch;
            }

            $repliesTree = buildReplyTree($flatReplies);

            echo json_encode([
                "status" => "success", 
                "data" => ["thread" => $thread, "replies" => $repliesTree]
            ]);
            exit();
        }

        // List Threads
        $where = "WHERE t.is_hidden = 0";
        $params = [$login_uid];

        if ($user_id_filter > 0) {
            $where = "WHERE t.user_id = ?";
            $params[] = $user_id_filter;
        } else if ($category && $category !== 'All') {
            if (isAdmin($conn, $login_uid)) {
                $where = "WHERE t.category = ?";
            } else {
                $where = "WHERE t.category = ? AND t.is_hidden = 0";
            }
            $params[] = $category;
        } else if (isAdmin($conn, $login_uid)) {
            $where = "WHERE 1=1";
        }

        $sql = "SELECT t.*, 
                (SELECT COUNT(*) FROM upvotes WHERE target_id = t.id AND target_type = 'thread' AND vote_value = 1) as upvotes_count,
                (SELECT COUNT(*) FROM upvotes WHERE target_id = t.id AND target_type = 'thread' AND vote_value = -1) as downvotes_count,
                (SELECT SUM(vote_value) FROM upvotes WHERE target_id = t.id AND target_type = 'thread' AND user_id = ?) as user_vote
                FROM forum_threads t 
                $where 
                ORDER BY t.is_pinned DESC, t.created_at DESC";

        $stmt = $conn->prepare($sql);
        $stmt->execute($params);
        $threads = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode(["status" => "success", "data" => $threads]);

    } catch (Exception $e) {
        echo json_encode(["status" => "error", "message" => $e->getMessage()]);
    }
}

// ── POST Logic ─────────────────────────────────────────────────────────────
else if ($method === 'POST') {
    // Attempt to get JSON data
    $json = json_decode(file_get_contents("php://input"), true);
    // Merge with $_POST for FormData support
    $data = $json ? $json : $_POST;

    if (!isset($data['action'])) {
        echo json_encode(["status" => "error", "message" => "Action required"]);
        exit();
    }

    $action = $data['action'];

    try {
        if ($action === 'create') {
            $image_url = null;
            
            // Handle Multipart File Upload
            if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
                $uploadDir = '../uploads';
                if (!file_exists($uploadDir)) {
                    mkdir($uploadDir, 0777, true);
                }
                $fileName = uniqid() . '_' . basename($_FILES['image']['name']);
                $filePath = $uploadDir . '/' . $fileName;
                if (move_uploaded_file($_FILES['image']['tmp_name'], $filePath)) {
                    $image_url = 'uploads/' . $fileName;
                }
            } 
            // Fallback to Base64
            else if (!empty($data['image_base64'])) {
                $img = $data['image_base64'];
                $img = str_replace(['data:image/jpeg;base64,', 'data:image/png;base64,', 'data:image/gif;base64,'], '', $img);
                $img = str_replace(' ', '+', $img);
                $imgData = base64_decode($img);
                
                $uploadDir = '../uploads';
                if (!file_exists($uploadDir)) mkdir($uploadDir, 0777, true);
                
                $fileName = uniqid() . '.png';
                $filePath = $uploadDir . '/' . $fileName;
                file_put_contents($filePath, $imgData);
                $image_url = 'uploads/' . $fileName;
            }

            $hashtags = isset($data['hashtags']) ? trim($data['hashtags']) : null;
            $user_id = $data['user_id'];
            $user_name = $data['user_name'];
            $title = $data['title'];
            $category = $data['category'];
            $content = $data['content'];

            if ($image_url) {
                $stmt = $conn->prepare("INSERT INTO forum_threads (user_id, user_name, title, category, content, image_url, hashtags) VALUES (?, ?, ?, ?, ?, ?, ?)");
                $stmt->execute([$user_id, $user_name, $title, $category, $content, $image_url, $hashtags]);
            } else {
                $stmt = $conn->prepare("INSERT INTO forum_threads (user_id, user_name, title, category, content, hashtags) VALUES (?, ?, ?, ?, ?, ?)");
                $stmt->execute([$user_id, $user_name, $title, $category, $content, $hashtags]);
            }
            echo json_encode(["status" => "success", "message" => "Thread created", "image_url" => $image_url]);
        } 
        else if ($action === 'reply') {
            $chk = $conn->prepare("SELECT is_locked FROM forum_threads WHERE id = ?");
            $chk->execute([$data['thread_id']]);
            if ($chk->fetchColumn()) {
                echo json_encode(["status" => "error", "message" => "Thread is locked"]);
                exit();
            }
            
            $parent_id = isset($data['parent_id']) ? (int)$data['parent_id'] : null;
            $stmt = $conn->prepare("INSERT INTO forum_replies (thread_id, user_id, user_name, content, parent_id) VALUES (?, ?, ?, ?, ?)");
            $stmt->execute([$data['thread_id'], $data['user_id'], $data['user_name'], $data['content'], $parent_id]);
            
            echo json_encode(["status" => "success", "message" => "Reply posted"]);
        }
        else if (in_array($action, ['pin', 'lock', 'hide'])) {
            if (isAdmin($conn, $data['admin_id'])) {
                $col = ($action === 'pin') ? 'is_pinned' : "is_" . $action;
                $stmt = $conn->prepare("UPDATE forum_threads SET $col = ? WHERE id = ?");
                $stmt->execute([(int)$data['status'], $data['thread_id']]);
                echo json_encode(["status" => "success", "message" => "Status updated"]);
            } else { echo json_encode(["status" => "error", "message" => "Unauthorized"]); }
        }
        else if ($action === 'delete') {
            $check = $conn->prepare("SELECT user_id FROM forum_threads WHERE id = ?");
            $check->execute([$data['thread_id']]);
            $ownerId = $check->fetchColumn();
            if ($ownerId == $data['user_id'] || isAdmin($conn, $data['user_id'])) {
                $conn->prepare("DELETE FROM forum_threads WHERE id = ?")->execute([$data['thread_id']]);
                echo json_encode(["status" => "success", "message" => "Deleted"]);
            } else { echo json_encode(["status" => "error", "message" => "Unauthorized"]); }
        }
        else if ($action === 'edit') {
            $check = $conn->prepare("SELECT user_id FROM forum_threads WHERE id = ?");
            $check->execute([$data['thread_id']]);
            $ownerId = $check->fetchColumn();
            if ($ownerId == $data['user_id'] || isAdmin($conn, $data['user_id'])) {
                $hashtags = isset($data['hashtags']) ? trim($data['hashtags']) : null;
                
                // Handle image update in edit mode
                $image_sql = "";
                $params = [$data['title'], $data['content'], $hashtags];
                
                if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
                    $uploadDir = '../uploads';
                    if (!file_exists($uploadDir)) mkdir($uploadDir, 0777, true);
                    $fileName = uniqid() . '_' . basename($_FILES['image']['name']);
                    $filePath = $uploadDir . '/' . $fileName;
                    if (move_uploaded_file($_FILES['image']['tmp_name'], $filePath)) {
                        $image_sql = ", image_url = ?";
                        $params[] = 'uploads/' . $fileName;
                    }
                }
                
                $params[] = $data['thread_id'];
                $stmt = $conn->prepare("UPDATE forum_threads SET title = ?, content = ?, hashtags = ? $image_sql WHERE id = ?");
                $stmt->execute($params);
                echo json_encode(["status" => "success", "message" => "Updated"]);
            } else { echo json_encode(["status" => "error", "message" => "Unauthorized"]); }
        }
        else if ($action === 'delete_reply') {
            $check = $conn->prepare("SELECT user_id FROM forum_replies WHERE id = ?");
            $check->execute([$data['reply_id']]);
            $ownerId = $check->fetchColumn();
            if ($ownerId == $data['user_id'] || isAdmin($conn, $data['user_id'])) {
                $conn->prepare("DELETE FROM forum_replies WHERE id = ?")->execute([$data['reply_id']]);
                echo json_encode(["status" => "success", "message" => "Reply deleted"]);
            } else { echo json_encode(["status" => "error", "message" => "Unauthorized"]); }
        }
        else if ($action === 'edit_reply') {
            $check = $conn->prepare("SELECT user_id FROM forum_replies WHERE id = ?");
            $check->execute([$data['reply_id']]);
            $ownerId = $check->fetchColumn();
            if ($ownerId == $data['user_id'] || isAdmin($conn, $data['user_id'])) {
                $stmt = $conn->prepare("UPDATE forum_replies SET content = ? WHERE id = ?");
                $stmt->execute([$data['content'], $data['reply_id']]);
                echo json_encode(["status" => "success", "message" => "Reply updated"]);
            } else { echo json_encode(["status" => "error", "message" => "Unauthorized"]); }
        }
    } catch (Exception $e) {
        echo json_encode(["status" => "error", "message" => $e->getMessage()]);
    }
}
?>
