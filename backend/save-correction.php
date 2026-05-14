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

if (!empty($data->text) && isset($data->correct_label)) {
    try {
        // Починаємо транзакцію (щоб безпечно записати у дві таблиці)
        $pdo->beginTransaction();

        // 1. Зберігаємо текст і правильну цифру для навчання ШІ
        $stmt1 = $pdo->prepare("INSERT INTO ai_corrections (text, correct_label) VALUES (?, ?)");
        $stmt1->execute([$data->text, $data->correct_label]);
        
        // 2. ОНОВЛЮЄМО ТОНАЛЬНІСТЬ У ТАБЛИЦІ СКАРГ (щоб бейджик змінився назавжди)
        if (!empty($data->id) && !empty($data->sentiment)) {
            $stmt2 = $pdo->prepare("UPDATE complaints SET sentiment = ? WHERE id = ?");
            $stmt2->execute([$data->sentiment, $data->id]);
        }

        // Підтверджуємо зміни
        $pdo->commit();
        
        echo json_encode(["success" => true]);
    } catch (Exception $e) {
        $pdo->rollBack(); // Скасовуємо, якщо сталася помилка
        http_response_code(500);
        echo json_encode(["success" => false, "error" => "Помилка запису в БД: " . $e->getMessage()]);
    }
} else {
    http_response_code(400);
    echo json_encode(["success" => false, "error" => "Неповні дані"]);
}
?>