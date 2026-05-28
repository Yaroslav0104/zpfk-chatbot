<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit(0);
}

header("Content-Type: application/json; charset=UTF-8");

require_once 'db.php';

try {
    $stmt = $pdo->query("SELECT * FROM bot_ratings ORDER BY created_at DESC");
    $ratings = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode($ratings);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => "Помилка бази даних: " . $e->getMessage()]);
}
?>