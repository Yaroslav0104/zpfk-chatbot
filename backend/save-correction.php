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
        // Зберігаємо текст і правильну цифру (0, 1 або 2)
        $stmt = $pdo->prepare("INSERT INTO ai_corrections (text, correct_label) VALUES (?, ?)");
        $stmt->execute([$data->text, $data->correct_label]);
        
        echo json_encode(["success" => true]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(["success" => false, "error" => "Помилка запису в БД"]);
    }
} else {
    http_response_code(400);
    echo json_encode(["success" => false, "error" => "Неповні дані"]);
}
?>