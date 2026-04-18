<?php
/**
 * Analytics API for KNOWva
 * Handles fetching admin-level statistics
 */

require_once 'config.php';

try {
    // Analytics specific logic starts here

    $method = $_SERVER['REQUEST_METHOD'];

    if ($method === 'GET') {
        $action = isset($_GET['action']) ? $_GET['action'] : '';
        
        if ($action === 'get_users') {
            // Fetch users with needed data
            $stmt = $conn->query("SELECT id, fullName AS name, email, mobile, last_login, login_count FROM users ORDER BY last_login DESC, id DESC");
            $users = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // Compute weekly analysis
            $weeklyLogins = 0;
            $totalLogins = 0;
            $sevenDaysAgo = new DateTime("-7 days");

            foreach ($users as $user) {
                $totalLogins += (int)$user['login_count'];
                if (!empty($user['last_login'])) {
                    $loginTime = new DateTime($user['last_login']);
                    if ($loginTime >= $sevenDaysAgo) {
                        $weeklyLogins++;
                    }
                }
            }

            echo json_encode([
                "status" => "success",
                "data" => [
                    "users" => $users,
                    "totalUsers" => count($users),
                    "totalLogins" => $totalLogins,
                    "weeklyActiveUsers" => $weeklyLogins
                ]
            ]);
        } else {
             echo json_encode(["status" => "error", "message" => "Invalid action."]);
        }
    } else {
         echo json_encode(["status" => "error", "message" => "Invalid request method."]);
    }

} catch(PDOException $e) {
    echo json_encode(["status" => "error", "message" => "Connection failed: " . $e->getMessage()]);
}
?>
