<?php
// 1. НАЛАШТУВАННЯ ДОСТУПУ (CORS)
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

// 2. ОТРИМАННЯ ДАНИХ ВІД REACT
$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['id']) || !isset($data['status'])) {
    echo json_encode(["success" => false, "message" => "Не передано ID або статус"]);
    exit;
}

// Підключення до БД (через спільний файл)
require_once 'db.php';

try {
    // 3. РОЗУМНЕ ОНОВЛЕННЯ СТАТУСУ (З УРАХУВАННЯМ СПАМУ)
    if ($data['status'] === 'spam') {
        // Якщо адмін вибирає "У спам" -> ставимо статус і примусово вішаємо мітку ШІ (is_spam = 1)
        $sql = "UPDATE complaints SET status = :status, is_spam = 1 WHERE id = :id";
    } else {
        // Якщо вибрано "В архів", "Нове" чи "В роботі" -> ЗНІМАЄМО мітку спаму (is_spam = 0)
        $sql = "UPDATE complaints SET status = :status, is_spam = 0 WHERE id = :id";
    }
    
    $stmt = $pdo->prepare($sql);
    
    $stmt->execute([
        ':status' => $data['status'],
        ':id' => $data['id']
    ]);

    echo json_encode(["success" => true, "message" => "Статус успішно оновлено"]);

} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => "Помилка бази даних: " . $e->getMessage()]);
}
?>