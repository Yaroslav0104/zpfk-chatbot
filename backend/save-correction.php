<?php
header("Access-Control-Allow-Origin: http://localhost:3000"); 
header("Access-Control-Allow-Credentials: true"); 
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit(0);
}

header("Content-Type: application/json; charset=UTF-8");
require_once 'db.php'; // Твій файл підключення до PDO

$data = json_decode(file_get_contents("php://input"));

// Перевіряємо, чи прийшли всі необхідні дані з React
if (isset($data->id) && isset($data->sentiment)) {
    try {
        // 1. ОНОВЛЮЄМО МІТКУ В ОСНОВНІЙ ТАБЛИЦІ СКАРГ
        $stmtUpdate = $pdo->prepare("UPDATE complaints SET sentiment = ? WHERE id = ?");
        $stmtUpdate->execute([$data->sentiment, $data->id]);
        
        // 2. ЗБЕРІГАЄМО ТЕКСТ І ЦИФРУ ДЛЯ НАВЧАННЯ ШІ (якщо вони передані)
        if (!empty($data->text) && isset($data->correct_label)) {
            $stmtInsert = $pdo->prepare("INSERT INTO ai_corrections (text, correct_label) VALUES (?, ?)");
            $stmtInsert->execute([$data->text, $data->correct_label]);
        }
        
        echo json_encode(["success" => true]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(["success" => false, "error" => "Помилка запису в БД: " . $e->getMessage()]);
    }
} else {
    http_response_code(400);
    echo json_encode(["success" => false, "error" => "Неповні дані: відсутній id або sentiment"]);
}
?>