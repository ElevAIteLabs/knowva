<?php
/**
 * Tools API for KNOWva
 * Handles CRUD operations for AI tools
 */

// --- CORS HEADERS ---
require_once 'config.php';

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
            $is_trending = $data->is_trending ?? 0;
            $prompts = isset($data->prompts) ? (is_string($data->prompts) ? $data->prompts : json_encode($data->prompts)) : '[]';
            $faqs = isset($data->faqs) ? (is_string($data->faqs) ? $data->faqs : json_encode($data->faqs)) : '[]';

            $stmt = $conn->prepare("UPDATE tools SET name = ?, description = ?, category = ?, pricing = ?, website_url = ?, rating = ?, reviews_count = ?, icon_url = ?, pros = ?, cons = ?, features = ?, pricing_tiers = ?, media_urls = ?, is_trending = ?, prompts = ?, faqs = ? WHERE id = ?");
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
                $is_trending,
                $prompts,
                $faqs,
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
    $id = $_POST['id'] ?? null;
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
    
    $pros = $_POST['pros'] ?? '[]';
    $cons = $_POST['cons'] ?? '[]';
    $features = $_POST['features'] ?? '[]';
    $pricing_tiers = $_POST['pricing_tiers'] ?? '[]';
    $media_urls = $_POST['media_urls'] ?? '[]';
    
    $icon_url = $_POST['icon_url'] ?? '';
    $is_trending = $_POST['is_trending'] ?? 0;
    
    $prompts = $_POST['prompts'] ?? '[]';
    $faqs = $_POST['faqs'] ?? '[]';
    if (isset($_FILES['icon']) && $_FILES['icon']['error'] === 0) {
        $file_info = getimagesize($_FILES["icon"]["tmp_name"]);
        $allowed_exts = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];
        $file_ext = strtolower(pathinfo($_FILES["icon"]["name"], PATHINFO_EXTENSION));
        
        if ($file_info !== false || $file_ext === 'svg') {
            if (in_array($file_ext, $allowed_exts)) {
                $target_dir = "../uploads/";
                if (!file_exists($target_dir)) mkdir($target_dir, 0777, true);
                $file_name = uniqid() . "_icon." . $file_ext;
                $target_file = $target_dir . $file_name;
                if (move_uploaded_file($_FILES["icon"]["tmp_name"], $target_file)) {
                    $icon_url = "uploads/" . $file_name;
                }
            }
        }
    }

    $uploaded_media_urls = [];
    if (isset($_FILES['media'])) {
        $target_dir = "../uploads/";
        if (!file_exists($target_dir)) mkdir($target_dir, 0777, true);
        
        $files = $_FILES['media'];
        $file_count = is_array($files['name']) ? count($files['name']) : 0;
        $allowed_exts = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];
        
        for ($i = 0; $i < $file_count; $i++) {
            if ($files['error'][$i] === 0) {
                $file_ext = strtolower(pathinfo($files["name"][$i], PATHINFO_EXTENSION));
                $file_info = getimagesize($files["tmp_name"][$i]);
                
                if (($file_info !== false || $file_ext === 'svg') && in_array($file_ext, $allowed_exts)) {
                    $file_name = uniqid() . "_media_" . $i . "." . $file_ext;
                    $target_file = $target_dir . $file_name;
                    
                    if (move_uploaded_file($files["tmp_name"][$i], $target_file)) {
                        $uploaded_media_urls[] = "uploads/" . $file_name;
                    }
                }
            }
        }
    }

    $existing_media = json_decode($media_urls, true) ?: [];
    if (!empty($uploaded_media_urls)) {
        $media_urls = json_encode(array_merge($existing_media, $uploaded_media_urls));
    }

    try {
        $isUpdate = false;
        $toolId = null;

        // 1. If explicit ID is provided, it's an update
        if ($id) {
            $checkId = $conn->prepare("SELECT id FROM tools WHERE id = ?");
            $checkId->execute([$id]);
            if ($checkId->fetch()) {
                $isUpdate = true;
                $toolId = $id;
            }
        }

        // 2. If no ID but name exists, it's also an update (for backwards compatibility/Excel matching)
        if (!$isUpdate) {
            $checkName = $conn->prepare("SELECT id FROM tools WHERE name = ?");
            $checkName->execute([$name]);
            $existing = $checkName->fetch(PDO::FETCH_ASSOC);
            if ($existing) {
                $isUpdate = true;
                $toolId = $existing['id'];
            }
        }

        if ($isUpdate) {
            // Keep existing icon if no new one provided
            if (empty($icon_url)) {
                $getIcon = $conn->prepare("SELECT icon_url FROM tools WHERE id = ?");
                $getIcon->execute([$toolId]);
                $icon_url = $getIcon->fetchColumn();
            }

            $stmt = $conn->prepare("UPDATE tools SET name = ?, description = ?, category = ?, pricing = ?, website_url = ?, rating = ?, reviews_count = ?, icon_url = ?, pros = ?, cons = ?, features = ?, pricing_tiers = ?, media_urls = ?, is_trending = ?, prompts = ?, faqs = ? WHERE id = ?");
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
                $media_urls,
                $is_trending,
                $prompts,
                $faqs,
                $toolId
            ]);

            echo json_encode(["status" => "success", "message" => "Tool updated successfully", "id" => $toolId]);
        } else {
            // INSERT new tool
            $stmt = $conn->prepare("INSERT INTO tools (name, description, category, pricing, website_url, rating, reviews_count, icon_url, pros, cons, features, pricing_tiers, media_urls, is_trending, prompts, faqs) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
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
                $media_urls,
                $is_trending,
                $prompts,
                $faqs
            ]);
            echo json_encode(["status" => "success", "message" => "Tool added successfully", "id" => $conn->lastInsertId()]);
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
            // Updated Column Mapping:
            // 0:Name, 1:Desc, 2:Category, 3:Pricing, 4:URL, 5:Rating, 6:IconFileName, 
            // 7:Pros, 8:Cons, 9:Features, 10:PricingTiers, 11:GalleryImages, 12:Prompts, 13:FAQs
            
            $icon = !empty($data[6]) ? "uploads/" . trim($data[6]) : "";
            
            $media = isset($data[11]) ? explode(",", $data[11]) : [];
            $media = array_map(function($img) {
                return "uploads/" . trim($img);
            }, $media);
            $media_json = json_encode($media);

            $stmt = $conn->prepare("INSERT INTO tools 
                (name, description, category, pricing, website_url, rating, icon_url, pros, cons, features, pricing_tiers, media_urls, prompts, faqs) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");

            $stmt->execute([
                $data[0] ?? '',
                $data[1] ?? '',
                $data[2] ?? '',
                $data[3] ?? '',
                $data[4] ?? '',
                $data[5] ?? '4.5',
                $icon,
                $data[7] ?? '[]',
                $data[8] ?? '[]',
                $data[9] ?? '[]',
                $data[10] ?? '[]',
                $media_json,
                $data[12] ?? '[]',
                $data[13] ?? '[]'
            ]);
            $count++;
        }
        $conn->commit();
        echo json_encode(["status" => "success", "message" => "$count tools imported successfully"]);
    } catch (Exception $e) {
        if ($conn->inTransaction()) $conn->rollBack();
        echo json_encode(["status" => "error", "message" => "Import failed: " . $e->getMessage()]);
    }
}
?>
