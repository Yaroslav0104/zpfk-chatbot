<?php
// 1. Вказуємо ТОЧНУ адресу фронтенду замість зірочки
header("Access-Control-Allow-Origin: http://localhost:3000"); 

// 2. Додаємо дозвіл на використання credentials (кукі, токени)
header("Access-Control-Allow-Credentials: true"); 
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

// Якщо браузер просто перевіряє з'єднання (OPTIONS), віддаємо статус 200 і закриваємо
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit(0);
}

header("Content-Type: application/json; charset=UTF-8");
require_once 'db.php';

// Отримуємо ID від React
$data = json_decode(file_get_contents("php://input"));

if (!empty($data->id)) {
    try {
        // Видаляємо звернення з бази
        $stmt = $pdo->prepare("DELETE FROM complaints WHERE id = ?");
        $stmt->execute([$data->id]);
        
        echo json_encode(["success" => true]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(["success" => false, "error" => "Помилка бази даних"]);
    }
} else {
    http_response_code(400);
    echo json_encode(["success" => false, "error" => "ID не передано"]);
}
?>