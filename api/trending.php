<?php
/**
 * Trending API for KNOWva
 * Fetches the most upvoted tools
 */

require_once 'config.php';

try {

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
