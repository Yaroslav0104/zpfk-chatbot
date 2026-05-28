<?php
// Дозволяємо CORS
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

require_once 'db.php';

try {
    // УВАГА: Переконайся, що таблиця називається bot_texts
    // Витягуємо id (назва кроку) та message (збережений текст)
    $stmt = $pdo->query("SELECT id, message, updated_at FROM bot_texts");
    $texts = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Віддаємо масив текстів у React
    echo json_encode($texts);
} catch (Exception $e) {
    // Якщо таблиці ще немає або сталася помилка - віддаємо порожній масив
    http_response_code(500);
    echo json_encode([]);
}
?>