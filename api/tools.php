<?php
/**
 * Tools API for KNOWva
 * Handles CRUD operations for AI tools
 */

// --- CORS HEADERS ---
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// --- DATABASE CONFIGURATION ---
$host = 'localhost';
$db_name = 'u674592973_knowva'; 
$username = 'u674592973_knowva_admin';
$password = 'Knowva@2026';

try {
    $conn = new PDO("mysql:host=" . $host . ";dbname=" . $db_name, $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    echo json_encode(["status" => "error", "message" => "Connection failure: " . $e->getMessage()]);
    exit();
}

$method = $_SERVER['REQUEST_METHOD'];

// --- ROUTES ---

// 1. GET ALL TOOLS
if ($method === 'GET') {
    try {
        $stmt = $conn->prepare("SELECT * FROM tools ORDER BY created_at DESC");
        $stmt->execute();
        $tools = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode(["status" => "success", "data" => $tools]);
    } catch (Exception $e) {
        echo json_encode(["status" => "error", "message" => $e->getMessage()]);
    }
}

// 2. POST (ADD TOOL or BULK UPLOAD)
else if ($method === 'POST') {
    // Check if it's a file upload (Bulk or Image)
    if (isset($_POST['action']) && $_POST['action'] === 'bulk_import') {
        handleBulkImport($conn);
    } else {
        handleAddTool($conn);
    }
}

// 3. PUT (UPDATE TOOL)
else if ($method === 'PUT') {
    $data = json_decode(file_get_contents("php://input"));
    if (isset($data->id)) {
        try {
            // New complex fields sent as JSON strings or raw arrays
            $pros = isset($data->pros) ? (is_string($data->pros) ? $data->pros : json_encode($data->pros)) : '[]';
            $cons = isset($data->cons) ? (is_string($data->cons) ? $data->cons : json_encode($data->cons)) : '[]';
            $features = isset($data->features) ? (is_string($data->features) ? $data->features : json_encode($data->features)) : '[]';
            $pricing_tiers = isset($data->pricing_tiers) ? (is_string($data->pricing_tiers) ? $data->pricing_tiers : json_encode($data->pricing_tiers)) : '[]';
            $media_urls = isset($data->media_urls) ? (is_string($data->media_urls) ? $data->media_urls : json_encode($data->media_urls)) : '[]';
            $reviews_count = $data->reviews_count ?? 0;

            $stmt = $conn->prepare("UPDATE tools SET name = ?, description = ?, category = ?, pricing = ?, website_url = ?, rating = ?, reviews_count = ?, icon_url = ?, pros = ?, cons = ?, features = ?, pricing_tiers = ?, media_urls = ? WHERE id = ?");
            $stmt->execute([
                $data->name, 
                $data->description, 
                $data->category, 
                $data->pricing, 
                $data->website_url, 
                $data->rating, 
                $reviews_count,
                $data->icon_url ?? '',
                $pros,
                $cons,
                $features,
                $pricing_tiers,
                $media_urls,
                $data->id
            ]);
            echo json_encode(["status" => "success", "message" => "Tool updated successfully"]);
        } catch (Exception $e) {
            echo json_encode(["status" => "error", "message" => $e->getMessage()]);
        }
    }
}

// 4. DELETE TOOL
else if ($method === 'DELETE') {
    $data = json_decode(file_get_contents("php://input"));
    if (isset($data->id)) {
        try {
            $stmt = $conn->prepare("DELETE FROM tools WHERE id = ?");
            $stmt->execute([$data->id]);
            echo json_encode(["status" => "success", "message" => "Tool deleted"]);
        } catch (Exception $e) {
            echo json_encode(["status" => "error", "message" => $e->getMessage()]);
        }
    }
}

// --- HELPER FUNCTIONS ---

function handleAddTool($conn) {
    $name = $_POST['name'] ?? '';
    if (empty($name)) {
        echo json_encode(["status" => "error", "message" => "Tool name is required"]);
        return;
    }

    $description = $_POST['description'] ?? '';
    $category = $_POST['category'] ?? 'Other';
    $pricing = $_POST['pricing'] ?? 'Free';
    $website_url = $_POST['website_url'] ?? '';
    $rating = $_POST['rating'] ?? 4.5;
    $reviews_count = $_POST['reviews_count'] ?? 0;
    
    // Complex fields sent as JSON strings via FormData
    $pros = $_POST['pros'] ?? '[]';
    $cons = $_POST['cons'] ?? '[]';
    $features = $_POST['features'] ?? '[]';
    $pricing_tiers = $_POST['pricing_tiers'] ?? '[]';
    $media_urls = $_POST['media_urls'] ?? '[]';
    
    $icon_url = $_POST['icon_url'] ?? '';
    if (isset($_FILES['icon']) && $_FILES['icon']['error'] === 0) {
        $target_dir = "../uploads/";
        if (!file_exists($target_dir)) mkdir($target_dir, 0777, true);
        $file_ext = pathinfo($_FILES["icon"]["name"], PATHINFO_EXTENSION);
        $file_name = uniqid() . "_icon." . $file_ext;
        $target_file = $target_dir . $file_name;
        if (move_uploaded_file($_FILES["icon"]["tmp_name"], $target_file)) {
            $icon_url = "uploads/" . $file_name;
        }
    }

    // Handle multiple media file uploads
    $uploaded_media_urls = [];
    if (isset($_FILES['media'])) {
        $target_dir = "../uploads/";
        if (!file_exists($target_dir)) mkdir($target_dir, 0777, true);
        
        $files = $_FILES['media'];
        $file_count = is_array($files['name']) ? count($files['name']) : 0;
        
        for ($i = 0; $i < $file_count; $i++) {
            if ($files['error'][$i] === 0) {
                $file_ext = pathinfo($files["name"][$i], PATHINFO_EXTENSION);
                $file_name = uniqid() . "_media_" . $i . "." . $file_ext;
                $target_file = $target_dir . $file_name;
                
                if (move_uploaded_file($files["tmp_name"][$i], $target_file)) {
                    $uploaded_media_urls[] = "uploads/" . $file_name;
                }
            }
        }
    }

    // Merge uploaded files with existing media_urls JSON string
    $existing_media = json_decode($media_urls, true) ?: [];
    if (!empty($uploaded_media_urls)) {
        $media_urls = json_encode(array_merge($existing_media, $uploaded_media_urls));
    }

    try {
        // Check if tool with same name already exists
        $checkStmt = $conn->prepare("SELECT id FROM tools WHERE name = ?");
        $checkStmt->execute([$name]);
        $existing = $checkStmt->fetch(PDO::FETCH_ASSOC);

        if ($existing) {
            // UPDATE existing tool
            $id = $existing['id'];
            
            // If no new icon_url or file is provided, keep the existing icon
            $final_icon = $icon_url;
            if (empty($final_icon)) {
                $getIcon = $conn->prepare("SELECT icon_url FROM tools WHERE id = ?");
                $getIcon->execute([$id]);
                $final_icon = $getIcon->fetchColumn();
            }

            $stmt = $conn->prepare("UPDATE tools SET description = ?, category = ?, pricing = ?, website_url = ?, rating = ?, reviews_count = ?, icon_url = ?, pros = ?, cons = ?, features = ?, pricing_tiers = ?, media_urls = ? WHERE id = ?");
            $stmt->execute([
                $description, 
                $category, 
                $pricing, 
                $website_url, 
                $rating, 
                $reviews_count,
                $final_icon,
                $pros,
                $cons,
                $features,
                $pricing_tiers,
                $media_urls,
                $id
            ]);

            echo json_encode(["status" => "success", "message" => "Tool '$name' updated successfully", "id" => $id]);
        } else {
            // INSERT new tool
            $stmt = $conn->prepare("INSERT INTO tools (name, description, category, pricing, website_url, rating, reviews_count, icon_url, pros, cons, features, pricing_tiers, media_urls) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
            $stmt->execute([
                $name, 
                $description, 
                $category, 
                $pricing, 
                $website_url, 
                $rating, 
                $reviews_count,
                $icon_url,
                $pros,
                $cons,
                $features,
                $pricing_tiers,
                $media_urls
            ]);
            echo json_encode(["status" => "success", "message" => "Tool '$name' added successfully", "id" => $conn->lastInsertId()]);
        }
    } catch (Exception $e) {
        echo json_encode(["status" => "error", "message" => $e->getMessage()]);
    }
}

function handleBulkImport($conn) {
    if (!isset($_FILES['file']) || $_FILES['file']['error'] !== 0) {
        echo json_encode(["status" => "error", "message" => "No file uploaded"]);
        return;
    }

    $file = $_FILES['file']['tmp_name'];
    $handle = fopen($file, "r");
    fgetcsv($handle); // Skip header row

    $count = 0;
    try {
        $conn->beginTransaction();
        while (($data = fgetcsv($handle, 1000, ",")) !== FALSE) {
            // CSV columns: Name, Description, Category, Pricing, WebsiteURL, Rating
            $stmt = $conn->prepare("INSERT INTO tools (name, description, category, pricing, website_url, rating) VALUES (?, ?, ?, ?, ?, ?)");
            $stmt->execute([$data[0], $data[1], $data[2], $data[3], $data[4], $data[5]]);
            $count++;
        }
        $conn->commit();
        echo json_encode(["status" => "success", "message" => "$count tools imported successfully"]);
    } catch (Exception $e) {
        $conn->rollBack();
        echo json_encode(["status" => "error", "message" => "Import failed: " . $e->getMessage()]);
    }
}
?>
