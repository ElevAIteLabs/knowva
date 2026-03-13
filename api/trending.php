<?php
/**
 * Trending API for KNOWva
 * Fetches the most upvoted tools
 */

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

$host     = 'localhost';
$db_name  = 'u674592973_knowva';
$username = 'u674592973_knowva_admin';
$password = 'Knowva@2026';

try {
    $conn = new PDO("mysql:host=$host;dbname=$db_name", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // SQL query to fetch most upvoted tools
    // We join with the tools table if it exists, otherwise we just return the slugs and counts
    // Assuming 'tools' table has 'slug', 'name', 'tagline', 'icon'
    $query = "
        SELECT 
            u.target_id as slug,
            COUNT(u.id) as upvote_count,
            t.name,
            t.tagline,
            t.icon,
            t.category
        FROM upvotes u
        LEFT JOIN tools t ON u.target_id = t.slug
        WHERE u.target_type = 'tool'
        GROUP BY u.target_id
        ORDER BY upvote_count DESC
        LIMIT 10
    ";

    $stmt = $conn->query($query);
    $trending = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        "status" => "success",
        "data" => $trending
    ]);

} catch (PDOException $e) {
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>
