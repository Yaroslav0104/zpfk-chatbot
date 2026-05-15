<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit(0);
}

header("Content-Type: application/json; charset=UTF-8");
require_once 'db.php';

$data = json_decode(file_get_contents("php://input"));

if (!empty($data->step_id) && isset($data->message)) {
    try {
        // УВАГА: Перевір, чи твоя таблиця дійсно називається bot_texts
        // Ми використовуємо "id" замість "text_id"
        $sql = "INSERT INTO bot_texts (id, message) VALUES (?, ?) 
                ON DUPLICATE KEY UPDATE message = ?";
                
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$data->step_id, $data->message, $data->message]);
        
        echo json_encode(["success" => true]);
    } catch (PDOException $e) {
        http_response_code(500);
        // Тепер PHP повертатиме деталі, якщо щось піде не так
        echo json_encode(["success" => false, "error" => $e->getMessage()]);
    }
} else {
    http_response_code(400);
    echo json_encode(["success" => false, "error" => "Недостатньо даних"]);
}
?>