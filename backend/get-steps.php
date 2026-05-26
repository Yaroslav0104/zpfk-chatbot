<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

require_once 'db.php';

try {
    $stmt = $pdo->query("SELECT id, message, updated_at FROM bot_texts");
    $texts = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($texts);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([]);
}
?>