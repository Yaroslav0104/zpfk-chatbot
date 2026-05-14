<?php
require_once 'db.php';

try {
    $stmt = $pdo->query("SELECT text_id as id, message FROM bot_texts");
    $texts = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Віддаємо масив у форматі [{"id": "schedule", "message": "текст..."}]
    echo json_encode($texts, JSON_UNESCAPED_UNICODE);
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'error' => $e->getMessage()], JSON_UNESCAPED_UNICODE);
}
?>