<?php
/**
 * Analytics API for KNOWva
 * Handles fetching admin-level statistics
 */

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
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
